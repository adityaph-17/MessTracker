/**
 * Core type definitions for Mess Meal Tracker & Token System
 * Complete Stage 1, Stage 2, and Stage 3 (Student & Admin Roles, Forecasts, Invariants)
 */

export type UserRole = 'student' | 'admin';

export type MealCategory = 'Breakfast' | 'Lunch' | 'Dinner';

export interface MealPricing {
  category: MealCategory;
  baseCost: number; // 1 TK for Breakfast, 2 TK for Lunch, 2 TK for Dinner
  guestCost: number; // double: 2 TK for Breakfast, 4 TK for Lunch, 4 TK for Dinner
  servingHours: string;
  defaultTimeRange: [number, number]; // 24-hr [startHour, endHour]
  description: string;
  menuHighlights: string[];
}

export interface Student {
  id: string;
  name: string;
  email: string;
  password: string; // Stored securely in persistent storage
  rollNo: string;
  hostelBlock: string;
  roomNo: string;
  tokenBalance: number; // Invariant: must ALWAYS be >= 0
  monthlyTokens: number; // 60 TK new monthly quota
  rolloverTokens: number; // Tokens rolled over from prior month (capped at 10)
  tokensUsed: number; // Total tokens spent on dining
  tokensRefundedFromSkips: number; // Total refund tokens received from skipped meals
  monthlyFixQuota: number; // 60 TK fix per month
  lastQuotaCreditedAt: string; // ISO string
  quotaCycleExpiresAt: string; // ISO string
  registeredAt: string;
  dietPreference: 'Vegetarian' | 'Non-Vegetarian' | 'Halal Special' | 'Jain Dining';
  phone?: string;
  avatarSeed: string;
}

export type SkipStatus = 'ACTIVE' | 'SKIPPED';

export interface MealTransaction {
  id: string; // e.g., 'ML-20261030-9182'
  studentId: string;
  studentName: string;
  studentRoll: string;
  mealCategory: MealCategory;
  isGuest: boolean;
  guestCount: number;
  tokensDeducted: number; // Regular: 1 or 2; Guest: 2 or 4
  originalCost: number; // Base cost before skip refund
  refundReceived: number; // Refund amount: 0 for Breakfast, 1 for Lunch/Dinner, etc.
  skipStatus: SkipStatus;
  skippedAt?: string; // ISO string when skip occurred
  skipDeadline?: string; // ISO string of deadline (8 PM previous day)
  balanceBefore: number;
  balanceAfter: number; // Invariant: balanceAfter >= 0
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO timestamp
  timeSlot: string; // e.g. "08:15 AM"
  tokenPassCode: string; // Verification code e.g. "TK-9412"
  status: 'REDEEMED' | 'CHECKED_IN' | 'SKIPPED';
  dietNote?: string;
}

export interface LedgerEntry {
  id: string;
  studentId: string;
  type: 'MONTHLY_QUOTA' | 'TOKEN_PURCHASE' | 'MEAL_DEDUCTION' | 'SKIP_REFUND' | 'MONTH_ROLLOVER';
  description: string;
  amount: number; // Positive for credits (+60, +30, +1 refund), negative for debits (-1, -2, -4)
  balanceAfter: number;
  date: string;
  timestamp: string;
  referenceId: string; // Meal ID, Purchase ID, or Rollover ID
}

export interface TokenPack {
  id: string;
  name: string;
  tokens: number;
  priceInTaka: number;
  bonusTokens: number;
  popular?: boolean;
  tagline: string;
}

export type PreventionType =
  | 'OVERDRAW_PREVENTED'
  | 'OVERLAPPING_BLOCKED'
  | 'ZERO_FLOOR_VIOLATION'
  | 'SKIP_DEADLINE_PASSED'
  | 'DUPLICATE_SKIP_BLOCKED';

export interface PreventionAlert {
  type: PreventionType;
  title: string;
  message: string;
  details: {
    currentBalance?: number;
    requiredTokens?: number;
    existingMealDate?: string;
    existingMealCategory?: MealCategory;
    existingClaimTime?: string;
    skipDeadline?: string;
    currentSimulatedTime?: string;
    refundAmount?: number;
  };
  timestamp: string;
}

export interface UpcomingMeal {
  id: string; // e.g. 'UP-2026-11-02-Breakfast'
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "Monday, Nov 2"
  mealCategory: MealCategory;
  cost: number;
  refundIfSkipped: number;
  skipDeadlineIso: string;
  skipDeadlineDisplay: string;
  canSkip: boolean;
  isSkipped: boolean;
}

// Stage 3 Admin Meal Forecast Types
export interface TomorrowMealForecast {
  mealCategory: MealCategory;
  expectedStudentMeals: number; // Total students minus valid skips
  expectedGuestMeals: number; // Total guest trays scheduled
  totalExpectedMeals: number; // Student + Guest
  capacityLimit: number; // Fixed at 120
  isExceeded: boolean; // totalExpectedMeals > 120
  capacityStatus: 'WITHIN_CAPACITY' | 'CAPACITY_EXCEEDED';
  skippedStudentsCount: number;
  skippedStudentNames: string[];
  activeStudentNames: string[];
}

export interface TomorrowForecastSummary {
  simulatedDate: string; // YYYY-MM-DD
  simulatedDateTimeDisplay: string;
  tomorrowDate: string; // YYYY-MM-DD
  tomorrowDayLabel: string; // e.g. "Monday, Nov 2"
  totalRegisteredStudents: number;
  breakfast: TomorrowMealForecast;
  lunch: TomorrowMealForecast;
  dinner: TomorrowMealForecast;
  totalDayExpectedMeals: number;
  anyMealExceedsCapacity: boolean;
}

export interface GuestMealReservation {
  id: string;
  date: string; // YYYY-MM-DD
  mealCategory: MealCategory;
  guestCount: number;
  hostName: string;
  notes?: string;
}

export interface AdminAuthSession {
  isLoggedIn: boolean;
  username: string;
  name: string;
  email: string;
  role: 'admin';
  loginTime: string;
}
