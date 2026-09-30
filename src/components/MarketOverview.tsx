import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  DollarSign,
  ShieldCheck,
  Layers,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { MarketQuote, ThaiGoldRates, TechnicalIndicators, DataSourceMode } from '../types/gold';
import { formatCurrency, formatSpot } from '../utils/goldMath';

interface MarketOverviewProps {
  quote: MarketQuote;
  rates: ThaiGoldRates;
  indicators: TechnicalIndicators;
  mode: DataSourceMode;
  onUpdateManualQuote: (spot: number, usdThb: number, premium: number) => void;
  onSyncLiveExchangeRate?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const MarketOverview: React.FC<MarketOverviewProps> = ({
  quote,
  rates,
  indicators,
  mode,
  onUpdateManualQuote,
  onSyncLiveExchangeRate,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const isSpotUp = quote.spotChange >= 0;
  const isUsdUp = quote.usdThbChange >= 0;

  return (
    <div className="space-y-3">
      {/* Live Stream Attribution Banner & Collapse Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-slate-900 via-[#0c142b] to-slate-900 border border-slate-800 text-xs shadow-md">
        <div className="flex items-center flex-wrap gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-slate-300 font-medium">
            สตรีมข้อมูล Gold Spot & ค่าเงินบาท Real-time อ้างอิง:
          </span>
          <span className="font-mono font-bold text-amber-400 flex items-center gap-1">
            TradingView (OANDA:XAUUSD & FX_IDC:USDTHB)
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
          {onSyncLiveExchangeRate && (
            <button
              onClick={onSyncLiveExchangeRate}
              className="text-amber-400 hover:text-amber-300 underline font-sans flex items-center gap-1"
              title="ดึงอัตราแลกเปลี่ยน THB ล่าสุด"
            >
              <span>ซิงค์ค่าเงินบาทสด</span>
              <span>↻</span>
            </button>
          )}

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 font-sans font-medium text-xs"
              title={isCollapsed ? 'แสดงการ์ดสรุปตลาด 4 ใบ' : 'ย่อการ์ดสรุปเพื่อโฟกัสกราฟเต็มตา'}
            >
              {isCollapsed ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>แสดงการ์ดสรุปตลาด (4 การ์ด)</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>ย่อสรุป (โฟกัสกราฟใหญ่เต็มตา)</span>
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Conditionally rendered Collapsed Mini Bar or Full 4-Card Grid */}
      {isCollapsed ? (
        /* Sleek 1-Line Compact Summary Bar */
        <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl backdrop-blur flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center flex-wrap gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-sans">Gold Spot:</span>
              <strong className="text-amber-300 font-bold text-sm">{formatSpot(quote.spot)}</strong>
              <span className={`text-[11px] font-bold ${isSpotUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isSpotUp ? '+' : ''}{quote.spotChange.toFixed(2)} ({isSpotUp ? '+' : ''}{quote.spotChangePercent.toFixed(2)}%)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-sans">USD/THB:</span>
              <strong className="text-white font-bold">{quote.usdThb.toFixed(2)} ฿</strong>
              <span className={`text-[11px] ${isUsdUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                ({isUsdUp ? '+' : ''}{quote.usdThbChange.toFixed(2)})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-sans">ทองแท่ง 96.5% สมาคมฯ:</span>
              <span className="text-emerald-400">ซื้อ {formatCurrency(rates.barBuy)} ฿</span>
              <span className="text-slate-600">/</span>
              <span className="text-amber-300 font-bold">ขาย {formatCurrency(rates.barSell)} ฿</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-sans">YLG ขายออก:</span>
              <strong className="text-amber-400 font-bold">{formatCurrency(rates.ylgSell)} ฿</strong>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-purple-400 font-sans text-xs bg-purple-500/10 px-2.5 py-1 rounded border border-purple-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>LuxAlgo: <strong>{indicators.luxAlgo.signal}</strong> ({indicators.luxAlgo.signalConfidence}%)</span>
            </span>
          </div>
        </div>
      ) : (
        /* Full 4-Card KPI Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Gold Spot (XAU/USD) */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4.5 relative overflow-hidden backdrop-blur hover:border-amber-500/40 transition-all shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <span>GOLD SPOT (TradingView OANDA)</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </div>
                <h3 className="text-2xl font-bold font-mono text-white mt-1.5 tracking-tight">
                  {formatSpot(quote.spot)}
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span
                className={`flex items-center gap-1 font-mono font-semibold ${
                  isSpotUp ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isSpotUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {isSpotUp ? '+' : ''}
                {quote.spotChange.toFixed(2)} ({isSpotUp ? '+' : ''}
                {quote.spotChangePercent.toFixed(2)}%)
              </span>
              <span className="text-slate-500 font-mono text-[11px]">24h Chg</span>
            </div>

            <div className="mt-2 text-[11px] text-slate-400 font-mono flex justify-between">
              <span>H: {formatSpot(quote.spotHigh24h)}</span>
              <span>L: {formatSpot(quote.spotLow24h)}</span>
            </div>
          </div>

          {/* Card 2: USD / THB Exchange Rate */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4.5 relative overflow-hidden backdrop-blur hover:border-emerald-500/40 transition-all shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <span>USD / THB (TradingView Feed)</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </div>
                <h3 className="text-2xl font-bold font-mono text-white mt-1.5 tracking-tight">
                  {quote.usdThb.toFixed(2)} <span className="text-sm font-normal text-slate-400">฿</span>
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span
                className={`flex items-center gap-1 font-mono font-semibold ${
                  isUsdUp ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isUsdUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {isUsdUp ? '+' : ''}
                {quote.usdThbChange.toFixed(2)} ({isUsdUp ? '+' : ''}
                {quote.usdThbChangePercent.toFixed(2)}%)
              </span>
              <span className="text-slate-500 font-mono text-[11px]">บาทแข็ง/อ่อน</span>
            </div>

            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
              <span>ผลต่อทองไทย:</span>
              <span className="text-amber-400 font-mono">10 สต. ≈ 50-60 ฿</span>
            </div>
          </div>

          {/* Card 3: Thai Gold Association (สมาคมค้าทองคำ) */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4.5 relative overflow-hidden backdrop-blur hover:border-amber-500/40 transition-all shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <span>ราคาทองแท่ง 96.5% (สมาคมฯ)</span>
                </div>
                <div className="mt-1.5">
                  <div className="text-xs text-slate-400">ขายออก:</div>
                  <h3 className="text-xl font-bold font-mono text-amber-300 tracking-tight">
                    {formatCurrency(rates.barSell)} <span className="text-sm font-normal text-slate-400">฿</span>
                  </h3>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">รับซื้อคืน:</span>
              <span className="font-mono font-semibold text-emerald-400">
                {formatCurrency(rates.barBuy)} ฿
              </span>
            </div>

            <div className="mt-1.5 text-[11px] text-slate-400 flex items-center justify-between">
              <span>ส่วนต่าง (Spread):</span>
              <span className="font-mono text-slate-300">
                {formatCurrency(rates.barSell - rates.barBuy)} ฿
              </span>
            </div>
          </div>

          {/* Card 4: YLG Bullion & Hua Seng Heng Rates */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4.5 relative overflow-hidden backdrop-blur hover:border-indigo-500/40 transition-all shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <span>ราคา YLG & ฮั่วเซ่งเฮง 96.5%</span>
                </div>
                <div className="mt-1.5">
                  <div className="text-xs text-slate-400">YLG ขายออก:</div>
                  <h3 className="text-xl font-bold font-mono text-amber-300 tracking-tight">
                    {formatCurrency(rates.ylgSell)} <span className="text-sm font-normal text-slate-400">฿</span>
                  </h3>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Layers className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">ฮั่วเซ่งเฮง (HSH):</span>
              <span className="font-mono font-semibold text-slate-200">
                {formatCurrency(rates.hshSell)} ฿
              </span>
            </div>

            <div className="mt-1.5 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Premium ขนส่ง:</span>
              <span className="font-mono text-amber-400">
                +{quote.premium} ฿ / บาททอง
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Manual Sandbox Adjuster Panel when in manual mode */}
      {mode === 'manual' && (
        <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 mt-2">
          <div className="flex items-center justify-between mb-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="font-bold text-amber-300">
                โหมดปรับแต่งตัวเลขจำลอง (Sandbox Manual Mode)
              </span>
            </div>
            <span className="text-slate-400">
              ทดลองเปลี่ยน Spot หรือ USD/THB เพื่อดูผลกระทบต่อราคาทองไทยและสัญญาณเทรด
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1.5">
                Gold Spot ($ / oz)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  value={quote.spot}
                  onChange={(e) =>
                    onUpdateManualQuote(
                      parseFloat(e.target.value) || 0,
                      quote.usdThb,
                      quote.premium
                    )
                  }
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-slate-500">USD</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1.5">
                USD / THB (ค่าเงินบาท)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.05"
                  value={quote.usdThb}
                  onChange={(e) =>
                    onUpdateManualQuote(
                      quote.spot,
                      parseFloat(e.target.value) || 0,
                      quote.premium
                    )
                  }
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-slate-500">THB</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1.5">
                Premium / ค่าเผื่อขนส่งและความเสี่ยง (บาท)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="10"
                  value={quote.premium}
                  onChange={(e) =>
                    onUpdateManualQuote(
                      quote.spot,
                      quote.usdThb,
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-slate-500">฿</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
