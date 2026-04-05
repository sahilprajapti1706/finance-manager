export type Role = 'viewer' | 'analyst' | 'admin';
export type UserStatus = 'active' | 'inactive';
export type RecordType = 'income' | 'expense';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface FinancialRecord {
  id: string;
  created_by: string;
  amount: number;
  type: RecordType;
  category: string;
  date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardSummary {
  total_income: number;
  total_expenses: number;
  net_balance: number;
}

export interface CategoryTotal {
  category: string;
  type: RecordType;
  total: number;
}

export interface TrendData {
  month?: string;
  week_start?: string;
  income: number;
  expense: number;
}
