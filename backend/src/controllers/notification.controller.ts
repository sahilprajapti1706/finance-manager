import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { sendSuccess } from '../utils/response';

export class NotificationController {
  /**
   * Get all notifications for current user
   */
  static async getMyNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const notifications = await NotificationService.getUserNotifications(userId);
      sendSuccess(res, 200, { notifications });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const id = req.params.id as string;
      await NotificationService.markAsRead(id, userId);
      sendSuccess(res, 200, null, 'Notification marked as read');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Mark all as read
   */
  static async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      await NotificationService.markAllAsRead(userId);
      sendSuccess(res, 200, null, 'All notifications marked as read');
    } catch (err) {
      next(err);
    }
  }
}
