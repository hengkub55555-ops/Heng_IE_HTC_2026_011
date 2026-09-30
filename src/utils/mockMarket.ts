import { Candle, Timeframe, TradeRecord } from '../types/gold';

/**
 * Generate historical candles around base spot price with LuxAlgo signals
 */
export function generateCandles(baseSpot: number, count: number = 32, timeframe: Timeframe = '1H'): Candle[] {
  const candles: Candle[] = [];
  const now = Date.now();

  let stepMs = 60 * 60 * 1000; // 1H
  if (timeframe === '15M') stepMs = 15 * 60 * 1000;
  if (timeframe === '4H') stepMs = 4 * 60 * 60 * 1000;
  if (timeframe === '1D') stepMs = 24 * 60 * 60 * 1000;

  let currentClose = baseSpot - (count * 0.4);

  for (let i = count; i >= 0; i--) {
    const timestamp = now - i * stepMs;
    const dateObj = new Date(timestamp);
    const time = timeframe === '1D'
      ? `${dateObj.getDate()}/${dateObj.getMonth() + 1}`
      : `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;

    // Random walk with upward trend
    const delta = (Math.random() - 0.46) * (baseSpot * 0.0035);
    const open = currentClose;
    const close = Math.max(open + delta, 10);
    const high = Math.max(open, close) + Math.random() * (baseSpot * 0.002);
    const low = Math.min(open, close) - Math.random() * (baseSpot * 0.002);
    const volume = Math.floor(1200 + Math.random() * 4500);

    // LuxAlgo marker on key inflection candles
    let luxMarker: Candle['luxMarker'] = undefined;
    if (i === 22) luxMarker = 'BUY';
    if (i === 15) luxMarker = 'BOS';
    if (i === 7) luxMarker = 'CHOCH';
    if (i === 2) luxMarker = 'BUY';

    candles.push({
      time,
      timestamp,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
      luxMarker,
    });

    currentClose = close;
  }

  // Ensure last candle matches baseSpot
  const last = candles[candles.length - 1];
  last.close = baseSpot;
  last.high = Math.max(last.high, baseSpot);
  last.low = Math.min(last.low, baseSpot);

  return candles;
}

/**
 * Initial sample journal entries
 */
export const initialJournalData: TradeRecord[] = [
  {
    id: 'tr-1',
    assetSymbol: 'XAU/USD',
    date: '30/09/2026 11:30',
    type: 'BUY',
    spotEntry: 4165.0,
    thaiPrice: 66150,
    weightBaht: 2,
    targetTp: 4195.0,
    stopLoss: 4140.0,
    exitPrice: 4195.0,
    status: 'CLOSED_WIN',
    pnlThb: 2400,
    notes: 'เข้าซื้อตามสัญญาณ LuxAlgo BUY + แนวรับ BB %b < 0.2',
  },
  {
    id: 'tr-2',
    assetSymbol: 'NVDA',
    date: '29/09/2026 21:15',
    type: 'BUY',
    spotEntry: 132.4,
    thaiPrice: 4435, // THB equivalent in Dime
    weightBaht: 5, // shares
    targetTp: 140.0,
    stopLoss: 128.0,
    exitPrice: 136.0,
    status: 'CLOSED_WIN',
    pnlThb: 603,
    notes: 'ซื้อสะสมบน Dime หลังทะลุ BOS ตามสไตล์ LuxAlgo Smart Money',
  },
  {
    id: 'tr-3',
    assetSymbol: 'XAU/USD',
    date: '28/09/2026 09:15',
    type: 'BUY',
    spotEntry: 4178.0,
    thaiPrice: 66400,
    weightBaht: 1,
    targetTp: 4210.0,
    stopLoss: 4160.0,
    exitPrice: 4160.0,
    status: 'CLOSED_LOSS',
    pnlThb: -350,
    notes: 'ตัดขาดทุนสั้นๆ ตามวินัยเมื่อหลุด Lower Band',
  },
];

/**
 * Play a notification chime using browser Web Audio API
 */
export function playAlertChime() {
  try {
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.15); // E6

    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
  } catch {
    // Ignore audio context errors if not interacted yet
  }
}
