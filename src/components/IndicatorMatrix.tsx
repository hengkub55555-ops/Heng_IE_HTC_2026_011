import React from 'react';
import { Cpu, Target, Sparkles, Layers, Activity, ShieldCheck, ArrowUpRight, TrendingUp } from 'lucide-react';
import { TechnicalIndicators, SupportResistanceLevels, BbPercentBData, LuxAlgoData } from '../types/gold';
import { formatCurrency, formatSpot } from '../utils/goldMath';

interface IndicatorMatrixProps {
  indicators: TechnicalIndicators;
  levels: SupportResistanceLevels;
  spotPrice: number;
  bbData: BbPercentBData;
  luxData: LuxAlgoData;
  assetSymbol?: string;
  isUsStock?: boolean;
}

export const IndicatorMatrix: React.FC<IndicatorMatrixProps> = ({
  indicators,
  levels,
  spotPrice,
  bbData,
  luxData,
  assetSymbol = 'XAU/USD',
  isUsStock = false,
}) => {
  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2">
              <span>ระบบวิเคราะห์ Indicator ขั้นสูง: RSI · BB %b20 · LuxAlgo SMC</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono border border-purple-500/30">
                PRO SUITE
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              วิเคราะห์โมเมนตัม โซนความผันผวน และสัญญาณ Smart Money Concept บนสินทรัพย์ {assetSymbol}
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-medium bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-amber-400">
          Timeframe: H1 / H4
        </span>
      </div>

      {/* Primary Highlights: LuxAlgo & BB %b 20 & RSI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* LuxAlgo Intelligence Card */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/20 p-4 rounded-xl border border-purple-500/30 space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wide">
                LuxAlgo SMC & Signals
              </span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                luxData.signal.includes('BUY')
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {luxData.signal.replace('_', ' ')}
            </span>
          </div>

          <div>
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-bold font-mono text-white">
                {luxData.signalConfidence}% <span className="text-xs font-normal text-slate-400">ความเชื่อมั่น</span>
              </span>
              <span className="text-xs font-mono text-purple-400 font-semibold">
                Neo Cloud: {luxData.neoCloudStatus === 'BULLISH_GREEN' ? 'เขียว (Bull)' : 'แดง (Bear)'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {luxData.recommendationThai}
            </p>
          </div>

          {/* LuxAlgo Order Block Levels */}
          <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px] font-mono">
            <div className="flex justify-between text-slate-300">
              <span className="text-emerald-400">▲ Bullish Demand OB:</span>
              <strong className="text-white">${luxData.orderBlocks[0].topPrice} - ${luxData.orderBlocks[0].bottomPrice}</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-rose-400">▼ Bearish Supply OB:</span>
              <strong className="text-white">${luxData.orderBlocks[1].topPrice} - ${luxData.orderBlocks[1].bottomPrice}</strong>
            </div>
          </div>
        </div>

        {/* Bollinger Bands %b (20, 2) Card */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950/20 p-4 rounded-xl border border-sky-500/30 space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold text-sky-300 uppercase tracking-wide">
                Bollinger Bands %b (20, 2)
              </span>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
              %b = {bbData.percentB.toFixed(2)}
            </span>
          </div>

          <div>
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-bold font-mono text-white">
                {bbData.percentB.toFixed(3)}
              </span>
              <span className="text-xs font-medium text-slate-400">
                {bbData.status === 'UPPER_ZONE'
                  ? 'โซนบน (Bullish Expansion)'
                  : bbData.status === 'EXTREME_OVERBOUGHT'
                  ? 'ทะลุกรอบบน (>1.0)'
                  : bbData.status === 'EXTREME_OVERSOLD'
                  ? 'หลุดกรอบล่าง (<0.0)'
                  : 'กรอบกึ่งกลาง (Mean)'}
              </span>
            </div>

            {/* BB %b Linear Meter */}
            <div className="w-full bg-slate-950 rounded-full h-2 mt-2.5 relative border border-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 via-sky-400 to-rose-400 transition-all duration-500"
                style={{
                  width: `${Math.min(Math.max(bbData.percentB * 100, 5), 100)}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>0.0 (Lower)</span>
              <span>0.5 (SMA20)</span>
              <span>1.0 (Upper)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px] font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Upper Band (+2σ):</span>
              <span className="text-white">${bbData.upperBand}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Middle Band (SMA 20):</span>
              <span className="text-sky-300">${bbData.middleSma20}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Lower Band (-2σ):</span>
              <span className="text-white">${bbData.lowerBand}</span>
            </div>
          </div>
        </div>

        {/* RSI (14) Card */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/20 p-4 rounded-xl border border-amber-500/30 space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                RSI (14) Relative Strength
              </span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                indicators.rsi14 > 70
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : indicators.rsi14 < 30
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {indicators.rsiSignal}
            </span>
          </div>

          <div>
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-bold font-mono text-white">
                {indicators.rsi14.toFixed(1)}
              </span>
              <span className="text-xs font-medium text-emerald-400">
                {indicators.rsiDivergence === 'BULLISH_DIV'
                  ? '★ Bullish Divergence'
                  : indicators.rsiDivergence === 'BEARISH_DIV'
                  ? '⚠ Bearish Divergence'
                  : 'โมเมนตัมปกติ'}
              </span>
            </div>

            {/* RSI Meter */}
            <div className="w-full bg-slate-950 rounded-full h-2 mt-2.5 relative border border-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-400 transition-all duration-500"
                style={{ width: `${Math.min(Math.max(indicators.rsi14, 0), 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>&lt;30 Oversold</span>
              <span>50 Mid</span>
              <span>&gt;70 Overbought</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px] font-mono">
            <div className="flex justify-between text-slate-400">
              <span>MACD Histogram:</span>
              <span className="text-emerald-400">+{indicators.macd.histogram.toFixed(2)} (Bull Cross)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>EMA 50 / EMA 200:</span>
              <span className="text-emerald-400 font-bold">Golden Cross (Bull Trend)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Support & Resistance Table with Dual Currency */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-amber-400" />
            <span>แนวรับ - แนวต้าน คำนวณตาม Floor Pivot ({assetSymbol})</span>
          </h4>
          <span className="text-[11px] text-slate-500">Floor Pivot Method</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Resistance */}
          <div className="bg-rose-500/10 border border-rose-500/30 p-3.5 rounded-xl text-center">
            <span className="text-rose-400 text-xs font-semibold block">แนวต้านสำคัญ (Resistance 1)</span>
            <div className="text-white font-mono font-bold text-lg mt-1">
              {formatSpot(levels.r1)}
            </div>
            <div className="text-rose-300 text-xs font-mono mt-0.5">
              ~{formatCurrency(levels.thaiR1)} ฿ {isUsStock ? '/ หุ้น' : '/ บาททอง'}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">ต้านถัดไป R2: {formatSpot(levels.r2)}</div>
          </div>

          {/* Pivot Entry */}
          <div className="bg-amber-500/10 border border-amber-500/35 p-3.5 rounded-xl text-center">
            <span className="text-amber-400 text-xs font-semibold block">จุดหมุนหลัก (Pivot Point)</span>
            <div className="text-white font-mono font-bold text-lg mt-1">
              {formatSpot(levels.pivot)}
            </div>
            <div className="text-amber-300 text-xs font-mono mt-0.5">
              ~{formatCurrency(levels.thaiPivot)} ฿ {isUsStock ? '/ หุ้น' : '/ บาททอง'}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">จุดสมดุลแรงซื้อ-ขายรายวัน</div>
          </div>

          {/* Support */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl text-center">
            <span className="text-emerald-400 text-xs font-semibold block">แนวรับสำคัญ (Support 1)</span>
            <div className="text-white font-mono font-bold text-lg mt-1">
              {formatSpot(levels.s1)}
            </div>
            <div className="text-emerald-300 text-xs font-mono mt-0.5">
              ~{formatCurrency(levels.thaiS1)} ฿ {isUsStock ? '/ หุ้น' : '/ บาททอง'}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">รับถัดไป S2: {formatSpot(levels.s2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
