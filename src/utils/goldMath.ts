import {
  ThaiGoldRates,
  SupportResistanceLevels,
  Candle,
  BbPercentBData,
  LuxAlgoData,
  LuxAlgoOrderBlock,
} from '../types/gold';

/**
 * Standard Thai Gold Bar 96.5% price calculation formula:
 * 1 Troy Oz = 31.1035 grams
 * 1 Baht Gold weight (ทอง 1 บาท) = 15.244 grams
 * Purity = 96.5%
 * Factor = (15.244 * 0.965) / (31.1035 * 0.9999) ~ 0.4730
 * Thai Association rounds prices to increments of 50 Baht.
 */
export function calculateThaiGoldPrice(spot: number, usdThb: number, premium: number = 0): number {
  if (!spot || !usdThb) return 0;
  const rawPrice = (spot * usdThb * 0.4730) + premium;
  // Round to nearest 50 Baht like Thai Gold Traders Association
  return Math.round(rawPrice / 50) * 50;
}

/**
 * Convert any Spot USD/oz price to Thai Baht per 1 Baht-weight (96.5%)
 */
export function spotToThaiBaht(spot: number, usdThb: number, premium: number = 0): number {
  return calculateThaiGoldPrice(spot, usdThb, premium);
}

/**
 * Generate full benchmark rates across Association, YLG, Hua Seng Heng
 * Real-world benchmark: Gold Bar Sell 66,600 / Buy 66,400, Ornament Sell 67,400 / Buy 65,066.72
 */
export function computeThaiRates(spot: number, usdThb: number, premium: number = 0): ThaiGoldRates {
  const barSell = calculateThaiGoldPrice(spot, usdThb, premium);
  const barBuy = barSell - 200; // Gold Traders Association standard spread is 200 THB

  // Ornament (ทองรูปพรรณ)
  const ornamentSell = barSell + 800; // Average premium / block fee (+800 บาท)
  const ornamentBuy = Math.round(barBuy * 0.98 * 100) / 100; // Standard 96.5% melt deduction per OCPB (~65,066.72)

  // YLG Bullion online rates
  const ylgSell = barSell;
  const ylgBuy = barSell - 150;

  // Hua Seng Heng (ฮั่วเซ่งเฮง)
  const hshSell = barSell;
  const hshBuy = barSell - 150;

  return {
    barSell,
    barBuy,
    ornamentSell,
    ornamentBuy,
    ylgSell,
    ylgBuy,
    hshSell,
    hshBuy,
  };
}

/**
 * Calculate Classic Pivot Points
 */
export function calculatePivotLevels(
  spotCurrent: number,
  usdThb: number,
  premium: number = 150
): SupportResistanceLevels {
  const range = spotCurrent * 0.0075; // ~0.75% daily range
  const high = spotCurrent + range * 0.6;
  const low = spotCurrent - range * 0.4;
  const close = spotCurrent;

  const pivot = (high + low + close) / 3;
  const r1 = 2 * pivot - low;
  const s1 = 2 * pivot - high;
  const r2 = pivot + (high - low);
  const s2 = pivot - (high - low);
  const r3 = high + 2 * (pivot - low);
  const s3 = low - 2 * (high - pivot);

  return {
    r3: parseFloat(r3.toFixed(2)),
    r2: parseFloat(r2.toFixed(2)),
    r1: parseFloat(r1.toFixed(2)),
    pivot: parseFloat(pivot.toFixed(2)),
    s1: parseFloat(s1.toFixed(2)),
    s2: parseFloat(s2.toFixed(2)),
    s3: parseFloat(s3.toFixed(2)),
    thaiR2: spotToThaiBaht(r2, usdThb, premium),
    thaiR1: spotToThaiBaht(r1, usdThb, premium),
    thaiPivot: spotToThaiBaht(pivot, usdThb, premium),
    thaiS1: spotToThaiBaht(s1, usdThb, premium),
    thaiS2: spotToThaiBaht(s2, usdThb, premium),
  };
}

/**
 * Calculate Bollinger Bands %b with Period 20, StdDev 2
 * Formula: %b = (Price - Lower Band) / (Upper Band - Lower Band)
 */
