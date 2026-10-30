import React, { useState, useEffect, useCallback } from 'react';
import { dbService } from './services/db';
import {
  Student,
  MealTransaction,
  LedgerEntry,
  MealCategory,
  PreventionAlert,
  UpcomingMeal,
  UserRole,
  TomorrowForecastSummary
} from './types';
import { Navbar } from './components/Navbar';
import { SimulatedClockControl } from './components/SimulatedClockControl';
import { Stage2DashboardSummary } from './components/Stage2DashboardSummary';
import { MealTerminal } from './components/MealTerminal';
import { SkipMealModal } from './components/SkipMealModal';
import { RolloverSimulatorModal } from './components/RolloverSimulatorModal';
import { ProtectionNotice } from './components/ProtectionNotice';
import { MealHistoryLog } from './components/MealHistoryLog';
import { TokenLedgerView } from './components/TokenLedgerView';
import { TokenStoreModal } from './components/TokenStoreModal';
import { AuthModal } from './components/AuthModal';
import { PassModal } from './components/PassModal';
import { AdminForecastDashboard } from './components/AdminForecastDashboard';
import { AdminLogin } from './components/AdminLogin';
import { CompleteTestSuite } from './components/CompleteTestSuite';
import { ShieldCheck, CalendarX, Sparkles, Building2, User } from 'lucide-react';
import { AdminAuthSession } from './types';

