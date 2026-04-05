import api from './client';
import type { User } from '../types';

export const usersApi = {
  /**
   * List all users (Admin only).
   */
  getUsers: async (page = 1, limit = 10, search = '') => {
    const res = await api.get(`/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
    return res.data;
  },

  /**
   * Get user by ID (Admin only).
   */
  getUserById: async (id: string) => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },

  /**
   * Update user details (Admin only).
   */
  updateUser: async (id: string, data: Partial<User>) => {
    const res = await api.patch(`/users/${id}`, data);
    return res.data;
  },

  /**
   * Soft deactivate a user (Admin only).
   */
  deleteUser: async (id: string) => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },

  /**
   * Create a new user (Admin only).
   */
  createUser: async (data: { name: string; email: string; role: string; password?: string }) => {
    const res = await api.post('/users', data);
    return res.data;
  },
};
