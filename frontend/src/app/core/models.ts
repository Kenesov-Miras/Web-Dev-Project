export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  access: string;
  refresh: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  is_default: boolean;
  created_at: string;
}

export interface Expense {
  id: number;
  title: string;
  amount: number;
  date: string;
  note: string;
  category: number | null;
  category_name: string;
  category_icon: string;
  category_color: string;
  created_at: string;
  updated_at: string;
}

export interface Income {
  id: number;
  title: string;
  amount: number;
  source: string;
  date: string;
  note: string;
  created_at: string;
}

export interface Goal {
  id: number;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  description: string;
  is_completed: boolean;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryStat {
  name: string;
  color: string;
  icon: string;
  total: number;
}

export interface DayData {
  day: string;
  date: string;
  total: number;
}

export interface GoalProgress {
  id: number;
  title: string;
  target: number;
  current: number;
  progress: number;
}

export interface Stats {
  total_income: number;
  total_expense: number;
  balance: number;
  expense_by_category: CategoryStat[];
  weekly_expenses: DayData[];
  monthly_expenses: DayData[];
  recent_expenses: Expense[];
  goal_progress: GoalProgress[];
}

export interface ExpenseFilter {
  search?: string;
  category?: string;
  date_from?: string;
  date_to?: string;
  min_amount?: string;
}

export interface ApiError {
  [key: string]: string | string[];
}
