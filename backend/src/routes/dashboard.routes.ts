import { Router } from 'express';
import * as DashboardController from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

/**
 * All routes require:
 * 1. Authentication (valid JWT)
 * 2. Authorization (Analyst OR Admin role)
 */

router.use(authenticate, authorize('analyst', 'admin'));

/**
 * @route   GET /api/dashboard/summary
 * @desc    Get income/expense summary
 * @access  Private (Analyst+)
 */
router.get('/summary', DashboardController.getSummary);

/**
 * @route   GET /api/dashboard/category-totals
 * @desc    Get breakdown by category
 * @access  Private (Analyst+)
 */
router.get('/category-totals', DashboardController.getCategoryTotals);

/**
 * @route   GET /api/dashboard/monthly-trends
 * @desc    Get trends for the last 12 months
 * @access  Private (Analyst+)
 */
router.get('/monthly-trends', DashboardController.getMonthlyTrends);

/**
 * @route   GET /api/dashboard/weekly-trends
 * @desc    Get trends for the last 8 weeks
 * @access  Private (Analyst+)
 */
router.get('/weekly-trends', DashboardController.getWeeklyTrends);

/**
 * @route   GET /api/dashboard/recent-activity
 * @desc    Get last 10 entries
 * @access  Private (Analyst+)
 */
router.get('/recent-activity', DashboardController.getRecentActivity);

export default router;
