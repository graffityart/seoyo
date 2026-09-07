import net from 'node:net';
import { getDb } from './db';
import { decryptText } from './secure';

export const SMS_DEFAULTS={
  sms_prefix:'[사요상품권]',
  sms_admin_phone:'',
  sms_received_customer_enabled:'1',
  sms_received_admin_enabled:'1',
  sms_reviewing_enabled:'1',
  sms_paid_enabled:'1',
  sms_rejected_enabled:'1',
  sms_template_received_customer:'상품권 판매 신청이 정상 접수되었습니다. 확인후 5분이내 입금이 완료됩니다.',
  sms_template_received_admin:'신규신청 {접수번호} / {신청자} / {전화번호} / {신청금액}',
  sms_template_reviewing:'{접수번호} 상품권 PIN을 확인하고 있습니다.',
  sms_template_paid:'{접수번호} 상품권 판매금액 {입금금액} 입금이 완료되었습니다.',
  sms_template_rejected:'{접수번호} 상품권 신청이 처리 불가 상태입니다.'
};

export async function ensureSmsSchema(){
  const sql=getDb();
  await sql`CREATE TABLE IF NOT EXISTS sms_logs(
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NULL,
    recipient_type VARCHAR(20) NOT NULL DEFAULT 'customer',
    recipient_phone_last4 VARCHAR(4) NOT NULL DEFAULT '',
    event_type VARCHAR(40) NOT NULL,
    message_content TEXT NOT NULL,
    provider VARCHAR(20) NOT NULL DEFAULT 'icode',
    send_status VARCHAR(20) NOT NULL,
    result_code VARCHAR(10) NOT NULL DEFAULT '',
    provider_response TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;
  for(const [key,value] of Object.entries(SMS_DEFAULTS)){
    await sql`INSERT INTO service_settings(setting_key,setting_value) VALUES(${key},${value}) ON CONFLICT(setting_key) DO NOTHING`;
  }
}

export async function getSmsSettings(){
  await ensureSmsSchema();
  const sql=getDb();
  const keys=Object.keys(SMS_DEFAULTS);
  const rows=await sql`SELECT setting_key,setting_value FROM service_settings WHERE setting_key = ANY(${keys})`;
  return {...SMS_DEFAULTS,...Object.fromEntries(rows.map(r=>[r.setting_key,String(r.setting_value??'')]))};
}

export async function saveSmsSettings(values){
  await ensureSmsSchema();
  const sql=getDb();
  for(const key of Object.keys(SMS_DEFAULTS)){
    if(!(key in values)) continue;
    const value=String(values[key]??'').slice(0,key.startsWith('sms_template_')?2000:200);
    await sql`INSERT INTO service_settings(setting_key,setting_value) VALUES(${key},${value}) ON CONFLICT(setting_key) DO UPDATE SET setting_value=EXCLUDED.setting_value`;
  }
}

export function normalizePhone(v){return String(v||'').replace(/\D/g,'')}
export function renderSmsTemplate(template,vars){let text=String(template||'');for(const [k,v] of Object.entries(vars||{}))text=text.split(`{${k}}`).join(String(v??''));return text.trim()}
function withPrefix(message,prefix){const m=String(message||'').trim().replace(/^\[[^\]\r\n]{1,40}\]\s*/u,'');return prefix?`${prefix} ${m}`.trim():m}

function buildPacket({key,tel,cb,msg,title=''}){
  const payload={key,tel,cb,msg:String(msg).slice(0,2000),title,date:'',charset:'utf-8'};
  const json=JSON.stringify(payload);
  const bytes=Buffer.byteLength(json,'utf8');
  if(bytes>9999) throw new Error('문자 데이터가 너무 깁니다.');
  return `06${String(bytes).padStart(4,'0')}${json}`;
}

export function getIcodeConfigState(){
  return {tokenConfigured:Boolean(process.env.ICODE_TOKEN_KEY),callbackConfigured:Boolean(process.env.ICODE_CALLBACK_PHONE),host:process.env.ICODE_HOST||'211.172.232.124',port:Number(process.env.ICODE_PORT||9201)};
}

export async function sendIcodeSms(phone,message,{title=''}={}){
  const token=String(process.env.ICODE_TOKEN_KEY||'').trim();
  const callback=normalizePhone(process.env.ICODE_CALLBACK_PHONE||'');
  const tel=normalizePhone(phone);
  if(!token) throw new Error('ICODE_TOKEN_KEY가 설정되지 않았습니다.');
  if(!/^01[016789]\d{7,8}$/.test(tel)) throw new Error('수신 휴대전화 번호가 올바르지 않습니다.');
  if(!/^\d{9,12}$/.test(callback)) throw new Error('ICODE_CALLBACK_PHONE 발신번호를 확인해 주세요.');
  const packet=buildPacket({key:token,tel,cb:callback,msg:message,title});
  const host=process.env.ICODE_HOST||'211.172.232.124';
  const port=Number(process.env.ICODE_PORT||9201);
  return await new Promise((resolve,reject)=>{
    const socket=net.createConnection({host,port});
    let response='';
    const timer=setTimeout(()=>{socket.destroy();reject(new Error('아이코드 서버 응답 시간이 초과되었습니다.'));},8000);
    socket.setEncoding('utf8');
    socket.on('connect',()=>socket.write(packet));
    socket.on('data',chunk=>{response+=chunk;if(response.length>=8){clearTimeout(timer);socket.end();const code=response.slice(6,8);resolve({success:code==='00',pending:code==='17',code,response});}});
    socket.on('error',err=>{clearTimeout(timer);reject(err)});
    socket.on('end',()=>{if(!response){clearTimeout(timer);reject(new Error('아이코드 서버에서 결과를 받지 못했습니다.'));}});
  });
}

export async function logSms({orderId=null,recipientType='customer',phone,eventType,message,status,resultCode='',response=''}){
  await ensureSmsSchema();
  const sql=getDb();const tel=normalizePhone(phone);
  await sql`INSERT INTO sms_logs(order_id,recipient_type,recipient_phone_last4,event_type,message_content,provider,send_status,result_code,provider_response) VALUES(${orderId},${recipientType},${tel.slice(-4)},${eventType},${message},'icode',${status},${resultCode},${String(response||'').slice(0,1000)})`;
}

export async function sendAndLogSms(args){
  const settings=await getSmsSettings();
  const message=withPrefix(args.message,settings.sms_prefix);
  try{
    const result=await sendIcodeSms(args.phone,message,{title:'사요 상품권'});
    const status=result.success?'sent':result.pending?'pending':'failed';
    await logSms({...args,message,status,resultCode:result.code,response:result.response});
    return {...result,status};
  }catch(error){
    await logSms({...args,message,status:'failed',response:error?.message||String(error)});
    throw error;
  }
}

export async function sendNewOrderSms({orderId,orderNo,customerName,phone,requestedAmount,expectedAmount}){
  const settings=await getSmsSettings();
  const customerPhone=normalizePhone(phone);
  const vars={접수번호:String(orderNo||''),신청자:String(customerName||''),전화번호:customerPhone,신청금액:`${Number(requestedAmount||0).toLocaleString()}원`,입금금액:`${Number(expectedAmount||0).toLocaleString()}원`};
  const results=[];
  if(settings.sms_received_customer_enabled==='1'){
    try{results.push(await sendAndLogSms({orderId:Number(orderId),recipientType:'customer',phone:customerPhone,eventType:'received_customer',message:renderSmsTemplate(settings.sms_template_received_customer,vars)}))}catch(error){console.error('Customer receipt SMS failed',error);results.push({success:false,status:'failed',error:error?.message||String(error)})}
  }
  if(settings.sms_received_admin_enabled==='1'&&normalizePhone(settings.sms_admin_phone)){
    try{results.push(await sendAndLogSms({orderId:Number(orderId),recipientType:'admin',phone:settings.sms_admin_phone,eventType:'received_admin',message:renderSmsTemplate(settings.sms_template_received_admin,vars)}))}catch(error){console.error('Admin receipt SMS failed',error);results.push({success:false,status:'failed',error:error?.message||String(error)})}
  }
  return results;
}

export async function sendOrderEventSms(orderId,eventType){
  const settings=await getSmsSettings();const sql=getDb();
  const rows=await sql`SELECT id,order_no,customer_name,phone_encrypted,requested_amount,expected_amount,paid_amount,status FROM orders WHERE id=${orderId} AND deleted_at IS NULL LIMIT 1`;
  if(!rows.length)return [];
  const o=rows[0],phone=decryptText(o.phone_encrypted);
  const vars={접수번호:o.order_no,신청자:o.customer_name,전화번호:phone,신청금액:`${Number(o.requested_amount||0).toLocaleString()}원`,입금금액:`${Number(o.paid_amount||o.expected_amount||0).toLocaleString()}원`};
  const jobs=[];
  if(eventType==='received'){
    if(settings.sms_received_customer_enabled==='1')jobs.push({recipientType:'customer',phone,template:settings.sms_template_received_customer,eventType:'received_customer'});
    if(settings.sms_received_admin_enabled==='1'&&normalizePhone(settings.sms_admin_phone))jobs.push({recipientType:'admin',phone:settings.sms_admin_phone,template:settings.sms_template_received_admin,eventType:'received_admin'});
  }
  if(eventType==='reviewing'&&settings.sms_reviewing_enabled==='1')jobs.push({recipientType:'customer',phone,template:settings.sms_template_reviewing,eventType:'status_reviewing'});
  if(eventType==='paid'&&settings.sms_paid_enabled==='1')jobs.push({recipientType:'customer',phone,template:settings.sms_template_paid,eventType:'status_paid'});
  if(eventType==='rejected'&&settings.sms_rejected_enabled==='1')jobs.push({recipientType:'customer',phone,template:settings.sms_template_rejected,eventType:'status_rejected'});
  const results=[];
  for(const job of jobs){try{results.push(await sendAndLogSms({orderId:Number(orderId),recipientType:job.recipientType,phone:job.phone,eventType:job.eventType,message:renderSmsTemplate(job.template,vars)}))}catch(e){console.error('SMS send failed',eventType,e)}}
  return results;
}

export async function getSmsLogs(limit=50){await ensureSmsSchema();const sql=getDb();return sql`SELECT * FROM sms_logs ORDER BY created_at DESC LIMIT ${Math.min(200,Math.max(1,Number(limit)||50))}`}
