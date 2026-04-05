import { pool } from '../config/db';
import { FinancialRecord } from '../types';

export class DashboardService {
  /**
   * Get overall summary (Income, Expenses, Net Balance).
   */
  static async getSummary() {
    const sql = `SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as net_balance
       FROM financial_records 
       WHERE is_deleted = FALSE`;
    console.log('[SVC SQL SUMMARY]:', sql);
    const result = await pool.query(sql);

    return result.rows[0];
  }

  /**
   * Get category-wise totals.
   */
  static async getCategoryTotals() {
    const result = await pool.query(
      `SELECT category, type, SUM(amount) as total 
       FROM financial_records 
       WHERE is_deleted = FALSE 
       GROUP BY category, type 
       ORDER BY total DESC`
    );

    return result.rows;
  }

  /**
   * Get monthly trends (Last 12 months).
   */
  static async getMonthlyTrends() {
    const result = await pool.query(
      `SELECT 
        TO_CHAR(date, 'YYYY-MM') as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
       FROM financial_records 
       WHERE is_deleted = FALSE 
       AND date >= CURRENT_DATE - INTERVAL '12 months'
       GROUP BY month 
       ORDER BY month ASC`
    );

    return result.rows;
  }

  /**
   * Get weekly trends (Last 8 weeks).
   */
  static async getWeeklyTrends() {
    const result = await pool.query(
      `SELECT 
        TO_CHAR(date_trunc('week', date), 'YYYY-MM-DD') as week_start,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
       FROM financial_records 
       WHERE is_deleted = FALSE 
       AND date >= CURRENT_DATE - INTERVAL '8 weeks'
       GROUP BY week_start 
       ORDER BY week_start ASC`
    );

    return result.rows;
  }

  /**
   * Get recent activity (Last 10 records).
   */
  static async getRecentActivity(): Promise<FinancialRecord[]> {
    const result = await pool.query(
      `SELECT * FROM financial_records 
       WHERE is_deleted = FALSE 
       ORDER BY created_at DESC 
       LIMIT 10`
    );

    return result.rows;
  }
}
