import React, { useEffect, useRef } from 'react';

export const TradingViewTickerTape: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    container.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.type = 'text/javascript';
    script.async = true;

    const config = {
      symbols: [
        { proName: 'OANDA:XAUUSD', title: 'GOLD SPOT' },
        { proName: 'FX_IDC:USDTHB', title: 'USD / THB' },
        { proName: 'AMEX:GLD', title: 'SPDR GOLD' },
        { proName: 'NASDAQ:NVDA', title: 'NVIDIA' },
        { proName: 'NASDAQ:AAPL', title: 'APPLE' },
        { proName: 'NASDAQ:TSLA', title: 'TESLA' },
        { proName: 'AMEX:VOO', title: 'S&P 500 (VOO)' },
        { proName: 'NASDAQ:QQQ', title: 'NASDAQ (QQQ)' },
        { proName: 'NYSE:O', title: 'REALTY INCOME' },
      ],
      showSymbolLogo: true,
      colorTheme: 'dark',
      isTransparent: true,
      displayMode: 'adaptive',
      locale: 'th_TH',
    };

    script.innerHTML = JSON.stringify(config);
    container.appendChild(script);

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="bg-[#050811] border-b border-slate-800/80 overflow-hidden">
      <div ref={containerRef} className="tradingview-widget-container w-full" />
    </div>
  );
};
