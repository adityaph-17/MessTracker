/**
 * In-browser Persistent Storage and Business Logic Engine
 * Stage 1, Stage 2, and Stage 3 Complete Implementation
 * Handles:
 * - Student & Admin Roles
 * - Exact 8:00 PM previous day deadline (< 20:00:00)
 * - Half-cost round-down skip refunds (Breakfast 0 TK, Lunch 1 TK, Dinner 1 TK, Guest half)
 * - Monthly rollover capped at 10 tokens (60 + rollover)
 * - Tomorrow's Meal Forecast (Breakfast, Lunch, Dinner, Student count - Skips + Guests)
 * - 120 Meal Capacity Limit (<= 120 Within Limit, > 120 Capacity Warning)
 * - Zero-Floor & Anti-Overdraw strict invariants
 */

import {
  Student,
  MealTransaction,
  LedgerEntry,
  MealCategory,
  PreventionAlert,
  MealPricing,
  UpcomingMeal,
  TomorrowMealForecast,
  TomorrowForecastSummary,
  GuestMealReservation,
  AdminAuthSession,
} from '../types';

export const MEAL_PRICING_TABLE: Record<MealCategory, MealPricing> = {
  Breakfast: {
    category: 'Breakfast',
    baseCost: 1, // 1 TK
    guestCost: 2, // Double cost for guest (1 * 2 = 2 TK)
    servingHours: '07:00 AM - 10:00 AM',
    defaultTimeRange: [7, 10],
    description: 'Wholesome breakfast tray with hot eggs/poha/toast, fresh seasonal fruit, and milk or spiced tea.',
    menuHighlights: ['Boiled Eggs / Vegetable Poha', 'Fresh Cut Fruit', 'Hot Spiced Tea / Milk', 'Toasted Brown Bread & Butter'],
  },
  Lunch: {
    category: 'Lunch',
    baseCost: 2, // 2 TK
    guestCost: 4, // Double cost for guest (2 * 2 = 4 TK)
    servingHours: '12:00 PM - 03:00 PM',
    defaultTimeRange: [12, 15],
    description: 'Full nutrition student thali with steamed basmati rice, slow-cooked lentils (dal), mixed sabzi, curd, and fresh salad.',
    menuHighlights: ['Steamed Basmati Rice', 'Tadka Yellow Dal', 'Seasonal Vegetable Curry', 'Fresh Cucumber Salad & Curd'],
  },
  Dinner: {
    category: 'Dinner',
    baseCost: 2, // 2 TK
    guestCost: 4, // Double cost for guest (2 * 2 = 4 TK)
    servingHours: '07:30 PM - 10:30 PM',
    defaultTimeRange: [19, 22],
    description: 'Balanced evening spread with warm whole-wheat rotis, spiced paneer/chicken gravy, steamed rice, and dessert.',
    menuHighlights: ['Fresh Whole-Wheat Rotis', 'Spiced Paneer / Savory Curry', 'Steamed Cumin Rice', 'Sweet Kheer / Gulab Jamun'],
  },
};

const STORAGE_KEYS = {
  STUDENTS: 'mess_tracker_students_v3',
  MEALS: 'mess_tracker_meals_v3',
  LEDGER: 'mess_tracker_ledger_v3',
  CURRENT_USER: 'mess_tracker_current_user_v3',
  CURRENT_ROLE: 'mess_tracker_current_role_v3',
  SIMULATED_TIME: 'mess_tracker_simulated_time_v3',
  GUEST_RESERVATIONS: 'mess_tracker_guest_reservations_v3',
  ADMIN_AUTH: 'mess_tracker_admin_auth_v3',
};

function getDefaultSimulatedDate(): string {
  // Sunday evening at 07:30 PM (before Sunday 8:00 PM deadline for Monday meals)
  return '2026-11-01T19:30:00';
}

