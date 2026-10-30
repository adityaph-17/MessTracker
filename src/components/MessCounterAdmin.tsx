import React, { useState } from 'react';
import { MealTransaction } from '../types';
import { Building2, Search, CheckCircle2, XCircle, Users, Utensils, Coffee, Sun, Moon } from 'lucide-react';

interface MessCounterAdminProps {
  meals: MealTransaction[];
}

export const MessCounterAdmin: React.FC<MessCounterAdminProps> = ({ meals }) => {
  const [verifyCode, setVerifyCode] = useState('');
  const [searchResult, setSearchResult] = useState<MealTransaction | null | 'NOT_FOUND'>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayMeals = meals.filter((m) => m.date === todayStr);

  const breakfastCount = todayMeals.filter((m) => m.mealCategory === 'Breakfast').length;
  const lunchCount = todayMeals.filter((m) => m.mealCategory === 'Lunch').length;
  const dinnerCount = todayMeals.filter((m) => m.mealCategory === 'Dinner').length;
  const guestCount = todayMeals.filter((m) => m.isGuest).length;
  const totalTokensCollected = todayMeals.reduce((sum, m) => sum + m.tokensDeducted, 0);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = verifyCode.trim().toUpperCase();
    if (!clean) return;

    const found = meals.find(
      (m) => m.tokenPassCode.toUpperCase() === clean || m.id.toUpperCase() === clean
    );

    if (found) {
      setSearchResult(found);
    } else {
      setSearchResult('NOT_FOUND');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Hostel Mess Supervisor &amp; Dining Hall Counter
            </h1>
            <p className="text-xs text-slate-500">
              Live catering logistics, student verification scanner, and daily token collection tally.
            </p>
          </div>
        </div>

        {/* Today Headcount Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-4 border-t border-slate-100 mt-4">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <span className="text-[11px] font-semibold text-amber-800 flex items-center gap-1">
              <Coffee className="w-3.5 h-3.5" />
              <span>Breakfast (1 TK)</span>
            </span>
            <span className="font-mono text-2xl font-bold text-amber-950 tabular-nums block mt-1">
              {breakfastCount}
            </span>
          </div>

          <div className="p-3 bg-orange-50 rounded-xl border border-orange-200">
            <span className="text-[11px] font-semibold text-orange-800 flex items-center gap-1">
              <Sun className="w-3.5 h-3.5" />
              <span>Lunch (2 TK)</span>
            </span>
            <span className="font-mono text-2xl font-bold text-orange-950 tabular-nums block mt-1">
              {lunchCount}
            </span>
          </div>

          <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200">
            <span className="text-[11px] font-semibold text-indigo-800 flex items-center gap-1">
              <Moon className="w-3.5 h-3.5" />
              <span>Dinner (2 TK)</span>
            </span>
            <span className="font-mono text-2xl font-bold text-indigo-950 tabular-nums block mt-1">
              {dinnerCount}
            </span>
          </div>

          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
            <span className="text-[11px] font-semibold text-purple-800 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>Guest Trays (2x)</span>
            </span>
            <span className="font-mono text-2xl font-bold text-purple-950 tabular-nums block mt-1">
              {guestCount}
            </span>
          </div>

          <div className="p-3 bg-slate-900 text-white rounded-xl">
            <span className="text-[11px] font-semibold text-slate-300 block">
              Tokens Collected Today
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-mono text-2xl font-bold text-amber-400 tabular-nums">
                {totalTokensCollected}
              </span>
              <span className="text-xs font-bold text-amber-200">TK</span>
            </div>
          </div>
        </div>
      </div>

      {/* Counter Verification Scanner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-1">
          Counter Verification &amp; Pass Inspector
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Enter student Pass Code (e.g. <span className="font-mono font-bold text-slate-700">TK-8419</span>) or Transaction ID to confirm dining authorization.
        </p>

        <form onSubmit={handleVerify} className="flex gap-2 max-w-md">
          <input
            type="text"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value)}
            placeholder="e.g. TK-8419 or ML-2026..."
            className="flex-1 px-3.5 py-2 text-xs font-mono font-bold uppercase bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
          />
          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Verify</span>
          </button>
        </form>

        {/* Verification Result */}
        {searchResult === 'NOT_FOUND' && (
          <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs text-rose-900">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold">Invalid or Unrecognized Pass Code</p>
              <p className="text-rose-700 mt-0.5">
                No matching meal token was found for &quot;{verifyCode}&quot;. Ensure student has completed token redemption.
              </p>
            </div>
          </div>
        )}

        {searchResult && searchResult !== 'NOT_FOUND' && (
          <div className="mt-4 p-5 rounded-2xl bg-emerald-50 border border-emerald-300 animate-in fade-in duration-150">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-emerald-950">
                    PASS VERIFIED &amp; AUTHORIZED FOR SERVING
                  </h3>
                  <span className="font-mono text-xs font-bold bg-emerald-200/80 text-emerald-950 px-2 py-0.5 rounded">
                    {searchResult.tokenPassCode}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-emerald-800 block text-[11px]">Student:</span>
                    <span className="font-bold text-emerald-950">{searchResult.studentName}</span>
                  </div>
                  <div>
                    <span className="text-emerald-800 block text-[11px]">Roll No:</span>
                    <span className="font-mono font-bold text-emerald-950">{searchResult.studentRoll}</span>
                  </div>
                  <div>
                    <span className="text-emerald-800 block text-[11px]">Meal Category:</span>
                    <span className="font-bold text-emerald-950">{searchResult.mealCategory} {searchResult.isGuest ? '(Guest 2x)' : ''}</span>
                  </div>
                  <div>
                    <span className="text-emerald-800 block text-[11px]">Deducted:</span>
                    <span className="font-mono font-bold text-emerald-950">{searchResult.tokensDeducted} TK</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live Dining Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-3">
          Live Mess Service Stream (Today: {todayStr})
        </h2>

        {todayMeals.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">
            No meal tokens redeemed yet today.
          </p>
        ) : (
          <div className="space-y-2">
            {todayMeals.slice(0, 8).map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-500">{m.timeSlot}</span>
                  <div>
                    <span className="font-bold text-slate-900">{m.studentName}</span>
                    <span className="text-slate-500 ml-1.5 font-mono">({m.studentRoll})</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`font-semibold ${
                      m.isGuest ? 'text-amber-800 bg-amber-100 px-2 py-0.5 rounded' : 'text-slate-700'
                    }`}
                  >
                    {m.mealCategory} {m.isGuest ? '(Guest Mode 2x)' : ''}
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    -{m.tokensDeducted} TK
                  </span>
                  <span className="font-mono text-[11px] bg-slate-200/80 px-1.5 py-0.5 rounded text-slate-700">
                    {m.tokenPassCode}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
