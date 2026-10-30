import React, { useState } from 'react';
import { Student } from '../types';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';

interface RolloverSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudent: Student | null;
  onProcessRollover: (studentId: string) => void;
  onSetTestBalance: (studentId: string, testBalance: number) => void;
}

export const RolloverSimulatorModal: React.FC<RolloverSimulatorModalProps> = ({
  isOpen,
  onClose,
  currentStudent,
  onProcessRollover,
  onSetTestBalance,
}) => {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !currentStudent) return null;

  const unusedTokens = currentStudent.tokenBalance;
  const calculatedRollover = Math.min(10, Math.max(0, unusedTokens)); // Capped at 10
  const isCapped = unusedTokens > 10;
  const nextBalance = 60 + calculatedRollover;

  const handleExecute = () => {
    onProcessRollover(currentStudent.id);
    setSuccessMsg(
      `Month-end rollover completed! Rolled over ${calculatedRollover} TK (capped at 10 max) + 60 new monthly tokens. New balance: ${nextBalance} TK.`
    );
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1800);
  };

  const handleTestScenario = (tokens: number) => {
    onSetTestBalance(currentStudent.id, tokens);
    setSuccessMsg(`Simulated balance set to ${tokens} TK. Check rollover preview below.`);
    setTimeout(() => setSuccessMsg(null), 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Month-End Token Rollover</h2>
              <p className="text-xs text-slate-500">
                Unused tokens roll over to next month (strictly capped at 10 tokens maximum).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Success message */}
        {successMsg && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-950 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Current Student Snapshot */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Student Account:</span>
            <span className="font-bold text-slate-900">{currentStudent.name} ({currentStudent.rollNo})</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Current Unused Tokens:</span>
            <span className="font-mono font-bold text-base text-slate-900">{unusedTokens} TK</span>
          </div>
        </div>

        {/* Rollover Formula Calculation Breakdown */}
        <div className="mt-4 p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950 space-y-2">
          <div className="font-bold flex items-center gap-1.5 text-blue-900">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Rollover Calculation Breakdown:</span>
          </div>

          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex justify-between py-1 border-b border-blue-200/60">
              <span>Unused Tokens at Month End:</span>
              <span className="font-bold">{unusedTokens} TK</span>
            </div>
            <div className="flex justify-between py-1 border-b border-blue-200/60">
              <span>Rollover Cap Rule:</span>
              <span>min(10, {unusedTokens}) = <strong className="text-blue-900">{calculatedRollover} TK</strong></span>
            </div>
            <div className="flex justify-between py-1 border-b border-blue-200/60">
              <span>New Monthly Quota:</span>
              <span className="font-bold">+60 TK</span>
            </div>
            <div className="flex justify-between py-1.5 font-bold text-xs text-blue-950">
              <span>Next Month Starting Balance:</span>
              <span className="text-sm text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-300">
                60 + {calculatedRollover} = {nextBalance} TK
              </span>
            </div>
          </div>

          {isCapped && (
            <p className="text-[11px] text-blue-800 bg-blue-100/70 p-2 rounded-lg font-medium mt-2">
              <strong>Cap Enforced:</strong> Student has {unusedTokens} unused tokens. Since rollover is capped at 10 tokens maximum, exactly 10 tokens roll over ({unusedTokens - 10} tokens expire per mess policy).
            </p>
          )}
        </div>

        {/* Testing Scenarios Quick Buttons (Requirement 7) */}
        <div className="mt-4 p-3 bg-slate-100/80 rounded-2xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
            Test Preset Scenarios:
          </span>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {/* Scenario 1: 6 tokens remaining -> 6 rollover */}
            <button
              type="button"
              onClick={() => handleTestScenario(6)}
              className="p-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-left transition-colors"
            >
              <span className="font-bold block text-slate-900">Set 6 TK</span>
              <span className="text-[10px] text-slate-500">&rarr; 6 rollover (66 TK)</span>
            </button>

            {/* Scenario 2: 10 tokens remaining -> 10 rollover */}
            <button
              type="button"
              onClick={() => handleTestScenario(10)}
              className="p-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-left transition-colors"
            >
              <span className="font-bold block text-slate-900">Set 10 TK</span>
              <span className="text-[10px] text-slate-500">&rarr; 10 rollover (70 TK)</span>
            </button>

            {/* Scenario 3: 18 tokens remaining -> capped at 10 */}
            <button
              type="button"
              onClick={() => handleTestScenario(18)}
              className="p-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl text-left transition-colors"
            >
              <span className="font-bold block text-amber-950">Set 18 TK</span>
              <span className="text-[10px] text-amber-800">&rarr; Capped at 10 (70 TK)</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExecute}
            className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Process Rollover (New Balance: {nextBalance} TK)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
