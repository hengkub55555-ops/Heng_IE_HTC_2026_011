import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DataSourceMode,
  MarketQuote,
  ThaiGoldRates,
  TechnicalIndicators,
  SupportResistanceLevels,
  Candle,
  Timeframe,
  TradeRecord,
  PriceAlert,
  StrategyPlan,
  UsStock,
} from './types/gold';
import {
  calculateThaiGoldPrice,
  computeThaiRates,
  calculatePivotLevels,
  spotToThaiBaht,
  calculateBollingerBandsPercentB,
  calculateRsi,
  computeLuxAlgoData,
} from './utils/goldMath';
import {
  generateCandles,
  initialJournalData,
  playAlertChime,
} from './utils/mockMarket';
import { popularDimeStocks } from './data/dimeStocks';
import { fetchLiveExchangeRate } from './services/marketFeed';
import { Header } from './components/Header';
import { MarketOverview } from './components/MarketOverview';
import { TechnicalChart } from './components/TechnicalChart';
import { TradingViewChart } from './components/TradingViewChart';
import { TradingViewTechnical } from './components/TradingViewTechnical';
import { TradingViewTickerTape } from './components/TradingViewTickerTape';
import { IndicatorMatrix } from './components/IndicatorMatrix';
import { ActionPlan } from './components/ActionPlan';
import { GoldCalculator } from './components/GoldCalculator';
import { TradeJournal } from './components/TradeJournal';
import { DimeUsStocks } from './components/DimeUsStocks';
import { PriceAlertsModal } from './components/PriceAlertsModal';
import { MarketGuideModal } from './components/MarketGuideModal';
import { Coins, LineChart, BookMarked, Wallet, Sparkles, SlidersHorizontal, Check } from 'lucide-react';

