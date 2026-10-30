import React from 'react';
import { MealTransaction } from '../types';
import { Receipt, CheckCircle, Utensils, QrCode, Printer, Users } from 'lucide-react';

interface PassModalProps {
  meal: MealTransaction | null;
  onClose: () => void;
}

export const PassModal: React.FC<PassModalProps> = ({ meal, onClose }) => {
  if (!meal) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden">
        {/* Top Decorative Header */}
        <div className="text-center pb-4 border-b border-dashed border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center mx-auto mb-2 shadow-xs">
            <Utensils className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
            Authorized Digital Mess Pass
          </span>
          <h2 className="text-lg font-bold text-slate-900 mt-1">Hostel Dining Token</h2>
          <p className="text-xs text-slate-500 font-mono">Present to Dining Hall Counter Staff</p>
        </div>

        {/* Big Pass Code Display */}
        <div className="my-5 p-4 rounded-2xl bg-slate-900 text-white text-center shadow-inner">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
            Counter Verification Code
          </span>
          <div className="font-mono text-3xl font-extrabold tracking-widest text-amber-400 my-1">
            {meal.tokenPassCode}
          </div>
          <div className="text-[11px] text-slate-400">
            Status: <span className="text-emerald-400 font-bold">VERIFIED &amp; REDEEMED</span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Student Name:</span>
            <span className="font-bold text-slate-900">{meal.studentName}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Roll / ID:</span>
            <span className="font-mono font-bold text-slate-900">{meal.studentRoll}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Meal Category:</span>
            <span className="font-bold text-slate-900">
              {meal.mealCategory} {meal.isGuest ? '(Guest Mode 2x)' : '(Regular)'}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Tokens Spent:</span>
            <span className="font-mono font-bold text-amber-700">-{meal.tokensDeducted} TK</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Remaining Balance:</span>
            <span className="font-mono font-bold text-slate-900">{meal.balanceAfter} TK</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Date &amp; Time:</span>
            <span className="font-mono text-slate-700">{meal.date} · {meal.timeSlot}</span>
          </div>
        </div>

        {/* Simulated QR Code Box */}
        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="w-12 h-12 bg-white border border-slate-300 rounded-lg flex items-center justify-center p-1 shrink-0">
            <QrCode className="w-10 h-10 text-slate-800" />
          </div>
          <div className="text-[11px] text-slate-500 leading-tight">
            <span className="font-mono font-bold text-slate-800 block">{meal.id}</span>
            Scanned by mess supervisor optical reader or verified via pass code.
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Slip</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
