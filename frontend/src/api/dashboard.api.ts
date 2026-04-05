import api from './client';

export const dashboardApi = {
  /**
   * Get overall summary (Income, Expenses, Net Balance)
   */
  getSummary: async () => {
    const res = await api.get('/dashboard/summary');
    return res.data;
  },

  /**
   * Get category-wise totals
   */
  getCategoryTotals: async () => {
    const res = await api.get('/dashboard/category-totals');
    return res.data;
  },

  /**
   * Get monthly trends (Last 12 months)
   */
  getMonthlyTrends: async () => {
    const res = await api.get('/dashboard/monthly-trends');
    return res.data;
  },

  /**
   * Get weekly trends (Last 8 weeks)
   */
  getWeeklyTrends: async () => {
    const res = await api.get('/dashboard/weekly-trends');
    return res.data;
  },

  /**
   * Get recent activity (Last 10 records)
   */
  getRecentActivity: async () => {
    const res = await api.get('/dashboard/recent-activity');
    return res.data;
  },
};
