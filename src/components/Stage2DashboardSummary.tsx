import React from 'react';
import { Student, UpcomingMeal } from '../types';
import {
  Coins,
  History,
  RotateCcw,
  Sparkles,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  CalendarX,
  ArrowRight
} from 'lucide-react';

interface Stage2DashboardSummaryProps {
  currentStudent: Student;
  upcomingMeals: UpcomingMeal[];
  currentSimulatedIso: string;
  onOpenSkipModal: (meal?: UpcomingMeal) => void;
  onOpenRolloverModal: () => void;
}

export const Stage2DashboardSummary: React.FC<Stage2DashboardSummaryProps> = ({
  currentStudent,
  upcomingMeals,
  currentSimulatedIso,
  onOpenSkipModal,
  onOpenRolloverModal,
}) => {
  const simDate = new Date(currentSimulatedIso);
  const formattedSimTime = simDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const skippableMeals = upcomingMeals.filter((m) => m.canSkip);
  const nextSkippable = skippableMeals[0] || null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Top Header Row with Simulated Time */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            <span>Stage 2 Student Dashboard</span>
            <span>·</span>
            <span className="text-amber-700 font-mono">Skip &amp; Rollover Engine</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Dining Token &amp; Quota Overview
          </h2>
        </div>

        {/* 7. Current Simulated Date / Time Badge */}
        <div className="flex items-center gap-2.5 bg-slate-900 text-white px-3.5 py-2 rounded-xl text-xs font-mono shadow-xs">
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-sans">
              System Simulated Clock
            </span>
            <span className="font-bold text-amber-300">{formattedSimTime}</span>
          </div>
        </div>
      </div>

      {/* Primary 4-Metric Grid (Token Balance, Tokens Used, Refunded, Rollover) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 1. Current Token Balance */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/80">
          <div className="flex items-center justify-between text-amber-800 text-xs font-semibold">
            <span>1. Current Balance</span>
            <Coins className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-mono text-3xl font-extrabold text-slate-900 tabular-nums">
              {currentStudent.tokenBalance}
            </span>
            <span className="text-xs font-bold text-amber-700">TK</span>
          </div>
          <p className="text-[11px] text-amber-900/80 mt-1">
            Invariant: strictly &ge; 0 TK (overdraw protected)
          </p>
        </div>

        {/* 2. Tokens Used */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
            <span>2. Tokens Used</span>
            <History className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-mono text-3xl font-extrabold text-slate-900 tabular-nums">
              {currentStudent.tokensUsed || 0}
            </span>
            <span className="text-xs font-bold text-slate-500">TK</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Meals consumed this monthly cycle
          </p>
        </div>

        {/* 3. Tokens Refunded from Skips */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold">
            <span>3. Refunded from Skips</span>
            <RotateCcw className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-mono text-3xl font-extrabold text-emerald-700 tabular-nums">
              +{currentStudent.tokensRefundedFromSkips || 0}
            </span>
            <span className="text-xs font-bold text-emerald-600">TK</span>
          </div>
          <p className="text-[11px] text-emerald-800 mt-1">
            Half-cost refund policy credited back
          </p>
        </div>

        {/* 4. Rollover Tokens (Requirement 4 & 6) */}
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
          <div className="flex items-center justify-between text-blue-800 text-xs font-semibold">
            <span>4. Rollover Tokens</span>
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-mono text-3xl font-extrabold text-blue-900 tabular-nums">
              {currentStudent.rolloverTokens || 0}
            </span>
            <span className="text-xs font-bold text-blue-600">/ 10 TK max</span>
          </div>
          <p className="text-[11px] text-blue-800 mt-1 flex items-center justify-between">
            <span>Capped at 10 max</span>
            <button
              onClick={onOpenRolloverModal}
              className="text-blue-700 hover:text-blue-900 font-bold underline"
            >
              Simulate
            </button>
          </p>
        </div>
      </div>

      {/* Rollover Formula Callout (Requirement 4: Clearly show Monthly Tokens, Rollover Tokens, and Current Balance) */}
      <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-slate-400">Month-End Balance Formula:</div>
          <div className="flex items-center gap-2">
            <span className="bg-slate-800 px-2 py-1 rounded text-amber-400 font-bold">
              60 New Monthly Tokens
            </span>
            <span className="text-slate-500">+</span>
            <span className="bg-slate-800 px-2 py-1 rounded text-blue-400 font-bold">
              {currentStudent.rolloverTokens || 0} Rollover Tokens
            </span>
            <span className="text-slate-500">=</span>
            <span className="bg-amber-500 text-slate-950 px-2.5 py-1 rounded font-bold">
              {60 + (currentStudent.rolloverTokens || 0)} TK Next Balance
            </span>
          </div>
        </div>

        <button
          onClick={onOpenRolloverModal}
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 font-sans text-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Test Month-End Rollover</span>
        </button>
      </div>

      {/* Upcoming Meals & Skip Deadlines Strip (Requirements 5 & 6) */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <CalendarX className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">
                5. Upcoming Meals &amp; Skip Deadlines (Rule: Before 8:00 PM Previous Day)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Eligible upcoming meals you can skip to receive half your token cost refunded down.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
              {skippableMeals.length} skippable slots
            </span>
            <button
              onClick={() => onOpenSkipModal()}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <span>Manage Meal Skips</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Next 3 upcoming meal quick cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {upcomingMeals.slice(0, 3).map((meal) => {
            return (
              <div
                key={meal.id}
                className={`p-3.5 rounded-xl border text-xs flex flex-col justify-between transition-all ${
                  meal.isSkipped
                    ? 'bg-emerald-50/70 border-emerald-300'
                    : meal.canSkip
                    ? 'bg-white border-slate-200 hover:border-amber-400'
                    : 'bg-slate-100/70 border-slate-200 opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900">{meal.mealCategory}</span>
                    <span className="font-mono text-slate-500 font-semibold">{meal.cost} TK</span>
                  </div>

                  <p className="text-[11px] text-slate-600 font-medium">{meal.dayLabel}</p>

                  {/* 6. Skip Deadline Information */}
                  <div className="mt-2 text-[10px] flex items-start gap-1 text-slate-500">
                    <Clock className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      Deadline: <strong className="text-slate-700">{meal.skipDeadlineDisplay}</strong>
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  {meal.isSkipped ? (
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Skipped (+{meal.refundIfSkipped} TK)</span>
                    </span>
                  ) : meal.canSkip ? (
                    <button
                      type="button"
                      onClick={() => onOpenSkipModal(meal)}
                      className="w-full py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold border border-amber-300 rounded-lg text-[11px] transition-colors flex items-center justify-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3 text-amber-700" />
                      <span>Skip (Refund {meal.refundIfSkipped} TK)</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-rose-700 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Deadline Passed</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
