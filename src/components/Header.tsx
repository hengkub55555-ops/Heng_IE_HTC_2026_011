import React from 'react';
import { RefreshCw, Sliders, Radio, Bell, BookOpen, Volume2, VolumeX, Sparkles, TrendingUp } from 'lucide-react';
import { DataSourceMode, MarketQuote, ThaiGoldRates, UsStock } from '../types/gold';
import { formatCurrency, formatSpot } from '../utils/goldMath';
import { popularDimeStocks } from '../data/dimeStocks';

interface HeaderProps {
  mode: DataSourceMode;
  onModeChange: (mode: DataSourceMode) => void;
  quote: MarketQuote;
  rates: ThaiGoldRates;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenAlerts: () => void;
  onOpenGuide: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activeAlertsCount: number;
  currentAssetSymbol: string;
  onSelectAsset: (symbol: string) => void;
  containerClass?: string;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeChange,
  quote,
  rates,
  isRefreshing,
  onRefresh,
  onOpenAlerts,
  onOpenGuide,
  soundEnabled,
  onToggleSound,
  activeAlertsCount,
  currentAssetSymbol,
  onSelectAsset,
  containerClass = 'max-w-[1720px] mx-auto px-4',
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0a0f1d]/95 backdrop-blur-md border-b border-amber-500/20 shadow-2xl">
      {/* Ticker Bar */}
      <div className="bg-[#050811] border-b border-slate-800/80 py-1.5 px-4 overflow-hidden text-xs">
        <div className="ticker-wrap flex">
          <div className="animate-ticker text-amber-300 font-mono font-medium flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ราคาทองคำ & หุ้นสหรัฐฯ บน Dime: สมาคมค้าทองคำ · YLG · ฮั่วเซ่งเฮง · NYSE / NASDAQ
            </span>
            <span className="text-slate-600">|</span>
            <span>GOLD SPOT: <strong className="text-white">{formatSpot(quote.spot)}</strong></span>
            <span className="text-slate-600">|</span>
            <span>USD/THB: <strong className="text-white">{quote.usdThb.toFixed(2)} ฿</strong></span>
            <span className="text-slate-600">|</span>
            <span>ทองแท่ง 96.5% สมาคมฯ: <strong className="text-emerald-400">{formatCurrency(rates.barSell)} ฿</strong></span>
            <span className="text-slate-600">|</span>
            <span>YLG ขายออก: <strong className="text-amber-300">{formatCurrency(rates.ylgSell)} ฿</strong></span>
            <span className="text-slate-600">|</span>
            {popularDimeStocks.slice(0, 5).map((st) => (
              <React.Fragment key={st.symbol}>
                <span className="text-slate-600">|</span>
                <span className="text-sky-300">
                  {st.symbol}: <strong className="text-white">${st.priceUsd}</strong> (~{formatCurrency(st.priceUsd * quote.usdThb)} ฿)
                </span>
              </React.Fragment>
            ))}
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">อัปเดตล่าสุด: {quote.lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className={`${containerClass} py-3 flex flex-wrap items-center justify-between gap-4`}>
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-bold text-lg">
            Au
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
                PRO GOLD & US STOCKS TRADER
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                PRO v3.0
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>วางแผนเทรดทองคำ 96.5% & หุ้นสหรัฐฯ บน Dime</span>
              <span className="text-purple-400 font-mono text-[10px]">· RSI · BB %b20 · LuxAlgo SMC</span>
            </p>
          </div>
        </div>

        {/* Quick Asset Switcher Bar */}
        <div className="flex items-center flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => onSelectAsset('XAU/USD')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              currentAssetSymbol === 'XAU/USD'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-amber-400/80 hover:text-amber-300'
            }`}
          >
            👑 ทองไทย 96.5%
          </button>
          {['NVDA', 'AAPL', 'TSLA', 'VOO', 'GLD'].map((sym) => (
            <button
              key={sym}
              onClick={() => onSelectAsset(sym)}
              className={`px-2.5 py-1 rounded-lg font-mono font-medium transition ${
                currentAssetSymbol === sym
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sym}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Feed Mode Switcher */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => onModeChange('live')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
                mode === 'live'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radio className="w-3 h-3" />
              Live Feed
            </button>
            <button
              onClick={() => onModeChange('manual')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
                mode === 'manual'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3 h-3" />
              กำหนดเอง
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'ปิดเสียงแจ้งเตือน' : 'เปิดเสียงแจ้งเตือน'}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Price Alerts Button */}
          <button
            onClick={onOpenAlerts}
            className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-medium transition"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">เตือนราคา</span>
            {activeAlertsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                {activeAlertsCount}
              </span>
            )}
          </button>

          {/* Market Guide Button */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-medium transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">คู่มือ</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition disabled:opacity-50"
            title="รีเฟรชข้อมูลทันที"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
