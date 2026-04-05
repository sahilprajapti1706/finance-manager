import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { sendSuccess } from '../utils/response';

/**
 * Controller for Dashboard Analytics.
 */

export async function getSummary(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const summary = await DashboardService.getSummary();
    sendSuccess(res, 200, { summary });
  } catch (err) {
    next(err);
  }
}

export async function getCategoryTotals(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await DashboardService.getCategoryTotals();
    sendSuccess(res, 200, { categories });
  } catch (err) {
    next(err);
  }
}

export async function getMonthlyTrends(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const months = await DashboardService.getMonthlyTrends();
    sendSuccess(res, 200, { months });
  } catch (err) {
    next(err);
  }
}

export async function getWeeklyTrends(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const weeks = await DashboardService.getWeeklyTrends();
    sendSuccess(res, 200, { weeks });
  } catch (err) {
    next(err);
  }
}

export async function getRecentActivity(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const activity = await DashboardService.getRecentActivity();
    sendSuccess(res, 200, { activity });
  } catch (err) {
    next(err);
  }
}