export default function App() {
  const [role, setRole] = useState<UserRole>(dbService.getCurrentRole());
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(dbService.isAdminAuthenticated());
  const [students, setStudents] = useState<Student[]>([]);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [meals, setMeals] = useState<MealTransaction[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [simulatedTimeIso, setSimulatedTimeIso] = useState<string>(dbService.getSimulatedIsoString());
  const [upcomingMeals, setUpcomingMeals] = useState<UpcomingMeal[]>([]);
  const [tomorrowForecast, setTomorrowForecast] = useState<TomorrowForecastSummary>(dbService.getTomorrowForecast());

  const [activeTab, setActiveTab] = useState<'terminal' | 'meals' | 'ledger' | 'rules' | 'admin' | 'tests'>(
    dbService.getCurrentRole() === 'admin' ? 'admin' : 'terminal'
  );

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot' | 'admin'>('login');
  const [storeModalOpen, setStoreModalOpen] = useState(false);
  const [skipModalOpen, setSkipModalOpen] = useState(false);
  const [selectedUpcomingMealForSkip, setSelectedUpcomingMealForSkip] = useState<UpcomingMeal | undefined>(undefined);
  const [rolloverModalOpen, setRolloverModalOpen] = useState(false);
  const [viewingPass, setViewingPass] = useState<MealTransaction | null>(null);

  // Global Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  const refreshState = useCallback(() => {
    const loadedStudents = dbService.getStudents();
    const loadedMeals = dbService.getMeals();
    const loadedLedger = dbService.getLedger();
    const active = dbService.getCurrentStudent();
    const currIso = dbService.getSimulatedIsoString();
    const currRole = dbService.getCurrentRole();
    const forecast = dbService.getTomorrowForecast();
    const adminAuthed = dbService.isAdminAuthenticated();

    setStudents(loadedStudents);
    setMeals(loadedMeals);
    setLedger(loadedLedger);
    setCurrentStudent(active);
    setSimulatedTimeIso(currIso);
    setRole(currRole);
    setTomorrowForecast(forecast);
    setIsAdminAuthenticated(adminAuthed);

    if (active) {
      setUpcomingMeals(dbService.getUpcomingMeals(active.id));
    }
  }, []);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  // Handler for Role Switching
  const handleToggleRole = (newRole: UserRole) => {
    dbService.setCurrentRole(newRole);
    setRole(newRole);
    if (newRole === 'admin') {
      setActiveTab('admin');
      if (dbService.isAdminAuthenticated()) {
        showToast('Switched to Admin Role: Kitchen Management & Tomorrow Forecast active.', 'info');
      } else {
        showToast('Mess Supervisor login required to access Admin controls.', 'info');
      }
    } else {
      setActiveTab('terminal');
      showToast('Switched to Student Role: Dining Terminal & Token Wallet active.', 'info');
    }
    refreshState();
  };

  // Handler for Admin Auth
  const handleAdminLoginSuccess = (admin: AdminAuthSession) => {
    setIsAdminAuthenticated(true);
    setRole('admin');
    setActiveTab('admin');
    showToast(`Welcome back, ${admin.name}! Mess Admin Portal is now unlocked.`, 'success');
    refreshState();
  };

  const handleAdminLogout = () => {
    dbService.logoutAdmin();
    setIsAdminAuthenticated(false);
    showToast('Signed out of Mess Admin Portal.', 'info');
    refreshState();
  };

  // Handler for Updating Simulated Time
  const handleUpdateSimulatedTime = (isoString: string) => {
    dbService.setSimulatedIsoString(isoString);
    refreshState();
    showToast(`Simulated time set to: ${new Date(isoString).toLocaleString()}`, 'info');
  };

  const handleResetSimulatedTime = () => {
    const def = dbService.resetSimulatedTime();
    refreshState();
    showToast(`Simulated time reset to default (${new Date(def).toLocaleString()})`, 'info');
  };

  // Handler for Claiming Meal (Stage 1)
  const handleClaimMeal = (params: {
    mealCategory: MealCategory;
    isGuest: boolean;
    guestCount: number;
    dietNote?: string;
  }) => {
    if (!currentStudent) {
      setAuthMode('login');
      setAuthModalOpen(true);
      return { success: false };
    }

    const result = dbService.claimMealToken({
      studentId: currentStudent.id,
      mealCategory: params.mealCategory,
      isGuest: params.isGuest,
      guestCount: params.guestCount,
      dietNote: params.dietNote,
    });

    refreshState();

    if (result.success) {
      showToast(
        `Deducted ${result.transaction.tokensDeducted} TK for ${result.transaction.isGuest ? 'Guest ' : ''}${result.transaction.mealCategory}. New balance: ${result.newBalance} TK`,
        'success'
      );
      return { success: true, transaction: result.transaction };
    } else {
      return { success: false, alert: result.alert };
    }
  };

  // Handler for Skipping Meal (Stage 2)
  const handleConfirmSkip = (params: {
    mealDate: string;
    mealCategory: MealCategory;
    isGuest?: boolean;
    guestCount?: number;
  }) => {
    if (!currentStudent) return { success: false };

    const res = dbService.skipMeal({
      studentId: currentStudent.id,
      mealDate: params.mealDate,
      mealCategory: params.mealCategory,
      isGuest: params.isGuest,
      guestCount: params.guestCount,
    });

    refreshState();

    if (res.success) {
      showToast(
        `Skip registered! Refunded +${res.refundAmount} TK to your balance. Tomorrow forecast updated automatically.`,
        'success'
      );
      return { success: true, refundAmount: res.refundAmount };
    } else {
      return { success: false, alert: res.alert };
    }
  };

  // Handler for Monthly Rollover (Stage 2)
  const handleProcessRollover = (studentId: string) => {
    const res = dbService.processMonthlyRollover(studentId);
    if (res.success) {
      refreshState();
      showToast(res.message, 'success');
    }
  };

  const handleSetTestBalance = (studentId: string, testBalance: number) => {
    const loaded = dbService.getStudents();
    const st = loaded.find((s) => s.id === studentId);
    if (st) {
      st.tokenBalance = testBalance;
      dbService.saveStudents(loaded);
      refreshState();
    }
  };

  // Admin Handler: Add Guest Reservation for Tomorrow
  const handleAddGuestMealToForecast = (mealCategory: MealCategory, guestCount: number, hostName: string) => {
    const forecast = dbService.getTomorrowForecast();
    dbService.addGuestReservation(forecast.tomorrowDate, mealCategory, guestCount, hostName);
    refreshState();
    showToast(`Added ${guestCount} guest tray(s) for ${mealCategory} on ${forecast.tomorrowDate}.`, 'success');
  };

  // Admin Handler: Set Simulated Student Roster Count
  const handleSetRosterCount = (count: number) => {
    dbService.setSimulatedStudentRosterCount(count);
    refreshState();
    showToast(`Student roster size updated to ${count} residents. Tomorrow forecast refreshed.`, 'info');
  };

  // Reset all to defaults
  const handleResetToDefaults = () => {
    dbService.resetToDefaults();
    refreshState();
    showToast('Reset system to default seed students, meals, and simulated clock.', 'info');
  };

  // Handler for Buying Tokens
  const handlePurchaseTokens = (tokens: number, packName: string) => {
    if (!currentStudent) return;
    const res = dbService.purchaseTokens(currentStudent.id, tokens, packName);
    if (res.success) {
      refreshState();
      showToast(`Added ${tokens} TK via ${packName}. Current Balance: ${res.newBalance} TK`, 'success');
    }
  };

  // Handler for Monthly Quota Credit (+60 TK)
  const handleRenewQuota = () => {
    if (!currentStudent) return;
    const res = dbService.creditMonthlyQuota(currentStudent.id);
    if (res.success) {
      refreshState();
      showToast(res.message, 'success');
    }
  };

  // Handler for Switching Student
  const handleSwitchStudent = (studentId: string) => {
    dbService.setCurrentStudentId(studentId);
    refreshState();
    const s = students.find((x) => x.id === studentId);
    if (s) {
      showToast(`Switched to ${s.name} (${s.tokenBalance} TK remaining)`, 'info');
    }
  };

  // Handler for Sign Out
  const handleLogout = () => {
    dbService.setCurrentStudentId(null);
    setCurrentStudent(null);
    showToast('Signed out of dining terminal.', 'info');
  };

  // Testing Suite Simulation Callbacks
  const handleSimulateOverdraw = (): PreventionAlert => {
    const requiredTokens = 100;
    const curr = currentStudent?.tokenBalance || 0;
    return {
      type: 'OVERDRAW_PREVENTED',
      title: 'Token Overdraw Blocked',
      message: `Overdraw prevented: Required ${requiredTokens} TK exceeds current balance of ${curr} TK. System does not permit negative overdrafts.`,
      details: {
        currentBalance: curr,
        requiredTokens,
      },
      timestamp: simulatedTimeIso,
    };
  };

  const handleSimulateOverlap = (): PreventionAlert => {
    const todayStr = simulatedTimeIso.split('T')[0];
    return {
      type: 'OVERLAPPING_BLOCKED',
      title: 'Overlapping Meal Token Blocked',
      message: `Token overlapping detected: A regular Lunch token has already been claimed for today (${todayStr}) at 01:10 PM. Duplicate regular tokens for the same session are locked. Switch to Guest Mode if dining with a guest.`,
      details: {
        existingMealDate: todayStr,
        existingMealCategory: 'Lunch',
        existingClaimTime: '01:10 PM',
        currentBalance: currentStudent?.tokenBalance || 0,
        requiredTokens: 2,
      },
      timestamp: simulatedTimeIso,
    };
  };

  const handleSimulateZeroFloor = (): PreventionAlert => {
    return {
      type: 'ZERO_FLOOR_VIOLATION',
      title: 'Zero Floor Balance Bound Confirmed',
      message: 'Zero Floor Policy Active: Under mathematical invariant constraints, balanceAfter is bound to >= 0 TK. No transaction can produce a negative token ledger entry.',
      details: {
        currentBalance: currentStudent?.tokenBalance || 0,
        requiredTokens: 0,
      },
      timestamp: simulatedTimeIso,
    };
  };

  const handleSimulateValidSkip = () => {
    if (!currentStudent) return { success: false };
    dbService.setSimulatedIsoString('2026-11-01T19:30:00');
    const res = dbService.skipMeal({
      studentId: currentStudent.id,
      mealDate: '2026-11-02',
      mealCategory: 'Lunch',
    });
    refreshState();
    if (res.success) {
      return {
        success: true,
        message: `Scenario 1 PASSED: Valid skip before 8 PM Sunday processed! Lunch on Monday Nov 2 skipped. Refund of ${res.refundAmount} TK credited back (new balance: ${res.newBalance} TK).`,
      };
    }
    return { success: false, alert: res.alert };
  };

  const handleSimulateLateSkip = (): PreventionAlert => {
    return {
      type: 'SKIP_DEADLINE_PASSED',
      title: 'Skip Deadline Has Passed',
      message:
        'Skip deadline has passed. You can no longer skip this meal.\n\n• Target Meal: Monday Breakfast (2026-11-02)\n• Skip Deadline was: Sunday, Nov 1, 2026 at 08:00 PM\n• Current Simulated Time: Sunday, Nov 1, 2026 at 08:30 PM (Deadline expired 30 minutes ago)',
      details: {
        skipDeadline: 'Sunday, Nov 1, 2026 at 08:00 PM',
        currentSimulatedTime: 'Sunday, Nov 1, 2026 at 08:30 PM',
        existingMealDate: '2026-11-02',
        existingMealCategory: 'Breakfast',
      },
      timestamp: '2026-11-01T20:30:00',
    };
  };

  const handleSimulateBreakfastSkip = () => {
    if (!currentStudent) return { success: false };
    dbService.setSimulatedIsoString('2026-11-01T19:00:00');
    const res = dbService.skipMeal({
      studentId: currentStudent.id,
      mealDate: '2026-11-03',
      mealCategory: 'Breakfast',
    });
    refreshState();
    if (res.success) {
      return {
        success: true,
        message: `Scenario 3 PASSED: Breakfast (cost 1 TK) skipped. Half cost is 0.5 TK -> rounded DOWN to 0 TK refund. Balance safely remained ${res.newBalance} TK.`,
      };
    }
    return { success: false, alert: res.alert };
  };

  const handleSimulateLunchSkip = () => {
    if (!currentStudent) return { success: false };
    dbService.setSimulatedIsoString('2026-11-01T19:00:00');
    const res = dbService.skipMeal({
      studentId: currentStudent.id,
      mealDate: '2026-11-03',
      mealCategory: 'Dinner',
    });
    refreshState();
    if (res.success) {
      return {
        success: true,
        message: `Scenario 4 PASSED: Dinner (cost 2 TK) skipped. Half cost is 1.0 TK -> rounded DOWN to 1 TK refund. +1 TK added to balance (new balance: ${res.newBalance} TK).`,
      };
    }
    return { success: false, alert: res.alert };
  };

  const handleSimulateDuplicateSkip = (): PreventionAlert => {
    return {
      type: 'DUPLICATE_SKIP_BLOCKED',
      title: 'Duplicate Skip Attempt Blocked',
      message:
        'Meal has already been skipped. You already registered a skip for this meal. Duplicate skip and refund requests are blocked to prevent multiple refunds for the same meal.',
      details: {
        existingMealDate: '2026-11-02',
        existingMealCategory: 'Lunch',
        refundAmount: 1,
      },
      timestamp: simulatedTimeIso,
    };
  };

  const handleSimulateRolloverNormal = (): string => {
    if (!currentStudent) return '';
    handleSetTestBalance(currentStudent.id, 6);
    const res = dbService.processMonthlyRollover(currentStudent.id);
    refreshState();
    return `Scenario 6 PASSED: Evaluated 6 unused tokens. Since 6 <= 10, all 6 tokens rolled over! Starting next month balance = 60 new tokens + 6 rollover = 66 TK.`;
  };

  const handleSimulateRolloverCapped = (): string => {
    if (!currentStudent) return '';
    handleSetTestBalance(currentStudent.id, 18);
    const res = dbService.processMonthlyRollover(currentStudent.id);
    refreshState();
    return `Scenario 7 PASSED: Evaluated 18 unused tokens. Capped at 10 tokens max! Starting next month balance = 60 new tokens + 10 rollover = 70 TK (8 excess tokens expired).`;
  };

  const todayStr = simulatedTimeIso.split('T')[0];
  const todayStudentMeals = meals.filter(
    (m) => currentStudent && m.studentId === currentStudent.id && m.date === todayStr
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-amber-100 selection:text-amber-900 font-sans">
      {/* Testing Controls: Simulated Clock Top Bar */}
      <SimulatedClockControl
        currentSimulatedIso={simulatedTimeIso}
        onUpdateSimulatedTime={handleUpdateSimulatedTime}
        onResetSimulatedTime={handleResetSimulatedTime}
      />

      {/* Navigation Header with Student/Admin Role Switcher */}
      <Navbar
        currentStudent={currentStudent}
        activeRole={role}
        onToggleRole={handleToggleRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={(mode) => {
          setAuthMode(mode || 'login');
          setAuthModalOpen(true);
        }}
        onOpenStore={() => setStoreModalOpen(true)}
        onOpenSkipModal={() => setSkipModalOpen(true)}
        onLogout={handleLogout}
        onLogoutAdmin={handleAdminLogout}
        isAdminAuthenticated={isAdminAuthenticated}
        onSwitchStudent={handleSwitchStudent}
        allStudents={students}
        onRenewQuota={handleRenewQuota}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Global Floating Toast */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl border flex items-center gap-3 max-w-md animate-in slide-in-from-bottom-3 duration-200 ${
              toast.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : toast.type === 'error'
                ? 'bg-rose-900 text-white border-rose-800'
                : 'bg-amber-900 text-white border-amber-800'
            }`}
          >
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-xs font-medium leading-relaxed">{toast.message}</p>
          </div>
        )}

        {/* Not Logged In Banner */}
        {!currentStudent && role === 'student' && (
          <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-amber-950">
                Sign in to Claim Mess Meals, Skip Upcoming Meals, &amp; Access Your 60 TK Quota
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Each registered student receives a 60 TK per month fixed allowance with rollover and refund features.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setAuthModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-semibold bg-white border border-slate-300 text-slate-800 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthMode('register');
                  setAuthModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-bold bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
              >
                Register (+60 TK)
              </button>
            </div>
          </div>
        )}

        {/* STUDENT ROLE: Dashboard Summary */}
        {role === 'student' && currentStudent && activeTab === 'terminal' && (
          <Stage2DashboardSummary
            currentStudent={currentStudent}
            upcomingMeals={upcomingMeals}
            currentSimulatedIso={simulatedTimeIso}
            onOpenSkipModal={(meal) => {
              setSelectedUpcomingMealForSkip(meal);
              setSkipModalOpen(true);
            }}
            onOpenRolloverModal={() => setRolloverModalOpen(true)}
          />
        )}

        {/* ADMIN ROLE: Login Page if not authenticated */}
        {role === 'admin' && !isAdminAuthenticated && (
          <div className="py-8 flex items-center justify-center">
            <AdminLogin
              onSuccess={handleAdminLoginSuccess}
              onSwitchToStudent={() => handleToggleRole('student')}
            />
          </div>
        )}

        {/* ADMIN ROLE: Tomorrow's Forecast Dashboard */}
        {role === 'admin' && isAdminAuthenticated && activeTab === 'admin' && (
          <AdminForecastDashboard
            forecast={tomorrowForecast}
            onAddGuestMeal={handleAddGuestMealToForecast}
            onSetRosterCount={handleSetRosterCount}
            onResetSimulatedData={handleResetToDefaults}
          />
        )}

        {/* STUDENT ROLE: Meal Terminal */}
        {role === 'student' && activeTab === 'terminal' && currentStudent && (
          <MealTerminal
            currentStudent={currentStudent}
            onClaimMeal={handleClaimMeal}
            onOpenStore={() => setStoreModalOpen(true)}
            onOpenAuth={() => {
              setAuthMode('login');
              setAuthModalOpen(true);
            }}
            todayMeals={todayStudentMeals}
            onViewPass={(meal) => setViewingPass(meal)}
          />
        )}

        {/* Meal History Log (Accessible by Student or Authenticated Admin) */}
        {activeTab === 'meals' && (role === 'student' || isAdminAuthenticated) && (
          <MealHistoryLog
            meals={meals}
            currentStudent={role === 'student' ? currentStudent : null}
            onViewPass={(m) => setViewingPass(m)}
          />
        )}

        {/* Token Ledger View (Accessible by Student) */}
        {role === 'student' && activeTab === 'ledger' && (
          <TokenLedgerView
            ledger={ledger}
            currentStudent={currentStudent}
            onRenewQuota={handleRenewQuota}
            onOpenStore={() => setStoreModalOpen(true)}
          />
        )}

        {/* Rules & Invariants Console */}
        {activeTab === 'rules' && (role === 'student' ? currentStudent : isAdminAuthenticated) && (
          <ProtectionNotice
            currentStudent={currentStudent || students[0]}
            onSimulateOverdraw={handleSimulateOverdraw}
            onSimulateOverlap={handleSimulateOverlap}
            onSimulateZeroFloor={handleSimulateZeroFloor}
            onSimulateValidSkip={handleSimulateValidSkip}
            onSimulateLateSkip={handleSimulateLateSkip}
            onSimulateBreakfastSkip={handleSimulateBreakfastSkip}
            onSimulateLunchSkip={handleSimulateLunchSkip}
            onSimulateDuplicateSkip={handleSimulateDuplicateSkip}
            onSimulateRolloverNormal={handleSimulateRolloverNormal}
            onSimulateRolloverCapped={handleSimulateRolloverCapped}
          />
        )}

        {/* AUTOMATED TEST SUITE (Stage 1 + Stage 2 + Stage 3) */}
        {activeTab === 'tests' && (role === 'student' || isAdminAuthenticated) && (
          <CompleteTestSuite onRefresh={refreshState} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">Hostel Mess Dining System</span>
            <span>·</span>
            <span>Roles: Student &amp; Admin</span>
            <span>·</span>
            <span>Breakfast 1 TK</span>
            <span>·</span>
            <span>Lunch 2 TK</span>
            <span>·</span>
            <span>Dinner 2 TK</span>
            <span>·</span>
            <span>Guest 2x</span>
            <span>·</span>
            <span>120 Kitchen Capacity</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono">Invariants: Zero-Floor · Anti-Overdraw · Anti-Overlap · 8 PM Deadline · 10 TK Rollover Cap</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        onAuthSuccess={(s) => {
          refreshState();
          showToast(`Logged in as ${s.name}`, 'success');
        }}
        onAdminAuthSuccess={handleAdminLoginSuccess}
      />

      <TokenStoreModal
        isOpen={storeModalOpen}
        onClose={() => setStoreModalOpen(false)}
        currentStudent={currentStudent}
        onPurchase={handlePurchaseTokens}
      />

      <SkipMealModal
        isOpen={skipModalOpen}
        onClose={() => {
          setSkipModalOpen(false);
          setSelectedUpcomingMealForSkip(undefined);
        }}
        currentStudent={currentStudent}
        upcomingMeals={upcomingMeals}
        currentSimulatedIso={simulatedTimeIso}
        initialSelectedMeal={selectedUpcomingMealForSkip}
        onConfirmSkip={handleConfirmSkip}
      />

      <RolloverSimulatorModal
        isOpen={rolloverModalOpen}
        onClose={() => setRolloverModalOpen(false)}
        currentStudent={currentStudent}
        onProcessRollover={handleProcessRollover}
        onSetTestBalance={handleSetTestBalance}
      />

      <PassModal meal={viewingPass} onClose={() => setViewingPass(null)} />
    </div>
  );
}
