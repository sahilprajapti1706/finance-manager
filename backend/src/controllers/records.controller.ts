import { Request, Response, NextFunction } from 'express';
import { RecordsService } from '../services/records.service';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError } from '../utils/errors';

/**
 * Controller for Financial Records management.
 */

export async function getRecords(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filters = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      type: req.query.type as string,
      category: req.query.category as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };

    console.log('🏁 [RECORDS_FETCH_INITIATED!] Filters:', filters);
    const { records, total } = await RecordsService.findAll(filters);
    sendSuccess(res, 200, { records, total, page: filters.page, limit: filters.limit });
  } catch (err) {
    next(err);
  }
}

export async function getRecordById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const record = await RecordsService.findById(id);
    sendSuccess(res, 200, { record });
  } catch (err) {
    next(err);
  }
}

export async function createRecord(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const record = await RecordsService.create(req.user.userId, req.body);
    sendSuccess(res, 201, { record }, 'Record created successfully');
  } catch (err) {
    next(err);
  }
}

export async function updateRecord(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const id = req.params.id as string;
    const record = await RecordsService.update(id, req.body, req.user.userId);
    sendSuccess(res, 200, { record }, 'Record updated successfully');
  } catch (err) {
    next(err);
  }
}

export async function deleteRecord(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    await RecordsService.softDelete(id);
    sendSuccess(res, 200, null, 'Record deleted successfully');
  } catch (err) {
    next(err);
  }
}

export async function getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await RecordsService.getCategories();
    sendSuccess(res, 200, { categories });
  } catch (err) {
    next(err);
  }
}

export async function exportRecords(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filters = {
      type: req.query.type as string,
      category: req.query.category as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };

    const records = await RecordsService.findAllForExport(filters);

    // CSV Header
    let csv = 'Date,Category,Type,Amount (INR),Notes\n';
    
    // Rows
    for (const r of records) {
      const row = [
        new Date(r.date).toISOString().split('T')[0],
        `"${r.category.replace(/"/g, '""')}"`,
        r.type.toUpperCase(),
        r.amount,
        `"${(r.notes || '').replace(/"/g, '""')}"`
      ];
      csv += row.join(',') + '\n';
    }

    const filename = `Finance_Export_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
}

export async function exportRecordsJSON(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filters = {
      type: req.query.type as string,
      category: req.query.category as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };

    const records = await RecordsService.findAllForExport(filters);
    sendSuccess(res, 200, { records });
  } catch (err) {
    next(err);
  }
}
