import api from './client';

export const authApi = {
  /**
   * Register a new user.
   */
  register: async (data: any) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  /**
   * Login a user and retrieve tokens.
   */
  login: async (data: any) => {
    const res = await api.post('/auth/login', data);
    return res.data;
  },

  /**
   * Logout a user (revoke refresh token).
   */
  logout: async (refreshToken: string) => {
    const res = await api.post('/auth/logout', { refreshToken });
    return res.data;
  },

  /**
   * Manual refresh (usually handled by interceptors).
   */
  refresh: async (refreshToken: string) => {
    const res = await api.post('/auth/refresh', { refreshToken });
    return res.data;
  },
};
