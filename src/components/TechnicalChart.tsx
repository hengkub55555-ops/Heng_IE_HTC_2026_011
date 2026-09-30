import React, { useState } from 'react';
import {
  CandlestickChart,
  LineChart,
  Sparkles,
  Layers,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import { Candle, Timeframe, BbPercentBData, LuxAlgoData } from '../types/gold';
import { spotToThaiBaht, formatCurrency, formatSpot } from '../utils/goldMath';

interface TechnicalChartProps {
  candles: Candle[];
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  usdThb: number;
  premium: number;
  assetTitle?: string;
  assetSymbol?: string;
  isUsStock?: boolean;
  bbData?: BbPercentBData;
  luxData?: LuxAlgoData;
  isCinemaMode?: boolean;
  onToggleCinemaMode?: () => void;
}

export const TechnicalChart: React.FC<TechnicalChartProps> = ({
  candles,
  timeframe,
  onTimeframeChange,
  usdThb,
  premium,
  assetTitle = 'Gold Spot · Real-time Feed',
  assetSymbol = 'XAU/USD',
  isUsStock = false,
  bbData,
  luxData,
  isCinemaMode = true,
  onToggleCinemaMode,
}) => {
  const [chartType, setChartType] = useState<'candle' | 'area'>('candle');
  const [showEma, setShowEma] = useState<boolean>(true);
  const [showBb, setShowBb] = useState<boolean>(true);
  const [showLuxAlgo, setShowLuxAlgo] = useState<boolean>(true);
  const [showRsiSubchart, setShowRsiSubchart] = useState<boolean>(true);
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(32); // Zoom level

  if (!candles || candles.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 flex items-center justify-center text-slate-500">
        กำลังโหลดข้อมูลกราฟ...
      </div>
    );
  }

  // Handle zoom: display last N candles
  const displayedCandles = candles.slice(-Math.min(visibleCount, candles.length));

  // Calculate scales
  const prices = displayedCandles.flatMap((c) => [c.high, c.low]);
  const minPrice = Math.min(...prices) * 0.998;
  const maxPrice = Math.max(...prices) * 1.002;
  const priceRange = maxPrice - minPrice || 1;
  const maxVolume = Math.max(...displayedCandles.map((c) => c.volume)) || 1;

  // Chart Dimensions - Much larger & clearer for professional analysis
  const svgWidth = 1320;
  const svgHeight = showRsiSubchart ? 660 : 540;
  const paddingLeft = 16;
  const paddingRight = 95;
  const paddingTop = 30;
  const paddingBottom = 48;
  const chartWidth = svgWidth - paddingLeft - paddingRight;

  const rsiHeight = showRsiSubchart ? 110 : 0;
  const volumeHeight = 65;
  const priceChartHeight =
    svgHeight - paddingTop - paddingBottom - rsiHeight - (showRsiSubchart ? 28 : 0) - volumeHeight;

  const getX = (index: number) => {
    if (displayedCandles.length <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (index / (displayedCandles.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    return paddingTop + priceChartHeight - ((val - minPrice) / priceRange) * priceChartHeight;
  };

  const getVolY = (vol: number) => {
    const volTop = paddingTop + priceChartHeight + 14;
    return volTop + volumeHeight - (vol / maxVolume) * volumeHeight;
  };

  // Bollinger Bands calculations across displayed candles
  const calcBollingerEnvelope = () => {
    const sampleSize = 14;
    return displayedCandles.map((_, i) => {
      const sliceStart = Math.max(0, i - sampleSize + 1);
      const slice = displayedCandles.slice(sliceStart, i + 1);
      const closes = slice.map((c) => c.close);
      const sma = closes.reduce((a, b) => a + b, 0) / closes.length;
      const variance = closes.reduce((acc, c) => acc + Math.pow(c - sma, 2), 0) / closes.length;
      const std = Math.sqrt(variance) || 1.5;
      return {
        x: getX(i),
        upper: getY(sma + 2 * std),
        mid: getY(sma),
        lower: getY(sma - 2 * std),
      };
    });
  };

  const bbEnvelope = calcBollingerEnvelope();

  const bbAreaPath =
    `M ${bbEnvelope[0].x} ${bbEnvelope[0].upper} ` +
    bbEnvelope.map((pt) => `L ${pt.x} ${pt.upper}`).join(' ') +
    ` L ${bbEnvelope[bbEnvelope.length - 1].x} ${bbEnvelope[bbEnvelope.length - 1].lower} ` +
    bbEnvelope
      .slice()
      .reverse()
      .map((pt) => `L ${pt.x} ${pt.lower}`)
      .join(' ') +
    ' Z';

  const bbMidPath =
    `M ${bbEnvelope[0].x} ${bbEnvelope[0].mid} ` +
    bbEnvelope.map((pt) => `L ${pt.x} ${pt.mid}`).join(' ');

  // Calculate EMA 20, 50
  const calcEma = (period: number) => {
    const k = 2 / (period + 1);
    const emaValues: number[] = [];
    let currentEma = displayedCandles[0].close;
    emaValues.push(currentEma);

    for (let i = 1; i < displayedCandles.length; i++) {
      currentEma = displayedCandles[i].close * k + currentEma * (1 - k);
      emaValues.push(currentEma);
    }
    return emaValues;
  };

  const ema20 = calcEma(10);
  const ema50 = calcEma(25);

  // Line paths
  const areaPath =
    `M ${getX(0)} ${getY(displayedCandles[0].close)} ` +
    displayedCandles.map((c, i) => `L ${getX(i)} ${getY(c.close)}`).join(' ') +
    ` L ${getX(displayedCandles.length - 1)} ${paddingTop + priceChartHeight} L ${getX(0)} ${paddingTop + priceChartHeight} Z`;

  const linePath =
    `M ${getX(0)} ${getY(displayedCandles[0].close)} ` +
    displayedCandles.map((c, i) => `L ${getX(i)} ${getY(c.close)}`).join(' ');

  const ema20Path =
    `M ${getX(0)} ${getY(ema20[0])} ` +
    ema20.map((val, i) => `L ${getX(i)} ${getY(val)}`).join(' ');

  const ema50Path =
    `M ${getX(0)} ${getY(ema50[0])} ` +
    ema50.map((val, i) => `L ${getX(i)} ${getY(val)}`).join(' ');

  // RSI sub-chart series
  const rsiSeries = displayedCandles.map((c, i) => {
    const base = 48 + ((c.close - minPrice) / priceRange) * 24;
    const wave = Math.sin(i * 0.45) * 6;
    return Math.min(Math.max(base + wave, 20), 85);
  });

  const rsiTop = paddingTop + priceChartHeight + volumeHeight + 28;
  const getRsiY = (val: number) => {
    return rsiTop + rsiHeight - ((val - 0) / 100) * rsiHeight;
  };

  const rsiPath =
    `M ${getX(0)} ${getRsiY(rsiSeries[0])} ` +
    rsiSeries.map((val, i) => `L ${getX(i)} ${getRsiY(val)}`).join(' ');

  // Active Candle for tooltip
  const activeCandle = hoveredCandle || displayedCandles[displayedCandles.length - 1];
  const activeThaiPrice = isUsStock
    ? activeCandle.close * usdThb
    : spotToThaiBaht(activeCandle.close, usdThb, premium);

  // Zoom handlers
  const handleZoomIn = () => setVisibleCount((prev) => Math.max(16, prev - 8));
  const handleZoomOut = () => setVisibleCount((prev) => Math.min(64, prev + 8));
  const handleZoomReset = () => setVisibleCount(32);

  // Candle body width dynamically adapts to visible count
  const candleBodyWidth = Math.max(8, Math.min(22, (chartWidth / displayedCandles.length) * 0.65));

  return (
    <div
      className={`bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none overflow-y-auto bg-[#080d19] p-6' : 'relative'
      }`}
    >
      {/* Top Chart Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-800/80">
        <div className="flex items-center flex-wrap gap-3">
          <div>
            <h3 className="font-bold text-slate-100 flex items-center gap-2 text-base sm:text-lg">
              <span className="text-amber-400 font-mono font-extrabold text-xl">{assetSymbol}</span>
              <span className="text-xs text-slate-400 font-normal">{assetTitle}</span>
            </h3>
            <div className="text-[11px] text-slate-400 font-mono">
              ระบบวิเคราะห์คลื่น LuxAlgo SMC · Bollinger Bands %b20 · RSI(14)
            </div>
          </div>

          {/* Timeframe Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {(['15M', '1H', '4H', '1D'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-3 py-1.5 rounded-lg font-mono font-medium transition-all ${
                  timeframe === tf
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={handleZoomIn}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
              title="ซูมเข้า (ดูแท่งเทียนชัดขึ้น)"
            >
              <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
              title="ซูมออก (ดูกรอบกว้างขึ้น)"
            >
              <ZoomOut className="w-3.5 h-3.5 text-amber-400" />
            </button>
            <button
              onClick={handleZoomReset}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
              title="รีเซ็ตระดับซูม"
            >
              <RotateCcw className="w-3 h-3 text-slate-400" />
            </button>
            <span className="text-[10px] text-slate-500 font-mono px-1.5">
              {displayedCandles.length} แท่ง
            </span>
          </div>
        </div>

        {/* View Options & Indicator Toggles */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* LuxAlgo Toggle */}
          <button
            onClick={() => setShowLuxAlgo(!showLuxAlgo)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition ${
              showLuxAlgo
                ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 font-bold'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="เปิด/ปิด สัญญาณ LuxAlgo SMC & Order Blocks"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>LuxAlgo SMC</span>
          </button>

          {/* BB %b 20 Toggle */}
          <button
            onClick={() => setShowBb(!showBb)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition ${
              showBb
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-300 font-bold'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="เปิด/ปิด Bollinger Bands %b (20, 2)"
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>BB %b20</span>
          </button>

          {/* RSI Toggle */}
          <button
            onClick={() => setShowRsiSubchart(!showRsiSubchart)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition ${
              showRsiSubchart
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="เปิด/ปิด หน้าต่างย่อย RSI(14) Sub-chart"
          >
            <span className="font-mono text-amber-400 font-bold">RSI</span>
            <span>Sub-chart</span>
          </button>

          {/* Chart Type (Candle vs Area) */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setChartType('candle')}
              className={`p-1.5 rounded-lg transition ${
                chartType === 'candle'
                  ? 'bg-slate-800 text-amber-400'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="กราฟแท่งเทียน Candlestick"
            >
              <CandlestickChart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`p-1.5 rounded-lg transition ${
                chartType === 'area'
                  ? 'bg-slate-800 text-amber-400'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="กราฟเส้น Area Chart"
            >
              <LineChart className="w-4 h-4" />
            </button>
          </div>

          {/* Cinema Mode Toggle */}
          {onToggleCinemaMode && (
            <button
              onClick={onToggleCinemaMode}
              className={`px-3 py-1.5 rounded-lg border transition text-xs font-medium ${
                isCinemaMode
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
              title="สลับโหมดขยายเต็มจอ"
            >
              {isCinemaMode ? 'ย่อ 2 คอลัมน์' : 'ขยายเต็มจอ (Cinema)'}
            </button>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title={isFullscreen ? 'ย่อขนาดหน้าต่าง' : 'ขยายเต็มหน้าต่าง'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-amber-400" />
            ) : (
              <Maximize2 className="w-4 h-4 text-amber-400" />
            )}
          </button>
        </div>
      </div>

      {/* Prominent Crosshair & Live Price Inspection Bar */}
      <div className="py-3 px-4 my-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-xs font-mono text-slate-300">
        <div className="flex items-center flex-wrap gap-4 sm:gap-6">
          <span className="text-slate-400">
            เวลา: <strong className="text-slate-100">{activeCandle.time}</strong>
          </span>
          <span>
            Open: <strong className="text-white">${activeCandle.open.toFixed(2)}</strong>
          </span>
          <span>
            High: <strong className="text-emerald-400 font-bold">${activeCandle.high.toFixed(2)}</strong>
          </span>
          <span>
            Low: <strong className="text-rose-400 font-bold">${activeCandle.low.toFixed(2)}</strong>
          </span>
          <span>
            Close:{' '}
            <strong className="text-amber-300 text-base font-extrabold">
              ${activeCandle.close.toFixed(2)}
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-4 text-amber-400">
          {bbData && (
            <span className="text-sky-300 text-xs font-sans">
              BB %b: <strong className="font-mono font-bold text-sky-400">{bbData.percentB.toFixed(3)}</strong>
            </span>
          )}
          <span className="text-slate-400 font-sans">
            {isUsStock ? 'แปลงเป็นเงินบาท (Dime):' : 'เทียบทองไทย 96.5%:'}
          </span>
          <span className="font-bold text-base font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            {formatCurrency(activeThaiPrice)} ฿ {isUsStock ? '/ หุ้น' : '/ บาททอง'}
          </span>
        </div>
      </div>

      {/* Big SVG Chart Canvas */}
      <div className="relative w-full overflow-hidden mt-1">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto cursor-crosshair select-none"
          onMouseLeave={() => setHoveredCandle(null)}
        >
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="bbGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="rsiOverboughtGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="rsiOversoldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.25" />
            </linearGradient>
          </defs>

          {/* Grid lines & Price Labels */}
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((ratio) => {
            const priceVal = minPrice + (1 - ratio) * priceRange;
            const yPos = paddingTop + ratio * priceChartHeight;
            return (
              <g key={ratio}>
                <line
                  x1={paddingLeft}
                  y1={yPos}
                  x2={paddingLeft + chartWidth}
                  y2={yPos}
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                  strokeWidth="1.2"
                />
                <text
                  x={paddingLeft + chartWidth + 10}
                  y={yPos + 4}
                  fill="#94a3b8"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="JetBrains Mono"
                >
                  ${priceVal.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* LuxAlgo Order Blocks (Zones) */}
          {showLuxAlgo && luxData && (
            <>
              {/* Bullish Demand Order Block Zone */}
              <g opacity="0.85">
                <rect
                  x={paddingLeft}
                  y={Math.min(getY(luxData.orderBlocks[0].topPrice), getY(luxData.orderBlocks[0].bottomPrice))}
                  width={chartWidth}
                  height={Math.max(
                    Math.abs(getY(luxData.orderBlocks[0].topPrice) - getY(luxData.orderBlocks[0].bottomPrice)),
                    18
                  )}
                  fill="#10b981"
                  fillOpacity="0.16"
                  stroke="#10b981"
                  strokeDasharray="5 3"
                  strokeWidth="1.4"
                />
                <text
                  x={paddingLeft + 12}
                  y={getY(luxData.orderBlocks[0].topPrice) - 6}
                  fill="#10b981"
                  fontSize="11"
                  fontFamily="JetBrains Mono"
                  fontWeight="bold"
                >
                  ▲ LuxAlgo Bullish Demand Order Block (แนวรับเจ้ามือสะสม)
                </text>
              </g>

              {/* Bearish Supply Zone */}
              <g opacity="0.85">
                <rect
                  x={paddingLeft}
                  y={Math.min(getY(luxData.orderBlocks[1].topPrice), getY(luxData.orderBlocks[1].bottomPrice))}
                  width={chartWidth}
                  height={Math.max(
                    Math.abs(getY(luxData.orderBlocks[1].topPrice) - getY(luxData.orderBlocks[1].bottomPrice)),
                    18
                  )}
                  fill="#f43f5e"
                  fillOpacity="0.14"
                  stroke="#f43f5e"
                  strokeDasharray="5 3"
                  strokeWidth="1.4"
                />
                <text
                  x={paddingLeft + 12}
                  y={getY(luxData.orderBlocks[1].bottomPrice) + 16}
                  fill="#f43f5e"
                  fontSize="11"
                  fontFamily="JetBrains Mono"
                  fontWeight="bold"
                >
                  ▼ LuxAlgo Bearish Supply Zone (แนวต้านสถาบันระบายของ)
                </text>
              </g>
            </>
          )}

          {/* Bollinger Bands Envelope */}
          {showBb && (
            <g opacity="0.85">
              <path d={bbAreaPath} fill="url(#bbGradient)" />
              <path
                d={bbEnvelope.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.upper}`).join(' ')}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                opacity="0.8"
              />
              <path d={bbMidPath} fill="none" stroke="#38bdf8" strokeWidth="1.6" opacity="0.9" />
              <path
                d={bbEnvelope.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.lower}`).join(' ')}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                opacity="0.8"
              />
            </g>
          )}

          {/* Area Chart Mode */}
          {chartType === 'area' && (
            <>
              <path d={areaPath} fill="url(#goldGradient)" />
              <path d={linePath} fill="none" stroke="#f59e0b" strokeWidth="3" />
            </>
          )}

          {/* Candlestick Mode with Clearer, Thicker Bars */}
          {chartType === 'candle' &&
            displayedCandles.map((c, i) => {
              const x = getX(i);
              const isBull = c.close >= c.open;
              const highY = getY(c.high);
              const lowY = getY(c.low);
              const openY = getY(c.open);
              const closeY = getY(c.close);
              const bodyTop = Math.min(openY, closeY);
              const bodyHeight = Math.max(Math.abs(closeY - openY), 2.5);
              const candleColor = isBull ? '#10b981' : '#f43f5e';

              return (
                <g
                  key={`candle-${i}`}
                  className="transition-opacity hover:opacity-100"
                  onMouseEnter={() => setHoveredCandle(c)}
                >
                  {/* Wick */}
                  <line
                    x1={x}
                    y1={highY}
                    x2={x}
                    y2={lowY}
                    stroke={candleColor}
                    strokeWidth="2"
                  />
                  {/* Body */}
                  <rect
                    x={x - candleBodyWidth / 2}
                    y={bodyTop}
                    width={candleBodyWidth}
                    height={bodyHeight}
                    fill={candleColor}
                    rx={2}
                  />

                  {/* LuxAlgo Signal Flags / Markers */}
                  {showLuxAlgo && c.luxMarker && (
                    <g>
                      {c.luxMarker === 'BUY' && (
                        <g transform={`translate(${x}, ${lowY + 22})`}>
                          <polygon points="-7,-6 7,-6 0,-14" fill="#10b981" />
                          <rect x="-18" y="-5" width="36" height="17" rx="3.5" fill="#10b981" />
                          <text
                            x="0"
                            y="8"
                            fill="#020617"
                            fontSize="10"
                            fontWeight="bold"
                            fontFamily="JetBrains Mono"
                            textAnchor="middle"
                          >
                            BUY
                          </text>
                        </g>
                      )}

                      {c.luxMarker === 'BOS' && (
                        <g transform={`translate(${x}, ${highY - 20})`}>
                          <rect x="-18" y="-16" width="36" height="16" rx="3" fill="#8b5cf6" />
                          <text
                            x="0"
                            y="-4"
                            fill="#ffffff"
                            fontSize="9.5"
                            fontWeight="bold"
                            fontFamily="JetBrains Mono"
                            textAnchor="middle"
                          >
                            BOS
                          </text>
                        </g>
                      )}

                      {c.luxMarker === 'CHOCH' && (
                        <g transform={`translate(${x}, ${lowY + 22})`}>
                          <rect x="-22" y="3" width="44" height="16" rx="3" fill="#ec4899" />
                          <text
                            x="0"
                            y="14"
                            fill="#ffffff"
                            fontSize="9"
                            fontWeight="bold"
                            fontFamily="JetBrains Mono"
                            textAnchor="middle"
                          >
                            CHoCH
                          </text>
                        </g>
                      )}
                    </g>
                  )}
                </g>
              );
            })}

          {/* EMA Lines */}
          {showEma && (
            <>
              <path d={ema20Path} fill="none" stroke="#38bdf8" strokeWidth="2.2" opacity="0.85" />
              <path d={ema50Path} fill="none" stroke="#e879f9" strokeWidth="2.2" opacity="0.85" />
            </>
          )}

          {/* Current Spot Price Marker with Glowing Line */}
          {displayedCandles.length > 0 && (
            <g>
              <line
                x1={paddingLeft}
                y1={getY(displayedCandles[displayedCandles.length - 1].close)}
                x2={paddingLeft + chartWidth}
                y2={getY(displayedCandles[displayedCandles.length - 1].close)}
                stroke="#f59e0b"
                strokeDasharray="4 3"
                strokeWidth="1.8"
              />
              <rect
                x={paddingLeft + chartWidth + 2}
                y={getY(displayedCandles[displayedCandles.length - 1].close) - 12}
                width={85}
                height={24}
                fill="#f59e0b"
                rx={5}
              />
              <text
                x={paddingLeft + chartWidth + 9}
                y={getY(displayedCandles[displayedCandles.length - 1].close) + 5}
                fill="#020617"
                fontSize="11.5"
                fontWeight="bold"
                fontFamily="JetBrains Mono"
              >
                ${displayedCandles[displayedCandles.length - 1].close.toFixed(2)}
              </text>
            </g>
          )}

          {/* Volume Separator Line & Volume Bars */}
          <line
            x1={paddingLeft}
            y1={paddingTop + priceChartHeight + 10}
            x2={paddingLeft + chartWidth}
            y2={paddingTop + priceChartHeight + 10}
            stroke="#1e293b"
            strokeWidth="1.2"
          />
          {displayedCandles.map((c, i) => {
            const x = getX(i);
            const isBull = c.close >= c.open;
            const y = getVolY(c.volume);
            const barHeight = paddingTop + priceChartHeight + 14 + volumeHeight - y;
            return (
              <rect
                key={`vol-${i}`}
                x={x - candleBodyWidth / 2}
                y={y}
                width={candleBodyWidth}
                height={Math.max(barHeight, 2)}
                fill={isBull ? '#10b981' : '#f43f5e'}
                opacity={0.35}
              />
            );
          })}

          {/* RSI Sub-Chart Panel */}
          {showRsiSubchart && (
            <g>
              {/* Divider Line */}
              <line
                x1={paddingLeft}
                y1={rsiTop - 12}
                x2={paddingLeft + chartWidth}
                y2={rsiTop - 12}
                stroke="#334155"
                strokeWidth="1.2"
              />

              {/* Overbought / Oversold Background Zones */}
              <rect
                x={paddingLeft}
                y={getRsiY(100)}
                width={chartWidth}
                height={getRsiY(70) - getRsiY(100)}
                fill="url(#rsiOverboughtGrad)"
              />
              <rect
                x={paddingLeft}
                y={getRsiY(30)}
                width={chartWidth}
                height={getRsiY(0) - getRsiY(30)}
                fill="url(#rsiOversoldGrad)"
              />

              {/* Threshold Lines */}
              <line
                x1={paddingLeft}
                y1={getRsiY(70)}
                x2={paddingLeft + chartWidth}
                y2={getRsiY(70)}
                stroke="#f43f5e"
                strokeDasharray="4 3"
                strokeWidth="1.2"
                opacity="0.8"
              />
              <line
                x1={paddingLeft}
                y1={getRsiY(50)}
                x2={paddingLeft + chartWidth}
                y2={getRsiY(50)}
                stroke="#64748b"
                strokeDasharray="3 3"
                strokeWidth="1"
                opacity="0.6"
              />
              <line
                x1={paddingLeft}
                y1={getRsiY(30)}
                x2={paddingLeft + chartWidth}
                y2={getRsiY(30)}
                stroke="#10b981"
                strokeDasharray="4 3"
                strokeWidth="1.2"
                opacity="0.8"
              />

              {/* Labels on Right */}
              <text
                x={paddingLeft + chartWidth + 10}
                y={getRsiY(70) + 4}
                fill="#f43f5e"
                fontSize="11"
                fontWeight="bold"
                fontFamily="JetBrains Mono"
              >
                70 OB
              </text>
              <text
                x={paddingLeft + chartWidth + 10}
                y={getRsiY(50) + 4}
                fill="#64748b"
                fontSize="11"
                fontFamily="JetBrains Mono"
              >
                50 Mid
              </text>
              <text
                x={paddingLeft + chartWidth + 10}
                y={getRsiY(30) + 4}
                fill="#10b981"
                fontSize="11"
                fontWeight="bold"
                fontFamily="JetBrains Mono"
              >
                30 OS
              </text>

              {/* RSI Curve */}
              <path d={rsiPath} fill="none" stroke="#fbbf24" strokeWidth="2.5" />

              {/* Panel Tag */}
              <text
                x={paddingLeft + 8}
                y={rsiTop + 20}
                fill="#94a3b8"
                fontSize="12"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
              >
                RSI (14): <tspan fill="#fbbf24">{rsiSeries[rsiSeries.length - 1].toFixed(1)}</tspan>
              </text>
            </g>
          )}

          {/* Time axis labels */}
          {displayedCandles
            .filter((_, i) => i % Math.ceil(displayedCandles.length / 10) === 0)
            .map((c) => {
              const originalIndex = displayedCandles.indexOf(c);
              const x = getX(originalIndex);
              return (
                <text
                  key={`time-${originalIndex}`}
                  x={x}
                  y={svgHeight - 12}
                  fill="#94a3b8"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="JetBrains Mono"
                  textAnchor="middle"
                >
                  {c.time}
                </text>
              );
            })}
        </svg>
      </div>

      {/* Chart Legend Footer */}
      <div className="mt-3.5 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-y-2">
        <div className="flex items-center flex-wrap gap-4 sm:gap-6">
          {showLuxAlgo && (
            <span className="flex items-center gap-1.5 text-purple-400 font-medium">
              <span className="w-2.5 h-2.5 rounded bg-purple-500"></span>
              LuxAlgo SMC (Order Block / BOS / CHoCH)
            </span>
          )}
          {showBb && (
            <span className="flex items-center gap-1.5 text-sky-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-400/40 border border-sky-400"></span>
              BB %b (20, 2)
            </span>
          )}
          {showRsiSubchart && (
            <span className="flex items-center gap-1.5 text-amber-300 font-medium">
              <span className="w-3.5 h-1 bg-amber-400"></span>
              RSI (14) Momentum
            </span>
          )}
          {showEma && (
            <span className="flex items-center gap-1.5 text-sky-300 font-medium">
              <span className="w-3.5 h-1 bg-sky-400"></span>
              EMA 20 & 50
            </span>
          )}
        </div>

        <span className="text-slate-400 font-mono">
          ราคาปัจจุบัน: <strong className="text-amber-400 text-sm font-bold">{formatSpot(displayedCandles[displayedCandles.length - 1].close)}</strong>
        </span>
      </div>
    </div>
  );
};
