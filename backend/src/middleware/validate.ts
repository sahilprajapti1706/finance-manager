import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodError, ZodObject } from 'zod';
import { sendError } from '../utils/response';

type AnyZodObject = ZodObject<any>;

type Target = 'body' | 'query' | 'params';

/**
 * validate(schema, target?) — returns middleware that validates the
 * specified part of the request ('body' by default) against a Zod schema.
 * On failure, responds 400 with a structured errors array.
 */
export function validate(schema: AnyZodObject, target: Target = 'body'): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.parse(req[target]);
      Object.defineProperty(req, target, {
        value: result,
        writable: true,
        configurable: true,
        enumerable: true
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.issues.map((e: any) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        sendError(res, 400, 'VALIDATION_ERROR', 'Validation failed', errors);
        return;
      }
      next(err);
    }
  };
}
