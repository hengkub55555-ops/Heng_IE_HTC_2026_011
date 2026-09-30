import React, { useState } from 'react';
import { Crosshair, CheckCircle2, AlertTriangle, ArrowRight, BookmarkPlus } from 'lucide-react';
import { StrategyPlan, MarketQuote, ThaiGoldRates } from '../types/gold';
import { formatCurrency, formatSpot } from '../utils/goldMath';

interface ActionPlanProps {
  plan: StrategyPlan;
  quote: MarketQuote;
  rates: ThaiGoldRates;
  onSaveToJournal: (weight: number, notes?: string) => void;
}

export const ActionPlan: React.FC<ActionPlanProps> = ({
  plan,
  quote,
  rates,
  onSaveToJournal,
}) => {
  const [selectedWeight, setSelectedWeight] = useState<number>(1);
  const [customNote, setCustomNote] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleExecute = () => {
    onSaveToJournal(selectedWeight, customNote || plan.description);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur flex flex-col justify-between space-y-4">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Crosshair className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm sm:text-base">
                แผนการเทรดแนะนำ (Action Plan)
              </h3>
              <p className="text-xs text-slate-400">
                ประเมินความเสี่ยงและจุดเข้าทำกำไรที่ได้เปรียบทางสถิติ
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {plan.badge}
          </span>
        </div>

        {/* Strategy Description Box */}
        <div className="mt-4 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>กลยุทธ์: {plan.title}</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            {plan.description}
          </p>
          <div className="pt-1 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/60 font-mono">
            <span>Risk / Reward Ratio:</span>
            <span className="text-amber-400 font-bold">{plan.riskRewardRatio}</span>
          </div>
        </div>

        {/* Key Targets & Stop Loss */}
        <div className="mt-4 space-y-2.5 text-xs">
          {/* Entry Zone */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="text-slate-300">โซนเข้าซื้อ (Entry Zone):</span>
            </div>
            <div className="text-right">
              <span className="text-amber-300 font-mono font-bold block">
                {formatSpot(plan.entryZoneSpot[0])} - {formatSpot(plan.entryZoneSpot[1])}
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                ~{formatCurrency(plan.entryZoneThb[0])} - {formatCurrency(plan.entryZoneThb[1])} ฿
              </span>
            </div>
          </div>

          {/* Target Profit 1 */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-emerald-500/30 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-slate-300">เป้าหมายทำกำไร (TP1):</span>
            </div>
            <div className="text-right">
              <span className="text-emerald-400 font-mono font-bold block">
                {formatSpot(plan.tp1Spot)}
              </span>
              <span className="text-emerald-300/80 font-mono text-[11px]">
                ~{formatCurrency(plan.tp1Thb)} ฿ / บาททอง
              </span>
            </div>
          </div>

          {/* Stop Loss */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-rose-500/30 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-slate-300">จุดตัดขาดทุน (SL):</span>
            </div>
            <div className="text-right">
              <span className="text-rose-400 font-mono font-bold block">
                {formatSpot(plan.slSpot)}
              </span>
              <span className="text-rose-300/80 font-mono text-[11px]">
                ~{formatCurrency(plan.slThb)} ฿ / บาททอง
              </span>
            </div>
          </div>
        </div>

        {/* Trade Execution Inputs */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              เลือกน้ำหนักทองที่จะบันทึกแผน:
            </label>
            <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
              {[0.25, 0.5, 1, 2, 5, 10, 20, 50].map((w) => (
                <button
                  key={w}
                  onClick={() => setSelectedWeight(w)}
                  className={`py-1.5 px-1 rounded-lg border text-center transition ${
                    selectedWeight === w
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {w < 1 ? (w === 0.25 ? '1 สลึง' : '2 สลึง') : `${w} บ.`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <input
              type="text"
              placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)..."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Button to Record to Journal */}
      <div className="mt-3">
        <button
          onClick={handleExecute}
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
            savedSuccess
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/20'
          }`}
        >
          {savedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>บันทึกลงสมุดเทรดเรียบร้อยแล้ว!</span>
            </>
          ) : (
            <>
              <BookmarkPlus className="w-4 h-4" />
              <span>บันทึกแผนเทรดนี้ลงสมุดบันทึก ({selectedWeight} บาททอง)</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