export default function App() {
  // Mode: Live feed vs Manual
  const [mode, setMode] = useState<DataSourceMode>('live');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showTvTicker, setShowTvTicker] = useState<boolean>(true);

  // Chart View Mode: 'tradingview' | 'luxalgo' | 'split'
  const [chartViewMode, setChartViewMode] = useState<'tradingview' | 'luxalgo' | 'split'>('tradingview');
  // Big Chart & Cinema Mode (Full Width & Expansive height for easy analysis)
  const [isCinemaMode, setIsCinemaMode] = useState<boolean>(true);
  const [chartHeight, setChartHeight] = useState<number>(820);
  const [workspaceWidth, setWorkspaceWidth] = useState<'standard' | 'wide' | 'fluid'>('wide');
  const [isMarketOverviewCollapsed, setIsMarketOverviewCollapsed] = useState<boolean>(false);

  // Active Main Navigation Tab
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'DIME_STOCKS' | 'GOLD_CALC' | 'JOURNAL'>('DASHBOARD');

  // Currently Selected Asset (XAU/USD or US Stock symbol)
  const [currentAssetSymbol, setCurrentAssetSymbol] = useState<string>('XAU/USD');

  // Modals
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Market Quote State (Gold) - Real-world GTA & TradingView as of Sept 30, 2026
  const [quote, setQuote] = useState<MarketQuote>(() => ({
    spot: 4196.20, // Real-world benchmark Spot ($4,196.20 /oz)
    spotChange: 23.70,
    spotChangePercent: 0.57,
    spotHigh24h: 4218.80,
    spotLow24h: 4156.85,
    usdThb: 33.56,
    usdThbChange: 0.06,
    usdThbChangePercent: 0.18,
    premium: 0,
    lastUpdated: new Date().toLocaleTimeString('th-TH'),
  }));

  // Chart Timeframe & Candles
  const [timeframe, setTimeframe] = useState<Timeframe>('1H');
  const [candles, setCandles] = useState<Candle[]>(() => generateCandles(4196.20, 32, '1H'));

  // Trade Journal state persisted in localStorage
  const [trades, setTrades] = useState<TradeRecord[]>(() => {
    try {
      const saved = localStorage.getItem('pro_gold_trades_v3');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return initialJournalData;
  });

  // Save trades to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pro_gold_trades_v3', JSON.stringify(trades));
    } catch {
      // ignore
    }
  }, [trades]);

  // Initial Live USD/THB exchange rate fetch
  useEffect(() => {
    fetchLiveExchangeRate().then((liveRate) => {
      if (liveRate) {
        setQuote((prev) => ({
          ...prev,
          usdThb: liveRate,
          lastUpdated: new Date().toLocaleTimeString('th-TH'),
        }));
      }
    });
  }, []);

  // Price Alerts
  const [alerts, setAlerts] = useState<PriceAlert[]>([
    {
      id: 'al-1',
      asset: 'SPOT',
      condition: 'ABOVE',
      targetPrice: 4220.0,
      triggered: false,
      createdAt: '30/09/2026',
    },
    {
      id: 'al-2',
      asset: 'THAI_GOLD',
      condition: 'ABOVE',
      targetPrice: 67000,
      triggered: false,
      createdAt: '30/09/2026',
    },
    {
      id: 'al-3',
      asset: 'US_STOCK',
      assetSymbol: 'NVDA',
      condition: 'ABOVE',
      targetPrice: 140.0,
      triggered: false,
      createdAt: '30/09/2026',
    },
  ]);

  // Current active asset properties
  const isUsStock = currentAssetSymbol !== 'XAU/USD';
  const selectedUsStock = useMemo(() => {
    return popularDimeStocks.find((s) => s.symbol === currentAssetSymbol);
  }, [currentAssetSymbol]);

  const currentPrice = useMemo(() => {
    if (isUsStock && selectedUsStock) {
      return selectedUsStock.priceUsd;
    }
    return quote.spot;
  }, [isUsStock, selectedUsStock, quote.spot]);

  // Derived Thai Gold Rates (Fully reactive to quote.spot and quote.usdThb)
  const rates: ThaiGoldRates = useMemo(() => {
    return computeThaiRates(quote.spot, quote.usdThb, quote.premium);
  }, [quote.spot, quote.usdThb, quote.premium]);

  // Derived Pivot Levels for current asset
  const levels: SupportResistanceLevels = useMemo(() => {
    return calculatePivotLevels(currentPrice, quote.usdThb, quote.premium);
  }, [currentPrice, quote.usdThb, quote.premium]);

  // Derived Bollinger Bands %b (20, 2)
  const bbData = useMemo(() => {
    return calculateBollingerBandsPercentB(candles, currentPrice);
  }, [candles, currentPrice]);

  // Derived RSI (14)
  const rsiResult = useMemo(() => {
    return calculateRsi(candles, 14);
  }, [candles]);

  // Derived LuxAlgo SMC Data
  const luxData = useMemo(() => {
    return computeLuxAlgoData(currentPrice, candles, bbData, rsiResult.rsi);
  }, [currentPrice, candles, bbData, rsiResult.rsi]);

  // Derived Technical Indicators
  const indicators: TechnicalIndicators = useMemo(() => {
    return {
      rsi14: rsiResult.rsi,
      rsiSignal: rsiResult.signal,
      rsiDivergence: rsiResult.divergence,
      bbPercentB: bbData,
      luxAlgo: luxData,
      macd: {
        macdLine: 4.85,
        signalLine: 2.15,
        histogram: 2.7,
        trend: 'BULLISH_CROSS',
      },
      ema50: currentPrice * 0.985,
      ema200: currentPrice * 0.955,
      emaTrend: 'STRONG_BULLISH',
      overallSignal: luxData.signal,
      winRatePotential: luxData.signalConfidence,
    };
  }, [rsiResult, bbData, luxData, currentPrice]);

  // Recommended Strategy Plan
  const plan: StrategyPlan = useMemo(() => {
    const pivot = levels.pivot;
    const entryLow = parseFloat((pivot - currentPrice * 0.003).toFixed(2));
    const entryHigh = parseFloat((pivot + currentPrice * 0.002).toFixed(2));
    const tp1 = parseFloat((currentPrice + currentPrice * 0.007).toFixed(2));
    const tp2 = parseFloat((currentPrice + currentPrice * 0.015).toFixed(2));
    const sl = parseFloat((levels.s1 - currentPrice * 0.004).toFixed(2));

    const title = isUsStock
      ? `กลยุทธ์ LuxAlgo Swing บน ${currentAssetSymbol}`
      : 'Buy on Dip (สะสมตามแนวรับ)';

    const desc = isUsStock
      ? `ราคาหุ้น ${currentAssetSymbol} กำลังทดสอบแนวรับ LuxAlgo Bullish Order Block แนะนำเปิดออเดอร์สะสมบน Dime ในโซน $${entryLow} - $${entryHigh}`
      : `ราคา Spot ทดสอบแนวรับสำคัญใกล้ Pivot Point ($${pivot}) อิงราคา YLG แนะนำให้แบ่งไม้เข้าซื้อเพื่อความปลอดภัยสูงสุดและวาง TP ตามแนวต้าน R1 ($${levels.r1})`;

    return {
      title,
      badge: luxData.signal.replace('_', ' '),
      type: luxData.signal.includes('BUY') ? 'BUY' : 'SELL',
      description: desc,
      entryZoneSpot: [entryLow, entryHigh],
      entryZoneThb: [
        isUsStock ? entryLow * quote.usdThb : spotToThaiBaht(entryLow, quote.usdThb, quote.premium),
        isUsStock ? entryHigh * quote.usdThb : spotToThaiBaht(entryHigh, quote.usdThb, quote.premium),
      ],
      tp1Spot: tp1,
      tp1Thb: isUsStock ? tp1 * quote.usdThb : spotToThaiBaht(tp1, quote.usdThb, quote.premium),
      tp2Spot: tp2,
      tp2Thb: isUsStock ? tp2 * quote.usdThb : spotToThaiBaht(tp2, quote.usdThb, quote.premium),
      slSpot: sl,
      slThb: isUsStock ? sl * quote.usdThb : spotToThaiBaht(sl, quote.usdThb, quote.premium),
      riskRewardRatio: '1 : 2.50',
      timeframe: 'H1 / H4 Swing',
    };
  }, [currentPrice, quote.usdThb, quote.premium, levels, isUsStock, currentAssetSymbol, luxData.signal]);

  // Check Price Alerts
  const checkAlerts = useCallback(
    (currentSpotVal: number, currentThaiVal: number) => {
      let triggeredAny = false;
      setAlerts((prevAlerts) =>
        prevAlerts.map((al) => {
          if (al.triggered) return al;

          let hit = false;
          if (al.asset === 'SPOT') {
            if (al.condition === 'ABOVE' && currentSpotVal >= al.targetPrice) hit = true;
            if (al.condition === 'BELOW' && currentSpotVal <= al.targetPrice) hit = true;
          } else if (al.asset === 'THAI_GOLD') {
            if (al.condition === 'ABOVE' && currentThaiVal >= al.targetPrice) hit = true;
            if (al.condition === 'BELOW' && currentThaiVal <= al.targetPrice) hit = true;
          }

          if (hit) {
            triggeredAny = true;
            return { ...al, triggered: true };
          }
          return al;
        })
      );

      if (triggeredAny && soundEnabled) {
        playAlertChime();
      }
    },
    [soundEnabled]
  );

  // Live Tick Simulation Handler
  const handleMarketTick = useCallback(
    (customSpotDelta?: number) => {
      setQuote((prev) => {
        const delta = customSpotDelta !== undefined ? customSpotDelta : (Math.random() - 0.48) * 1.5;
        const newSpot = parseFloat((prev.spot + delta).toFixed(2));
        const newSpotChange = parseFloat((prev.spotChange + delta).toFixed(2));
        const newSpotChangePct = parseFloat(((newSpotChange / (newSpot - newSpotChange)) * 100).toFixed(2));
        const newHigh = Math.max(prev.spotHigh24h, newSpot);
        const newLow = Math.min(prev.spotLow24h, newSpot);

        // Update latest candle if watching Gold
        if (!isUsStock) {
          setCandles((prevCandles) => {
            if (prevCandles.length === 0) return prevCandles;
            const updated = [...prevCandles];
            const lastCandle = { ...updated[updated.length - 1] };
            lastCandle.close = newSpot;
            lastCandle.high = Math.max(lastCandle.high, newSpot);
            lastCandle.low = Math.min(lastCandle.low, newSpot);
            lastCandle.volume += Math.floor(Math.random() * 8) + 1;
            updated[updated.length - 1] = lastCandle;
            return updated;
          });
        }

        // Trigger alert check
        const newThaiVal = calculateThaiGoldPrice(newSpot, prev.usdThb, prev.premium);
        checkAlerts(newSpot, newThaiVal);

        return {
          ...prev,
          spot: newSpot,
          spotChange: newSpotChange,
          spotChangePercent: newSpotChangePct,
          spotHigh24h: newHigh,
          spotLow24h: newLow,
          lastUpdated: new Date().toLocaleTimeString('th-TH'),
        };
      });
    },
    [checkAlerts, isUsStock]
  );

  // Live Auto-Refresh Interval
  useEffect(() => {
    if (mode !== 'live') return;

    const timer = setInterval(() => {
      handleMarketTick();
    }, 5000);

    return () => clearInterval(timer);
  }, [mode, handleMarketTick]);

  // Asset Switcher Handler
  const handleSelectAsset = (symbol: string) => {
    setCurrentAssetSymbol(symbol);
    if (symbol === 'XAU/USD') {
      setCandles(generateCandles(quote.spot, 32, timeframe));
    } else {
      const stock = popularDimeStocks.find((s) => s.symbol === symbol);
      if (stock) {
        setCandles(generateCandles(stock.priceUsd, 32, timeframe));
      }
    }
  };

  // Stock selection from Dime Table
  const handleSelectStockForChart = (stock: UsStock) => {
    setCurrentAssetSymbol(stock.symbol);
    setCandles(generateCandles(stock.priceUsd, 32, timeframe));
    setActiveTab('DASHBOARD');
  };

  // Manual Quote Adjuster
  const handleUpdateManualQuote = (newSpot: number, newUsdThb: number, newPremium: number) => {
    setQuote((prev) => ({
      ...prev,
      spot: parseFloat(newSpot.toFixed(2)),
      usdThb: parseFloat(newUsdThb.toFixed(2)),
      premium: newPremium,
      lastUpdated: new Date().toLocaleTimeString('th-TH'),
    }));

    if (!isUsStock) {
      setCandles((prevCandles) => {
        if (prevCandles.length === 0) return prevCandles;
        const updated = [...prevCandles];
        const lastCandle = { ...updated[updated.length - 1] };
        lastCandle.close = newSpot;
        lastCandle.high = Math.max(lastCandle.high, newSpot);
        lastCandle.low = Math.min(lastCandle.low, newSpot);
        updated[updated.length - 1] = lastCandle;
        return updated;
      });
    }

    const newThaiVal = calculateThaiGoldPrice(newSpot, newUsdThb, newPremium);
    checkAlerts(newSpot, newThaiVal);
  };

  // Quick Refresh & Sync Live Exchange Rate
  const handleRefresh = async () => {
    setIsRefreshing(true);
    const liveRate = await fetchLiveExchangeRate();
    if (liveRate) {
      setQuote((prev) => ({
        ...prev,
        usdThb: liveRate,
      }));
    }
    handleMarketTick(2.0 * (Math.random() > 0.5 ? 1 : -1));
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Change Chart Timeframe
  const handleTimeframeChange = (tf: Timeframe) => {
    setTimeframe(tf);
    setCandles(generateCandles(currentPrice, 32, tf));
  };

  // Trade Journal Actions
  const handleAddTrade = (newTrade: Omit<TradeRecord, 'id'>) => {
    const trade: TradeRecord = {
      ...newTrade,
      id: `tr-${Date.now()}`,
      assetSymbol: currentAssetSymbol,
    };
    setTrades((prev) => [trade, ...prev]);
  };

  const handleCloseTrade = (
    id: string,
    exitPrice: number,
    status: 'CLOSED_WIN' | 'CLOSED_LOSS',
    pnlThb: number
  ) => {
    setTrades((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status, exitPrice, pnlThb } : t))
    );
  };

  const handleDeleteTrade = (id: string) => {
    setTrades((prev) => prev.filter((t) => t.id !== id));
  };

  const handleResetTrades = () => {
    if (window.confirm('คุณต้องการรีเซ็ตข้อมูลสมุดบันทึกเทรดเป็นชุดตัวอย่างหรือไม่?')) {
      setTrades(initialJournalData);
    }
  };

  const handleSaveActionPlanToJournal = (weight: number, notes?: string) => {
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    handleAddTrade({
      date: dateStr,
      type: 'BUY',
      spotEntry: currentPrice,
      thaiPrice: isUsStock ? currentPrice * quote.usdThb : rates.barBuy,
      weightBaht: weight,
      targetTp: plan.tp1Spot,
      stopLoss: plan.slSpot,
      status: 'OPEN',
      notes: notes || plan.title,
      assetSymbol: currentAssetSymbol,
    });
  };

  // Alerts Management
  const handleAddAlert = (newAlert: Omit<PriceAlert, 'id' | 'triggered' | 'createdAt'>) => {
    const alert: PriceAlert = {
      ...newAlert,
      id: `al-${Date.now()}`,
      triggered: false,
      createdAt: new Date().toLocaleDateString('th-TH'),
    };
    setAlerts((prev) => [alert, ...prev]);
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const activeAlertsCount = alerts.filter((a) => !a.triggered).length;

  // Dynamic Workspace Width class for expansive viewing
  const containerClass = useMemo(() => {
    if (workspaceWidth === 'fluid') return 'w-full px-3 sm:px-6';
    if (workspaceWidth === 'wide') return 'max-w-[1720px] w-full mx-auto px-4';
    return 'max-w-7xl w-full mx-auto px-4';
  }, [workspaceWidth]);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col antialiased selection:bg-amber-500/30 selection:text-amber-200">
      {/* Header */}
      <Header
        mode={mode}
        onModeChange={setMode}
        quote={quote}
        rates={rates}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        activeAlertsCount={activeAlertsCount}
        currentAssetSymbol={currentAssetSymbol}
        onSelectAsset={handleSelectAsset}
        containerClass={containerClass}
      />

      {/* Official TradingView Ticker Tape */}
      {showTvTicker && <TradingViewTickerTape />}

      {/* Main Navigation Segmented Bar */}
      <div className="bg-[#050914] border-b border-slate-800/80 sticky top-[80px] z-30 shadow-md">
        <div className={`${containerClass} py-2 flex items-center justify-between overflow-x-auto`}>
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveTab('DASHBOARD')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition ${
                activeTab === 'DASHBOARD'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>กระดานวิเคราะห์กราฟ & Indicator ({currentAssetSymbol})</span>
            </button>

            <button
              onClick={() => setActiveTab('DIME_STOCKS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition ${
                activeTab === 'DIME_STOCKS'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>หุ้นสหรัฐฯ บน Dime! (เริ่มต้น 50 ฿)</span>
            </button>

            <button
              onClick={() => setActiveTab('GOLD_CALC')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition ${
                activeTab === 'GOLD_CALC'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>คำนวณกำไรทอง & DCA ออมทอง</span>
            </button>

            <button
              onClick={() => setActiveTab('JOURNAL')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition ${
                activeTab === 'JOURNAL'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span>สมุดบันทึกเทรด ({trades.length})</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <button
              onClick={() => setShowTvTicker(!showTvTicker)}
              className="hover:text-amber-400 text-slate-500 text-[10px]"
            >
              {showTvTicker ? 'ซ่อน Ticker Tape' : 'แสดง Ticker Tape'}
            </button>
            <span>·</span>
            <span>สินทรัพย์:</span>
            <strong className="text-amber-400 font-bold">{currentAssetSymbol}</strong>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className={`flex-1 ${containerClass} py-6 space-y-6`}>
        {/* Market Overview Top Cards with TradingView Attribution */}
        <MarketOverview
          quote={quote}
          rates={rates}
          indicators={indicators}
          mode={mode}
          onUpdateManualQuote={handleUpdateManualQuote}
          onSyncLiveExchangeRate={handleRefresh}
          isCollapsed={isMarketOverviewCollapsed}
          onToggleCollapse={() => setIsMarketOverviewCollapsed(!isMarketOverviewCollapsed)}
        />

        {/* TAB 1: Main Dashboard (Chart + Indicators + Action Plan) */}
        {activeTab === 'DASHBOARD' && (
          <>
            {/* Chart Engine Switcher & Sizing Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs shadow-xl">
              <div className="flex items-center flex-wrap gap-3">
                {/* Engine Selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-medium">เครื่องมือกราฟ:</span>
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setChartViewMode('tradingview')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                        chartViewMode === 'tradingview'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>📈 TradingView Pro Live</span>
                    </button>
                    <button
                      onClick={() => setChartViewMode('luxalgo')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                        chartViewMode === 'luxalgo'
                          ? 'bg-gradient-to-r from-purple-600 to-amber-500 text-white font-bold shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                      <span>LuxAlgo SMC + BB%b</span>
                    </button>
                    <button
                      onClick={() => setChartViewMode('split')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                        chartViewMode === 'split'
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>⚡ กราฟคู่ (Dual)</span>
                    </button>
                  </div>
                </div>

                {/* Sizing & Layout Switcher */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-medium">เลย์เอาต์:</span>
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setIsCinemaMode(true)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition ${
                        isCinemaMode
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="กราฟกว้างเต็มจอ 100% วิเคราะห์ง่ายและชัดเจนที่สุด"
                    >
                      🖥️ กราฟเต็มจอ (Cinema 100%)
                    </button>
                    <button
                      onClick={() => setIsCinemaMode(false)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition ${
                        !isCinemaMode
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="จัดแสดงแบบ 2 คอลัมน์"
                    >
                      📊 2 คอลัมน์
                    </button>
                  </div>
                </div>

                {/* Workspace Width Switcher */}
                <div className="hidden lg:flex items-center gap-1.5">
                  <span className="text-slate-400 font-medium">ความกว้าง:</span>
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setWorkspaceWidth('wide')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition ${
                        workspaceWidth === 'wide'
                          ? 'bg-slate-800 text-amber-400 font-bold border border-amber-500/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="ขยายพื้นที่กว้าง 1720px สำหรับจอกว้าง"
                    >
                      📐 กว้างโปร (1720px)
                    </button>
                    <button
                      onClick={() => setWorkspaceWidth('fluid')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition ${
                        workspaceWidth === 'fluid'
                          ? 'bg-slate-800 text-amber-400 font-bold border border-amber-500/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="เต็มความกว้างจอ 100% ไร้ขอบ"
                    >
                      🖥️ เต็มจอ 100%
                    </button>
                    <button
                      onClick={() => setWorkspaceWidth('standard')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition ${
                        workspaceWidth === 'standard'
                          ? 'bg-slate-800 text-amber-400 font-bold border border-amber-500/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="ขนาดมาตรฐาน 1280px"
                    >
                      มาตรฐาน
                    </button>
                  </div>
                </div>

                {/* Height Selector */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[10px] px-1 font-mono">ความสูง:</span>
                  {[
                    { h: 700, label: '700px' },
                    { h: 820, label: '820px (ใหญ่)' },
                    { h: 950, label: '950px (โปร)' },
                    { h: 1100, label: '1100px (ยักษ์)' },
                  ].map((item) => (
                    <button
                      key={item.h}
                      onClick={() => setChartHeight(item.h)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-mono transition ${
                        chartHeight === item.h
                          ? 'bg-slate-800 text-amber-400 font-bold border border-amber-500/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
                <button
                  onClick={() => setIsMarketOverviewCollapsed(!isMarketOverviewCollapsed)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-sans border border-slate-700 transition"
                  title="สลับย่อ/ขยายการ์ดสรุปตลาดเพื่อขยับกราฟขึ้นด้านบน"
                >
                  {isMarketOverviewCollapsed ? '👁️ แสดงการ์ดสรุป' : '🎯 โฟกัสกราฟเต็มตา (ย่อการ์ดสรุป)'}
                </button>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{currentAssetSymbol} · {chartHeight}px</span>
              </div>
            </div>

            {/* Technical Chart & Action Plan / Side Widget */}
            {isCinemaMode ? (
              /* CINEMA / FULL-WIDTH LAYOUT (Big, Expansive & Easy to Analyze) */
              <div className="space-y-6">
                {/* 100% Full-Width Chart */}
                <div className="w-full">
                  {chartViewMode === 'tradingview' && (
                    <TradingViewChart
                      symbol={currentAssetSymbol}
                      interval="60"
                      height={chartHeight}
                      isCinemaMode={isCinemaMode}
                      onToggleCinemaMode={() => setIsCinemaMode(!isCinemaMode)}
                      onSelectSymbol={handleSelectAsset}
                      onHeightChange={(h) => setChartHeight(h)}
                    />
                  )}

                  {chartViewMode === 'luxalgo' && (
                    <TechnicalChart
                      candles={candles}
                      timeframe={timeframe}
                      onTimeframeChange={handleTimeframeChange}
                      usdThb={quote.usdThb}
                      premium={quote.premium}
                      assetTitle={isUsStock ? `${selectedUsStock?.name || currentAssetSymbol} (บน Dime)` : 'Gold Spot · Real-time Feed'}
                      assetSymbol={currentAssetSymbol}
                      isUsStock={isUsStock}
                      bbData={bbData}
                      luxData={luxData}
                      isCinemaMode={isCinemaMode}
                      onToggleCinemaMode={() => setIsCinemaMode(!isCinemaMode)}
                    />
                  )}

                  {chartViewMode === 'split' && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5 px-1">
                          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                          <span>1. กราฟสด TradingView Pro (OANDA Feed)</span>
                        </div>
                        <TradingViewChart
                          symbol={currentAssetSymbol}
                          interval="60"
                          height={Math.max(chartHeight - 80, 680)}
                          isCinemaMode={isCinemaMode}
                          onToggleCinemaMode={() => setIsCinemaMode(!isCinemaMode)}
                          onSelectSymbol={handleSelectAsset}
                          onHeightChange={(h) => setChartHeight(h)}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5 px-1">
                          <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                          <span>2. กราฟวิเคราะห์ LuxAlgo SMC + BB%b20 + RSI</span>
                        </div>
                        <TechnicalChart
                          candles={candles}
                          timeframe={timeframe}
                          onTimeframeChange={handleTimeframeChange}
                          usdThb={quote.usdThb}
                          premium={quote.premium}
                          assetTitle={isUsStock ? `${selectedUsStock?.name || currentAssetSymbol} (บน Dime)` : 'Gold Spot · Real-time Feed'}
                          assetSymbol={currentAssetSymbol}
                          isUsStock={isUsStock}
                          bbData={bbData}
                          luxData={luxData}
                          isCinemaMode={isCinemaMode}
                          onToggleCinemaMode={() => setIsCinemaMode(!isCinemaMode)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Meter & Plan Row Under the Giant Chart */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TradingViewTechnical
                    symbol={currentAssetSymbol}
                    interval="1h"
                    height={340}
                  />

                  <ActionPlan
                    plan={plan}
                    quote={quote}
                    rates={rates}
                    onSaveToJournal={handleSaveActionPlanToJournal}
                  />
                </div>
              </div>
            ) : (
              /* CLASSIC 2-COLUMN LAYOUT */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  {chartViewMode === 'tradingview' && (
                    <TradingViewChart
                      symbol={currentAssetSymbol}
                      interval="60"
                      height={chartHeight}
                      isCinemaMode={isCinemaMode}
                      onToggleCinemaMode={() => setIsCinemaMode(!isCinemaMode)}
                      onSelectSymbol={handleSelectAsset}
                      onHeightChange={(h) => setChartHeight(h)}
                    />
                  )}

                  {chartViewMode === 'luxalgo' && (
                    <TechnicalChart
                      candles={candles}
                      timeframe={timeframe}
                      onTimeframeChange={handleTimeframeChange}
                      usdThb={quote.usdThb}
                      premium={quote.premium}
                      assetTitle={isUsStock ? `${selectedUsStock?.name || currentAssetSymbol} (บน Dime)` : 'Gold Spot · Real-time Feed'}
                      assetSymbol={currentAssetSymbol}
                      isUsStock={isUsStock}
                      bbData={bbData}
                      luxData={luxData}
                      isCinemaMode={isCinemaMode}
                      onToggleCinemaMode={() => setIsCinemaMode(!isCinemaMode)}
                    />
                  )}

                  {chartViewMode === 'split' && (
                    <div className="space-y-4">
                      <TradingViewChart
                        symbol={currentAssetSymbol}
                        interval="60"
                        height={550}
                        isCinemaMode={isCinemaMode}
                        onToggleCinemaMode={() => setIsCinemaMode(!isCinemaMode)}
                        onSelectSymbol={handleSelectAsset}
                        onHeightChange={(h) => setChartHeight(h)}
                      />
                      <TechnicalChart
                        candles={candles}
                        timeframe={timeframe}
                        onTimeframeChange={handleTimeframeChange}
                        usdThb={quote.usdThb}
                        premium={quote.premium}
                        assetTitle={isUsStock ? `${selectedUsStock?.name || currentAssetSymbol} (บน Dime)` : 'Gold Spot · Real-time Feed'}
                        assetSymbol={currentAssetSymbol}
                        isUsStock={isUsStock}
                        bbData={bbData}
                        luxData={luxData}
                        isCinemaMode={isCinemaMode}
                        onToggleCinemaMode={() => setIsCinemaMode(!isCinemaMode)}
                      />
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <TradingViewTechnical
                    symbol={currentAssetSymbol}
                    interval="1h"
                    height={320}
                  />

                  <ActionPlan
                    plan={plan}
                    quote={quote}
                    rates={rates}
                    onSaveToJournal={handleSaveActionPlanToJournal}
                  />
                </div>
              </div>
            )}

            {/* Advanced Multi-Indicator Matrix (RSI, BB %b 20, LuxAlgo SMC) */}
            <IndicatorMatrix
              indicators={indicators}
              levels={levels}
              spotPrice={currentPrice}
              bbData={bbData}
              luxData={luxData}
              assetSymbol={currentAssetSymbol}
              isUsStock={isUsStock}
            />

            {/* Quick Link to Dime Stocks */}
            <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>📱 ซื้อทองคำหรือหุ้น {currentAssetSymbol} ผ่าน Dime! ได้ง่ายๆ</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  เชื่อมโยงราคาโลกแบบ Real-time เริ่มต้นเพียง 50 บาท มีทั้งทองคำแท่งโลก (GLD, IAU) และหุ้นระดับโลก
                </p>
              </div>
              <button
                onClick={() => setActiveTab('DIME_STOCKS')}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition"
              >
                ดูหุ้นสหรัฐฯ ทั้งหมดบน Dime →
              </button>
            </div>
          </>
        )}

        {/* TAB 2: Dime US Stocks Intelligence & Fractional Calculator */}
        {activeTab === 'DIME_STOCKS' && (
          <DimeUsStocks
            usdThb={quote.usdThb}
            onSelectStockForChart={handleSelectStockForChart}
            selectedStockSymbol={currentAssetSymbol}
          />
        )}

        {/* TAB 3: Gold Calculator & DCA Simulator */}
        {activeTab === 'GOLD_CALC' && (
          <GoldCalculator quote={quote} rates={rates} />
        )}

        {/* TAB 4: Trade Journal */}
        {activeTab === 'JOURNAL' && (
          <TradeJournal
            trades={trades}
            onAddTrade={handleAddTrade}
            onCloseTrade={handleCloseTrade}
            onDeleteTrade={handleDeleteTrade}
            onResetTrades={handleResetTrades}
            currentSpot={currentPrice}
            currentThaiPrice={isUsStock ? currentPrice * quote.usdThb : rates.barSell}
          />
        )}

        {/* If on DASHBOARD, still show Journal preview at bottom */}
        {activeTab === 'DASHBOARD' && (
          <div className="pt-2">
            <TradeJournal
              trades={trades}
              onAddTrade={handleAddTrade}
              onCloseTrade={handleCloseTrade}
              onDeleteTrade={handleDeleteTrade}
              onResetTrades={handleResetTrades}
              currentSpot={currentPrice}
              currentThaiPrice={isUsStock ? currentPrice * quote.usdThb : rates.barSell}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-slate-900 bg-[#02050e] text-center text-xs text-slate-500 space-y-2">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
              Au
            </div>
            <span className="font-semibold text-slate-300">PRO GOLD & US STOCKS TRADER</span>
            <span>·</span>
            <span>เชื่อมโยง TradingView Realtime Feed & สมาคมค้าทองคำ</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>TradingView: OANDA:XAUUSD</span>
            <span>·</span>
            <span>FX_IDC:USDTHB</span>
            <span>·</span>
            <span>สมาคมค้าทองคำ (GTA)</span>
            <span>·</span>
            <span>YLG Bullion</span>
            <span>·</span>
            <span>ฮั่วเซ่งเฮง</span>
            <span>·</span>
            <span>Dime! Securities</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-600">
          การลงทุนในทองคำและหุ้นสหรัฐฯ มีความเสี่ยง ผู้ลงทุนควรศึกษาข้อมูลและบริหารความเสี่ยงอย่างรอบคอบก่อนตัดสินใจลงทุน
        </p>
      </footer>

      {/* Modals */}
      <PriceAlertsModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        alerts={alerts}
        onAddAlert={handleAddAlert}
        onDeleteAlert={handleDeleteAlert}
        onTestSound={playAlertChime}
        currentSpot={currentPrice}
        currentThaiPrice={rates.barSell}
      />

      <MarketGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
