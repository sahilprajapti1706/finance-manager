import api from './client';
import type { FinancialRecord } from '../types';

export const recordsApi = {
  /**
   * List all records (Viewer+).
   */
  getRecords: async (filters: Record<string, any>) => {
    const params = new URLSearchParams(filters).toString();
    const res = await api.get(`/records?${params}`);
    return res.data;
  },

  /**
   * Get record details (Viewer+).
   */
  getRecordById: async (id: string) => {
    const res = await api.get(`/records/${id}`);
    return res.data;
  },

  /**
   * Create a new record (Admin only).
   */
  createRecord: async (data: Omit<FinancialRecord, 'id' | 'created_by' | 'created_at' | 'updated_at'>) => {
    const res = await api.post('/records', data);
    return res.data;
  },

  /**
   * Update an existing record (Admin only).
   */
  updateRecord: async (id: string, data: Partial<FinancialRecord>) => {
    const res = await api.patch(`/records/${id}`, data);
    return res.data;
  },

  /**
   * Soft delete a record (Admin only).
   */
  deleteRecord: async (id: string) => {
    const res = await api.delete(`/records/${id}`);
    return res.data;
  },

  /**
   * Export all filtered records as CSV.
   */
  exportCSV: async (filters: Record<string, any>) => {
    const params = new URLSearchParams(filters).toString();
    const res = await api.get(`/records/export?${params}`, { responseType: 'blob' });
    return res;
  },

  /**
   * Export all filtered records as JSON.
   */
  exportJSON: async (filters: Record<string, any>) => {
    const params = new URLSearchParams(filters).toString();
    const res = await api.get(`/records/export/json?${params}`);
    return res.data;
  },
};
