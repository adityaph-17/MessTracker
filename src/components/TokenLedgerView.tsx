import React, { useState, useMemo } from 'react';
import { LedgerEntry, Student } from '../types';
import { Coins, ArrowDownRight, ArrowUpRight, ShieldCheck, Download, Search, RefreshCw, Calendar } from 'lucide-react';

interface TokenLedgerViewProps {
  ledger: LedgerEntry[];
  currentStudent: Student | null;
  onRenewQuota: () => void;
  onOpenStore: () => void;
}

export const TokenLedgerView: React.FC<TokenLedgerViewProps> = ({
  ledger,
  currentStudent,
  onRenewQuota,
  onOpenStore,
}) => {
  const [filterType, setFilterType] = useState<'All' | 'Credits' | 'Debits'>('All');
  const [search, setSearch] = useState<string>('');

  const studentLedger = useMemo(() => {
    return ledger.filter((entry) => {
      if (currentStudent && entry.studentId !== currentStudent.id) {
        return false;
      }
      if (filterType === 'Credits' && entry.amount <= 0) {
        return false;
      }
      if (filterType === 'Debits' && entry.amount >= 0) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          entry.description.toLowerCase().includes(q) ||
          entry.referenceId.toLowerCase().includes(q) ||
          entry.date.includes(q)
        );
      }
      return true;
    });
  }, [ledger, currentStudent, filterType, search]);

  const totalCredits = studentLedger
    .filter((e) => e.amount > 0)
    .reduce((sum, e) => sum + e.amount, 0);

  const totalDebits = Math.abs(
    studentLedger
      .filter((e) => e.amount < 0)
      .reduce((sum, e) => sum + e.amount, 0)
  );

  return (
    <div className="space-y-6">
      {/* Header & Balance Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              <span>Financial Ledger</span>
              <span>·</span>
              <span className="text-amber-700">Token Accounting</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Token Spend &amp; Credit History
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Verified double-entry ledger of all monthly 60 TK allocations, top-ups, and meal spend events.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRenewQuota}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-slate-500" />
              <span>Simulate +60 TK Quota</span>
            </button>
            <button
              onClick={onOpenStore}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors"
            >
              <Coins className="w-4 h-4" />
              <span>Purchase Tokens</span>
            </button>
          </div>
        </div>

        {/* 4 Statistical Metric Blocks */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-500 block">Current Available Balance</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono text-2xl font-extrabold text-slate-900 tabular-nums">
                {currentStudent ? currentStudent.tokenBalance : 0}
              </span>
              <span className="text-xs font-bold text-amber-600">TK</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-500 block">Total Inflow / Credits</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono text-2xl font-bold text-emerald-700 tabular-nums">
                +{totalCredits}
              </span>
              <span className="text-xs font-bold text-emerald-600">TK</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-500 block">Total Outflow / Spent</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono text-2xl font-bold text-rose-700 tabular-nums">
                -{totalDebits}
              </span>
              <span className="text-xs font-bold text-rose-600">TK</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
            <span className="text-xs text-emerald-800 block">Zero-Floor Invariant</span>
            <div className="flex items-center gap-1.5 mt-1 text-emerald-800 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Solvency Preserved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions, reference IDs..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Filter Segment */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg">
          {(['All', 'Credits', 'Debits'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filterType === f
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f === 'Credits' ? '+ Credits (+TK)' : f === 'Debits' ? '- Debits (-TK)' : 'All Records'}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {studentLedger.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No ledger transactions found for this view.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Activity Description</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Running Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentLedger.map((entry) => {
                  const isCredit = entry.amount > 0;
                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Date & Time */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-medium text-slate-900 block">{entry.date}</span>
                        <span className="text-[11px] text-slate-500">
                          {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                              isCredit
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isCredit ? (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowDownRight className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <span>{entry.description}</span>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-mono text-[11px] px-2 py-0.5 rounded font-semibold ${
                            entry.type === 'MONTHLY_QUOTA'
                              ? 'bg-amber-100 text-amber-900'
                              : entry.type === 'TOKEN_PURCHASE'
                              ? 'bg-blue-100 text-blue-900'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {entry.type}
                        </span>
                      </td>

                      {/* Reference ID */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        {entry.referenceId}
                      </td>

                      {/* Amount */}
                      <td
                        className={`py-3.5 px-4 text-right font-mono font-bold tabular-nums ${
                          isCredit ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {isCredit ? `+${entry.amount}` : entry.amount} TK
                      </td>

                      {/* Running Balance */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {entry.balanceAfter} TK
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
