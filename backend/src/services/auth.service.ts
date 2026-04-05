import bcrypt from 'bcryptjs';
import { pool } from '../config/db';
import { User, Role, JwtPayload } from '../types';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors';
import { signAccessToken, signRefreshToken } from '../utils/jwt';
import crypto from 'crypto';

export class AuthService {
  static async register(name: string, email: string, passwordRaw: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const checkResult = await client.query('SELECT 1 FROM users WHERE email = $1', [email]);
      if (checkResult.rowCount && checkResult.rowCount > 0) {
        throw new ConflictError('User with this email already exists');
      }

      // First user to register gets the keys to the castle (admin). 
      // Everyone else starts as an analyst by default.
      const countResult = await client.query('SELECT COUNT(*) FROM users');
      const role: Role = parseInt(countResult.rows[0].count) === 0 ? 'admin' : 'analyst';

      const passwordHash = await bcrypt.hash(passwordRaw, 12);

      const insertResult = await client.query(
        `INSERT INTO users (name, email, password_hash, role) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, name, email, role, status, created_at`,
        [name, email, passwordHash, role]
      );

      const newUser = insertResult.rows[0];
      await client.query('COMMIT');

      return newUser;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  static async login(email: string, passwordRaw: string) {
    const result = await pool.query(
      'SELECT id, name, email, password_hash, role, status FROM users WHERE email = $1',
      [email]
    );

    if (result.rowCount === 0) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const user = result.rows[0];
    if (user.status !== 'active') {
      throw new UnauthorizedError('Account is inactive');
    }

    const isValid = await bcrypt.compare(passwordRaw, user.password_hash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Hash refreshToken for storage
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshTokenHash, expiresAt]
    );

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    };
  }

  static async refreshToken(token: string) {
    const refreshTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const result = await pool.query(
      `SELECT rt.user_id, u.email, u.role, u.status 
       FROM refresh_tokens rt
       JOIN users u ON rt.user_id = u.id
       WHERE rt.token_hash = $1 AND rt.expires_at > NOW()`,
      [refreshTokenHash]
    );

    if (result.rowCount === 0) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = result.rows[0];
    if (user.status !== 'active') {
      throw new UnauthorizedError('Account is inactive');
    }

    const payload: JwtPayload = { userId: user.user_id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);

    return { accessToken };
  }

  static async logout(token: string) {
    const refreshTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await pool.query('DELETE FROM refresh_tokens WHERE token_hash = $1', [refreshTokenHash]);
  }
}
