import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users as UsersIcon, 
  ShieldCheck, 
  ShieldAlert, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  Mail,
  UserCog,
  Power,
  Search,
  Plus,
  X,
  Lock,
  User as UserIcon
} from 'lucide-react';
import { usersApi } from '../api/users.api';
import type { User, Role } from '../types';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await usersApi.getUsers(page, limit, search);
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  // Keeps the UI in sync whenever the user searches or changes pages
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: Role) => {
    if (!window.confirm(`Are you sure you want to change the role to ${newRole}?`)) return;
    try {
      await usersApi.updateUser(userId, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert('Role update failed');
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const actionName = newStatus === 'active' ? 'activate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${actionName} this user?`)) return;
    try {
      await usersApi.updateUser(userId, { status: newStatus as any });
      fetchUsers();
    } catch (err) {
      alert('Status update failed');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">User Management</h1>
            <p className="text-text-secondary mt-1">Manage administrative roles and system accessibility levels.</p>
         </div>
         <button 
           onClick={() => setIsModalOpen(true)}
           className="btn-primary flex items-center gap-2"
         >
           <Plus size={20} />
           Add User
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <UserStat label="Total Users" value={total} icon={UsersIcon} />
         <UserStat label="Admins" value={users.filter(u => u.role === 'admin').length} icon={ShieldCheck} />
         <UserStat label="Analysts" value={users.filter(u => u.role === 'analyst').length} icon={ShieldAlert} />
         <UserStat label="Active" value={total > 0 ? users.filter(u => u.status === 'active').length : 0} icon={UserCog} />
      </div>

      <div className="relative group max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" size={18} />
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users by name or email..." 
          className="glass-input !rounded-full pl-10 w-full"
        />
      </div>

      <div className="glass-card overflow-hidden shadow-2xl relative">
        {loading && (
          <div className="absolute inset-0 bg-background/20 backdrop-blur-sm z-10 flex items-center justify-center">
             <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        )}

        <table className="w-full text-left">
           <thead className="bg-white/5 border-b border-white/5 uppercase text-[10px] font-black tracking-[0.2em] text-text-secondary">
             <tr>
               <th className="px-6 py-5">Full Name</th>
               <th className="px-6 py-5">Email Address</th>
               <th className="px-6 py-5">Role</th>
               <th className="px-6 py-5">Status</th>
               <th className="px-6 py-5">Joined</th>
               <th className="px-6 py-5 text-right">Actions</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-white/5">
             {users.map((user) => (
               <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                 <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary">
                          {user.name.charAt(0).toUpperCase()}
                       </div>
                       <span className="text-sm font-bold text-white">{user.name}</span>
                    </div>
                 </td>
                 <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-text-secondary">
                       <Mail size={14} />
                       <span className="text-sm">{user.email}</span>
                    </div>
                 </td>
                 <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                      // The root admin is the "keys to the kingdom" - don't allow role changes to prevent lockouts
                      disabled={user.email === 'admin@example.com'}
                      className={`bg-transparent text-xs font-black uppercase text-white border-b border-white/10 focus:border-primary outline-none transition-all ${
                        user.email === 'admin@example.com' ? 'opacity-40 cursor-not-allowed border-none' : 'cursor-pointer'
                      }`}
                    >
                      <option value="viewer" className="bg-background text-white">Viewer</option>
                      <option value="analyst" className="bg-background text-white">Analyst</option>
                      <option value="admin" className="bg-background text-white">Admin</option>
                    </select>
                 </td>
                 <td className="px-6 py-4">
                    <button 
                      onClick={() => handleStatusToggle(user.id, user.status)}
                      // Same for status - if this goes inactive, the system loses its primary owner
                      disabled={user.email === 'admin@example.com'}
                      className={`flex items-center gap-2 transition-all active:scale-95 group/status ${
                        user.email === 'admin@example.com' ? 'opacity-30 cursor-not-allowed' : 'hover:opacity-70 group-hover/status:underline'
                      }`}
                    >
                       <div className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-income shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-expense shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`} />
                       <span className={`text-[10px] font-black uppercase tracking-widest ${user.status === 'active' ? 'text-income' : 'text-expense'} group-hover/status:underline`}>
                         {user.status}
                       </span>
                    </button>
                 </td>
                 <td className="px-6 py-4 text-xs text-text-secondary font-medium">
                    {new Date(user.created_at).toLocaleDateString()}
                 </td>
                 <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleStatusToggle(user.id, user.status)}
                      className={`p-2 rounded-lg transition-all ${user.status === 'active' ? 'text-text-secondary hover:text-rose-400 hover:bg-rose-500/10' : 'text-income hover:bg-income/10'}`}
                      title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                    >
                      <Power size={16} />
                    </button>
                 </td>
               </tr>
             ))}
           </tbody>
        </table>

        <div className="p-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-text-secondary font-medium">
              System Accounts: {total} total
            </span>
            <div className="flex items-center gap-2">
               <button 
                 disabled={page === 1}
                 onClick={() => setPage(p => p - 1)}
                 className="p-2 glass-card hover:bg-white/10 disabled:opacity-30"
               >
                 <ChevronLeft size={18} />
               </button>
               <span className="text-sm font-bold text-white px-4">Page {page} of {Math.ceil(total/limit) || 1}</span>
               <button 
                 disabled={page >= Math.ceil(total/limit)}
                 onClick={() => setPage(p => p + 1)}
                 className="p-2 glass-card hover:bg-white/10 disabled:opacity-30"
               >
                 <ChevronRight size={18} />
               </button>
            </div>
        </div>
      </div>

      {isModalOpen && (
        <UserModal 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={() => { setIsModalOpen(false); fetchUsers(); }} 
        />
      )}
    </div>
  );
};

const UserStat = ({ label, value, icon: Icon }: any) => (
  <div className="glass-card p-6 flex items-center justify-between">
     <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-1">{label}</p>
        <h4 className="text-2xl font-black text-white leading-none">{value}</h4>
     </div>
     <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-text-secondary">
        <Icon size={20} />
     </div>
  </div>
);

const UserModal = ({ onClose, onSubmit }: any) => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'analyst' 
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await usersApi.createUser(formData);
      onSubmit();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
       <div className="w-full max-w-md glass-card p-10 relative shadow-2xl border-white/20">
          <button onClick={onClose} className="absolute right-6 top-6 text-text-secondary hover:text-white transition-colors">
            <X size={24} />
          </button>
          
          <h2 className="text-2xl font-black text-white mb-8 tracking-tight uppercase">
            New Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
             <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-[0.2em] mb-2">Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="glass-input pl-10 w-full font-bold text-white"
                    placeholder="Staff Member Name"
                  />
                </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-[0.2em] mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="glass-input pl-10 w-full font-bold text-white"
                    placeholder="staff@example.com"
                  />
                </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-[0.2em] mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                  <input 
                    type="password" 
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="glass-input pl-10 w-full font-bold text-white"
                    placeholder="••••••••"
                  />
                </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-[0.2em] mb-2">Initial Role</label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="glass-input w-full font-black text-white appearance-none cursor-pointer"
                >
                  <option value="viewer" className="bg-background">Viewer</option>
                  <option value="analyst" className="bg-background font-bold text-primary">Analyst</option>
                  <option value="admin" className="bg-background text-rose-400">Admin</option>
                </select>
             </div>

             <button type="submit" disabled={loading} className="w-full btn-primary !py-5 text-md font-black tracking-widest uppercase flex items-center justify-center gap-3 mt-4 transition-all active:scale-95">
                {loading && <Loader2 className="animate-spin" size={20} />}
                Create Staff Account
             </button>
          </form>
       </div>
    </div>,
    document.body
  );
};

export default Users;