function getSeedStudents(): Student[] {
  const regDate = '2026-10-15T10:00:00Z';
  const nextMonth = '2026-11-15T10:00:00Z';

  return [
    {
      id: 'STU-001',
      name: 'Parth Patil',
      email: 'parthpatil503@gmail.com',
      password: 'password123',
      rollNo: 'CS-2026-081',
      hostelBlock: 'Hall of Residence 4',
      roomNo: 'B-304',
      tokenBalance: 42,
      monthlyTokens: 60,
      rolloverTokens: 4,
      tokensUsed: 22,
      tokensRefundedFromSkips: 1,
      monthlyFixQuota: 60,
      lastQuotaCreditedAt: regDate,
      quotaCycleExpiresAt: nextMonth,
      registeredAt: regDate,
      dietPreference: 'Vegetarian',
      phone: '+91 98765 43210',
      avatarSeed: 'parth',
    },
    {
      id: 'STU-002',
      name: 'Ayesha Khan',
      email: 'ayesha.k@campus.edu',
      password: 'password123',
      rollNo: 'EE-2026-014',
      hostelBlock: 'Sarojini Naidu Bhawan',
      roomNo: 'A-102',
      tokenBalance: 1, // Only 1 TK left: ideal for overdraw test!
      monthlyTokens: 60,
      rolloverTokens: 0,
      tokensUsed: 59,
      tokensRefundedFromSkips: 0,
      monthlyFixQuota: 60,
      lastQuotaCreditedAt: regDate,
      quotaCycleExpiresAt: nextMonth,
      registeredAt: regDate,
      dietPreference: 'Non-Vegetarian',
      phone: '+91 91234 56789',
      avatarSeed: 'ayesha',
    },
    {
      id: 'STU-003',
      name: 'Rohan Sharma',
      email: 'rohan.sharma@campus.edu',
      password: 'password123',
      rollNo: 'ME-2026-056',
      hostelBlock: 'Tagore Hall',
      roomNo: 'C-215',
      tokenBalance: 60,
      monthlyTokens: 60,
      rolloverTokens: 0,
      tokensUsed: 0,
      tokensRefundedFromSkips: 0,
      monthlyFixQuota: 60,
      lastQuotaCreditedAt: regDate,
      quotaCycleExpiresAt: nextMonth,
      registeredAt: regDate,
      dietPreference: 'Halal Special',
      phone: '+91 95551 23456',
      avatarSeed: 'rohan',
    },
    {
      id: 'STU-004',
      name: 'Neha Verma',
      email: 'neha.v@campus.edu',
      password: 'password123',
      rollNo: 'BT-2026-092',
      hostelBlock: 'Kalpana Chawla Hall',
      roomNo: 'D-110',
      tokenBalance: 55,
      monthlyTokens: 60,
      rolloverTokens: 2,
      tokensUsed: 7,
      tokensRefundedFromSkips: 0,
      monthlyFixQuota: 60,
      lastQuotaCreditedAt: regDate,
      quotaCycleExpiresAt: nextMonth,
      registeredAt: regDate,
      dietPreference: 'Vegetarian',
      phone: '+91 94444 11223',
      avatarSeed: 'neha',
    },
    {
      id: 'STU-005',
      name: 'Tanvir Ahmed',
      email: 'tanvir.a@campus.edu',
      password: 'password123',
      rollNo: 'CE-2026-033',
      hostelBlock: 'Hall of Residence 4',
      roomNo: 'B-212',
      tokenBalance: 2, // Exactly 2 TK: ideal for exact balance test on Lunch/Dinner!
      monthlyTokens: 60,
      rolloverTokens: 0,
      tokensUsed: 58,
      tokensRefundedFromSkips: 0,
      monthlyFixQuota: 60,
      lastQuotaCreditedAt: regDate,
      quotaCycleExpiresAt: nextMonth,
      registeredAt: regDate,
      dietPreference: 'Halal Special',
      phone: '+91 98888 77665',
      avatarSeed: 'tanvir',
    },
  ];
}

function getSeedMeals(): MealTransaction[] {
  return [
    {
      id: 'ML-20261101-101',
      studentId: 'STU-001',
      studentName: 'Parth Patil',
      studentRoll: 'CS-2026-081',
      mealCategory: 'Breakfast',
      isGuest: false,
      guestCount: 0,
      tokensDeducted: 1,
      originalCost: 1,
      refundReceived: 0,
      skipStatus: 'ACTIVE',
      balanceBefore: 43,
      balanceAfter: 42,
      date: '2026-11-01',
      timestamp: '2026-11-01T08:15:00Z',
      timeSlot: '08:15 AM',
      tokenPassCode: 'TK-8419',
      status: 'CHECKED_IN',
      dietNote: 'Vegetarian',
    },
    {
      id: 'ML-20261031-100',
      studentId: 'STU-001',
      studentName: 'Parth Patil',
      studentRoll: 'CS-2026-081',
      mealCategory: 'Dinner',
      isGuest: true,
      guestCount: 1,
      tokensDeducted: 4,
      originalCost: 4,
      refundReceived: 0,
      skipStatus: 'ACTIVE',
      balanceBefore: 47,
      balanceAfter: 43,
      date: '2026-10-31',
      timestamp: '2026-10-31T20:30:00Z',
      timeSlot: '08:30 PM',
      tokenPassCode: 'TK-7104',
      status: 'CHECKED_IN',
      dietNote: 'Guest: Non-Veg',
    },
    {
      id: 'ML-20261030-098',
      studentId: 'STU-001',
      studentName: 'Parth Patil',
      studentRoll: 'CS-2026-081',
      mealCategory: 'Lunch',
      isGuest: false,
      guestCount: 0,
      tokensDeducted: 1,
      originalCost: 2,
      refundReceived: 1,
      skipStatus: 'SKIPPED',
      skippedAt: '2026-10-29T18:00:00Z',
      skipDeadline: '2026-10-29T20:00:00Z',
      balanceBefore: 47,
      balanceAfter: 48,
      date: '2026-10-30',
      timestamp: '2026-10-30T12:00:00Z',
      timeSlot: '12:00 PM',
      tokenPassCode: 'TK-SKIP-01',
      status: 'SKIPPED',
      dietNote: 'Skipped in advance (Refund: 1 TK)',
    },
  ];
}

function getSeedLedger(): LedgerEntry[] {
  return [
    {
      id: 'LDG-001',
      studentId: 'STU-001',
      type: 'MONTHLY_QUOTA',
      description: 'Monthly Fixed Allowance (60 TK Allocation) + 4 TK Rollover',
      amount: 64,
      balanceAfter: 64,
      date: '2026-10-15',
      timestamp: '2026-10-15T10:00:00Z',
      referenceId: 'SYS-INIT-60TK',
    },
    {
      id: 'LDG-002',
      studentId: 'STU-001',
      type: 'SKIP_REFUND',
      description: 'Refund for Skipped Lunch on 2026-10-30 (Half Cost: +1 TK)',
      amount: 1,
      balanceAfter: 48,
      date: '2026-10-29',
      timestamp: '2026-10-29T18:00:00Z',
      referenceId: 'ML-20261030-098',
    },
    {
      id: 'LDG-003',
      studentId: 'STU-001',
      type: 'MEAL_DEDUCTION',
      description: 'Dinner token redeemed (Guest Mode: 2x Cost)',
      amount: -4,
      balanceAfter: 43,
      date: '2026-10-31',
      timestamp: '2026-10-31T20:30:00Z',
      referenceId: 'ML-20261031-100',
    },
    {
      id: 'LDG-004',
      studentId: 'STU-001',
      type: 'MEAL_DEDUCTION',
      description: 'Breakfast token redeemed (Regular)',
      amount: -1,
      balanceAfter: 42,
      date: '2026-11-01',
      timestamp: '2026-11-01T08:15:00Z',
      referenceId: 'ML-20261101-101',
    },
  ];
}

