import React, { useState } from 'react';
import { Student, MealCategory, MealTransaction, PreventionAlert } from '../types';
import { MEAL_PRICING_TABLE } from '../services/db';
import {
  Coffee,
  Sun,
  Moon,
  Users,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  Receipt,
  Info
} from 'lucide-react';

interface MealTerminalProps {
  currentStudent: Student;
  onClaimMeal: (params: {
    mealCategory: MealCategory;
    isGuest: boolean;
    guestCount: number;
    dietNote?: string;
  }) => { success: boolean; transaction?: MealTransaction; alert?: PreventionAlert };
  onOpenStore: () => void;
  onOpenAuth: () => void;
  todayMeals: MealTransaction[];
  onViewPass: (meal: MealTransaction) => void;
}

export const MealTerminal: React.FC<MealTerminalProps> = ({
  currentStudent,
  onClaimMeal,
  onOpenStore,
  todayMeals,
  onViewPass,
}) => {
  // Determine appropriate default meal based on current hour
  const currentHour = new Date().getHours();
  const getDefaultMeal = (): MealCategory => {
    if (currentHour >= 6 && currentHour < 11) return 'Breakfast';
    if (currentHour >= 11 && currentHour < 16) return 'Lunch';
    return 'Dinner';
  };

  const [selectedMeal, setSelectedMeal] = useState<MealCategory>(getDefaultMeal());
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [guestCount, setGuestCount] = useState<number>(1);
  const [dietNote, setDietNote] = useState<string>('Standard Diet');
  const [lastAlert, setLastAlert] = useState<PreventionAlert | null>(null);
  const [recentSuccess, setRecentSuccess] = useState<MealTransaction | null>(null);

  const pricing = MEAL_PRICING_TABLE[selectedMeal];
  const totalCost = isGuest ? pricing.guestCost * guestCount : pricing.baseCost;
  const balanceAfter = currentStudent.tokenBalance - totalCost;
  const isOverdraw = totalCost > currentStudent.tokenBalance;

  // Check if current student already claimed this meal today as regular
  const alreadyClaimedRegular = todayMeals.some(
    (m) => m.mealCategory === selectedMeal && !m.isGuest && m.studentId === currentStudent.id
  );

  const handleClaim = () => {
    setLastAlert(null);
    setRecentSuccess(null);

    const result = onClaimMeal({
      mealCategory: selectedMeal,
      isGuest,
      guestCount,
      dietNote: isGuest ? `Guest Meal (${dietNote})` : dietNote,
    });

    if (result.success && result.transaction) {
      setRecentSuccess(result.transaction);
    } else if (result.alert) {
      setLastAlert(result.alert);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Student Greeting & Live Metric Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              <span>Hostel Mess Self-Service Kiosk</span>
              <span>·</span>
              <span className="text-amber-700 font-mono">Automated Quota System</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back, {currentStudent.name}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Roll No: <span className="font-mono text-slate-700">{currentStudent.rollNo}</span> ·{' '}
              {currentStudent.hostelBlock}, Room {currentStudent.roomNo}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-3 rounded-xl">
            <div className="text-right">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block">
                Current Token Balance
              </span>
              <div className="flex items-baseline justify-end gap-1.5">
                <span className="font-mono text-3xl font-extrabold text-slate-900 tabular-nums">
                  {currentStudent.tokenBalance}
                </span>
                <span className="text-sm font-bold text-amber-600">TK</span>
              </div>
            </div>
            <button
              onClick={onOpenStore}
              className="px-3.5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-xs transition-colors shrink-0"
            >
              + Buy Tokens
            </button>
          </div>
        </div>

        {/* 3 Safeguard Status Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs">
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold block">1. Zero-Floor Enforced</span>
              <span className="text-emerald-700/90 text-[11px]">Balance cannot fall below 0 TK</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 text-blue-900">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <span className="font-bold block">2. Overdraw Blocked</span>
              <span className="text-blue-700/90 text-[11px]">Cannot spend beyond current tokens</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-purple-50/70 border border-purple-100 text-purple-900">
            <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
            <div>
              <span className="font-bold block">3. Anti-Overlap Active</span>
              <span className="text-purple-700/90 text-[11px]">1 regular meal per category/day</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prevention Alert Banner (If an invariant violation occurred) */}
      {lastAlert && (
        <div
          className={`p-5 rounded-2xl border shadow-sm animate-in fade-in slide-in-from-top-2 duration-200 ${
            lastAlert.type === 'OVERDRAW_PREVENTED'
              ? 'bg-rose-50/90 border-rose-300 text-rose-950'
              : lastAlert.type === 'OVERLAPPING_BLOCKED'
              ? 'bg-amber-50/90 border-amber-300 text-amber-950'
              : 'bg-red-50/90 border-red-300 text-red-950'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-xl shrink-0 ${
                lastAlert.type === 'OVERDRAW_PREVENTED'
                  ? 'bg-rose-600 text-white'
                  : 'bg-amber-600 text-white'
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold tracking-tight uppercase">
                  {lastAlert.title}
                </h3>
                <span className="text-xs font-mono opacity-75">
                  {new Date(lastAlert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <p className="text-sm mt-1 leading-relaxed font-medium">
                {lastAlert.message}
              </p>

              {lastAlert.type === 'OVERDRAW_PREVENTED' && (
                <div className="mt-3 flex items-center gap-3">
                  <button
                    onClick={onOpenStore}
                    className="px-3.5 py-1.5 text-xs font-bold bg-rose-900 text-white hover:bg-rose-800 rounded-lg transition-colors"
                  >
                    Top Up Tokens Now
                  </button>
                  <span className="text-xs text-rose-800">
                    Required: {lastAlert.details.requiredTokens} TK · Balance: {lastAlert.details.currentBalance} TK
                  </span>
                </div>
              )}

              {lastAlert.type === 'OVERLAPPING_BLOCKED' && (
                <div className="mt-3 flex items-center gap-3">
                  <button
                    onClick={() => {
                      setIsGuest(true);
                      setLastAlert(null);
                    }}
                    className="px-3.5 py-1.5 text-xs font-bold bg-amber-900 text-white hover:bg-amber-800 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Switch to Guest Mode (2x Cost)</span>
                  </button>
                  <span className="text-xs text-amber-800">
                    Guest mode permits additional meals without overlapping regular quota.
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => setLastAlert(null)}
              className="text-slate-400 hover:text-slate-600 text-sm font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Success Notification & Generated Pass Link */}
      {recentSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-950">
                Meal Token Claimed Successfully!
              </p>
              <p className="text-xs text-emerald-800">
                {recentSuccess.tokensDeducted} TK deducted for {recentSuccess.isGuest ? 'Guest ' : ''}
                {recentSuccess.mealCategory}. New balance: <span className="font-mono font-bold">{recentSuccess.balanceAfter} TK</span>.
              </p>
            </div>
          </div>
          <button
            onClick={() => onViewPass(recentSuccess)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs whitespace-nowrap transition-colors"
          >
            <Receipt className="w-4 h-4" />
            <span>Show Counter Pass ({recentSuccess.tokenPassCode})</span>
          </button>
        </div>
      )}

      {/* Primary Meal Selection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Breakfast Card */}
        <div
          onClick={() => setSelectedMeal('Breakfast')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all relative overflow-hidden ${
            selectedMeal === 'Breakfast'
              ? 'border-amber-500 bg-amber-50/40 shadow-md ring-2 ring-amber-500/20'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Coffee className="w-5 h-5" />
            </div>
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1">
                <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
                  {isGuest ? 2 : 1}
                </span>
                <span className="text-xs font-bold text-amber-600">TK</span>
              </div>
              <span className="text-[11px] text-slate-500">
                {isGuest ? 'Guest Rate (2x)' : 'Regular Rate'}
              </span>
            </div>
          </div>

          <h3 className="text-base font-bold text-slate-900">Breakfast</h3>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>07:00 AM - 10:00 AM</span>
          </p>

          <p className="text-xs text-slate-600 mt-2.5 line-clamp-2">
            Fresh boiled eggs, savory poha, hot tea/milk, seasonal fruits and buttered toast.
          </p>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            {todayMeals.some((m) => m.mealCategory === 'Breakfast' && !m.isGuest) ? (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Claimed for Today
              </span>
            ) : (
              <span className="text-[11px] text-slate-500">Ready to Claim</span>
            )}
            <span
              className={`text-xs font-bold ${
                selectedMeal === 'Breakfast' ? 'text-amber-600' : 'text-slate-400'
              }`}
            >
              {selectedMeal === 'Breakfast' ? 'Selected' : 'Select'}
            </span>
          </div>
        </div>

        {/* Lunch Card */}
        <div
          onClick={() => setSelectedMeal('Lunch')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all relative overflow-hidden ${
            selectedMeal === 'Lunch'
              ? 'border-amber-500 bg-amber-50/40 shadow-md ring-2 ring-amber-500/20'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center">
              <Sun className="w-5 h-5" />
            </div>
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1">
                <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
                  {isGuest ? 4 : 2}
                </span>
                <span className="text-xs font-bold text-amber-600">TK</span>
              </div>
              <span className="text-[11px] text-slate-500">
                {isGuest ? 'Guest Rate (2x)' : 'Regular Rate'}
              </span>
            </div>
          </div>

          <h3 className="text-base font-bold text-slate-900">Lunch</h3>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>12:00 PM - 03:00 PM</span>
          </p>

          <p className="text-xs text-slate-600 mt-2.5 line-clamp-2">
            Steamed rice, slow-simmered yellow dal, fresh seasonal vegetables, crisp salad &amp; curd.
          </p>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            {todayMeals.some((m) => m.mealCategory === 'Lunch' && !m.isGuest) ? (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Claimed for Today
              </span>
            ) : (
              <span className="text-[11px] text-slate-500">Ready to Claim</span>
            )}
            <span
              className={`text-xs font-bold ${
                selectedMeal === 'Lunch' ? 'text-amber-600' : 'text-slate-400'
              }`}
            >
              {selectedMeal === 'Lunch' ? 'Selected' : 'Select'}
            </span>
          </div>
        </div>

        {/* Dinner Card */}
        <div
          onClick={() => setSelectedMeal('Dinner')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all relative overflow-hidden ${
            selectedMeal === 'Dinner'
              ? 'border-amber-500 bg-amber-50/40 shadow-md ring-2 ring-amber-500/20'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
              <Moon className="w-5 h-5" />
            </div>
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1">
                <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
                  {isGuest ? 4 : 2}
                </span>
                <span className="text-xs font-bold text-amber-600">TK</span>
              </div>
              <span className="text-[11px] text-slate-500">
                {isGuest ? 'Guest Rate (2x)' : 'Regular Rate'}
              </span>
            </div>
          </div>

          <h3 className="text-base font-bold text-slate-900">Dinner</h3>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>07:30 PM - 10:30 PM</span>
          </p>

          <p className="text-xs text-slate-600 mt-2.5 line-clamp-2">
            Fresh hot rotis, paneer or chicken curry, steamed cumin rice, and evening dessert.
          </p>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            {todayMeals.some((m) => m.mealCategory === 'Dinner' && !m.isGuest) ? (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Claimed for Today
              </span>
            ) : (
              <span className="text-[11px] text-slate-500">Ready to Claim</span>
            )}
            <span
              className={`text-xs font-bold ${
                selectedMeal === 'Dinner' ? 'text-amber-600' : 'text-slate-400'
              }`}
            >
              {selectedMeal === 'Dinner' ? 'Selected' : 'Select'}
            </span>
          </div>
        </div>
      </div>

      {/* Guest Mode & Redemption Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-slate-900">
                Guest Mode (Double Cost Policy)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              When friends, family, or guests dine in the mess hall, meal token cost is exactly doubled.
              Guest meals do not conflict with daily single-meal regular limits.
            </p>
          </div>

          {/* Guest Mode Toggle */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <span className="text-xs font-semibold text-slate-700">
                {isGuest ? 'Guest Mode Enabled' : 'Regular Student Meal'}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={isGuest}
                onClick={() => setIsGuest(!isGuest)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  isGuest ? 'bg-amber-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isGuest ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </label>
          </div>
        </div>

        {/* Guest Options / Breakdown */}
        {isGuest && (
          <div className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-amber-900">Number of Guests:</span>
              <div className="flex items-center gap-1 bg-white border border-amber-300 rounded-lg p-1">
                {[1, 2, 3].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setGuestCount(qty)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                      guestCount === qty
                        ? 'bg-amber-600 text-white'
                        : 'text-amber-900 hover:bg-amber-100'
                    }`}
                  >
                    {qty} Guest{qty > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-amber-900 font-mono">
              Calculation: Base ({pricing.baseCost} TK) × 2 (Double) × {guestCount} guest(s) ={' '}
              <span className="font-bold text-sm text-amber-950">{totalCost} TK</span>
            </div>
          </div>
        )}

        {/* Dietary selection */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500 mr-2">Meal Tray Type:</span>
          {['Vegetarian Thali', 'Non-Vegetarian Special', 'Halal Prep', 'Jain Strict'].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDietNote(d)}
              className={`px-3 py-1 text-xs font-medium rounded-lg border transition-colors ${
                dietNote === d
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Transaction Calculation Strip */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-semibold uppercase text-slate-500 block">Selected Meal</span>
            <span className="text-sm font-bold text-slate-900">
              {selectedMeal} {isGuest ? `(Guest x${guestCount})` : '(Regular)'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-semibold uppercase text-slate-500 block">Cost Deduction</span>
            <span className="text-sm font-bold font-mono text-amber-700">
              -{totalCost} TK {isGuest ? '(Double Rate)' : ''}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-semibold uppercase text-slate-500 block">Balance After</span>
            <span
              className={`text-sm font-bold font-mono ${
                balanceAfter < 0 ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {balanceAfter < 0 ? `${balanceAfter} TK (Overdraw Blocked)` : `${balanceAfter} TK`}
            </span>
          </div>

          {/* Claim Action Button */}
          <div>
            <button
              type="button"
              onClick={handleClaim}
              disabled={isOverdraw}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all ${
                isOverdraw
                  ? 'bg-rose-100 text-rose-800 border border-rose-300 cursor-not-allowed'
                  : 'bg-amber-600 hover:bg-amber-700 text-white active:scale-98'
              }`}
            >
              {isOverdraw ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Cannot Overdraw ({totalCost} TK)</span>
                </>
              ) : alreadyClaimedRegular && !isGuest ? (
                <>
                  <ShieldAlert className="w-4 h-4 text-amber-200" />
                  <span>Overlap Check Required</span>
                </>
              ) : (
                <>
                  <span>Spend {totalCost} TK &amp; Eat Meal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {alreadyClaimedRegular && !isGuest && (
          <div className="mt-3 flex items-center gap-2 text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Note:</strong> You have already logged regular {selectedMeal} for today.
              Clicking claim will trigger the <strong>Anti-Overlapping Protection</strong> unless you enable Guest Mode.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
