import React, { useState } from 'react';
import { TomorrowForecastSummary, TomorrowMealForecast, MealCategory } from '../types';
import {
  Building2,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle2,
  Coffee,
  Sun,
  Moon,
  Plus,
  RotateCcw,
  ShieldCheck,
  UserCheck,
  UserX,
  Sparkles
} from 'lucide-react';

interface AdminForecastDashboardProps {
  forecast: TomorrowForecastSummary;
  onAddGuestMeal: (mealCategory: MealCategory, guestCount: number, hostName: string) => void;
  onSetRosterCount: (count: number) => void;
  onResetSimulatedData: () => void;
}

export const AdminForecastDashboard: React.FC<AdminForecastDashboardProps> = ({
  forecast,
  onAddGuestMeal,
  onSetRosterCount,
  onResetSimulatedData,
}) => {
  const [selectedMealForGuest, setSelectedMealForGuest] = useState<MealCategory>('Lunch');
  const [guestCountInput, setGuestCountInput] = useState<number>(2);
  const [guestHostInput, setGuestHostInput] = useState<string>('Parth Patil');

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (guestCountInput > 0) {
      onAddGuestMeal(selectedMealForGuest, guestCountInput, guestHostInput.trim() || 'Student Host');
      setGuestCountInput(1);
    }
  };

  const renderMealCard = (m: TomorrowMealForecast, icon: React.ReactNode, bgColor: string, borderColor: string) => {
    return (
      <div
        className={`rounded-3xl p-6 border transition-all ${
          m.isExceeded
            ? 'bg-rose-50/80 border-rose-300 shadow-md ring-2 ring-rose-500/20'
            : `${bgColor} ${borderColor} shadow-xs`
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center">
              {icon}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{m.mealCategory}</h3>
              <p className="text-[11px] text-slate-500 font-medium">Tomorrow's Service</p>
            </div>
          </div>

          {/* Capacity Status Badge */}
          <div className="text-right">
            {m.isExceeded ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-rose-700 bg-rose-100/90 px-2.5 py-1 rounded-full animate-pulse border border-rose-200">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>CAPACITY WARNING ({m.totalExpectedMeals} &gt; 120)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Within Capacity Limit ({m.totalExpectedMeals} / 120)</span>
              </span>
            )}
          </div>
        </div>

        {/* Big Forecast Number */}
        <div className="my-4 flex items-baseline justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Total Expected Meals
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span
                className={`font-mono text-4xl font-extrabold tabular-nums ${
                  m.isExceeded ? 'text-rose-700' : 'text-slate-900'
                }`}
              >
                {m.totalExpectedMeals}
              </span>
              <span className="text-xs font-bold text-slate-500">trays</span>
            </div>
          </div>

          <div className="text-right font-mono text-xs">
            <span className="text-slate-400 block text-[10px]">Kitchen Ceiling:</span>
            <span className="font-bold text-slate-700">120 Max</span>
          </div>
        </div>

        {/* Breakdown Row: Expected Student Meals + Expected Guest Meals */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-white/80 rounded-2xl border border-black/5 text-xs">
          <div>
            <div className="flex items-center gap-1 text-slate-500 text-[11px] font-medium">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Expected Student Meals:</span>
            </div>
            <div className="font-mono text-lg font-bold text-slate-900 mt-0.5">
              {m.expectedStudentMeals}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              ({m.skippedStudentsCount} valid skip{m.skippedStudentsCount === 1 ? '' : 's'} excluded)
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1 text-slate-500 text-[11px] font-medium">
              <Users className="w-3.5 h-3.5 text-amber-600" />
              <span>Expected Guest Meals:</span>
            </div>
            <div className="font-mono text-lg font-bold text-amber-700 mt-0.5">
              +{m.expectedGuestMeals}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              (Included in forecast)
            </div>
          </div>
        </div>

        {/* Skips & Guest Notes */}
        {m.skippedStudentsCount > 0 && (
          <div className="mt-3 text-[11px] text-slate-600 flex items-center gap-1.5 bg-amber-500/10 p-2 rounded-xl">
            <UserX className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span className="truncate">
              Excluded Skips: {m.skippedStudentNames.join(', ')}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Tomorrow's Date and Overall Capacity Status */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              <span>Hostel Mess Administration</span>
              <span>·</span>
              <span className="text-amber-700 font-mono">Stage 3 Kitchen Logistics</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Tomorrow&apos;s Meal Forecast &amp; Kitchen Capacity
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Calculated dynamically from live student records, excluding verified skips and including guest reservations.
            </p>
          </div>

          {/* Tomorrow's Date Header Pill */}
          <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xs">
            <Calendar className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-mono">
                Tomorrow&apos;s Forecast Date
              </span>
              <span className="text-sm font-bold text-amber-300 font-mono">
                {forecast.tomorrowDayLabel} ({forecast.tomorrowDate})
              </span>
            </div>
          </div>
        </div>

        {/* Global Capacity Warning or OK Indicator */}
        <div className="pt-4">
          {forecast.anyMealExceedsCapacity ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-950 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 animate-bounce" />
              <div>
                <h3 className="font-bold text-sm uppercase tracking-tight text-rose-900">
                  Kitchen Capacity Warning Alert
                </h3>
                <p className="text-xs mt-1 text-rose-800 leading-relaxed">
                  One or more meal sessions for tomorrow exceed the <strong>120-meal kitchen preparation threshold</strong>.
                  Head chef must authorize spillover dining or adjust ingredient prep.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-semibold">
                  All Tomorrow Sessions Within 120-Meal Capacity Limit ({forecast.totalDayExpectedMeals} total day meals expected).
                </span>
              </div>
              <span className="text-emerald-800 font-mono font-bold">
                Capacity Status: OK
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3 Meal Forecast Cards: Breakfast, Lunch, Dinner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {renderMealCard(
          forecast.breakfast,
          <Coffee className="w-5 h-5 text-amber-600" />,
          'bg-amber-50/50',
          'border-amber-200'
        )}
        {renderMealCard(
          forecast.lunch,
          <Sun className="w-5 h-5 text-orange-600" />,
          'bg-orange-50/50',
          'border-orange-200'
        )}
        {renderMealCard(
          forecast.dinner,
          <Moon className="w-5 h-5 text-indigo-600" />,
          'bg-indigo-50/50',
          'border-indigo-200'
        )}
      </div>

      {/* Admin Testing & Edge Case Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Admin Capacity Testing &amp; Simulation Controls
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Test edge cases including zero students, zero guests, multiple guest bookings, exactly 120 meals, and &gt;120 meals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Quick Roster Sizing (Test exactly 120 vs >120) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <span className="font-bold text-slate-900 block mb-1">
              1. Simulate Resident Student Roster Size:
            </span>
            <p className="text-[11px] text-slate-500 mb-3">
              Currently registered: <strong className="text-slate-900 font-mono">{forecast.totalRegisteredStudents} students</strong>
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => onSetRosterCount(5)}
                className="p-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl font-semibold text-slate-800 transition-colors"
              >
                5 Students
              </button>
              <button
                type="button"
                onClick={() => onSetRosterCount(118)}
                className="p-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl font-semibold text-slate-800 transition-colors"
              >
                118 Students
              </button>
              <button
                type="button"
                onClick={() => onSetRosterCount(120)}
                className="p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-950 font-bold rounded-xl transition-colors"
                title="Tests the exact 120 capacity threshold"
              >
                Exact 120 (OK)
              </button>
              <button
                type="button"
                onClick={() => onSetRosterCount(125)}
                className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-950 font-bold rounded-xl transition-colors"
                title="Tests > 120 capacity warning"
              >
                125 (&gt;120 Alert)
              </button>
            </div>
          </div>

          {/* Add Guest Meal Reservation for Tomorrow */}
          <form
            onSubmit={handleAddGuest}
            className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex flex-col justify-between"
          >
            <div>
              <span className="font-bold text-slate-900 block mb-1">
                2. Schedule Guest Meals for Tomorrow ({forecast.tomorrowDate}):
              </span>
              <p className="text-[11px] text-slate-500 mb-3">
                Include visitor guest trays to verify guest counts are added into the forecast.
              </p>

              <div className="grid grid-cols-3 gap-2 mb-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-medium block mb-1">Meal</label>
                  <select
                    value={selectedMealForGuest}
                    onChange={(e) => setSelectedMealForGuest(e.target.value as MealCategory)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 font-medium block mb-1">Guest Qty</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={guestCountInput}
                    onChange={(e) => setGuestCountInput(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 font-medium block mb-1">Host Student</label>
                  <input
                    type="text"
                    value={guestHostInput}
                    onChange={(e) => setGuestHostInput(e.target.value)}
                    placeholder="Student name"
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Guest Trays to Forecast</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
