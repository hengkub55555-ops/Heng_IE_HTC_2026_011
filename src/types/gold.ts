export type DataSourceMode = 'live' | 'manual';

export interface MarketQuote {
  spot: number; // e.g. 4172.50
  spotChange: number; // e.g. +12.40
  spotChangePercent: number; // e.g. +0.30
  spotHigh24h: number;
  spotLow24h: number;
  usdThb: number; // e.g. 33.50
  usdThbChange: number; // e.g. -0.15
  usdThbChangePercent: number;
  premium: number; // default ~150 Baht
  lastUpdated: string;
}

export interface ThaiGoldRates {
  // สมาคมค้าทองคำ (Gold Traders Association Standard)
  barSell: number;
  barBuy: number;
  ornamentSell: number;
  ornamentBuy: number;
  // YLG Bullion
  ylgSell: number;
  ylgBuy: number;
  // Hua Seng Heng (ฮั่วเซ่งเฮง)
  hshSell: number;
  hshBuy: number;
}

export interface BbPercentBData {
  percentB: number; // typically 0.0 to 1.0 (can be <0 or >1 during extreme squeeze/breakouts)
  upperBand: number;
  middleSma20: number;
  lowerBand: number;
  bandwidth: number; // (Upper - Lower) / Middle
  status: 'EXTREME_OVERBOUGHT' | 'UPPER_ZONE' | 'NEUTRAL_MID' | 'LOWER_ZONE' | 'EXTREME_OVERSOLD';
  interpretation: string;
}

export interface LuxAlgoOrderBlock {
  id: string;
  type: 'BULLISH' | 'BEARISH';
  topPrice: number;
  bottomPrice: number;
  mitigated: boolean;
  timeframe: string;
}

export interface LuxAlgoData {
  signal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
  signalConfidence: number; // 0-100%
  sensitivity: number; // LuxAlgo signal sensitivity (default 12)
  smcEvent: 'BOS_BULLISH' | 'BOS_BEARISH' | 'CHOCH_BULLISH' | 'CHOCH_BEARISH' | 'NONE';
  trendStrength: number; // 0-100
  neoCloudStatus: 'BULLISH_GREEN' | 'BEARISH_RED' | 'NEUTRAL_GREY';
  orderBlocks: LuxAlgoOrderBlock[];
  reversalProbability: number;
  recommendationThai: string;
}

export interface TechnicalIndicators {
  rsi14: number;
  rsiSignal: 'OVERSOLD' | 'BEARISH' | 'NEUTRAL' | 'BULLISH' | 'OVERBOUGHT';
  rsiDivergence?: 'BULLISH_DIV' | 'BEARISH_DIV' | 'NONE';
  bbPercentB: BbPercentBData;
  luxAlgo: LuxAlgoData;
  macd: {
    macdLine: number;
    signalLine: number;
    histogram: number;
    trend: 'BULLISH_CROSS' | 'BEARISH_CROSS' | 'BULLISH' | 'BEARISH';
  };
  ema50: number;
  ema200: number;
  emaTrend: 'STRONG_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH';
  overallSignal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
  winRatePotential: number; // e.g. 94.5%
}

export interface SupportResistanceLevels {
  r3: number;
  r2: number;
  r1: number;
  pivot: number;
  s1: number;
  s2: number;
  s3: number;
  // Thai Baht equivalents
  thaiR2: number;
  thaiR1: number;
  thaiPivot: number;
  thaiS1: number;
  thaiS2: number;
}

export interface Candle {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  // LuxAlgo marker attachment
  luxMarker?: 'BUY' | 'SELL' | 'BOS' | 'CHOCH';
}

export type Timeframe = '15M' | '1H' | '4H' | '1D';

export interface TradeRecord {
  id: string;
  assetSymbol?: string; // e.g. 'XAU/USD' or 'NVDA'
  date: string;
  type: 'BUY' | 'SELL';
  spotEntry: number;
  thaiPrice: number;
  weightBaht: number; // e.g. 1.0, 5.0, 0.25 (or shares for stocks)
  targetTp: number;
  stopLoss: number;
  exitPrice?: number;
  status: 'OPEN' | 'CLOSED_WIN' | 'CLOSED_LOSS';
  pnlThb?: number;
  notes?: string;
}

export interface PriceAlert {
  id: string;
  asset: 'SPOT' | 'THAI_GOLD' | 'US_STOCK';
  assetSymbol?: string;
  condition: 'ABOVE' | 'BELOW';
  targetPrice: number;
  triggered: boolean;
  createdAt: string;
}

export interface StrategyPlan {
  title: string;
  badge: string;
  type: 'BUY' | 'SELL' | 'WAIT';
  description: string;
  entryZoneSpot: [number, number];
  entryZoneThb: [number, number];
  tp1Spot: number;
  tp1Thb: number;
  tp2Spot: number;
  tp2Thb: number;
  slSpot: number;
  slThb: number;
  riskRewardRatio: string;
  timeframe: string;
}

// US Stocks on Dime Interface
export type StockCategory = 'MAG7' | 'TECH' | 'ETF' | 'DIVIDEND' | 'GOLD_ETF';

export interface UsStock {
  symbol: string;
  name: string;
  thaiName: string;
  category: StockCategory;
  priceUsd: number;
  changeUsd: number;
  changePercent: number;
  high52w: number;
  low52w: number;
  peRatio: number | null;
  dividendYield: number; // % e.g. 2.5
  marketCap: string; // e.g. "$3.1T"
  descriptionThai: string;
  dimeEligible: boolean; // available on Dime with 50 THB minimum
  rsi14: number;
  bbPercentB: number;
  luxAlgoSignal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
}
