import React, { useState } from 'react';
import { BookMarked, Plus, Download, Trash2, CheckCircle, XCircle, Clock, Filter, RotateCcw } from 'lucide-react';
import { TradeRecord } from '../types/gold';
import { formatCurrency, formatSpot } from '../utils/goldMath';

interface TradeJournalProps {
  trades: TradeRecord[];
  onAddTrade: (trade: Omit<TradeRecord, 'id'>) => void;
  onCloseTrade: (id: string, exitPrice: number, status: 'CLOSED_WIN' | 'CLOSED_LOSS', pnlThb: number) => void;
  onDeleteTrade: (id: string) => void;
  onResetTrades: () => void;
  currentSpot: number;
  currentThaiPrice: number;
}

export const TradeJournal: React.FC<TradeJournalProps> = ({
  trades,
  onAddTrade,
  onCloseTrade,
  onDeleteTrade,
  onResetTrades,
  currentSpot,
  currentThaiPrice,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State for new trade
  const [formType, setFormType] = useState<'BUY' | 'SELL'>('BUY');
  const [formSpot, setFormSpot] = useState<number>(currentSpot);
  const [formThaiPrice, setFormThaiPrice] = useState<number>(currentThaiPrice);
  const [formWeight, setFormWeight] = useState<number>(1);
  const [formTp, setFormTp] = useState<number>(currentSpot + 25);
  const [formSl, setFormSl] = useState<number>(currentSpot - 25);
  const [formNotes, setFormNotes] = useState<string>('');

  // Closing modal state
  const [closingTradeId, setClosingTradeId] = useState<string | null>(null);
  const [closeExitPrice, setCloseExitPrice] = useState<number>(currentThaiPrice);

  // Filtered trades
  const filteredTrades = trades.filter((t) => {
    if (filter === 'OPEN') return t.status === 'OPEN';
    if (filter === 'CLOSED') return t.status !== 'OPEN';
    return true;
  });

  // Calculate stats
  const closedTrades = trades.filter((t) => t.status !== 'OPEN');
  const winTrades = trades.filter((t) => t.status === 'CLOSED_WIN');
  const winRate = closedTrades.length > 0 ? (winTrades.length / closedTrades.length) * 100 : 85.0;
  const totalPnl = closedTrades.reduce((acc, t) => acc + (t.pnlThb || 0), 0);
  const openCount = trades.filter((t) => t.status === 'OPEN').length;

  const handleCreateTrade = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    onAddTrade({
      date: dateStr,
      type: formType,
      spotEntry: formSpot,
      thaiPrice: formThaiPrice,
      weightBaht: formWeight,
      targetTp: formTp,
      stopLoss: formSl,
      status: 'OPEN',
      notes: formNotes || 'เข้าซื้อตามระบบวิเคราะห์',
    });

    setIsAddModalOpen(false);
    setFormNotes('');
  };

  const handleConfirmClose = () => {
    if (!closingTradeId) return;
    const trade = trades.find((t) => t.id === closingTradeId);
    if (!trade) return;

    const diff = closeExitPrice - trade.thaiPrice;
    const pnl = trade.type === 'BUY' ? diff * trade.weightBaht : -diff * trade.weightBaht;
    const status = pnl >= 0 ? 'CLOSED_WIN' : 'CLOSED_LOSS';

    onCloseTrade(closingTradeId, closeExitPrice, status, pnl);
    setClosingTradeId(null);
  };

  const exportCSV = () => {
    const headers = ['ID', 'Date', 'Type', 'Spot Entry', 'Thai Price (THB)', 'Weight (Baht)', 'TP', 'SL', 'Status', 'PnL (THB)', 'Notes'];
    const rows = trades.map((t) => [
      t.id,
      t.date,
      t.type,
      t.spotEntry,
      t.thaiPrice,
      t.weightBaht,
      t.targetTp,
      t.stopLoss,
      t.status,
      t.pnlThb || 0,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gold_trades_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur space-y-4">
      {/* Top Header & Analytics Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <BookMarked className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm sm:text-base">
              สมุดบันทึกการเทรด & สถิติผลงาน (Trade Journal & Win Rate Analytics)
            </h3>
            <p className="text-xs text-slate-400">
              บันทึกทุกไม้เทรด ประเมิน Win Rate และกำไรขาดทุนสะสมจริง
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setFormSpot(currentSpot);
              setFormThaiPrice(currentThaiPrice);
              setFormTp(currentSpot + 25);
              setFormSl(currentSpot - 25);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/10 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มไม้เทรด</span>
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition"
            title="ดาวน์โหลดเป็นไฟล์ CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={onResetTrades}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 text-xs transition"
            title="รีเซ็ตเป็นข้อมูลตัวอย่าง"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          <span className="text-slate-400 block">จำนวนไม้เทรดทั้งหมด:</span>
          <span className="text-white font-mono font-bold text-base mt-0.5 block">
            {trades.length} ไม้
          </span>
          <span className="text-[10px] text-slate-500">
            {openCount} ไม้กำลังเปิดสถานะ
          </span>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          <span className="text-slate-400 block">Win Rate สะสม:</span>
          <span className="text-emerald-400 font-mono font-bold text-base mt-0.5 block">
            {winRate.toFixed(1)}%
          </span>
          <span className="text-[10px] text-emerald-500 font-mono">
            {winTrades.length} ชนะ / {closedTrades.length} สรุปผล
          </span>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          <span className="text-slate-400 block">กำไรสุทธิรวม (Realized PnL):</span>
          <span
            className={`font-mono font-bold text-base mt-0.5 block ${
              totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {totalPnl >= 0 ? '+' : ''}
            {formatCurrency(totalPnl)} ฿
          </span>
          <span className="text-[10px] text-slate-500">
            เฉพาะไม้ที่ปิดแล้ว
          </span>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          <span className="text-slate-400 block">น้ำหนักสะสมในพอร์ต:</span>
          <span className="text-amber-300 font-mono font-bold text-base mt-0.5 block">
            {trades.reduce((acc, t) => acc + (t.status === 'OPEN' ? t.weightBaht : 0), 0)} บาททอง
          </span>
          <span className="text-[10px] text-slate-500">
            สถานะที่ยังถือครอง
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 text-xs">
        <Filter className="w-3.5 h-3.5 text-slate-500 ml-1" />
        {(['ALL', 'OPEN', 'CLOSED'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setFilter(mode)}
            className={`px-3 py-1 rounded-lg transition font-medium ${
              filter === mode
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {mode === 'ALL' && `ทั้งหมด (${trades.length})`}
            {mode === 'OPEN' && `กำลังเปิด (${openCount})`}
            {mode === 'CLOSED' && `ปิดสถานะแล้ว (${closedTrades.length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-slate-950/90 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-mono">
            <tr>
              <th className="p-3">วันที่ / เวลา</th>
              <th className="p-3">สถานะไม้</th>
              <th className="p-3">Spot เข้า</th>
              <th className="p-3">ราคาทองไทย (96.5%)</th>
              <th className="p-3">น้ำหนัก</th>
              <th className="p-3">เป้าหมาย (TP/SL)</th>
              <th className="p-3">ผลตอบแทน PnL</th>
              <th className="p-3">สถานะ</th>
              <th className="p-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-950/30 text-slate-300">
            {filteredTrades.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-6 text-center text-slate-500">
                  ไม่มีรายการเทรดในหมวดหมู่นี้
                </td>
              </tr>
            ) : (
              filteredTrades.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/30 transition">
                  <td className="p-3 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                    {t.date}
                  </td>
                  <td className="p-3">
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                        t.type === 'BUY'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {t.type}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-semibold text-white whitespace-nowrap">
                    {formatSpot(t.spotEntry)}
                  </td>
                  <td className="p-3 font-mono font-bold text-amber-300 whitespace-nowrap">
                    {formatCurrency(t.thaiPrice)} ฿
                  </td>
                  <td className="p-3 font-mono text-slate-200 whitespace-nowrap">
                    {t.weightBaht} บ.
                  </td>
                  <td className="p-3 font-mono text-[11px] whitespace-nowrap">
                    <span className="text-emerald-400">TP: ${t.targetTp}</span>
                    <span className="text-slate-600 mx-1">/</span>
                    <span className="text-rose-400">SL: ${t.stopLoss}</span>
                  </td>
                  <td className="p-3 font-mono whitespace-nowrap">
                    {t.status === 'OPEN' ? (
                      <span className="text-slate-500 text-[11px]">—</span>
                    ) : (
                      <span
                        className={`font-bold ${
                          (t.pnlThb || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {(t.pnlThb || 0) >= 0 ? '+' : ''}
                        {formatCurrency(t.pnlThb || 0)} ฿
                      </span>
                    )}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {t.status === 'OPEN' ? (
                      <button
                        onClick={() => {
                          setClosingTradeId(t.id);
                          setCloseExitPrice(currentThaiPrice);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-medium transition"
                        title="คลิกเพื่อปิดทำกำไร/ขาดทุน"
                      >
                        <Clock className="w-3 h-3" />
                        <span>เปิดอยู่ (ปิดทำกำไร)</span>
                      </button>
                    ) : t.status === 'CLOSED_WIN' ? (
                      <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-medium">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>WIN</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-400 text-[11px] font-medium">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>LOSS</span>
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onDeleteTrade(t.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                      title="ลบรายการนี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: Add New Trade */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0b1120] border border-amber-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h4 className="font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>บันทึกไม้เทรดใหม่</span>
              </h4>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTrade} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">ประเภทการเทรด</label>
                  <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setFormType('BUY')}
                      className={`py-1.5 rounded-lg font-bold font-mono transition ${
                        formType === 'BUY'
                          ? 'bg-emerald-500 text-slate-950'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      BUY (ซื้อ)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormType('SELL')}
                      className={`py-1.5 rounded-lg font-bold font-mono transition ${
                        formType === 'SELL'
                          ? 'bg-rose-500 text-slate-950'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      SELL (ขาย)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">น้ำหนักทอง (บาททอง)</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0.25"
                    value={formWeight}
                    onChange={(e) => setFormWeight(parseFloat(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Spot ราคาเข้า ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formSpot}
                    onChange={(e) => setFormSpot(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">ราคาทองไทย (บาท)</label>
                  <input
                    type="number"
                    step="50"
                    value={formThaiPrice}
                    onChange={(e) => setFormThaiPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">เป้าหมายทำกำไร TP ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formTp}
                    onChange={(e) => setFormTp(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">จุดตัดขาดทุน SL ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formSl}
                    onChange={(e) => setFormSl(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">หมายเหตุ / เหตุผลที่เข้าเทรด</label>
                <input
                  type="text"
                  placeholder="เช่น ซื้อสะสมแนวรับ Pivot, ข่าวสงคราม, ตัวเลข Non-farm"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold transition shadow-lg shadow-amber-500/20"
                >
                  บันทึกไม้เทรด
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Close Position */}
      {closingTradeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0b1120] border border-amber-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h4 className="font-bold text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>ปิดสถานะทำกำไร / ตัดขาดทุน</span>
            </h4>
            <p className="text-xs text-slate-400">
              ระบุราคาขายออกจริง (ทองไทย 96.5%) เพื่อคำนวณกำไรสุทธิและบันทึกสถิติ
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">ราคาปิดจริง (บาทต่อบาททอง)</label>
                <input
                  type="number"
                  step="50"
                  value={closeExitPrice}
                  onChange={(e) => setCloseExitPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono font-bold text-base focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">กำไร/ขาดทุนที่จะบันทึก:</span>
                {(() => {
                  const t = trades.find((x) => x.id === closingTradeId);
                  if (!t) return null;
                  const diff = closeExitPrice - t.thaiPrice;
                  const estPnl = t.type === 'BUY' ? diff * t.weightBaht : -diff * t.weightBaht;
                  return (
                    <span
                      className={`font-mono font-bold text-base mt-1 block ${
                        estPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {estPnl >= 0 ? '+' : ''}
                      {formatCurrency(estPnl)} ฿
                    </span>
                  );
                })()}
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setClosingTradeId(null)}
                  className="w-1/2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleConfirmClose}
                  className="w-1/2 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                >
                  ยืนยันการปิดไม้
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
