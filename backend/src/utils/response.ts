import { Response } from 'express';
import { ApiSuccess, ApiError } from '../types';

export function sendSuccess<T>(
  res: Response,
  statusCode: number,
  data: T,
  message?: string,
): Response {
  const body: ApiSuccess<T> = { success: true, data, message };
  return res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  errors?: Record<string, string>[],
): Response {
  const body: ApiError = { success: false, code, message, errors };
  return res.status(statusCode).json(body);
}
