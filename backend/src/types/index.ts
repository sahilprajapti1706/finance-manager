// ─── Shared TypeScript Types ───────────────────────────────────────────────

export type Role = 'viewer' | 'analyst' | 'admin';
export type UserStatus = 'active' | 'inactive';
export type RecordType = 'income' | 'expense';

// ── Users ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
  status: UserStatus;
  created_at: Date;
  updated_at: Date;
}

export type PublicUser = Omit<User, 'password_hash'>;

// ── Financial Records ────────────────────────────────────────────────────────
export interface FinancialRecord {
  id: string;
  created_by: string;
  amount: number;
  type: RecordType;
  category: string;
  date: string; // ISO date string YYYY-MM-DD
  notes: string | null;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

// ── API Responses ────────────────────────────────────────────────────────────
export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  code: string;
  message: string;
  errors?: Record<string, string>[];
}

// ── Express augmentation ──────────────────────────────────────────────────────
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
