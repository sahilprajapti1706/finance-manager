import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Role } from '../types';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

/**
 * authorize(...roles) — factory that returns a middleware which checks
 * whether req.user.role is in the allowed roles list.
 *
 * Usage:
 *   router.post('/', authenticate, authorize('admin'), createRecord)
 *   router.get('/summary', authenticate, authorize('analyst', 'admin'), getSummary)
 */
export function authorize(...roles: Role[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`,
        ),
      );
    }

    next();
  };
}
