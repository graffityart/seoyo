'use client';

import { useEffect, useState } from 'react';

export default function ProductRateGrid({ products, dateLabel, notice }) {
  const [selectedId, setSelectedId] = useState(products[0]?.id ?? null);

  useEffect(() => {
    function handleApplyClick(event) {
      const button = event.target.closest('.productStrip button');
      if (!button) return;
      const buttons = Array.from(document.querySelectorAll('.productStrip button'));
      const index = buttons.indexOf(button);
      if (index >= 0 && products[index]) setSelectedId(products[index].id);
    }

    document.addEventListener('click', handleApplyClick);
    return () => document.removeEventListener('click', handleApplyClick);
  }, [products]);

  function selectFromRate(product, index) {
    setSelectedId(product.id);
    const buttons = document.querySelectorAll('.productStrip button');
    const target = buttons[index];
    if (target) target.click();
    requestAnimationFrame(() => {
      document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  return (
    <section className="rateSection" id="rates">
      <div className="shell">
        <div className="todayTitle"><span>금일</span><b>{dateLabel}</b><strong>매입률</strong></div>
        <div className="rateGridKsdl">
          {products.map((product, index) => {
            const selected = String(selectedId) === String(product.id);
            return (
              <article key={product.id} className={selected ? 'isSelected' : ''}>
                <span className="rateLogo">{product.imageUrl && <img src={product.imageUrl} alt={product.name} />}</span>
                <b>{product.name}</b>
                <strong>{Number(product.default_rate).toFixed(0)}%</strong>
                <button type="button" className="rateCardHit" onClick={() => selectFromRate(product, index)} aria-label={`${product.name} 선택`}>선택</button>
              </article>
            );
          })}
        </div>
        <p className="dailyNote">✓ {notice}</p>
      </div>
    </section>
  );
}
