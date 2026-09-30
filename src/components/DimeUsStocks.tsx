import React, { useState } from 'react';
import {
  TrendingUp,
  Search,
  DollarSign,
  Calculator,
  ExternalLink,
  Sparkles,
  Info,
  Clock,
  Layers,
  Activity,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { UsStock, StockCategory } from '../types/gold';
import { popularDimeStocks } from '../data/dimeStocks';
import { formatCurrency, formatSpot } from '../utils/goldMath';

interface DimeUsStocksProps {
  usdThb: number;
  onSelectStockForChart: (stock: UsStock) => void;
  selectedStockSymbol: string;
}

export const DimeUsStocks: React.FC<DimeUsStocksProps> = ({
  usdThb,
  onSelectStockForChart,
  selectedStockSymbol,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Calculator state
  const [calcStock, setCalcStock] = useState<UsStock>(popularDimeStocks[0]); // default NVDA
  const [investBaht, setInvestBaht] = useState<number>(500);

  // Filter stocks
  const filteredStocks = popularDimeStocks.filter((stock) => {
    const matchesCategory =
      selectedCategory === 'ALL' || stock.category === selectedCategory;
    const matchesSearch =
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.thaiName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculator computations
  const investUsd = investBaht / usdThb;
  const sharesReceived = investUsd / calcStock.priceUsd;
  const estAnnualDividendUsd = investUsd * (calcStock.dividendYield / 100);
  const estAnnualDividendThb = estAnnualDividendUsd * usdThb;

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold text-sm shadow-lg shadow-emerald-500/20">
            Dime!
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-100 text-base">
                ศูนย์ข้อมูลหุ้นสหรัฐฯ ยอดนิยมสำหรับลงทุนผ่าน Dime!
              </h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono border border-emerald-500/30">
                เริ่มต้น 50 บาท
              </span>
            </div>
            <p className="text-xs text-slate-400">
              วิเคราะห์หุ้นสหรัฐฯ และ ETF ระดับโลกด้วย RSI, BB %b20, และสัญญาณ LuxAlgo พร้อมเครื่องคำนวณซื้อเศษหุ้น
            </p>
          </div>
        </div>

        {/* Dime Badge & Market Hours Status */}
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            ตลาด US: 20:30 - 03:00 น.
          </span>
          <span className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-400 font-mono text-[11px]">
            เรทอ้างอิง: {usdThb.toFixed(2)} ฿/$
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {[
            { id: 'ALL', label: 'ทั้งหมด' },
            { id: 'MAG7', label: '★ Magnificent 7' },
            { id: 'ETF', label: 'S&P 500 & Tech ETFs' },
            { id: 'GOLD_ETF', label: 'ทองคำบน Dime (GLD/IAU)' },
            { id: 'DIVIDEND', label: 'ปันผลสูง (Dividend)' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                selectedCategory === cat.id
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="ค้นหาชื่อย่อหุ้น (เช่น NVDA, AAPL, GLD)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-400 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Stocks Grid / Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-slate-950/90 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-mono">
            <tr>
              <th className="p-3">ชื่อย่อ / บริษัท</th>
              <th className="p-3">ราคา USD</th>
              <th className="p-3">แปลงเป็นเงินบาท (Dime)</th>
              <th className="p-3">เปลี่ยนแปลง (24h)</th>
              <th className="p-3">ปันผล (Yield)</th>
              <th className="p-3">RSI (14)</th>
              <th className="p-3">BB %b20</th>
              <th className="p-3">LuxAlgo Signal</th>
              <th className="p-3 text-right">เลือกวิเคราะห์</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-950/30 text-slate-300">
            {filteredStocks.map((st) => {
              const isSelected = selectedStockSymbol === st.symbol;
              const isUp = st.changePercent >= 0;
              const priceThb = st.priceUsd * usdThb;

              return (
                <tr
                  key={st.symbol}
                  className={`hover:bg-slate-800/40 transition cursor-pointer ${
                    isSelected ? 'bg-emerald-500/10 border-l-2 border-emerald-400' : ''
                  }`}
                  onClick={() => onSelectStockForChart(st)}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-white text-xs">
                        {st.symbol.slice(0, 3)}
                      </div>
                      <div>
                        <div className="font-bold text-white font-mono flex items-center gap-1.5">
                          <span>{st.symbol}</span>
                          {st.category === 'MAG7' && (
                            <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-mono">
                              Mag7
                            </span>
                          )}
                          {st.category === 'GOLD_ETF' && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono">
                              Gold
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                          {st.thaiName}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-3 font-mono font-bold text-white whitespace-nowrap">
                    {formatSpot(st.priceUsd)}
                  </td>

                  <td className="p-3 font-mono font-semibold text-emerald-400 whitespace-nowrap">
                    ~{formatCurrency(priceThb)} ฿
                  </td>

                  <td className="p-3 font-mono whitespace-nowrap">
                    <span
                      className={`font-semibold ${
                        isUp ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isUp ? '+' : ''}
                      {st.changePercent.toFixed(2)}%
                    </span>
                  </td>

                  <td className="p-3 font-mono text-slate-300 whitespace-nowrap">
                    {st.dividendYield > 0 ? (
                      <span className="text-amber-400 font-semibold">{st.dividendYield}%</span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>

                  {/* RSI */}
                  <td className="p-3 font-mono whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        st.rsi14 >= 70
                          ? 'bg-rose-500/20 text-rose-400'
                          : st.rsi14 <= 30
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {st.rsi14.toFixed(1)}
                    </span>
                  </td>

                  {/* BB %b 20 */}
                  <td className="p-3 font-mono whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        st.bbPercentB >= 0.8
                          ? 'bg-sky-500/20 text-sky-300'
                          : st.bbPercentB <= 0.3
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {st.bbPercentB.toFixed(2)}
                    </span>
                  </td>

                  {/* LuxAlgo */}
                  <td className="p-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 w-max ${
                        st.luxAlgoSignal.includes('BUY')
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      {st.luxAlgoSignal.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="p-3 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStockForChart(st);
                        setCalcStock(st);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {isSelected ? 'กำลังดูกราฟ' : 'ดูกราฟ'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Section 2: Dime Fractional Investment Calculator */}
      <div className="bg-slate-950/80 p-5 rounded-xl border border-emerald-500/30 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <h4 className="font-bold text-slate-100 text-sm">
              เครื่องคำนวณซื้อเศษหุ้นบน Dime! (Fractional Shares Calculator)
            </h4>
          </div>
          <span className="text-xs text-slate-400">
            จำลองการซื้อหุ้น <strong className="text-emerald-400 font-mono">{calcStock.symbol}</strong> ({calcStock.thaiName})
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1.5">
              เลือกหุ้น / ETF ที่ต้องการคำนวณ
            </label>
            <select
              value={calcStock.symbol}
              onChange={(e) => {
                const found = popularDimeStocks.find((s) => s.symbol === e.target.value);
                if (found) setCalcStock(found);
              }}
              className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-xl p-2.5 text-white font-mono font-medium focus:outline-none"
            >
              {popularDimeStocks.map((s) => (
                <option key={s.symbol} value={s.symbol}>
                  {s.symbol} - {s.name} (${s.priceUsd})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1.5">
              จำนวนเงินบาทที่ต้องการลงทุน (เริ่มต้น 50 บาท)
            </label>
            <input
              type="number"
              step="50"
              min="50"
              value={investBaht}
              onChange={(e) => setInvestBaht(parseFloat(e.target.value) || 50)}
              className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none"
            />
            <div className="flex gap-1.5 mt-1.5">
              {[50, 200, 500, 1000, 5000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setInvestBaht(amt)}
                  className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white text-[10px] font-mono"
                >
                  {amt.toLocaleString()} ฿
                </button>
              ))}
            </div>
          </div>

          {/* Result Output */}
          <div className="bg-slate-900 p-3 rounded-xl border border-emerald-500/20 flex flex-col justify-center">
            <span className="text-slate-400 text-[11px] block">จำนวนเศษหุ้นที่จะได้รับใน Dime:</span>
            <div className="text-emerald-400 font-mono font-bold text-xl mt-0.5">
              {sharesReceived.toFixed(5)} <span className="text-sm font-normal text-slate-300">หุ้น {calcStock.symbol}</span>
            </div>
            <div className="text-slate-400 text-[11px] font-mono mt-1">
              เทียบเท่า ~${investUsd.toFixed(2)} USD (อัตรา {usdThb.toFixed(2)} ฿/$)
            </div>
          </div>
        </div>

        {/* Calculation Benefit Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">เงินปันผลต่อปีประมาณการ:</span>
            <strong className="text-amber-400 font-mono text-sm">
              {calcStock.dividendYield > 0
                ? `${estAnnualDividendThb.toFixed(2)} ฿ / ปี ($${estAnnualDividendUsd.toFixed(2)})`
                : 'ไม่มีปันผล (เน้นเติบโต Capital Gain)'}
            </strong>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">จุดเด่นสินทรัพย์นี้:</span>
            <span className="text-slate-200 text-[11px] font-medium leading-relaxed">
              {calcStock.descriptionThai}
            </span>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px]">เทรดบน Dime!:</span>
              <span className="text-emerald-400 text-xs font-bold">ไม่มีค่าธรรมเนียมขั้นต่ำ</span>
            </div>
            <button
              onClick={() => onSelectStockForChart(calcStock)}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition"
            >
              <span>ดูกราฟหุ้นนี้</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: Dime Playbook & Tax Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <CheckCircle className="w-4 h-4" />
            <span>ซื้อเศษหุ้น (Fractional Shares)</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            แม้หุ้นอย่าง MSFT หรือ VOO จะราคาหลักหลายร้อยดอลลาร์ แต่บน Dime สามารถซื้อด้วยเงินบาทเริ่มต้นเพียง 50 บาท
            ระบบจะแปลงเป็นเศษทศนิยมให้โดยอัตโนมัติ
          </p>
        </div>

        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-1.5 text-blue-400 font-bold">
            <Info className="w-4 h-4" />
            <span>ภาษีเงินปันผลสหรัฐฯ (W-8BEN)</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            คนไทยได้รับสิทธิประโยชน์ตามอนุสัญญาภาษีซ้อน (DTA) โดยเสียภาษีหัก ณ ที่จ่ายจากเงินปันผลเพียง <strong>15%</strong> (จากปกติ 30%)
            โดย Dime ดำเนินการยื่นแบบฟอร์ม W-8BEN ให้อัตโนมัติ
          </p>
        </div>

        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <Clock className="w-4 h-4" />
            <span>ช่วงเวลาเทรดตลาดหุ้นสหรัฐฯ</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            ตลาดเปิดทำการ <strong>20:30 - 03:00 น.</strong> (เวลาไทยช่วง Daylight Saving)
            และ <strong>21:30 - 04:00 น.</strong> (ช่วงฤดูหนาว) สามารถตั้งออเดอร์ล่วงหน้าได้ตลอด 24 ชั่วโมง
          </p>
        </div>
      </div>
    </div>
  );
};
