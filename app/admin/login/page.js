import { redirect } from 'next/navigation';
import { isAdmin } from '../../../lib/admin-auth';
import LoginForm from './LoginForm';

export default async function AdminLoginPage(){
  if(await isAdmin()) redirect('/admin/orders');
  return <div className="loginShell"><LoginForm/></div>;
}
