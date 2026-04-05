import { z } from 'zod';

export const createRecordSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  notes: z.string().max(500).optional().nullable(),
});

export const updateRecordSchema = z.object({
  amount: z.number().positive().optional(),
  type: z.enum(['income', 'expense']).optional(),
  category: z.string().min(1).max(100).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  notes: z.string().max(500).optional().nullable(),
});

export const queryRecordSchema = z.object({
  page: z.string().optional().transform(v => parseInt(v || '1')),
  limit: z.string().optional().transform(v => parseInt(v || '10')),
  type: z.preprocess((v) => v === '' ? undefined : v, z.enum(['income', 'expense']).optional()),
  category: z.preprocess((v) => v === '' ? undefined : v, z.string().optional()),
  startDate: z.preprocess((v) => v === '' ? undefined : v, z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  endDate: z.preprocess((v) => v === '' ? undefined : v, z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
});
