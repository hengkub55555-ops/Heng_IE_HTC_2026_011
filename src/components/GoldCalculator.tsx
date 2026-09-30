import React, { useState } from 'react';
import { Calculator, Sparkles, TrendingUp, PiggyBank, ArrowRight, Check } from 'lucide-react';
import { MarketQuote, ThaiGoldRates } from '../types/gold';
import { formatCurrency, formatSpot } from '../utils/goldMath';

interface GoldCalculatorProps {
  quote: MarketQuote;
  rates: ThaiGoldRates;
}

export const GoldCalculator: React.FC<GoldCalculatorProps> = ({ quote, rates }) => {
  const [activeTab, setActiveTab] = useState<'physical' | 'dca' | 'tfex'>('physical');

  // Physical Gold Calculator State
  const [weight, setWeight] = useState<number>(1);
  const [buyPrice, setBuyPrice] = useState<number>(rates.barBuy);
  const [sellPrice, setSellPrice] = useState<number>(rates.barSell + 1000);
  const [blockFee, setBlockFee] = useState<number>(weight >= 5 ? 0 : 150);

  // DCA Simulator State
  const [monthlyDeposit, setMonthlyDeposit] = useState<number>(5000);
  const [durationMonths, setDurationMonths] = useState<number>(12);
  const [annualGrowthRate, setAnnualGrowthRate] = useState<number>(10);

  // Calculations for Physical Gold
  const totalCost = (buyPrice * weight) + (blockFee * (weight < 5 ? 1 : 0));
  const totalGrossRevenue = sellPrice * weight;
  const netProfit = totalGrossRevenue - totalCost;
  const roiPercent = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
  const breakEvenPrice = Math.ceil(totalCost / weight);
  // Estimate Spot break-even
  const breakEvenSpot = quote.spot * (breakEvenPrice / rates.barSell);

  // Update prices when weight changes
  const handleWeightChange = (newWeight: number) => {
    setWeight(newWeight);
    if (newWeight >= 5) {
      setBlockFee(0); // Gold shops usually waive block fee for 5+ baht
    } else {
      setBlockFee(150);
    }
  };

  // DCA Projections
  const totalCapitalDca = monthlyDeposit * durationMonths;
  // Estimated average gold purchase price assuming compound growth
  const monthlyRate = Math.pow(1 + annualGrowthRate / 100, 1 / 12) - 1;
  let dcaFutureValue = 0;
  for (let m = 1; m <= durationMonths; m++) {
    dcaFutureValue += monthlyDeposit * Math.pow(1 + monthlyRate, durationMonths - m + 1);
  }
  const dcaNetProfit = dcaFutureValue - totalCapitalDca;
  const dcaEstimatedWeightBaht = totalCapitalDca / rates.barSell;
  const dcaEstimatedGrams = dcaEstimatedWeightBaht * 15.244;

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur space-y-4">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm sm:text-base">
              เครื่องคิดเลขทองคำ 96.5% & แผนการลงทุน
            </h3>
            <p className="text-xs text-slate-400">
              คำนวณต้นทุน กำไรสุทธิ ผลตอบแทน ROI และจำลองพอร์ตออมทอง
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('physical')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'physical'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            คำนวณกำไรทองแท่ง
          </button>
          <button
            onClick={() => setActiveTab('dca')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'dca'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            จำลองออมทอง (DCA)
          </button>
          <button
            onClick={() => setActiveTab('tfex')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'tfex'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ทองแท่ง vs TFEX GO
          </button>
        </div>
      </div>

      {/* TAB 1: Physical Bullion Calculator */}
      {activeTab === 'physical' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            {/* Weight Selector */}
            <div>
              <label className="block text-slate-400 font-medium mb-1.5">
                น้ำหนักทองคำ (บาททอง)
              </label>
              <select
                value={weight}
                onChange={(e) => handleWeightChange(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl p-2.5 text-white font-mono font-medium focus:outline-none"
              >
                <option value={0.25}>1 สลึง (0.25 บาท = 3.81 กรัม)</option>
                <option value={0.5}>2 สลึง (0.50 บาท = 7.62 กรัม)</option>
                <option value={1}>1 บาททองคำ (15.244 กรัม)</option>
                <option value={2}>2 บาททองคำ (30.488 กรัม)</option>
                <option value={5}>5 บาททองคำ (76.22 กรัม - ฟรีค่าบล็อก)</option>
                <option value={10}>10 บาททองคำ (152.44 กรัม)</option>
                <option value={20}>20 บาททองคำ (304.88 กรัม)</option>
                <option value={65.6}>1 กิโลกรัม (~65.6 บาททอง)</option>
              </select>
              <div className="mt-1.5 text-[11px] text-slate-500 font-mono">
                = {(weight * 15.244).toFixed(2)} กรัม
              </div>
            </div>

            {/* Buy Price */}
            <div>
              <label className="block text-slate-400 font-medium mb-1.5">
                ราคาซื้อเข้า (บาท / บาททอง)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="50"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setBuyPrice(rates.barBuy)}
                  className="absolute right-2 top-2 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded"
                >
                  ราคาตลาด
                </button>
              </div>
              <div className="mt-1.5 text-[11px] text-slate-500 font-mono">
                ต้นทุนทอง: {formatCurrency(buyPrice * weight)} ฿
              </div>
            </div>

            {/* Target Sell Price */}
            <div>
              <label className="block text-slate-400 font-medium mb-1.5">
                ราคาเป้าหมายขายออก (บาท / บาททอง)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="50"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setSellPrice(rates.barSell + 1000)}
                  className="absolute right-2 top-2 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded"
                >
                  +1,000 ฿
                </button>
              </div>
              <div className="mt-1.5 text-[11px] text-slate-500 font-mono">
                ยอดขาย: {formatCurrency(sellPrice * weight)} ฿
              </div>
            </div>

            {/* Block fee */}
            <div>
              <label className="block text-slate-400 font-medium mb-1.5">
                ค่าบล็อก / ค่ากำเหน็จ (บาท)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="10"
                  value={blockFee}
                  onChange={(e) => setBlockFee(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl p-2.5 text-white font-mono font-medium focus:outline-none"
                />
                {weight >= 5 && (
                  <span className="absolute right-3 top-2.5 text-[11px] text-emerald-400 font-semibold">
                    ฟรี (5 บาทขึ้นไป)
                  </span>
                )}
              </div>
              <div className="mt-1.5 text-[11px] text-slate-500 font-mono">
                {blockFee === 0 ? 'ไม่มีค่าธรรมเนียม' : `รวม ${formatCurrency(blockFee)} ฿`}
              </div>
            </div>
          </div>

          {/* Profit Output Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-xs block">เงินลงทุนรวม (Total Cost):</span>
              <span className="text-white font-mono font-bold text-lg mt-0.5 block">
                {formatCurrency(totalCost)} ฿
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                รวมค่าบล็อก {blockFee} ฿
              </span>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-xs block">ยอดเงินเมื่อขาย (Gross Return):</span>
              <span className="text-white font-mono font-bold text-lg mt-0.5 block">
                {formatCurrency(totalGrossRevenue)} ฿
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                ขายที่ {formatCurrency(sellPrice)} ฿/บาท
              </span>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                netProfit >= 0
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-rose-500/10 border-rose-500/30'
              }`}
            >
              <span className="text-slate-400 text-xs block">กำไร/ขาดทุนสุทธิ (Net PnL):</span>
              <span
                className={`font-mono font-bold text-xl mt-0.5 block ${
                  netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {netProfit >= 0 ? '+' : ''}
                {formatCurrency(netProfit)} ฿
              </span>
              <span
                className={`text-xs font-mono font-semibold ${
                  netProfit >= 0 ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                ROI: {netProfit >= 0 ? '+' : ''}
                {roiPercent.toFixed(2)}%
              </span>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-amber-500/20">
              <span className="text-amber-400 text-xs font-medium block">จุดคุ้มทุน (Break-even):</span>
              <span className="text-amber-300 font-mono font-bold text-lg mt-0.5 block">
                {formatCurrency(breakEvenPrice)} ฿
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                เทียบ Spot ~{formatSpot(breakEvenSpot)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DCA Simulator */}
      {activeTab === 'dca' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1.5">
                เงินออมทองต่อเดือน (บาท)
              </label>
              <input
                type="number"
                step="500"
                value={monthlyDeposit}
                onChange={(e) => setMonthlyDeposit(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none"
              />
              <div className="flex gap-1.5 mt-1.5">
                {[3000, 5000, 10000, 20000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setMonthlyDeposit(amt)}
                    className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 hover:text-slate-200 text-[10px] font-mono"
                  >
                    {amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1.5">
                ระยะเวลาออม (เดือน)
              </label>
              <select
                value={durationMonths}
                onChange={(e) => setDurationMonths(parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl p-2.5 text-white font-mono font-medium focus:outline-none"
              >
                <option value={6}>6 เดือน (ครึ่งปี)</option>
                <option value={12}>12 เดือน (1 ปี)</option>
                <option value={24}>24 เดือน (2 ปี)</option>
                <option value={36}>36 เดือน (3 ปี)</option>
                <option value={60}>60 เดือน (5 ปี)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1.5">
                คาดการณ์การเติบโตทองคำต่อปี (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={annualGrowthRate}
                onChange={(e) => setAnnualGrowthRate(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none"
              />
              <div className="mt-1.5 text-[11px] text-slate-500">
                ค่าเฉลี่ยสถิติโลกย้อนหลัง 10 ปี ~ 8-12% ต่อปี
              </div>
            </div>
          </div>

          {/* DCA Output */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-amber-500/20 grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-slate-400 text-xs block">เงินต้นสะสมทั้งหมด:</span>
              <span className="text-white font-mono font-bold text-lg mt-0.5 block">
                {formatCurrency(totalCapitalDca)} ฿
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {monthlyDeposit.toLocaleString()} ฿ × {durationMonths} ด.
              </span>
            </div>

            <div>
              <span className="text-slate-400 text-xs block">น้ำหนักทองสะสมประมาณการ:</span>
              <span className="text-amber-300 font-mono font-bold text-lg mt-0.5 block">
                {dcaEstimatedWeightBaht.toFixed(2)} บาททอง
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                ~{dcaEstimatedGrams.toFixed(1)} กรัม
              </span>
            </div>

            <div>
              <span className="text-slate-400 text-xs block">มูลค่าพอร์ตปลายทาง:</span>
              <span className="text-emerald-400 font-mono font-bold text-lg mt-0.5 block">
                {formatCurrency(dcaFutureValue)} ฿
              </span>
              <span className="text-[10px] text-emerald-500 font-mono">
                รวมผลตอบแทนทบต้น
              </span>
            </div>

            <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
              <span className="text-emerald-400 text-xs font-semibold block">กำไรสุทธิคาดการณ์:</span>
              <span className="text-emerald-300 font-mono font-bold text-lg mt-0.5 block">
                +{formatCurrency(dcaNetProfit)} ฿
              </span>
              <span className="text-[11px] text-emerald-400/80 font-mono">
                (+{((dcaNetProfit / totalCapitalDca) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Physical vs TFEX GO Comparison */}
      {activeTab === 'tfex' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Physical Gold */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-amber-500/30 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-amber-400 text-sm">ทองคำแท่ง 96.5% (Physical Bar)</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono">
                ถือครองจริง 100%
              </span>
            </div>
            <ul className="space-y-1.5 text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>ไม่มี Margin Call ไม่มีความเสี่ยงถูกบังคับปิดสัญญา</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>ได้รับสินทรัพย์จริง สามารถถอนเป็นทองคำแท่งได้</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>กำไรจากส่วนต่างราคาบุคคลธรรมดาได้รับการยกเว้นภาษี</span>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <span>·</span>
                <span>ต้องจ่ายเงินเต็มจำนวน (100% Cash)</span>
              </li>
            </ul>
          </div>

          {/* TFEX GO */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-blue-500/30 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-blue-400 text-sm">TFEX Gold Online (GO Futures)</span>
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono">
                Leverage ~10x-15x
              </span>
            </div>
            <ul className="space-y-1.5 text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>อิง Gold Spot โลกโดยตรง ไม่มีความเสี่ยงจากอัตราแลกเปลี่ยน THB</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>เทรดได้ทั้ง 2 ขา (เปิด Long เมื่อมองขึ้น / Short เมื่อมองลง)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>วางเงินหลักประกันเริ่มต้น (Initial Margin) เพียง ~10%</span>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <span>·</span>
                <span>มีวันหมดอายุสัญญา (Quarterly Expiry) และมีความเสี่ยงถูก Force Close</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
