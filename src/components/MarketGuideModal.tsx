import React from 'react';
import { BookOpen, Clock, Activity, Calculator, ShieldCheck } from 'lucide-react';

interface MarketGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MarketGuideModal: React.FC<MarketGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0b1120] border border-amber-500/30 rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">
                คู่มือตลาดทองคำ 96.5% & สูตรคำนวณมาตรฐาน
              </h3>
              <p className="text-xs text-slate-400">
                หลักการวิเคราะห์และกลไกความสัมพันธ์ของราคาทองคำในประเทศไทย
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            ✕
          </button>
        </div>

        {/* Section 1: Thai Gold Standard */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>มาตรฐานน้ำหนักและความบริสุทธิ์ทองคำไทย (96.5%)</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            ประเทศไทยใช้มาตรฐานความบริสุทธิ์ <strong>96.5%</strong> ซึ่งมีความแข็งแรงเหนียวเหมาะสำหรับทำทองรูปพรรณและทองคำแท่ง
            โดยมีน้ำหนักมาตรฐานดังนี้:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono">
            <div className="bg-slate-900 p-2 rounded-lg text-center border border-slate-800">
              <span className="text-slate-400 block text-[10px]">1 สลึง</span>
              <strong className="text-white text-xs">3.811 กรัม</strong>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg text-center border border-slate-800">
              <span className="text-slate-400 block text-[10px]">2 สลึง (50 สต.)</span>
              <strong className="text-white text-xs">7.622 กรัม</strong>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg text-center border border-slate-800">
              <span className="text-slate-400 block text-[10px]">1 บาททองคำ</span>
              <strong className="text-amber-300 text-xs">15.244 กรัม</strong>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg text-center border border-slate-800">
              <span className="text-slate-400 block text-[10px]">1 กิโลกรัม</span>
              <strong className="text-white text-xs">~65.6 บาททอง</strong>
            </div>
          </div>
        </div>

        {/* Section 2: Calculation Formula */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Calculator className="w-4 h-4" />
            <span>สูตรคำนวณราคาทองคำแท่งของสมาคมค้าทองคำ</span>
          </div>
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-amber-300 text-center text-xs">
            ราคาทองไทย (บาท) = (Gold Spot × อัตราแลกเปลี่ยน USD/THB × 0.4730) + ค่า Premium
          </div>
          <p className="text-slate-300 leading-relaxed">
            * สมาคมค้าทองคำจะปัดเศษราคาขึ้นหรือลงให้ลงท้ายด้วย <strong>50 บาท</strong> เสมอ
            และมีส่วนต่างระหว่างราคาขายออกกับราคารับซื้อคืนมาตรฐานที่ <strong>100 บาท</strong>
          </p>
        </div>

        {/* Section 3: USD/THB Impact Matrix */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
            <Activity className="w-4 h-4" />
            <span>อิทธิพลของค่าเงินบาท (USD/THB) ต่อราคาทองไทย</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="bg-slate-900 p-3 rounded-xl border border-emerald-500/20">
              <span className="text-emerald-400 font-bold block mb-1">
                📈 ค่าเงินบาทอ่อนค่า (&gt; 34.00)
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                ทำให้ราคาทองไทยแพงขึ้นแม้ราคาทอง Spot จะทรงตัว <strong>เงินบาทอ่อนค่าทุกๆ 10 สตางค์ จะดันราคาทองไทยขึ้นประมาณ 50-60 บาท</strong>
              </p>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-rose-500/20">
              <span className="text-rose-400 font-bold block mb-1">
                📉 ค่าเงินบาทแข็งค่า (&lt; 33.00)
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                กดดันให้ราคาทองไทยปรับตัวลงหรือขึ้นได้ช้ากว่าตลาดโลก แม้ Spot ในตลาดโลกจะบวกก็ตาม
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Trading Sessions */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm">
            <Clock className="w-4 h-4" />
            <span>ตารางเวลาตลาดทองคำโลกที่มีผลต่อความผันผวน (เวลาประเทศไทย)</span>
          </div>
          <div className="space-y-1.5 text-slate-300 pt-1">
            <div className="flex justify-between p-2 bg-slate-900 rounded-lg">
              <span className="font-medium">ตลาดเอเชีย (โตเกียว, ซิดนีย์, เซี่ยงไฮ้):</span>
              <span className="font-mono text-amber-300">07:00 - 15:00 น. (ไซด์เวย์ตามรอบ)</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-900 rounded-lg">
              <span className="font-medium">ตลาดยุโรป (ลอนดอน - London Bullion Market):</span>
              <span className="font-mono text-amber-300">14:00 - 23:00 น. (เริ่มมีวอลุ่มเทรดหนาแน่น)</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-900 rounded-lg border border-amber-500/30">
              <span className="font-medium text-amber-200">ตลาดอเมริกา (นิวยอร์ก Comex - Prime Time):</span>
              <span className="font-mono text-emerald-400 font-bold">19:30 - 04:00 น. (ผันผวนสูงสุด ตัวเลขเศรษฐกิจ)</span>
            </div>
          </div>
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition"
          >
            เข้าใจแล้ว / ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
