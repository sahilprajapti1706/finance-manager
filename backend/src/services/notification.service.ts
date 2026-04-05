import { pool } from '../config/db';

export class NotificationService {
  // We're using a plain "Polling-to-Pulse" strategy. It's way easier to maintain 
  // than WebSockets for a internal tool like this and handles the traffic just fine.
  static async notifyAdmins(message: string, type: string = 'info', recordId?: string) {
    try {
      // 1. Get all admin IDs
      const adminRes = await pool.query(
        "SELECT id FROM users WHERE role = 'admin' AND status = 'active'"
      );
      
      const adminIds = adminRes.rows.map(row => row.id);
      
      if (adminIds.length === 0) return;

      // 2. Insert notifications for each admin
      const values: any[] = [];
      const placeholders = adminIds.map((id, i) => {
        const base = i * 4;
        values.push(id, message, type, recordId || null);
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`;
      }).join(', ');

      const query = `
        INSERT INTO notifications (user_id, message, type, related_record_id)
        VALUES ${placeholders}
      `;

      await pool.query(query, values);
      console.log(`🔔 [NOTIF]: Sent notification to ${adminIds.length} admins - "${message}"`);
    } catch (err) {
      console.error('❌ [NOTIF_ERROR]: Failed to notify admins', err);
    }
  }

  static async notifyUser(userId: string, message: string, type: string = 'info') {
    try {
      await pool.query(
        "INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3)",
        [userId, message, type]
      );
      console.log(`🔔 [NOTIF]: Sent notification to user ${userId} - "${message}"`);
    } catch (err) {
      console.error('❌ [NOTIF_ERROR]: Failed to notify user', err);
    }
  }

  /**
   * Get unread notifications for a specific user
   */
  static async getUserNotifications(userId: string) {
    const res = await pool.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [userId]
    );
    return res.rows;
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string) {
    await pool.query(
      "UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2",
      [notificationId, userId]
    );
  }

  /**
   * Mark all as read
   */
  static async markAllAsRead(userId: string) {
    await pool.query(
      "UPDATE notifications SET is_read = TRUE WHERE user_id = $1",
      [userId]
    );
  }
}
