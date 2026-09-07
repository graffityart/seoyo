'use client';

import { useEffect, useState } from 'react';

export default function ProductRateSection({ products = [], rateNotice = '', formattedDate = '' }) {
  const [selectedId, setSelectedId] = useState(products[0]?.id ?? null);

  function selectFromTop(product) {
    setSelectedId(product.id);

    const buttons = Array.from(document.querySelectorAll('.productStrip button'));
    const target = buttons.find((button) => button.textContent?.includes(product.name));
    if (target) {
      target.click();
      document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  useEffect(() => {
    function syncFromApply(event) {
      const button = event.target.closest?.('.productStrip button');
      if (!button) return;
      const product = products.find((item) => button.textContent?.includes(item.name));
      if (product) setSelectedId(product.id);
    }

    document.addEventListener('click', syncFromApply);
    return () => document.removeEventListener('click', syncFromApply);
  }, [products]);

  return (
    <section className="rateSection" id="rates">
      <div className="shell">
        <div className="todayTitle">
          <span>금일</span>
          <b>{formattedDate}</b>
          <strong>매입률</strong>
        </div>

        <div className="rateGridKsdl">
          {products.map((product) => {
            const active = String(selectedId) === String(product.id);
            const rate = `${Number(product.default_rate || 0).toFixed(0)}%`;
            return (
              <article
                key={product.id}
                className={active ? 'is-selected' : ''}
                onClick={() => selectFromTop(product)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    selectFromTop(product);
                  }
                }}
                aria-pressed={active}
              >
                <b>{product.name}</b>
                <span className="rateLogo">
                  {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : null}
                </span>
                <strong>{rate}</strong>
              </article>
            );
          })}
        </div>

        <p className="dailyNote">✓ {rateNotice}</p>
      </div>
    </section>
  );
}
