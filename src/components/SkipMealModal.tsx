import React, { useState } from 'react';
import { Student, UpcomingMeal, MealCategory, PreventionAlert } from '../types';
import { RotateCcw, Clock, AlertTriangle, CheckCircle2, ShieldAlert, Calendar, Users, Info } from 'lucide-react';

interface SkipMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudent: Student | null;
  upcomingMeals: UpcomingMeal[];
  currentSimulatedIso: string;
  initialSelectedMeal?: UpcomingMeal;
  onConfirmSkip: (params: {
    mealDate: string;
    mealCategory: MealCategory;
    isGuest?: boolean;
    guestCount?: number;
  }) => { success: boolean; refundAmount?: number; alert?: PreventionAlert };
}

export const SkipMealModal: React.FC<SkipMealModalProps> = ({
  isOpen,
  onClose,
  currentStudent,
  upcomingMeals,
  currentSimulatedIso,
  initialSelectedMeal,
  onConfirmSkip,
}) => {
  const [selectedMealId, setSelectedMealId] = useState<string>(
    initialSelectedMeal ? initialSelectedMeal.id : upcomingMeals[0]?.id || ''
  );
  const [isGuest, setIsGuest] = useState(false);
  const [guestCount, setGuestCount] = useState(1);
  const [activeAlert, setActiveAlert] = useState<PreventionAlert | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ refund: number; category: string; date: string } | null>(null);

  if (!isOpen) return null;

  const currentMeal = upcomingMeals.find((m) => m.id === selectedMealId) || upcomingMeals[0];
  const simDate = new Date(currentSimulatedIso);

  // Refund calculation preview
  const baseCost = currentMeal ? currentMeal.cost : 1;
  const effectiveCost = isGuest ? baseCost * 2 * guestCount : baseCost;
  const calculatedRefund = Math.floor(effectiveCost / 2);

  const handleSkipSubmit = () => {
    setActiveAlert(null);
    setSuccessInfo(null);

    if (!currentMeal) return;

    const res = onConfirmSkip({
      mealDate: currentMeal.date,
      mealCategory: currentMeal.mealCategory,
      isGuest,
      guestCount,
    });

    if (res.success) {
      setSuccessInfo({
        refund: res.refundAmount !== undefined ? res.refundAmount : calculatedRefund,
        category: currentMeal.mealCategory,
        date: currentMeal.dayLabel,
      });
      setTimeout(() => {
        onClose();
      }, 1500);
    } else if (res.alert) {
      setActiveAlert(res.alert);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Skip Scheduled Meal</h2>
              <p className="text-xs text-slate-500">
                Submit before 8:00 PM on the previous day for half-cost refund.
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

        {/* Current Simulated Time Reference Banner */}
        <div className="mt-4 p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300">Simulated Validation Clock:</span>
          </div>
          <span className="font-bold text-amber-300">
            {simDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* Active Alert Banner */}
        {activeAlert && (
          <div
            className={`mt-4 p-4 rounded-xl border text-xs shadow-xs animate-in fade-in duration-150 ${
              activeAlert.type === 'SKIP_DEADLINE_PASSED'
                ? 'bg-rose-50 border-rose-300 text-rose-950'
                : activeAlert.type === 'DUPLICATE_SKIP_BLOCKED'
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-red-50 border-red-300 text-red-950'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold uppercase tracking-wider text-[11px]">
                  {activeAlert.title}
                </h4>
                <p className="mt-1 font-medium leading-relaxed whitespace-pre-line">
                  {activeAlert.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Banner */}
        {successInfo && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Meal Skip Registered Successfully!</p>
              <p className="text-emerald-800 mt-0.5">
                {successInfo.category} on {successInfo.date} has been marked as skipped.{' '}
                <strong className="text-emerald-950">+{successInfo.refund} TK</strong> refunded to your balance.
              </p>
            </div>
          </div>
        )}

        {/* Upcoming Meal Selector List */}
        <div className="mt-5 space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Select Upcoming Meal to Skip:
          </label>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {upcomingMeals.map((meal) => {
              const isSelected = selectedMealId === meal.id;
              return (
                <div
                  key={meal.id}
                  onClick={() => setSelectedMealId(meal.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="mealSelect"
                      checked={isSelected}
                      onChange={() => setSelectedMealId(meal.id)}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{meal.mealCategory}</span>
                        <span className="text-slate-500 font-mono">({meal.cost} TK)</span>
                        {meal.isSkipped && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                            Already Skipped
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{meal.dayLabel}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        meal.isSkipped
                          ? 'bg-slate-100 text-slate-500'
                          : meal.canSkip
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {meal.isSkipped
                        ? 'Refund Claimed'
                        : meal.canSkip
                        ? `Refund: +${meal.refundIfSkipped} TK`
                        : 'Past 8 PM Deadline'}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Deadline: {meal.skipDeadlineDisplay}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Meal Details & Refund Calculation Card */}
        {currentMeal && (
          <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-500">Meal:</span>{' '}
                <strong className="text-slate-900">{currentMeal.mealCategory}</strong> · {currentMeal.dayLabel}
              </div>
              <div className="font-mono text-slate-700">
                Standard Rate: <strong>{currentMeal.cost} TK</strong>
              </div>
            </div>

            {/* Guest Toggle for Guest Skip */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isGuest}
                  onChange={(e) => setIsGuest(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="font-semibold text-slate-700">Skip Guest Meal (Double Cost)</span>
              </label>

              {isGuest && (
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 text-[11px]">Guests:</span>
                  {[1, 2].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGuestCount(g)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        guestCount === g ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refund Math Rule Breakdown */}
            <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 text-amber-950 text-xs">
              <div className="font-bold flex items-center gap-1.5 mb-1">
                <Info className="w-3.5 h-3.5 text-amber-700" />
                <span>Stage 2 Refund Policy (Half-Cost, Rounded Down):</span>
              </div>
              <div className="font-mono space-y-0.5 text-[11px]">
                <div>
                  • Meal Cost: <span className="font-bold">{effectiveCost} TK</span>
                </div>
                <div>
                  • Calculation: floor({effectiveCost} / 2) ={' '}
                  <span className="font-bold text-amber-900 text-sm">+{calculatedRefund} TK Refund</span>
                </div>
                {currentMeal.mealCategory === 'Breakfast' && !isGuest && (
                  <div className="text-[10px] text-amber-800 italic mt-1">
                    (Breakfast is 1 TK &rarr; half is 0.5 &rarr; rounded down = 0 TK refund)
                  </div>
                )}
                {(currentMeal.mealCategory === 'Lunch' || currentMeal.mealCategory === 'Dinner') && !isGuest && (
                  <div className="text-[10px] text-amber-800 italic mt-1">
                    (Lunch/Dinner is 2 TK &rarr; half is 1.0 &rarr; rounded down = 1 TK refund)
                  </div>
                )}
              </div>
            </div>

            {/* Invariant Note */}
            <div className="text-[11px] text-slate-500">
              * The refund will be credited directly to your student balance ({currentStudent?.tokenBalance} TK &rarr;{' '}
              {(currentStudent?.tokenBalance || 0) + calculatedRefund} TK). Balance never becomes negative.
            </div>
          </div>
        )}

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
            onClick={handleSkipSubmit}
            className="px-5 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Confirm Skip &amp; Receive Refund (+{calculatedRefund} TK)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
