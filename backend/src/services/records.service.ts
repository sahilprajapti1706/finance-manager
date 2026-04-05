import { pool } from '../config/db';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { FinancialRecord } from '../types';
import { NotificationService } from './notification.service';

export interface RecordFilters {
  page: number;
  limit: number;
  type?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
}

export class RecordsService {
  /**
   * Create a new record (Admin only).
   */
  static async create(userId: string, data: any): Promise<FinancialRecord> {
    const { amount, type, category, date, notes } = data;
    const recordDate = date || new Date().toISOString().split('T')[0];

    // Fetch user name for notification
    const userRes = await pool.query('SELECT name FROM users WHERE id = $1', [userId]);
    const userName = userRes.rows[0]?.name || 'Someone';

    const result = await pool.query(
      `INSERT INTO financial_records (created_by, amount, type, category, date, notes) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [userId, amount, type, category, recordDate, notes]
    );

    const record = result.rows[0];

    // Notify admins
    const formattedAmount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(record.amount));
    await NotificationService.notifyAdmins(
      `${userName} created a new ${record.type} record for ${formattedAmount} in ${record.category}`,
      'success',
      record.id
    );

    return record;
  }

  /**
   * List all records (paginated, filtered).
   */
  static async findAll(filters: RecordFilters): Promise<{ records: FinancialRecord[]; total: number }> {
    const { page, limit, type, category, startDate, endDate } = filters;
    const offset = (page - 1) * limit;

    const whereClauses: string[] = ['is_deleted = FALSE'];
    const values: any[] = [];
    let idx = 1;

    if (type) {
      whereClauses.push(`type = $${idx++}`);
      values.push(type);
    }
    if (category) {
      whereClauses.push(`category ILIKE $${idx++}`);
      values.push(`%${category}%`);
    }
    if (startDate) {
      whereClauses.push(`date >= $${idx++}`);
      values.push(startDate);
    }
    if (endDate) {
      whereClauses.push(`date <= $${idx++}`);
      values.push(endDate);
    }

    const whereSql = whereClauses.join(' AND ');

    try {
      // Get total count
      console.log('[SVC DBG] Querying count with:', whereSql, values);
      const countResult = await pool.query(
        `SELECT COUNT(*) FROM financial_records WHERE ${whereSql}`,
        values
      );
      const total = parseInt(countResult.rows[0].count);

      // Get records
      const fullSql = `SELECT * FROM financial_records 
         WHERE ${whereSql} 
         ORDER BY date DESC, created_at DESC 
         LIMIT $${idx++} OFFSET $${idx++}`;
      
      console.log('[SVC SQL FINAL]:', fullSql);
      console.log('[SVC VAL FINAL]:', [...values, limit, offset]);

      const recordsResult = await pool.query(fullSql, [...values, limit, offset]);

      console.log('✅ [RECORDS_DATA_RETURNED]:', recordsResult.rows.length, 'records');

      return { records: recordsResult.rows, total };
    } catch (err) {
      console.error('[SVC CRASH]:', err);
      throw err;
    }
  }

  /**
   * Get a single record by ID.
   */
  static async findById(id: string): Promise<FinancialRecord> {
    const result = await pool.query(
      'SELECT * FROM financial_records WHERE id = $1 AND is_deleted = FALSE',
      [id]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError('Record');
    }

    return result.rows[0];
  }

  /**
   * Update a record (Admin only).
   */
  static async update(id: string, data: Partial<FinancialRecord>, performerId: string): Promise<FinancialRecord> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined && key !== 'id' && key !== 'created_by') {
        fields.push(`${key} = $${idx++}`);
        values.push(val);
      }
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `UPDATE financial_records SET ${fields.join(', ')} WHERE id = $${idx} AND is_deleted = FALSE RETURNING *`;
    
    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      throw new NotFoundError('Record');
    }

    const record = result.rows[0];

    // Fetch user name for notification
    const userRes = await pool.query('SELECT name FROM users WHERE id = $1', [performerId]);
    const userName = userRes.rows[0]?.name || 'Someone';

    // Notify admins
    const formattedAmount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(record.amount));
    await NotificationService.notifyAdmins(
      `${userName} updated record: ${record.category} (${formattedAmount})`,
      'info',
      record.id
    );

    return record;
  }

  /**
   * Soft delete a record (Admin only).
   */
  static async softDelete(id: string): Promise<void> {
    const result = await pool.query(
      'UPDATE financial_records SET is_deleted = TRUE WHERE id = $1 AND is_deleted = FALSE',
      [id]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError('Record');
    }
  }

  /**
   * Get all unique categories used in the system.
   */
  static async getCategories(): Promise<string[]> {
    const result = await pool.query(
      'SELECT DISTINCT category FROM financial_records WHERE is_deleted = FALSE ORDER BY category ASC'
    );
    return result.rows.map(row => row.category);
  }

  /**
   * Fetch all records matching filters (ignoring pagination) for CSV export.
   */
  static async findAllForExport(filters: Partial<Omit<RecordFilters, 'page' | 'limit'>>): Promise<FinancialRecord[]> {
    const { type, category, startDate, endDate } = filters;
    const whereClauses: string[] = ['is_deleted = FALSE'];
    const values: any[] = [];
    let idx = 1;

    if (type) {
      whereClauses.push(`type = $${idx++}`);
      values.push(type);
    }
    if (category) {
      whereClauses.push(`category ILIKE $${idx++}`);
      values.push(`%${category}%`);
    }
    if (startDate) {
      whereClauses.push(`date >= $${idx++}`);
      values.push(startDate);
    }
    if (endDate) {
      whereClauses.push(`date <= $${idx++}`);
      values.push(endDate);
    }

    const whereSql = whereClauses.join(' AND ');
    const fullSql = `SELECT * FROM financial_records WHERE ${whereSql} ORDER BY date DESC, created_at DESC`;
    
    const result = await pool.query(fullSql, values);
    return result.rows;
  }
}
