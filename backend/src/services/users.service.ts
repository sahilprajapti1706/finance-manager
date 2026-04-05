import { pool } from '../config/db';
import bcrypt from 'bcryptjs';
import { NotFoundError, ConflictError } from '../utils/errors';
import { PublicUser } from '../types';
import { NotificationService } from './notification.service';

export class UsersService {
  static async findAll(page: number = 1, limit: number = 10, search?: string): Promise<{ users: PublicUser[]; total: number }> {
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    const values: any[] = [];
    
    if (search) {
      whereClause = "WHERE name ILIKE $1 OR email ILIKE $1";
      values.push(`%${search}%`);
    }

    const countQuery = `SELECT COUNT(*) FROM users ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    const dataValues = [...values, limit, offset];
    const dataQuery = `
       SELECT id, name, email, role, status, created_at, updated_at 
       FROM users 
       ${whereClause}
       ORDER BY created_at DESC 
       LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;

    const result = await pool.query(dataQuery, dataValues);

    return {
      users: result.rows,
      total,
    };
  }

  static async findById(id: string): Promise<PublicUser> {
    const result = await pool.query(
      'SELECT id, name, email, role, status, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError('User');
    }

    return result.rows[0];
  }

  static async create(data: { name: string; email: string; role: string; password?: string }): Promise<PublicUser> {
    const { name, email, role, password = 'Password@123' } = data;

    // Check if email already exists
    const checkResult = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (checkResult.rowCount && checkResult.rowCount > 0) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash a default or provided password
    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, status) 
       VALUES ($1, $2, $3, $4, 'active') 
       RETURNING id, name, email, role, status, created_at, updated_at`,
      [name, email, passwordHash, role]
    );

    return result.rows[0];
  }

  static async update(id: string, data: Partial<{ name: string; role: string; status: string }>): Promise<PublicUser> {
    // IMMUTABILITY CHECK FOR PRIMARY ADMIN
    const primaryAdminEmail = 'admin@example.com';
    const checkResult = await pool.query('SELECT email FROM users WHERE id = $1', [id]);
    
    if (checkResult.rows[0]?.email === primaryAdminEmail) {
      // Allow only name updates if necessary, but strictly block role/status changes
      if (data.role || data.status) {
        throw new Error('Primary Administrator role and status are immutable.');
      }
    }

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined) {
        fields.push(`${key} = $${idx++}`);
        values.push(val);
      }
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, name, email, role, status, created_at, updated_at`;

    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      throw new NotFoundError('User');
    }

    const updatedUser = result.rows[0];

    if (data.role) {
      await NotificationService.notifyUser(id, `Your role has been updated to ${data.role.toUpperCase()}.`, 'info');
    }
    if (data.status) {
      const type = data.status === 'active' ? 'success' : 'warning';
      await NotificationService.notifyUser(id, `Your account status has been updated to ${data.status.toUpperCase()}.`, type);
    }

    return updatedUser;
  }

  static async deactivate(id: string): Promise<void> {
    const primaryAdminEmail = 'admin@example.com';
    const checkResult = await pool.query('SELECT email FROM users WHERE id = $1', [id]);
    
    if (checkResult.rows[0]?.email === primaryAdminEmail) {
      throw new Error('Primary Administrator cannot be deactivated.');
    }

    const result = await pool.query(
      "UPDATE users SET status = 'inactive' WHERE id = $1",
      [id]
    );
    if (result.rowCount === 0) {
      throw new NotFoundError('User');
    }
    
    await NotificationService.notifyUser(id, 'Your account has been deactivated. Please contact an admin for support.', 'warning');
  }
}