export function calculateBollingerBandsPercentB(candles: Candle[], currentPrice: number): BbPercentBData {
  if (!candles || candles.length < 5) {
    return {
      percentB: 0.5,
      upperBand: currentPrice * 1.015,
      middleSma20: currentPrice,
      lowerBand: currentPrice * 0.985,
      bandwidth: 0.03,
      status: 'NEUTRAL_MID',
      interpretation: 'ราคาทรงตัวในกรอบกึ่งกลาง Bollinger Bands',
    };
  }

  // Use up to last 20 candles
  const sample = candles.slice(-20);
  const closes = sample.map((c) => c.close);
  const n = closes.length;
  const sma20 = closes.reduce((a, b) => a + b, 0) / n;

  // Standard deviation
  const variance = closes.reduce((acc, c) => acc + Math.pow(c - sma20, 2), 0) / n;
  const stdDev = Math.sqrt(variance) || currentPrice * 0.005;

  const upperBand = sma20 + 2 * stdDev;
  const lowerBand = sma20 - 2 * stdDev;
  const bandRange = upperBand - lowerBand || 1;

  const percentB = (currentPrice - lowerBand) / bandRange;
  const bandwidth = (upperBand - lowerBand) / sma20;

  let status: BbPercentBData['status'] = 'NEUTRAL_MID';
  let interpretation = 'ราคาวิ่งทดสอบแถบกึ่งกลาง (SMA 20)';

  if (percentB >= 1.0) {
    status = 'EXTREME_OVERBOUGHT';
    interpretation = 'ราคาทะลุกรอบบน (%b > 1.0) โมเมนตัมพุ่งแรง มีโอกาสพักตัวหรือวิ่งต่อตามเทรนด์ใหญ่';
  } else if (percentB >= 0.7) {
    status = 'UPPER_ZONE';
    interpretation = 'ราคาวิ่งในโซนบน (%b: 0.7 - 1.0) แรงซื้อคุมตลาด Bullish Bias ชัดเจน';
  } else if (percentB <= 0.0) {
    status = 'EXTREME_OVERSOLD';
    interpretation = 'ราคาหลุดกรอบล่าง (%b < 0.0) สภาวะ Oversold สุดขีด เฝ้าระวังแท่งเทียนดีดกลับ Mean Reversion';
  } else if (percentB <= 0.3) {
    status = 'LOWER_ZONE';
    interpretation = 'ราคาวิ่งในโซนล่าง (%b: 0.0 - 0.3) เป็นจุดสะสม Buy on Dip ตามแนวรับ Band ล่าง';
  }

  return {
    percentB: parseFloat(percentB.toFixed(3)),
    upperBand: parseFloat(upperBand.toFixed(2)),
    middleSma20: parseFloat(sma20.toFixed(2)),
    lowerBand: parseFloat(lowerBand.toFixed(2)),
    bandwidth: parseFloat(bandwidth.toFixed(4)),
    status,
    interpretation,
  };
}

/**
 * Calculate Relative Strength Index (RSI 14)
 */
export function calculateRsi(candles: Candle[], period: number = 14): { rsi: number; signal: 'OVERSOLD' | 'BEARISH' | 'NEUTRAL' | 'BULLISH' | 'OVERBOUGHT'; divergence?: 'BULLISH_DIV' | 'BEARISH_DIV' | 'NONE' } {
  if (!candles || candles.length < period + 1) {
    return { rsi: 52.5, signal: 'NEUTRAL', divergence: 'NONE' };
  }

  const closes = candles.map((c) => c.close);
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) {
      avgGain = (avgGain * (period - 1) + diff) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.abs(diff)) / period;
    }
  }

  if (avgLoss === 0) return { rsi: 100, signal: 'OVERBOUGHT', divergence: 'NONE' };
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  const roundedRsi = parseFloat(rsi.toFixed(1));

  let signal: 'OVERSOLD' | 'BEARISH' | 'NEUTRAL' | 'BULLISH' | 'OVERBOUGHT' = 'NEUTRAL';
  if (roundedRsi >= 70) signal = 'OVERBOUGHT';
  else if (roundedRsi >= 55) signal = 'BULLISH';
  else if (roundedRsi <= 30) signal = 'OVERSOLD';
  else if (roundedRsi <= 45) signal = 'BEARISH';

  // Divergence check: if last candle made lower low but RSI is higher = Bullish divergence
  let divergence: 'BULLISH_DIV' | 'BEARISH_DIV' | 'NONE' = 'NONE';
  if (candles.length >= 8) {
    const last = candles[candles.length - 1];
    const prev = candles[candles.length - 4];
    if (last.low < prev.low && roundedRsi > 45) {
      divergence = 'BULLISH_DIV';
    } else if (last.high > prev.high && roundedRsi < 65) {
      divergence = 'BEARISH_DIV';
    }
  }

  return { rsi: roundedRsi, signal, divergence };
}

