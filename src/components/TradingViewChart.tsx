import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2, Sparkles, SlidersHorizontal } from 'lucide-react';

interface TradingViewChartProps {
  symbol?: string; // e.g. 'OANDA:XAUUSD', 'FX_IDC:USDTHB', 'NASDAQ:NVDA'
  theme?: 'dark' | 'light';
  interval?: string; // '15', '60', '240', 'D', 'W'
  height?: number | string;
  isCinemaMode?: boolean;
  onToggleCinemaMode?: () => void;
  onSelectSymbol?: (symbol: string) => void;
  onHeightChange?: (height: number) => void;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol = 'OANDA:XAUUSD',
  theme = 'dark',
  interval = '60',
  height = 820,
  isCinemaMode = true,
  onToggleCinemaMode,
  onSelectSymbol,
  onHeightChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentInterval, setCurrentInterval] = useState(interval);

  // Map internal symbol to TradingView symbol
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

  const effectiveHeight = isFullscreen
    ? 'calc(100vh - 65px)'
    : typeof height === 'number'
    ? `${height}px`
    : height;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous widget
    container.innerHTML = '';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = effectiveHeight;
    widgetDiv.style.width = '100%';
    container.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;

    const config = {
      autosize: true,
      symbol: tvSymbol,
      interval: currentInterval,
      timezone: 'Asia/Bangkok',
      theme: theme,
      style: '1',
      locale: 'th_TH',
      enable_publishing: false,
      withdateranges: true,
      hide_side_toolbar: false,
      allow_symbol_change: true,
      calendar: false,
      details: true,
      hotlist: true,
      studies: [
        'STD;RSI',
        'STD;Bollinger_Bands',
        'STD;EMA@tv-basicstudies',
        'STD;MACD',
      ],
      support_host: 'https://www.tradingview.com',
    };

    script.innerHTML = JSON.stringify(config);
    container.appendChild(script);

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [tvSymbol, theme, currentInterval, effectiveHeight]);

  return (
    <div
      className={`w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#0c1222] shadow-2xl transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : 'relative'
      }`}
    >
      {/* Chart Top Bar with Expansion Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#080d19] border-b border-slate-800 text-xs">
        <div className="flex items-center flex-wrap gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold text-slate-100 flex items-center gap-1.5 text-sm">
            <span>TradingView Pro Live Feed</span>
            <span className="font-mono text-amber-400 font-extrabold text-base">({tvSymbol})</span>
          </span>
          <span className="text-[10px] bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded font-mono font-bold border border-blue-500/30">
            OFFICIAL REAL-TIME WIDGET
          </span>

          {/* Quick Symbol Switcher directly on chart */}
          {onSelectSymbol && (
            <div className="hidden xl:flex items-center gap-1 ml-2 bg-slate-950 px-1.5 py-0.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500">สลับสินทรัพย์:</span>
              {[
                { sym: 'XAU/USD', label: '👑 ทองคำ' },
                { sym: 'USD/THB', label: '💵 ค่าเงินบาท' },
                { sym: 'NVDA', label: 'NVDA' },
                { sym: 'AAPL', label: 'AAPL' },
                { sym: 'TSLA', label: 'TSLA' },
                { sym: 'VOO', label: 'VOO' },
                { sym: 'GLD', label: 'GLD' },
              ].map((item) => (
                <button
                  key={item.sym}
                  onClick={() => onSelectSymbol(item.sym)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                    symbol === item.sym
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* Timeframe Presets */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[
              { tf: '15', label: '15m' },
              { tf: '60', label: '1H' },
              { tf: '240', label: '4H' },
              { tf: 'D', label: '1D' },
              { tf: 'W', label: '1W' },
            ].map((t) => (
              <button
                key={t.tf}
                onClick={() => setCurrentInterval(t.tf)}
                className={`px-2 py-0.5 rounded-lg font-mono text-[11px] transition ${
                  currentInterval === t.tf
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Height presets directly on chart */}
          {onHeightChange && !isFullscreen && (
            <div className="hidden md:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-[10px] px-1 font-mono">ความสูง:</span>
              {[
                { h: 700, label: '700p' },
                { h: 820, label: '820p (ใหญ่)' },
                { h: 950, label: '950p (โปร)' },
                { h: 1100, label: '1100p (ยักษ์)' },
              ].map((item) => (
                <button
                  key={item.h}
                  onClick={() => onHeightChange(item.h)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                    height === item.h
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* Cinema Mode Toggle */}
          {onToggleCinemaMode && (
            <button
              onClick={onToggleCinemaMode}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 border ${
                isCinemaMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="สลับโหมดขยายกว้างเต็มหน้าจอ (Cinema 100% Width)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isCinemaMode ? 'โหมดกว้างเต็มจอ (เปิด)' : 'ขยายกว้างเต็มจอ'}</span>
            </button>
          )}

          {/* Fullscreen browser toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-md"
            title={isFullscreen ? 'ออกจากโหมดเต็มหน้าต่าง' : 'เปิดเต็มหน้าต่างแบบยักษ์ (Full Window)'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4" />
                <span>ออกจากเต็มจอ (ESC)</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" />
                <span>ขยายเต็มหน้าต่าง</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Widget Container */}
      <div
        ref={containerRef}
        className="tradingview-widget-container w-full"
        style={{ height: effectiveHeight }}
      />
    </div>
  );
};
