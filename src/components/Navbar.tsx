import React from 'react';
import { Student, UserRole } from '../types';
import {
  Utensils,
  ShieldCheck,
  Coins,
  User,
  LogOut,
  RefreshCw,
  Sparkles,
  Building2,
  CalendarCheck,
  CalendarX,
  History,
  TestTube
} from 'lucide-react';

interface NavbarProps {
  currentStudent: Student | null;
  activeRole: UserRole;
  onToggleRole: (role: UserRole) => void;
  activeTab: 'terminal' | 'meals' | 'ledger' | 'rules' | 'admin' | 'tests';
  setActiveTab: (tab: 'terminal' | 'meals' | 'ledger' | 'rules' | 'admin' | 'tests') => void;
  onOpenAuth: (initialMode?: 'login' | 'register' | 'forgot' | 'admin') => void;
  onOpenStore: () => void;
  onOpenSkipModal: () => void;
  onLogout: () => void;
  onLogoutAdmin: () => void;
  isAdminAuthenticated: boolean;
  onSwitchStudent: (studentId: string) => void;
  allStudents: Student[];
  onRenewQuota: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStudent,
  activeRole,
  onToggleRole,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenStore,
  onOpenSkipModal,
  onLogout,
  onLogoutAdmin,
  isAdminAuthenticated,
  onSwitchStudent,
  allStudents,
  onRenewQuota,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [switchOpen, setSwitchOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-xs">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <button
                onClick={() => setActiveTab(activeRole === 'admin' ? 'admin' : 'terminal')}
                className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap text-left block"
              >
                Hostel Mess Tracker
              </button>
            </div>
          </div>

          {/* Role Toggle (Student vs Admin) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold shrink-0">
            <button
              onClick={() => {
                onToggleRole('student');
                if (activeTab === 'admin') setActiveTab('terminal');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeRole === 'student'
                  ? 'bg-amber-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Student Role</span>
            </button>
            <button
              onClick={() => {
                onToggleRole('admin');
                setActiveTab('admin');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeRole === 'admin'
                  ? 'bg-slate-900 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Admin Role</span>
            </button>
          </div>

          {/* Zone 2: Navigation Links based on active role */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600">
            {activeRole === 'student' ? (
              <>
                <button
                  onClick={() => setActiveTab('terminal')}
                  className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
                    activeTab === 'terminal' ? 'text-amber-600 font-bold' : ''
                  }`}
                >
                  Meal Counter
                </button>
                <button
                  onClick={onOpenSkipModal}
                  className="transition-colors whitespace-nowrap shrink-0 text-slate-600 hover:text-slate-900 flex items-center gap-1"
                >
                  <CalendarX className="w-3.5 h-3.5 text-amber-600" />
                  <span>Skip Meal</span>
                </button>
                <button
                  onClick={() => setActiveTab('meals')}
                  className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
                    activeTab === 'meals' ? 'text-amber-600 font-bold' : ''
                  }`}
                >
                  Meal History
                </button>
                <button
                  onClick={() => setActiveTab('ledger')}
                  className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
                    activeTab === 'ledger' ? 'text-amber-600 font-bold' : ''
                  }`}
                >
                  Token Ledger
                </button>
                <button
                  onClick={() => setActiveTab('tests')}
                  className={`flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
                    activeTab === 'tests' ? 'text-amber-600 font-bold' : ''
                  }`}
                >
                  <TestTube className="w-3.5 h-3.5 text-purple-600" />
                  <span>Test Suite</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
                    activeTab === 'admin' ? 'text-slate-900 font-bold' : ''
                  }`}
                >
                  <CalendarCheck className="w-4 h-4 text-amber-600" />
                  <span>Tomorrow Forecast</span>
                </button>
                <button
                  onClick={() => setActiveTab('meals')}
                  className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
                    activeTab === 'meals' ? 'text-slate-900 font-bold' : ''
                  }`}
                >
                  Dining Logs
                </button>
                <button
                  onClick={() => setActiveTab('rules')}
                  className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
                    activeTab === 'rules' ? 'text-slate-900 font-bold' : ''
                  }`}
                >
                  Capacity Invariants
                </button>
                <button
                  onClick={() => setActiveTab('tests')}
                  className={`flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
                    activeTab === 'tests' ? 'text-slate-900 font-bold' : ''
                  }`}
                >
                  <TestTube className="w-3.5 h-3.5 text-purple-600" />
                  <span>Automated Tests</span>
                </button>
              </>
            )}
          </nav>

          {/* Zone 3: 1 primary action / Account profile */}
          <div className="flex items-center gap-3 shrink-0">
            {activeRole === 'admin' ? (
              isAdminAuthenticated ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white shadow-2xs">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-xs">Mess Supervisor</span>
                  </div>

                  {/* Admin Account Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                      aria-label="Admin Account Menu"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                        A
                      </div>
                      <span className="hidden xl:inline text-xs font-semibold text-slate-700">
                        Admin
                      </span>
                    </button>

                    {dropdownOpen && (
                      <div
                        className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <div className="px-3 py-2 border-b border-slate-100">
                          <p className="font-bold text-slate-900 text-sm">Mess Administrator</p>
                          <p className="text-xs text-slate-500 font-mono">admin@mess.edu</p>
                          <div className="mt-2 text-xs flex items-center justify-between text-slate-700 bg-amber-50 p-2 rounded-xl border border-amber-200">
                            <span className="font-semibold">Authority Level:</span>
                            <span className="font-bold text-amber-900">Kitchen &amp; Capacity</span>
                          </div>
                        </div>

                        <div className="p-1 space-y-1">
                          <button
                            onClick={() => setActiveTab('admin')}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                          >
                            <CalendarCheck className="w-4 h-4 text-amber-600" />
                            <span>Tomorrow Meal Forecast</span>
                          </button>

                          <button
                            onClick={() => setActiveTab('meals')}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                          >
                            <History className="w-4 h-4 text-slate-600" />
                            <span>All Dining Transactions</span>
                          </button>

                          <button
                            onClick={() => setActiveTab('rules')}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>Capacity &amp; Invariants</span>
                          </button>

                          <div className="border-t border-slate-100 my-1"></div>

                          <button
                            onClick={onLogoutAdmin}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out (Admin)</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenAuth('admin')}
                    className="px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Admin Login</span>
                  </button>
                </div>
              )
            ) : currentStudent ? (
              <div className="flex items-center gap-2">
                {/* Token Balance Pill Button */}
                <button
                  onClick={onOpenStore}
                  className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-amber-900 transition-colors shadow-2xs group"
                  title="Click to purchase tokens"
                >
                  <Coins className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                  <span className="font-mono font-bold text-xs tabular-nums text-amber-900">
                    {currentStudent.tokenBalance} TK
                  </span>
                  <span className="text-[10px] font-bold bg-amber-200/80 text-amber-950 px-1.5 py-0.5 rounded">
                    + Top Up
                  </span>
                </button>

                {/* Account Menu */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                    aria-label="Student Account Menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                      {currentStudent.name.charAt(0)}
                    </div>
                    <span className="hidden xl:inline text-xs font-semibold text-slate-700 max-w-[90px] truncate">
                      {currentStudent.name}
                    </span>
                  </button>

                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="font-bold text-slate-900 text-sm">{currentStudent.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{currentStudent.rollNo}</p>
                        <p className="text-xs text-slate-500 truncate">{currentStudent.email}</p>
                        <div className="mt-2 text-xs flex items-center justify-between text-slate-600 bg-slate-50 p-2 rounded-xl">
                          <span>Monthly Fixed Quota:</span>
                          <span className="font-mono font-bold text-amber-700">60 TK / mo</span>
                        </div>
                      </div>

                      <div className="p-1 space-y-1">
                        <button
                          onClick={onOpenStore}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-900 rounded-xl transition-colors"
                        >
                          <Coins className="w-4 h-4 text-amber-600" />
                          <span>Buy Tokens &amp; Memberships</span>
                        </button>

                        <button
                          onClick={onRenewQuota}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 rounded-xl transition-colors"
                        >
                          <RefreshCw className="w-4 h-4 text-emerald-600" />
                          <span>Simulate Monthly 60 TK Credit</span>
                        </button>

                        <button
                          onClick={() => setSwitchOpen(true)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-500" />
                          <span>Switch Student Profile ({allStudents.length})</span>
                        </button>

                        <div className="border-t border-slate-100 my-1"></div>

                        <button
                          onClick={onLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors whitespace-nowrap shrink-0"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Register (+60 TK)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Switch Student Modal */}
      {switchOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Switch Resident Student</h3>
              <button
                onClick={() => setSwitchOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Select any student profile to test meal claiming, overdraw blocks, exact balances, or skips.
            </p>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {allStudents.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    onSwitchStudent(s.id);
                    setSwitchOpen(false);
                    setDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                    currentStudent?.id === s.id
                      ? 'border-amber-500 bg-amber-50/50 ring-1 ring-amber-500'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs uppercase">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{s.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{s.rollNo} · {s.hostelBlock}</p>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        s.tokenBalance <= 1
                          ? 'bg-rose-100 text-rose-800'
                          : s.tokenBalance === 2
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {s.tokenBalance} TK
                    </span>
                    {s.tokenBalance <= 1 && (
                      <p className="text-[10px] text-rose-600 font-sans font-medium mt-0.5">Low Balance Test</p>
                    )}
                    {s.tokenBalance === 2 && (
                      <p className="text-[10px] text-amber-700 font-sans font-medium mt-0.5">Exact Balance Test</p>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
              <button
                onClick={() => {
                  setSwitchOpen(false);
                  onOpenAuth('register');
                }}
                className="text-xs font-semibold text-amber-600 hover:text-amber-700"
              >
                + Register New Student
              </button>
              <button
                onClick={() => setSwitchOpen(false)}
                className="px-4 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