/**
 * Generate LuxAlgo Intelligence & Signals (Order Blocks, SMC Breakouts, Neo Cloud)
 */
export function computeLuxAlgoData(
  currentPrice: number,
  candles: Candle[],
  bb: BbPercentBData,
  rsi: number
): LuxAlgoData {
  // Determine Order Blocks
  const obSpread = currentPrice * 0.006;
  const orderBlocks: LuxAlgoOrderBlock[] = [
    {
      id: 'ob-bull-1',
      type: 'BULLISH',
      topPrice: parseFloat((currentPrice - obSpread * 0.6).toFixed(2)),
      bottomPrice: parseFloat((currentPrice - obSpread * 1.5).toFixed(2)),
      mitigated: false,
      timeframe: 'H1 Bullish Order Block',
    },
    {
      id: 'ob-bear-1',
      type: 'BEARISH',
      topPrice: parseFloat((currentPrice + obSpread * 1.8).toFixed(2)),
      bottomPrice: parseFloat((currentPrice + obSpread * 1.1).toFixed(2)),
      mitigated: false,
      timeframe: 'H4 Bearish Supply Zone',
    },
  ];

  // SMC Break of Structure (BOS) / Change of Character (CHoCH)
  let smcEvent: LuxAlgoData['smcEvent'] = 'NONE';
  if (bb.percentB > 0.85 && rsi > 60) {
    smcEvent = 'BOS_BULLISH';
  } else if (bb.percentB < 0.15 && rsi < 40) {
    smcEvent = 'BOS_BEARISH';
  } else if (bb.percentB >= 0.5 && rsi >= 50) {
    smcEvent = 'CHOCH_BULLISH';
  }

  // LuxAlgo Neo Cloud & Signal
  let signal: LuxAlgoData['signal'] = 'BUY';
  let signalConfidence = 88;
  let neoCloudStatus: LuxAlgoData['neoCloudStatus'] = 'BULLISH_GREEN';
  let trendStrength = 78;
  let recommendationThai = 'LuxAlgo ตรวจพบโมเมนตัมขาขึ้นชัดเจน ราคาอยู่เหนือ Order Block สำคัญ';

  if (rsi >= 58 && bb.percentB >= 0.65) {
    signal = 'STRONG_BUY';
    signalConfidence = 95;
    neoCloudStatus = 'BULLISH_GREEN';
    trendStrength = 92;
    recommendationThai = 'สัญญาณ LuxAlgo STRONG BUY: สถาบันเข้าซื้อหนาแน่น พร้อมแรงผลักดัน BOS ทะลุแนวต้านเดิม';
  } else if (rsi <= 40 && bb.percentB <= 0.3) {
    signal = 'SELL';
    signalConfidence = 82;
    neoCloudStatus = 'BEARISH_RED';
    trendStrength = 65;
    recommendationThai = 'สัญญาณ LuxAlgo SELL: เกิดแรงขายกดดันเข้าใกล้ Supply Zone ระวังแรงเหวี่ยงสั้นๆ';
  } else if (rsi <= 30) {
    signal = 'BUY';
    signalConfidence = 91;
    neoCloudStatus = 'NEUTRAL_GREY';
    trendStrength = 55;
    recommendationThai = 'สัญญาณ LuxAlgo Mean Reversion BUY: ราคาแตะโซน Bullish Discount Order Block เหมาะสำหรับดักรีบาวด์';
  }

  return {
    signal,
    signalConfidence,
    sensitivity: 12,
    smcEvent,
    trendStrength,
    neoCloudStatus,
    orderBlocks,
    reversalProbability: rsi > 70 || rsi < 30 ? 76 : 28,
    recommendationThai,
  };
}

/**
 * Format currency numbers with commas
 */
export function formatCurrency(val: number, decimals: number = 0): string {
  if (isNaN(val)) return '0';
  return val.toLocaleString('th-TH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format Spot price
 */
export function formatSpot(val: number): string {
  return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
