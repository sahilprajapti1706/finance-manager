import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../services/users.service';
import { sendSuccess } from '../utils/response';
import { ConflictError } from '../utils/errors';
import { pool } from '../config/db';
import bcrypt from 'bcryptjs';

/**
 * Controller for User related endpoints (Admin only).
 */
export async function getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const { users, total } = await UsersService.findAll(page, limit, search);
    sendSuccess(res, 200, { users, total, page, limit });
  } catch (err) {
    next(err);
  }
}

export async function getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const user = await UsersService.findById(id);
    sendSuccess(res, 200, { user });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const user = await UsersService.update(id, req.body);
    sendSuccess(res, 200, { user }, 'User updated successfully');
  } catch (err) {
    next(err);
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await UsersService.create(req.body);
    sendSuccess(res, 201, { user }, 'User created successfully');
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    await UsersService.deactivate(id);
    sendSuccess(res, 200, null, 'User status set to inactive');
  } catch (err) {
    next(err);
  }
}
