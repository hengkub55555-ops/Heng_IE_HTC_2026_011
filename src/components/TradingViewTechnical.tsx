import React, { useEffect, useRef } from 'react';

interface TradingViewTechnicalProps {
  symbol?: string;
  interval?: string; // '1m', '5m', '15m', '1h', '4h', '1D'
  height?: number | string;
}

export const TradingViewTechnical: React.FC<TradingViewTechnicalProps> = ({
  symbol = 'OANDA:XAUUSD',
  interval = '1h',
  height = 380,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const getTvSymbol = (sym: string): string => {
    if (sym === 'XAU/USD' || sym === 'XAUUSD') return 'OANDA:XAUUSD';
    if (sym === 'USD/THB' || sym === 'USDTHB') return 'FX_IDC:USDTHB';
    if (sym === 'GLD') return 'AMEX:GLD';
    if (sym === 'IAU') return 'AMEX:IAU';
    if (sym === 'VOO') return 'AMEX:VOO';
    if (sym === 'QQQ') return 'NASDAQ:QQQ';
    if (sym === 'SCHD') return 'AMEX:SCHD';
    if (sym === 'NVDA') return 'NASDAQ:NVDA';
    if (sym === 'AAPL') return 'NASDAQ:AAPL';
    if (sym === 'MSFT') return 'NASDAQ:MSFT';
    if (sym === 'TSLA') return 'NASDAQ:TSLA';
    if (sym === 'KO') return 'NYSE:KO';
    if (sym === 'O') return 'NYSE:O';
    return sym.includes(':') ? sym : `NASDAQ:${sym}`;
  };

  const tvSymbol = getTvSymbol(symbol);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = typeof height === 'number' ? `${height}px` : height;
    widgetDiv.style.width = '100%';
    container.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js';
    script.type = 'text/javascript';
    script.async = true;

    const config = {
      interval: interval,
      width: '100%',
      isTransparent: true,
      height: '100%',
      symbol: tvSymbol,
      showIntervalTabs: true,
      displayMode: 'single',
      locale: 'th_TH',
      colorTheme: 'dark',
    };

    script.innerHTML = JSON.stringify(config);
    container.appendChild(script);

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [tvSymbol, interval, height]);

  return (
    <div className="bg-[#0b101d] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-xs">
        <span className="font-bold text-slate-200 flex items-center gap-1.5">
          <span>TradingView Technical Meter</span>
          <span className="text-amber-400 font-mono">({tvSymbol})</span>
        </span>
        <span className="text-[10px] text-slate-400 font-mono">Real-time Signals</span>
      </div>
      <div
        ref={containerRef}
        className="tradingview-widget-container w-full"
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      />
    </div>
  );
};
