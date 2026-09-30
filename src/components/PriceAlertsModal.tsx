import React, { useState } from 'react';
import { Bell, Plus, Trash2, CheckCircle2, Volume2 } from 'lucide-react';
import { PriceAlert } from '../types/gold';
import { formatCurrency, formatSpot } from '../utils/goldMath';

interface PriceAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: PriceAlert[];
  onAddAlert: (alert: Omit<PriceAlert, 'id' | 'triggered' | 'createdAt'>) => void;
  onDeleteAlert: (id: string) => void;
  onTestSound: () => void;
  currentSpot: number;
  currentThaiPrice: number;
}

export const PriceAlertsModal: React.FC<PriceAlertsModalProps> = ({
  isOpen,
  onClose,
  alerts,
  onAddAlert,
  onDeleteAlert,
  onTestSound,
  currentSpot,
  currentThaiPrice,
}) => {
  const [asset, setAsset] = useState<'SPOT' | 'THAI_GOLD'>('SPOT');
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [targetPrice, setTargetPrice] = useState<number>(currentSpot + 20);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddAlert({
      asset,
      condition,
      targetPrice,
    });
  };

  const handleAssetChange = (newAsset: 'SPOT' | 'THAI_GOLD') => {
    setAsset(newAsset);
    if (newAsset === 'SPOT') {
      setTargetPrice(currentSpot + 20);
    } else {
      setTargetPrice(currentThaiPrice + 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0b1120] border border-amber-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm sm:text-base">
                ตั้งค่าการแจ้งเตือนราคา (Price Alert)
              </h3>
              <p className="text-xs text-slate-400">
                ส่งเสียงแจ้งเตือนอัตโนมัติเมื่อราคาวิ่งถึงจุดที่คุณเฝ้าระวัง
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            ✕
          </button>
        </div>

        {/* Form to Add Alert */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-400 mb-1">เลือกสินทรัพย์</label>
              <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={() => handleAssetChange('SPOT')}
                  className={`w-1/2 py-1.5 rounded-md font-mono font-medium transition ${
                    asset === 'SPOT' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                  }`}
                >
                  Spot ($)
                </button>
                <button
                  type="button"
                  onClick={() => handleAssetChange('THAI_GOLD')}
                  className={`w-1/2 py-1.5 rounded-md font-mono font-medium transition ${
                    asset === 'THAI_GOLD' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                  }`}
                >
                  ทองไทย (฿)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">เงื่อนไข</label>
              <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={() => setCondition('ABOVE')}
                  className={`w-1/2 py-1.5 rounded-md font-mono font-medium transition ${
                    condition === 'ABOVE' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'
                  }`}
                >
                  สูงกว่า (≥)
                </button>
                <button
                  type="button"
                  onClick={() => setCondition('BELOW')}
                  className={`w-1/2 py-1.5 rounded-md font-mono font-medium transition ${
                    condition === 'BELOW' ? 'bg-rose-500 text-slate-950 font-bold' : 'text-slate-400'
                  }`}
                >
                  ต่ำกว่า (≤)
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">
              ราคาเป้าหมายที่ต้องการแจ้งเตือน ({asset === 'SPOT' ? 'USD/oz' : 'บาทต่อบาททอง'})
            </label>
            <input
              type="number"
              step={asset === 'SPOT' ? '0.5' : '50'}
              value={targetPrice}
              onChange={(e) => setTargetPrice(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold text-sm focus:outline-none focus:border-amber-400"
              required
            />
            <div className="mt-1 text-[11px] text-slate-500">
              ราคาปัจจุบัน: {asset === 'SPOT' ? formatSpot(currentSpot) : `${formatCurrency(currentThaiPrice)} ฿`}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onTestSound}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium flex items-center gap-1.5 transition"
              title="ทดสอบเสียงกระดิ่ง"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span>ทดสอบเสียง</span>
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>สร้างการแจ้งเตือน</span>
            </button>
          </div>
        </form>

        {/* Existing Alerts List */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-400 flex items-center justify-between">
            <span>รายการแจ้งเตือนที่ตั้งไว้ ({alerts.length})</span>
          </h4>

          {alerts.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
              ยังไม่มีการตั้งเตือนราคา
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {alerts.map((al) => (
                <div
                  key={al.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-mono transition ${
                    al.triggered
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        al.triggered ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                      }`}
                    ></span>
                    <div>
                      <span className="font-bold text-white">
                        {al.asset === 'SPOT' ? 'Gold Spot' : 'ทองไทย 96.5%'}
                      </span>{' '}
                      <span className="text-slate-400">
                        {al.condition === 'ABOVE' ? '≥' : '≤'}
                      </span>{' '}
                      <span className="text-amber-300 font-bold">
                        {al.asset === 'SPOT'
                          ? formatSpot(al.targetPrice)
                          : `${formatCurrency(al.targetPrice)} ฿`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {al.triggered && (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-sans">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>เตือนแล้ว</span>
                      </span>
                    )}
                    <button
                      onClick={() => onDeleteAlert(al.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
