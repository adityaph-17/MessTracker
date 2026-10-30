import React, { useState } from 'react';
import { Student, PreventionAlert } from '../types';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Lock,
  Flame,
  CheckCircle2,
  Clock,
  Coins
} from 'lucide-react';

interface ProtectionNoticeProps {
  currentStudent: Student;
  onSimulateOverdraw: () => PreventionAlert;
  onSimulateOverlap: () => PreventionAlert;
  onSimulateZeroFloor: () => PreventionAlert;
  onSimulateValidSkip: () => { success: boolean; alert?: PreventionAlert; message?: string };
  onSimulateLateSkip: () => PreventionAlert;
  onSimulateBreakfastSkip: () => { success: boolean; alert?: PreventionAlert; message?: string };
  onSimulateLunchSkip: () => { success: boolean; alert?: PreventionAlert; message?: string };
  onSimulateDuplicateSkip: () => PreventionAlert;
  onSimulateRolloverNormal: () => string;
  onSimulateRolloverCapped: () => string;
}

export const ProtectionNotice: React.FC<ProtectionNoticeProps> = ({
  currentStudent,
  onSimulateOverdraw,
  onSimulateOverlap,
  onSimulateZeroFloor,
  onSimulateValidSkip,
  onSimulateLateSkip,
  onSimulateBreakfastSkip,
  onSimulateLunchSkip,
  onSimulateDuplicateSkip,
  onSimulateRolloverNormal,
  onSimulateRolloverCapped,
}) => {
  const [activeAlert, setActiveAlert] = useState<PreventionAlert | null>(null);
  const [infoBanner, setInfoBanner] = useState<string | null>(null);

  const handleInfo = (msg: string) => {
    setInfoBanner(msg);
    setActiveAlert(null);
  };

  const handleAlert = (alert: PreventionAlert) => {
    setActiveAlert(alert);
    setInfoBanner(null);
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Safety Invariants &amp; Stage 2 Testing Suite
            </h1>
            <p className="text-xs text-slate-500">
              Interactive test console for Stage 1 protections (overdraw, zero-floor, overlapping) &amp; Stage 2 rules (skip deadlines, refunds, duplicate skip prevention, 10-TK rollover cap).
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          Click any scenario below to immediately trigger the exact business logic rule and observe the real-time system response.
        </p>
      </div>

      {/* Active Invariant Alert Inspector */}
      {activeAlert && (
        <div
          className={`p-6 rounded-2xl border shadow-md animate-in fade-in duration-200 ${
            activeAlert.type === 'SKIP_DEADLINE_PASSED' || activeAlert.type === 'OVERDRAW_PREVENTED'
              ? 'bg-rose-50 border-rose-300 text-rose-950'
              : activeAlert.type === 'DUPLICATE_SKIP_BLOCKED' || activeAlert.type === 'OVERLAPPING_BLOCKED'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-red-50 border-red-300 text-red-950'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  activeAlert.type === 'SKIP_DEADLINE_PASSED' || activeAlert.type === 'OVERDRAW_PREVENTED'
                    ? 'bg-rose-600 text-white'
                    : 'bg-amber-600 text-white'
                }`}
              >
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold tracking-wider uppercase opacity-80 block">
                  Safety Invariant Block Triggered
                </span>
                <h3 className="text-base font-bold tracking-tight mt-0.5">
                  {activeAlert.title}
                </h3>
                <p className="text-sm mt-2 font-medium leading-relaxed whitespace-pre-line">
                  {activeAlert.message}
                </p>

                <div className="mt-4 p-3 bg-white/80 rounded-xl border border-black/5 text-xs font-mono space-y-1">
                  <div>Status: <span className="text-rose-700 font-bold">TRANSACTION_REJECTED</span></div>
                  <div>Student: {currentStudent.name} ({currentStudent.rollNo})</div>
                  <div>Current Balance: {currentStudent.tokenBalance} TK</div>
                  {activeAlert.details.skipDeadline && (
                    <div>Skip Deadline Was: {activeAlert.details.skipDeadline}</div>
                  )}
                  {activeAlert.details.currentSimulatedTime && (
                    <div>Simulated Time At Attempt: {activeAlert.details.currentSimulatedTime}</div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveAlert(null)}
              className="px-3 py-1 bg-black/10 hover:bg-black/20 rounded-lg text-xs font-bold transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Success Info Banner */}
      {infoBanner && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold text-sm">{infoBanner}</span>
          </div>
          <button
            onClick={() => setInfoBanner(null)}
            className="text-emerald-700 font-bold hover:text-emerald-900"
          >
            ✕
          </button>
        </div>
      )}

      {/* Stage 2 Requirements Testing Console (Grid of all 7 Scenarios) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-1">
          Stage 2 Feature Test Matrix (7 Specific Prompt Scenarios)
        </h2>
        <p className="text-xs text-slate-500 mb-5">
          Execute each scenario with a single click to verify compliance with skip rules, deadline validations, refunds, and rollover caps.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Scenario 1: Valid skip before 8 PM previous day */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                Scenario 1
              </span>
              <h3 className="font-bold text-slate-900 text-xs">
                Valid Skip Before 8 PM (Previous Day)
              </h3>
              <p className="text-[11px] text-slate-600 mt-1">
                Submits a skip request prior to 8:00 PM on the day before the meal. Confirms valid skip approval.
              </p>
            </div>
            <button
              onClick={() => {
                const res = onSimulateValidSkip();
                if (res.alert) handleAlert(res.alert);
                else if (res.message) handleInfo(res.message);
              }}
              className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors"
            >
              Test Valid Skip (Before 8 PM)
            </button>
          </div>

          {/* Scenario 2: Skip attempted after 8 PM deadline */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block mb-1">
                Scenario 2
              </span>
              <h3 className="font-bold text-slate-900 text-xs">
                Skip Attempted After 8 PM Deadline
              </h3>
              <p className="text-[11px] text-slate-600 mt-1">
                Simulates late skip attempt. Verifies strict block and clear &quot;Skip deadline has passed&quot; message.
              </p>
            </div>
            <button
              onClick={() => handleAlert(onSimulateLateSkip())}
              className="mt-3 w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition-colors"
            >
              Test Late Skip (After 8 PM Block)
            </button>
          </div>

          {/* Scenario 3: Breakfast skip with 0 token refund */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                Scenario 3
              </span>
              <h3 className="font-bold text-slate-900 text-xs">
                Breakfast Skip (0 TK Refund)
              </h3>
              <p className="text-[11px] text-slate-600 mt-1">
                Breakfast costs 1 TK &rarr; floor(1 / 2) = 0 TK refund. Verifies rounding down rule.
              </p>
            </div>
            <button
              onClick={() => {
                const res = onSimulateBreakfastSkip();
                if (res.alert) handleAlert(res.alert);
                else if (res.message) handleInfo(res.message);
              }}
              className="mt-3 w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors"
            >
              Test Breakfast Skip &rarr; 0 TK
            </button>
          </div>

          {/* Scenario 4: Lunch/Dinner skip with 1 token refund */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block mb-1">
                Scenario 4
              </span>
              <h3 className="font-bold text-slate-900 text-xs">
                Lunch/Dinner Skip (1 TK Refund)
              </h3>
              <p className="text-[11px] text-slate-600 mt-1">
                Lunch/Dinner costs 2 TK &rarr; floor(2 / 2) = 1 TK refund credited back to student balance.
              </p>
            </div>
            <button
              onClick={() => {
                const res = onSimulateLunchSkip();
                if (res.alert) handleAlert(res.alert);
                else if (res.message) handleInfo(res.message);
              }}
              className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors"
            >
              Test Lunch Skip &rarr; +1 TK Refund
            </button>
          </div>

          {/* Scenario 5: Duplicate skip attempt */}
          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block mb-1">
                Scenario 5
              </span>
              <h3 className="font-bold text-slate-900 text-xs">
                Duplicate Skip Attempt
              </h3>
              <p className="text-[11px] text-slate-600 mt-1">
                Tries to skip an already skipped meal. Confirms student cannot receive multiple refunds.
              </p>
            </div>
            <button
              onClick={() => handleAlert(onSimulateDuplicateSkip())}
              className="mt-3 w-full py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg text-xs transition-colors"
            >
              Test Duplicate Skip Block
            </button>
          </div>

          {/* Scenario 6 & 7: Month End Rollover (<=10 vs >10 capped) */}
          <div className="p-4 rounded-xl border border-slate-300 bg-slate-50 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Scenarios 6 &amp; 7
              </span>
              <h3 className="font-bold text-slate-900 text-xs">
                Month-End Rollover (Capped at 10 TK)
              </h3>
              <p className="text-[11px] text-slate-600 mt-1">
                Calculates unused tokens &rarr; max 10 TK rolls over + 60 new monthly quota.
              </p>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => handleInfo(onSimulateRolloverNormal())}
                className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-[11px] transition-colors"
              >
                Test 6 TK Rollover
              </button>
              <button
                onClick={() => handleInfo(onSimulateRolloverCapped())}
                className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px] transition-colors"
              >
                Test 18 TK Cap (10 max)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stage 1 Protection Cards (Retained and Preserved) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Rule 1: Zero Floor Invariant */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                01
              </div>
              <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                Floor: Balance &ge; 0
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              1. Balance Never Goes Below Zero
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Mathematical invariant: Sub-zero balances are prohibited across meal redemptions, skips, and rollovers.
            </p>
          </div>
          <button
            onClick={() => handleAlert(onSimulateZeroFloor())}
            className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
          >
            Verify Zero Floor Policy
          </button>
        </div>

        {/* Rule 2: Token Overdraw Block */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-sm">
                02
              </div>
              <span className="text-xs font-mono font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded">
                Strict Solvency
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              2. Token Never Overdraw
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Spending tokens exceeding current balance is blocked before any state change occurs.
            </p>
          </div>
          <button
            onClick={() => handleAlert(onSimulateOverdraw())}
            className="mt-4 w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold transition-colors"
          >
            Simulate Overdraw Attempt
          </button>
        </div>

        {/* Rule 3: Anti-Overlapping Tokens */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm">
                03
              </div>
              <span className="text-xs font-mono font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                Anti-Overlap Lock
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              3. Prevent Overlapping Tokens
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Blocks double-claiming the same regular meal on the same date.
            </p>
          </div>
          <button
            onClick={() => handleAlert(onSimulateOverlap())}
            className="mt-4 w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-colors"
          >
            Simulate Overlapping Claim
          </button>
        </div>
      </div>
    </div>
  );
};
