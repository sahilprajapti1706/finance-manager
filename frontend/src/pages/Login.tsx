import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WalletMinimal, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.login({ email, password });
      const { user, accessToken, refreshToken } = response.data;
      
      // Update global auth state
      setAuth(user, accessToken, refreshToken);
      
      // Navigate to dashboard
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      <div className="w-full max-w-md animate-fade-in z-10">
        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-2xl shadow-primary/20 mb-4 scale-110">
            <WalletMinimal size={36} />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">FinancePanel</h1>
          <p className="text-text-secondary mt-2">Manage your wealth with precision.</p>
        </div>

        {/* Login Form Card */}
        <div className="glass-card p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6">Welcome Back</h2>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 text-rose-400 text-sm animate-fade-in">
              <AlertCircle className="shrink-0 mt-0.5" size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input w-full pl-10"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input w-full pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-text-secondary hover:text-white transition-colors">
                <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-white/5 accent-primary" />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-primary hover:text-primary-hover font-medium">Forgot Password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Logging in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-text-secondary">
            Don't have an account?{' '}
            <button 
              onClick={() => navigate('/signup')}
              className="text-primary hover:text-primary-hover font-bold ml-1 transition-all"
            >
              Sign Up
            </button>
          </p>
        </div>

        <p className="mt-8 text-center text-[10px] text-text-secondary uppercase tracking-[0.2em]">
          &copy; 2026 Powered by FinancePanel Core
        </p>
      </div>
    </div>
  );
};

export default Login;