function getSeedGuestReservations(): GuestMealReservation[] {
  return [
    {
      id: 'GR-001',
      date: '2026-11-02', // Tomorrow for Sunday Nov 1
      mealCategory: 'Lunch',
      guestCount: 2,
      hostName: 'Parth Patil',
      notes: 'Visiting research collaborators',
    },
    {
      id: 'GR-002',
      date: '2026-11-02',
      mealCategory: 'Dinner',
      guestCount: 1,
      hostName: 'Neha Verma',
      notes: 'Parent visit',
    },
  ];
}

let transactionMutexLocked = false;

export const dbService = {
  // Role Management
  getCurrentRole(): 'student' | 'admin' {
    return (localStorage.getItem(STORAGE_KEYS.CURRENT_ROLE) as 'student' | 'admin') || 'student';
  },

  setCurrentRole(role: 'student' | 'admin') {
    localStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, role);
  },

  // Admin Authentication (Default: admin / admin@123)
  isAdminAuthenticated(): boolean {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH);
      if (!data) return false;
      const parsed = JSON.parse(data);
      return Boolean(parsed && parsed.isLoggedIn);
    } catch {
      return false;
    }
  },

  getAdminSession(): AdminAuthSession | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH);
      if (!data) return null;
      const parsed = JSON.parse(data);
      if (parsed && parsed.isLoggedIn) return parsed;
      return null;
    } catch {
      return null;
    }
  },

  loginAdmin(
    username: string,
    pass: string
  ): { success: true; admin: AdminAuthSession } | { success: false; error: string } {
    const cleanUser = username.trim().toLowerCase();
    const validUsers = ['admin', 'admin@mess.edu', 'admin@campus.edu'];
    const validPass = 'admin@123';

    if (!cleanUser) {
      return { success: false, error: 'Admin username is required. Default is "admin".' };
    }

    if (!validUsers.includes(cleanUser)) {
      return {
        success: false,
        error: 'Invalid admin username. Default username is "admin".',
      };
    }

    if (pass !== validPass) {
      return {
        success: false,
        error: 'Incorrect admin password. Default password is "admin@123".',
      };
    }

    const session: AdminAuthSession = {
      isLoggedIn: true,
      username: 'admin',
      name: 'Mess Administrator',
      email: 'admin@mess.edu',
      role: 'admin',
      loginTime: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, JSON.stringify(session));
    this.setCurrentRole('admin');
    return { success: true, admin: session };
  },

  logoutAdmin(): void {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
  },

  // Simulated Clock Operations
  getSimulatedIsoString(): string {
    const val = localStorage.getItem(STORAGE_KEYS.SIMULATED_TIME);
    if (!val) {
      const def = getDefaultSimulatedDate();
      localStorage.setItem(STORAGE_KEYS.SIMULATED_TIME, def);
      return def;
    }
    return val;
  },

  getSimulatedDate(): Date {
    return new Date(this.getSimulatedIsoString());
  },

  setSimulatedIsoString(iso: string) {
    localStorage.setItem(STORAGE_KEYS.SIMULATED_TIME, iso);
  },

  resetSimulatedTime(): string {
    const def = getDefaultSimulatedDate();
    localStorage.setItem(STORAGE_KEYS.SIMULATED_TIME, def);
    return def;
  },

  // Database Records Access
  getStudents(): Student[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (!data) {
        const seeded = getSeedStudents();
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(seeded));
        return seeded;
      }
      return JSON.parse(data);
    } catch {
      return getSeedStudents();
    }
  },

  saveStudents(students: Student[]) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  },

  getMeals(): MealTransaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEALS);
      if (!data) {
        const seeded = getSeedMeals();
        localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(seeded));
        return seeded;
      }
      return JSON.parse(data);
    } catch {
      return getSeedMeals();
    }
  },

  saveMeals(meals: MealTransaction[]) {
    localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
  },

  getLedger(): LedgerEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEDGER);
      if (!data) {
        const seeded = getSeedLedger();
        localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(seeded));
        return seeded;
      }
      return JSON.parse(data);
    } catch {
      return getSeedLedger();
    }
  },

  saveLedger(ledger: LedgerEntry[]) {
    localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(ledger));
  },

  getGuestReservations(): GuestMealReservation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GUEST_RESERVATIONS);
      if (!data) {
        const seeded = getSeedGuestReservations();
        localStorage.setItem(STORAGE_KEYS.GUEST_RESERVATIONS, JSON.stringify(seeded));
        return seeded;
      }
      return JSON.parse(data);
    } catch {
      return getSeedGuestReservations();
    }
  },

  saveGuestReservations(res: GuestMealReservation[]) {
    localStorage.setItem(STORAGE_KEYS.GUEST_RESERVATIONS, JSON.stringify(res));
  },

  getCurrentStudentId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || 'STU-001';
  },

  setCurrentStudentId(id: string | null) {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  getCurrentStudent(): Student | null {
    const id = this.getCurrentStudentId();
    if (!id) return null;
    const students = this.getStudents();
    return students.find((s) => s.id === id) || students[0] || null;
  },

  /**
   * Skip Deadline Calculation:
   * Rule: MUST be made strictly BEFORE 8:00 PM on the previous day.
   * At 8:00 PM (20:00:00) or later, it is blocked.
   */
  getSkipDeadline(mealDateYmd: string): Date {
    const [y, m, d] = mealDateYmd.split('-').map(Number);
    const prevDay = new Date(y, m - 1, d - 1, 20, 0, 0, 0);
    return prevDay;
  },

  /**
   * Helper: Generate upcoming meal slots for student
   */
  getUpcomingMeals(studentId: string): UpcomingMeal[] {
    const simDate = this.getSimulatedDate();
    const meals = this.getMeals();
    const result: UpcomingMeal[] = [];

    for (let dayOffset = 0; dayOffset <= 3; dayOffset++) {
      const target = new Date(simDate);
      target.setDate(simDate.getDate() + dayOffset);
      const y = target.getFullYear();
      const m = String(target.getMonth() + 1).padStart(2, '0');
      const d = String(target.getDate()).padStart(2, '0');
      const ymd = `${y}-${m}-${d}`;

      const dayName = target.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

      (['Breakfast', 'Lunch', 'Dinner'] as MealCategory[]).forEach((cat) => {
        const pricing = MEAL_PRICING_TABLE[cat];
        const cost = pricing.baseCost;
        const refundIfSkipped = Math.floor(cost / 2);

        const deadline = this.getSkipDeadline(ymd);
        const canSkip = simDate.getTime() < deadline.getTime(); // Strictly before 8:00 PM

        const isSkipped = meals.some(
          (meal) =>
            meal.studentId === studentId &&
            meal.date === ymd &&
            meal.mealCategory === cat &&
            meal.skipStatus === 'SKIPPED'
        );

        result.push({
          id: `UP-${ymd}-${cat}`,
          date: ymd,
          dayLabel: dayName,
          mealCategory: cat,
          cost,
          refundIfSkipped,
          skipDeadlineIso: deadline.toISOString(),
          skipDeadlineDisplay: deadline.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          canSkip: canSkip && !isSkipped,
          isSkipped,
        });
      });
    }

    return result;
  },

  /**
   * STAGE 3: TOMORROW'S MEAL FORECAST FOR ADMIN
   * - Tomorrow date = Simulated date + 1 day
   * - Expected Student Meals = Total Enrolled Students - Valid Skips for tomorrow
   * - Expected Guest Meals = Sum of guest meals scheduled for tomorrow
   * - Total Expected Meals = Student Meals + Guest Meals
   * - Capacity limit = 120
   *   - If total > 120: CAPACITY_EXCEEDED (show clear warning)
   *   - If total <= 120: WITHIN_CAPACITY (show capacity within limit)
   */
  getTomorrowForecast(): TomorrowForecastSummary {
    const simTime = this.getSimulatedDate();
    const simDateStr = simTime.toISOString().split('T')[0];

    const tomorrow = new Date(simTime);
    tomorrow.setDate(simTime.getDate() + 1);
    const ty = tomorrow.getFullYear();
    const tm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const td = String(tomorrow.getDate()).padStart(2, '0');
    const tomorrowYmd = `${ty}-${tm}-${td}`;

    const tomorrowDayLabel = tomorrow.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const students = this.getStudents();
    const allMeals = this.getMeals();
    const guestReservations = this.getGuestReservations();

    const computeCategoryForecast = (cat: MealCategory): TomorrowMealForecast => {
      // Find valid skips for tomorrow
      const skips = allMeals.filter(
        (m) => m.date === tomorrowYmd && m.mealCategory === cat && m.skipStatus === 'SKIPPED'
      );
      const skippedStudentIds = new Set(skips.map((s) => s.studentId));

      const skippedStudentNames: string[] = [];
      const activeStudentNames: string[] = [];

      students.forEach((st) => {
        if (skippedStudentIds.has(st.id)) {
          skippedStudentNames.push(st.name);
        } else {
          activeStudentNames.push(st.name);
        }
      });

      const expectedStudentMeals = Math.max(0, students.length - skips.length);

      // Guests scheduled for tomorrow
      const guestsForMeal = guestReservations
        .filter((g) => g.date === tomorrowYmd && g.mealCategory === cat)
        .reduce((sum, g) => sum + g.guestCount, 0);

      // Also count any meal transactions with guest count for tomorrow
      const guestTraysFromMeals = allMeals
        .filter((m) => m.date === tomorrowYmd && m.mealCategory === cat && m.isGuest && m.skipStatus !== 'SKIPPED')
        .reduce((sum, m) => sum + m.guestCount, 0);

      const expectedGuestMeals = guestsForMeal + guestTraysFromMeals;
      const totalExpectedMeals = expectedStudentMeals + expectedGuestMeals;
      const capacityLimit = 120;
      const isExceeded = totalExpectedMeals > capacityLimit; // strictly greater than 120

      return {
        mealCategory: cat,
        expectedStudentMeals,
        expectedGuestMeals,
        totalExpectedMeals,
        capacityLimit,
        isExceeded,
        capacityStatus: isExceeded ? 'CAPACITY_EXCEEDED' : 'WITHIN_CAPACITY',
        skippedStudentsCount: skips.length,
        skippedStudentNames,
        activeStudentNames,
      };
    };

    const breakfast = computeCategoryForecast('Breakfast');
    const lunch = computeCategoryForecast('Lunch');
    const dinner = computeCategoryForecast('Dinner');

    const totalDayExpectedMeals =
      breakfast.totalExpectedMeals + lunch.totalExpectedMeals + dinner.totalExpectedMeals;
    const anyMealExceedsCapacity =
      breakfast.isExceeded || lunch.isExceeded || dinner.isExceeded;

    return {
      simulatedDate: simDateStr,
      simulatedDateTimeDisplay: simTime.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      tomorrowDate: tomorrowYmd,
      tomorrowDayLabel,
      totalRegisteredStudents: students.length,
      breakfast,
      lunch,
      dinner,
      totalDayExpectedMeals,
      anyMealExceedsCapacity,
    };
  },

  /**
   * Helper: Adjust student roster count for capacity testing (e.g., test exactly 120 or 125)
   */
  setSimulatedStudentRosterCount(targetCount: number) {
    const students = this.getStudents();
    if (targetCount <= 0) {
      this.saveStudents([]);
      return;
    }

    if (students.length >= targetCount) {
      this.saveStudents(students.slice(0, targetCount));
      return;
    }

    // Expand
    const diff = targetCount - students.length;
    for (let i = 1; i <= diff; i++) {
      const idx = students.length + 1;
      students.push({
        id: `STU-GEN-${idx}`,
        name: `Hostel Resident ${idx}`,
        email: `resident${idx}@campus.edu`,
        password: 'password123',
        rollNo: `GEN-2026-${String(idx).padStart(3, '0')}`,
        hostelBlock: 'Hall of Residence 4',
        roomNo: `R-${100 + (idx % 80)}`,
        tokenBalance: 40,
        monthlyTokens: 60,
        rolloverTokens: 0,
        tokensUsed: 20,
        tokensRefundedFromSkips: 0,
        monthlyFixQuota: 60,
        lastQuotaCreditedAt: new Date().toISOString(),
        quotaCycleExpiresAt: new Date().toISOString(),
        registeredAt: new Date().toISOString(),
        dietPreference: 'Vegetarian',
        avatarSeed: `resident${idx}`,
      });
    }
    this.saveStudents(students);
  },

  /**
   * Helper: Add Guest Reservation for tomorrow's forecast test
   */
  addGuestReservation(date: string, mealCategory: MealCategory, guestCount: number, hostName: string) {
    const reservations = this.getGuestReservations();
    reservations.push({
      id: `GR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date,
      mealCategory,
      guestCount,
      hostName,
    });
    this.saveGuestReservations(reservations);
  },

  /**
   * STAGE 2 & 3: SKIP MEAL WITH HALF-COST REFUND
   * Strict Deadline Rule:
   * "skip must be submitted before 8 pm on the previous day"
   * Both "skip exactly at 8 pm" and "skip after 8 pm" are BLOCKED.
   */
  skipMeal(params: {
    studentId: string;
    mealDate: string; // YYYY-MM-DD
    mealCategory: MealCategory;
    isGuest?: boolean;
    guestCount?: number;
  }): { success: true; refundAmount: number; newBalance: number; transaction: MealTransaction } | { success: false; alert: PreventionAlert } {
    if (transactionMutexLocked) {
      return {
        success: false,
        alert: {
          type: 'DUPLICATE_SKIP_BLOCKED',
          title: 'Operation Locked',
          message: 'Another transaction is in progress. Please wait a moment.',
          details: {},
          timestamp: new Date().toISOString(),
        },
      };
    }

    try {
      transactionMutexLocked = true;

      const students = this.getStudents();
      const student = students.find((s) => s.id === params.studentId);
      if (!student) {
        return {
          success: false,
          alert: {
            type: 'ZERO_FLOOR_VIOLATION',
            title: 'Student Record Not Found',
            message: 'Student account record not found.',
            details: {},
            timestamp: new Date().toISOString(),
          },
        };
      }

      const simTime = this.getSimulatedDate();
      const deadline = this.getSkipDeadline(params.mealDate);

      // =========================================================================
      // DEADLINE VALIDATION (STRICTLY BEFORE 8:00 PM PREVIOUS DAY)
      // If simTime >= deadline (at 8:00 PM or after) -> BLOCKED
      // =========================================================================
      if (simTime.getTime() >= deadline.getTime()) {
        const deadlineFormatted = deadline.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });

        const currentSimFormatted = simTime.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });

        return {
          success: false,
          alert: {
            type: 'SKIP_DEADLINE_PASSED',
            title: 'Skip Deadline Has Passed',
            message: `Skip deadline has passed. You can no longer skip this meal. Skip requests must be made before 8:00 PM on the previous day.\n\n• Deadline was: ${deadlineFormatted}\n• Current Simulated Time: ${currentSimFormatted}`,
            details: {
              skipDeadline: deadlineFormatted,
              currentSimulatedTime: currentSimFormatted,
              existingMealDate: params.mealDate,
              existingMealCategory: params.mealCategory,
            },
            timestamp: simTime.toISOString(),
          },
        };
      }

      // =========================================================================
      // DUPLICATE SKIP PREVENTION
      // =========================================================================
      const allMeals = this.getMeals();
      const existingSkip = allMeals.find(
        (m) =>
          m.studentId === student.id &&
          m.date === params.mealDate &&
          m.mealCategory === params.mealCategory &&
          m.skipStatus === 'SKIPPED'
      );

      if (existingSkip) {
        return {
          success: false,
          alert: {
            type: 'DUPLICATE_SKIP_BLOCKED',
            title: 'Duplicate Skip Attempt Blocked',
            message: `Meal has already been skipped. You already registered a skip for ${params.mealCategory} on ${params.mealDate}. Duplicate skip and refund requests are blocked to prevent multi-refund abuse.`,
            details: {
              existingMealDate: params.mealDate,
              existingMealCategory: params.mealCategory,
              refundAmount: existingSkip.refundReceived,
            },
            timestamp: simTime.toISOString(),
          },
        };
      }

      // =========================================================================
      // REFUND CALCULATION: HALF COST ROUNDED DOWN
      // =========================================================================
      const pricing = MEAL_PRICING_TABLE[params.mealCategory];
      const isGuest = !!params.isGuest;
      const guestQty = isGuest ? Math.max(1, params.guestCount || 1) : 0;
      const originalCost = isGuest ? pricing.guestCost * guestQty : pricing.baseCost;
      const refundAmount = Math.floor(originalCost / 2);

      const balanceBefore = student.tokenBalance;
      const balanceAfter = balanceBefore + refundAmount;

      if (balanceAfter < 0) {
        return {
          success: false,
          alert: {
            type: 'ZERO_FLOOR_VIOLATION',
            title: 'Token Safety Violation',
            message: 'Calculated balance violation: balance cannot drop below 0.',
            details: {},
            timestamp: simTime.toISOString(),
          },
        };
      }

      // Update student
      student.tokenBalance = balanceAfter;
      student.tokensRefundedFromSkips = (student.tokensRefundedFromSkips || 0) + refundAmount;
      this.saveStudents(students);

      const skipTxnId = `SKP-${params.mealDate.replace(/-/g, '')}-${Date.now().toString().slice(-4)}`;
      const newMealRecord: MealTransaction = {
        id: skipTxnId,
        studentId: student.id,
        studentName: student.name,
        studentRoll: student.rollNo,
        mealCategory: params.mealCategory,
        isGuest,
        guestCount: guestQty,
        tokensDeducted: 0,
        originalCost,
        refundReceived: refundAmount,
        skipStatus: 'SKIPPED',
        skippedAt: simTime.toISOString(),
        skipDeadline: deadline.toISOString(),
        balanceBefore,
        balanceAfter,
        date: params.mealDate,
        timestamp: simTime.toISOString(),
        timeSlot: 'Advance Skip',
        tokenPassCode: `SKP-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'SKIPPED',
        dietNote: `Meal Skipped (Cost: ${originalCost} TK, Refund: ${refundAmount} TK)`,
      };

      allMeals.unshift(newMealRecord);
      this.saveMeals(allMeals);

      // Ledger entry
      const ledger = this.getLedger();
      ledger.unshift({
        id: `LDG-${Date.now()}-SKP`,
        studentId: student.id,
        type: 'SKIP_REFUND',
        description: `Refund for Skipped ${params.mealCategory} on ${params.mealDate} (${refundAmount} TK credited, half of ${originalCost} TK rounded down)`,
        amount: refundAmount,
        balanceAfter,
        date: params.mealDate,
        timestamp: simTime.toISOString(),
        referenceId: skipTxnId,
      });
      this.saveLedger(ledger);

      return {
        success: true,
        refundAmount,
        newBalance: balanceAfter,
        transaction: newMealRecord,
      };
    } finally {
      transactionMutexLocked = false;
    }
  },

  /**
   * MONTHLY ROLLOVER: Unused tokens roll over, capped at 10.
   * New Balance = 60 new monthly tokens + valid rollover.
   */
  processMonthlyRollover(studentId: string): {
    success: boolean;
    unusedTokens: number;
    rolloverTokens: number;
    newMonthlyTokens: number;
    newBalance: number;
    message: string;
    student?: Student;
  } {
    const students = this.getStudents();
    const student = students.find((s) => s.id === studentId);
    if (!student) {
      return {
        success: false,
        unusedTokens: 0,
        rolloverTokens: 0,
        newMonthlyTokens: 0,
        newBalance: 0,
        message: 'Student account not found.',
      };
    }

    const unusedTokens = student.tokenBalance;
    const rolloverTokens = Math.min(10, Math.max(0, unusedTokens)); // Capped at 10
    const newMonthlyTokens = 60;
    const newBalance = newMonthlyTokens + rolloverTokens;

    const simTime = this.getSimulatedDate();
    const simDateStr = simTime.toISOString().split('T')[0];

    student.rolloverTokens = rolloverTokens;
    student.monthlyTokens = newMonthlyTokens;
    student.tokenBalance = newBalance;
    student.tokensUsed = 0;
    student.lastQuotaCreditedAt = simTime.toISOString();
    this.saveStudents(students);

    const ledger = this.getLedger();
    const netAdjustment = newBalance - unusedTokens;
    ledger.unshift({
      id: `LDG-${Date.now()}-ROLLOVER`,
      studentId: student.id,
      type: 'MONTH_ROLLOVER',
      description: `Month-End Rollover: ${unusedTokens} unused tokens evaluated -> ${rolloverTokens} TK rolled over (capped at 10 TK max) + 60 TK new monthly quota`,
      amount: netAdjustment,
      balanceAfter: newBalance,
      date: simDateStr,
      timestamp: simTime.toISOString(),
      referenceId: `ROLLOVER-${Date.now().toString().slice(-5)}`,
    });
    this.saveLedger(ledger);

    return {
      success: true,
      unusedTokens,
      rolloverTokens,
      newMonthlyTokens,
      newBalance,
      message: `Month-end rollover processed! ${unusedTokens} unused tokens evaluated. Rolled over: ${rolloverTokens} TK (capped at 10 max) + 60 new monthly tokens. New balance: ${newBalance} TK.`,
      student,
    };
  },

  /**
   * MEAL CONSUMPTION (STAGE 1)
   */
  claimMealToken(params: {
    studentId: string;
    mealCategory: MealCategory;
    isGuest: boolean;
    guestCount?: number;
    dietNote?: string;
  }): { success: true; transaction: MealTransaction; newBalance: number } | { success: false; alert: PreventionAlert } {
    if (transactionMutexLocked) {
      return {
        success: false,
        alert: {
          type: 'OVERLAPPING_BLOCKED',
          title: 'Concurrent Request Locked',
          message: 'Another meal transaction is currently processing. Please wait a moment.',
          details: {},
          timestamp: new Date().toISOString(),
        },
      };
    }

    try {
      transactionMutexLocked = true;

      const students = this.getStudents();
      const student = students.find((s) => s.id === params.studentId);
      if (!student) {
        return {
          success: false,
          alert: {
            type: 'ZERO_FLOOR_VIOLATION',
            title: 'Account Verification Error',
            message: 'Student account record not found in system storage.',
            details: {},
            timestamp: new Date().toISOString(),
          },
        };
      }

      const pricing = MEAL_PRICING_TABLE[params.mealCategory];
      const guestQty = params.isGuest ? Math.max(1, params.guestCount || 1) : 0;
      const requiredTokens = params.isGuest ? pricing.guestCost * guestQty : pricing.baseCost;

      const simTime = this.getSimulatedDate();
      const todayStr = simTime.toISOString().split('T')[0];

      // Anti-overlapping rule
      if (!params.isGuest) {
        const allMeals = this.getMeals();
        const existingMeal = allMeals.find(
          (m) =>
            m.studentId === student.id &&
            m.date === todayStr &&
            m.mealCategory === params.mealCategory &&
            !m.isGuest &&
            m.skipStatus !== 'SKIPPED'
        );

        if (existingMeal) {
          return {
            success: false,
            alert: {
              type: 'OVERLAPPING_BLOCKED',
              title: 'Overlapping Meal Token Blocked',
              message: `You have already claimed a regular ${params.mealCategory} token today (${todayStr}) at ${existingMeal.timeSlot}. Token overlapping is strictly blocked. Switch to Guest Mode if dining with a visitor.`,
              details: {
                existingMealDate: todayStr,
                existingMealCategory: params.mealCategory,
                existingClaimTime: existingMeal.timeSlot,
                currentBalance: student.tokenBalance,
                requiredTokens,
              },
              timestamp: simTime.toISOString(),
            },
          };
        }
      }

      // Overdraw block rule
      if (student.tokenBalance < requiredTokens) {
        return {
          success: false,
          alert: {
            type: 'OVERDRAW_PREVENTED',
            title: 'Token Overdraw Blocked',
            message: `Overdraw prevented: You need ${requiredTokens} TK for this ${params.isGuest ? 'Guest ' : ''}${params.mealCategory}, but your current balance is ${student.tokenBalance} TK. Overdrawing tokens is not permitted.`,
            details: {
              currentBalance: student.tokenBalance,
              requiredTokens,
            },
            timestamp: simTime.toISOString(),
          },
        };
      }

      // Zero floor guarantee: balanceAfter >= 0
      const balanceBefore = student.tokenBalance;
      const balanceAfter = balanceBefore - requiredTokens;
      if (balanceAfter < 0) {
        return {
          success: false,
          alert: {
            type: 'ZERO_FLOOR_VIOLATION',
            title: 'Zero Floor Balance Violation Blocked',
            message: `System Invariant Violation: Calculated balance (${balanceAfter} TK) is below 0 TK floor limit.`,
            details: {
              currentBalance: balanceBefore,
              requiredTokens,
            },
            timestamp: simTime.toISOString(),
          },
        };
      }

      student.tokenBalance = balanceAfter;
      student.tokensUsed = (student.tokensUsed || 0) + requiredTokens;
      this.saveStudents(students);

      const timeSlot = simTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const passCode = `TK-${Math.floor(1000 + Math.random() * 9000)}`;
      const mealTxnId = `ML-${todayStr.replace(/-/g, '')}-${Date.now().toString().slice(-4)}`;

      const newMeal: MealTransaction = {
        id: mealTxnId,
        studentId: student.id,
        studentName: student.name,
        studentRoll: student.rollNo,
        mealCategory: params.mealCategory,
        isGuest: params.isGuest,
        guestCount: guestQty,
        tokensDeducted: requiredTokens,
        originalCost: requiredTokens,
        refundReceived: 0,
        skipStatus: 'ACTIVE',
        balanceBefore,
        balanceAfter,
        date: todayStr,
        timestamp: simTime.toISOString(),
        timeSlot,
        tokenPassCode: passCode,
        status: 'CHECKED_IN',
        dietNote: params.dietNote || student.dietPreference,
      };

      const meals = this.getMeals();
      meals.unshift(newMeal);
      this.saveMeals(meals);

      const ledger = this.getLedger();
      ledger.unshift({
        id: `LDG-${Date.now()}-ML`,
        studentId: student.id,
        type: 'MEAL_DEDUCTION',
        description: `${params.mealCategory} Token (${params.isGuest ? `Guest Mode x${guestQty} - 2x Rate` : 'Regular Meal'})`,
        amount: -requiredTokens,
        balanceAfter,
        date: todayStr,
        timestamp: simTime.toISOString(),
        referenceId: mealTxnId,
      });
      this.saveLedger(ledger);

      return {
        success: true,
        transaction: newMeal,
        newBalance: balanceAfter,
      };
    } finally {
      transactionMutexLocked = false;
    }
  },

  registerStudent(params: {
    name: string;
    email: string;
    password: string;
    rollNo: string;
    hostelBlock: string;
    roomNo: string;
    dietPreference?: 'Vegetarian' | 'Non-Vegetarian' | 'Halal Special' | 'Jain Dining';
  }): { success: true; student: Student } | { success: false; error: string; code: 'ACCOUNT_EXISTS' | 'INVALID_INPUT' } {
    const cleanEmail = params.email.trim().toLowerCase();
    if (!cleanEmail || !params.password || !params.name) {
      return { success: false, error: 'All fields are required.', code: 'INVALID_INPUT' };
    }

    const students = this.getStudents();
    const existing = students.find((s) => s.email.toLowerCase() === cleanEmail);

    if (existing) {
      return {
        success: false,
        error: 'Account already exists with this email address. Please sign in or use password recovery.',
        code: 'ACCOUNT_EXISTS',
      };
    }

    const now = this.getSimulatedDate();
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const newStudentId = `STU-${Date.now().toString().slice(-4)}`;
    const initialQuota = 60;

    const newStudent: Student = {
      id: newStudentId,
      name: params.name.trim(),
      email: cleanEmail,
      password: params.password,
      rollNo: params.rollNo.trim() || `ROLL-${Date.now().toString().slice(-3)}`,
      hostelBlock: params.hostelBlock.trim() || 'Hostel Block A',
      roomNo: params.roomNo.trim() || '101',
      tokenBalance: initialQuota,
      monthlyTokens: initialQuota,
      rolloverTokens: 0,
      tokensUsed: 0,
      tokensRefundedFromSkips: 0,
      monthlyFixQuota: 60,
      lastQuotaCreditedAt: now.toISOString(),
      quotaCycleExpiresAt: nextMonth.toISOString(),
      registeredAt: now.toISOString(),
      dietPreference: params.dietPreference || 'Vegetarian',
      avatarSeed: params.name.toLowerCase().replace(/\s+/g, ''),
    };

    students.push(newStudent);
    this.saveStudents(students);

    const ledger = this.getLedger();
    ledger.unshift({
      id: `LDG-${Date.now()}-INIT`,
      studentId: newStudentId,
      type: 'MONTHLY_QUOTA',
      description: 'Monthly Fixed Allowance Credited (60 TK Initial Registration Benefit)',
      amount: 60,
      balanceAfter: 60,
      date: now.toISOString().split('T')[0],
      timestamp: now.toISOString(),
      referenceId: 'REG-FIX-60TK',
    });
    this.saveLedger(ledger);

    this.setCurrentStudentId(newStudentId);
    return { success: true, student: newStudent };
  },

  login(email: string, pass: string): { success: true; student: Student } | { success: false; error: string } {
    const cleanEmail = email.trim().toLowerCase();
    const students = this.getStudents();
    const student = students.find((s) => s.email.toLowerCase() === cleanEmail);

    if (!student) {
      return { success: false, error: 'No account registered with this email address.' };
    }

    if (student.password !== pass) {
      return { success: false, error: 'Incorrect password. Check your credentials or use Forgot Password.' };
    }

    this.setCurrentStudentId(student.id);
    return { success: true, student };
  },

  findStudentByEmail(email: string): Student | null {
    const cleanEmail = email.trim().toLowerCase();
    const students = this.getStudents();
    return students.find((s) => s.email.toLowerCase() === cleanEmail) || null;
  },

  resetPassword(email: string, newPass: string): { success: boolean; message: string } {
    const cleanEmail = email.trim().toLowerCase();
    const students = this.getStudents();
    const idx = students.findIndex((s) => s.email.toLowerCase() === cleanEmail);

    if (idx === -1) {
      return { success: false, message: 'Account not found with this email.' };
    }

    students[idx].password = newPass;
    this.saveStudents(students);
    return { success: true, message: 'Password updated successfully! You can now log in.' };
  },

  creditMonthlyQuota(studentId: string): { success: boolean; message: string; student?: Student } {
    const students = this.getStudents();
    const student = students.find((s) => s.id === studentId);
    if (!student) return { success: false, message: 'Student not found.' };

    const quotaAmount = 60;
    const now = this.getSimulatedDate();
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    student.tokenBalance += quotaAmount;
    student.monthlyTokens = quotaAmount;
    student.lastQuotaCreditedAt = now.toISOString();
    student.quotaCycleExpiresAt = nextMonth.toISOString();
    this.saveStudents(students);

    const ledger = this.getLedger();
    ledger.unshift({
      id: `LDG-${Date.now()}-QUOTA`,
      studentId: student.id,
      type: 'MONTHLY_QUOTA',
      description: `Monthly Fixed Token Allocation (+60 TK Renewal)`,
      amount: quotaAmount,
      balanceAfter: student.tokenBalance,
      date: now.toISOString().split('T')[0],
      timestamp: now.toISOString(),
      referenceId: `QUOTA-${now.getFullYear()}-${now.getMonth() + 1}`,
    });
    this.saveLedger(ledger);

    return { success: true, message: `Successfully credited 60 TK monthly fixed quota!`, student };
  },

  purchaseTokens(studentId: string, tokensToAdd: number, packName: string): { success: boolean; newBalance: number; error?: string } {
    if (tokensToAdd <= 0) return { success: false, newBalance: 0, error: 'Invalid token amount' };

    const students = this.getStudents();
    const student = students.find((s) => s.id === studentId);
    if (!student) return { success: false, newBalance: 0, error: 'Student not found' };

    student.tokenBalance += tokensToAdd;
    this.saveStudents(students);

    const now = this.getSimulatedDate();
    const ledger = this.getLedger();
    ledger.unshift({
      id: `LDG-${Date.now()}-PUR`,
      studentId: student.id,
      type: 'TOKEN_PURCHASE',
      description: `Purchased ${packName} (+${tokensToAdd} TK)`,
      amount: tokensToAdd,
      balanceAfter: student.tokenBalance,
      date: now.toISOString().split('T')[0],
      timestamp: now.toISOString(),
      referenceId: `PAY-${Date.now().toString().slice(-6)}`,
    });
    this.saveLedger(ledger);

    return { success: true, newBalance: student.tokenBalance };
  },

  resetToDefaults() {
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.MEALS);
    localStorage.removeItem(STORAGE_KEYS.LEDGER);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_ROLE);
    localStorage.removeItem(STORAGE_KEYS.SIMULATED_TIME);
    localStorage.removeItem(STORAGE_KEYS.GUEST_RESERVATIONS);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
  },
};
