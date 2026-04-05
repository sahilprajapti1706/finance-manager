import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';
import { UnauthorizedError } from '../utils/errors';
import { pool } from '../config/db';

/**
 * Controller for Auth related endpoints.
 * All functions return void and use the sendSuccess helper.
 */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password } = req.body;
    const user = await AuthService.register(name, email, password);
    sendSuccess(res, 201, { user }, 'User registered successfully');
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await AuthService.login(email, password);
    
    // In a real app, refresh token should be in httpOnly cookie
    sendSuccess(res, 200, { user, accessToken, refreshToken }, 'Login successful');
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body;
    const { accessToken } = await AuthService.refreshToken(refreshToken);
    sendSuccess(res, 200, { accessToken });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await AuthService.logout(refreshToken);
    }
    sendSuccess(res, 200, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    
    // We already have User info pinned to req by authenticate middleware
    // but we can fetch fresh from DB if needed.
    const userResult = await pool.query(
      'SELECT id, name, email, role, status FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (userResult.rowCount === 0) {
      throw new UnauthorizedError('User no longer exists');
    }

    sendSuccess(res, 200, { user: userResult.rows[0] });
  } catch (err) {
    next(err);
  }
}
