import React, { useState, useMemo } from 'react';
import { MealTransaction, Student, MealCategory } from '../types';
import { Search, Download, Coffee, Sun, Moon, Users, Receipt, RotateCcw, CheckCircle2 } from 'lucide-react';

interface MealHistoryLogProps {
  meals: MealTransaction[];
  currentStudent: Student | null;
  onViewPass: (meal: MealTransaction) => void;
}

export const MealHistoryLog: React.FC<MealHistoryLogProps> = ({
  meals,
  currentStudent,
  onViewPass,
}) => {
  const [filterStudentOnly, setFilterStudentOnly] = useState<boolean>(true);
  const [categoryFilter, setCategoryFilter] = useState<'All' | MealCategory>('All');
  const [guestFilter, setGuestFilter] = useState<'All' | 'Regular' | 'Guest'>('All');
  const [skipFilter, setSkipFilter] = useState<'All' | 'ACTIVE' | 'SKIPPED'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredMeals = useMemo(() => {
    return meals.filter((m) => {
      if (filterStudentOnly && currentStudent && m.studentId !== currentStudent.id) {
        return false;
      }
      if (categoryFilter !== 'All' && m.mealCategory !== categoryFilter) {
        return false;
      }
      if (guestFilter === 'Regular' && m.isGuest) {
        return false;
      }
      if (guestFilter === 'Guest' && !m.isGuest) {
        return false;
      }
      if (skipFilter !== 'All' && m.skipStatus !== skipFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchCode = m.tokenPassCode.toLowerCase().includes(query);
        const matchName = m.studentName.toLowerCase().includes(query);
        const matchRoll = m.studentRoll.toLowerCase().includes(query);
        const matchDate = m.date.includes(query);
        return matchCode || matchName || matchRoll || matchDate;
      }
      return true;
    });
  }, [meals, currentStudent, filterStudentOnly, categoryFilter, guestFilter, skipFilter, searchQuery]);

  // Aggregate metrics
  const totalMeals = filteredMeals.length;
  const guestMeals = filteredMeals.filter((m) => m.isGuest).length;
  const skippedMeals = filteredMeals.filter((m) => m.skipStatus === 'SKIPPED').length;
  const totalRefunded = filteredMeals.reduce((acc, m) => acc + (m.refundReceived || 0), 0);
  const totalTokensSpent = filteredMeals
    .filter((m) => m.skipStatus !== 'SKIPPED')
    .reduce((acc, m) => acc + m.tokensDeducted, 0);

  const handleExportCSV = () => {
    const headers = [
      'Date',
      'Meal Type',
      'Normal/Guest',
      'Token Cost',
      'Skip Status',
      'Refund Received',
      'Balance After Transaction',
      'Transaction ID',
      'Student Name',
      'Roll Number',
      'Pass Code',
    ];

    const rows = filteredMeals.map((m) => [
      m.date,
      m.mealCategory,
      m.isGuest ? `Guest (x${m.guestCount})` : 'Normal',
      m.originalCost || m.tokensDeducted,
      m.skipStatus || 'ACTIVE',
      m.refundReceived !== undefined ? `${m.refundReceived} TK` : '0 TK',
      m.balanceAfter,
      m.id,
      m.studentName,
      m.studentRoll,
      m.tokenPassCode,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mess_meal_log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Metrics Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              <span>Stage 2 Meal History</span>
              <span>·</span>
              <span className="text-amber-700">Audit Trail with Skips &amp; Refunds</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Log of Every Meal
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Tracks Date, Meal Type, Normal/Guest, Token Cost, Skip Status, Refund Received, and Balance After.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 4-Stat Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-500 block">Total Entries</span>
            <span className="font-mono text-xl font-bold text-slate-900 tabular-nums">
              {totalMeals}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-500 block">Guest Meals (2x Cost)</span>
            <span className="font-mono text-xl font-bold text-amber-700 tabular-nums">
              {guestMeals}
            </span>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <span className="text-xs text-emerald-800 block">Meals Skipped</span>
            <span className="font-mono text-xl font-bold text-emerald-700 tabular-nums">
              {skippedMeals}{' '}
              <span className="text-xs font-normal text-emerald-600">
                (+{totalRefunded} TK refunded)
              </span>
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-500 block">Net Tokens Spent</span>
            <span className="font-mono text-xl font-bold text-slate-900 tabular-nums">
              {totalTokensSpent} <span className="text-xs font-semibold text-amber-600">TK</span>
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Pass Code, date, student..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {currentStudent && (
            <button
              onClick={() => setFilterStudentOnly(!filterStudentOnly)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                filterStudentOnly
                  ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {filterStudentOnly ? `My Meals (${currentStudent.name})` : 'All Hostel Meals'}
            </button>
          )}

          {/* Category Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            {(['All', 'Breakfast', 'Lunch', 'Dinner'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  categoryFilter === cat
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Guest Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            {(['All', 'Regular', 'Guest'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setGuestFilter(mode)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  guestFilter === mode
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode === 'Guest' ? 'Guest (2x)' : mode}
              </button>
            ))}
          </div>

          {/* Skip Status Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            {(['All', 'ACTIVE', 'SKIPPED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setSkipFilter(status)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  skipFilter === status
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status === 'ACTIVE' ? 'Active' : status === 'SKIPPED' ? 'Skipped' : 'All Status'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Meal Table with 7 Required Columns */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {filteredMeals.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900">No meal records found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No meal records match your current filter settings.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                  <th className="py-3 px-4">1. Date</th>
                  <th className="py-3 px-4">2. Meal Type</th>
                  <th className="py-3 px-4">3. Normal / Guest</th>
                  <th className="py-3 px-4 text-right">4. Token Cost</th>
                  <th className="py-3 px-4 text-center">5. Skip Status</th>
                  <th className="py-3 px-4 text-right">6. Refund Received</th>
                  <th className="py-3 px-4 text-right">7. Balance After</th>
                  <th className="py-3 px-4 text-center">Pass / Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMeals.map((m) => {
                  const isSkipped = m.skipStatus === 'SKIPPED';
                  return (
                    <tr
                      key={m.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSkipped ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* 1. Date */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 block">{m.date}</span>
                        <span className="text-[11px] text-slate-500">{m.timeSlot}</span>
                      </td>

                      {/* 2. Meal Type */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          {m.mealCategory === 'Breakfast' && (
                            <Coffee className="w-3.5 h-3.5 text-amber-600" />
                          )}
                          {m.mealCategory === 'Lunch' && (
                            <Sun className="w-3.5 h-3.5 text-orange-600" />
                          )}
                          {m.mealCategory === 'Dinner' && (
                            <Moon className="w-3.5 h-3.5 text-indigo-600" />
                          )}
                          <span>{m.mealCategory}</span>
                        </div>
                      </td>

                      {/* 3. Normal / Guest */}
                      <td className="py-3.5 px-4">
                        {m.isGuest ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                            <Users className="w-3 h-3" />
                            <span>Guest (2x Cost)</span>
                          </span>
                        ) : (
                          <span className="text-slate-600 font-medium">Normal</span>
                        )}
                      </td>

                      {/* 4. Token Cost */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {m.originalCost || m.tokensDeducted} TK
                      </td>

                      {/* 5. Skip Status */}
                      <td className="py-3.5 px-4 text-center">
                        {isSkipped ? (
                          <span className="inline-flex items-center gap-1 font-bold text-[11px] bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded">
                            <RotateCcw className="w-3 h-3 text-rose-600" />
                            <span>Skipped</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-medium text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Active / Eaten</span>
                          </span>
                        )}
                      </td>

                      {/* 6. Refund Received */}
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                        {isSkipped ? (
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            +{m.refundReceived || 0} TK
                          </span>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>

                      {/* 7. Balance After Transaction */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {m.balanceAfter} TK
                      </td>

                      {/* Pass Code */}
                      <td className="py-3.5 px-4 text-center">
                        {!isSkipped ? (
                          <button
                            onClick={() => onViewPass(m)}
                            className="font-mono text-[11px] font-bold bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2 py-0.5 rounded text-slate-800 inline-flex items-center gap-1"
                          >
                            <Receipt className="w-3 h-3 text-slate-500" />
                            <span>{m.tokenPassCode}</span>
                          </button>
                        ) : (
                          <span className="font-mono text-[11px] text-slate-400">
                            {m.tokenPassCode}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
