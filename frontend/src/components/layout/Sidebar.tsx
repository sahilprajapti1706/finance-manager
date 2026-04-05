import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ReceiptText, 
  Users, 
  LogOut,
  WalletMinimal
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

/**
 * Responsive Sidebar for navigation. 
 * Highlighting active routes and role-based link visibility.
 */
const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();

  const navItems = [
    { 
      label: 'Dashboard', 
      path: '/', 
      icon: LayoutDashboard,
      roles: ['analyst', 'admin']
    },
    { 
      label: 'Records', 
      path: '/records', 
      icon: ReceiptText,
      roles: ['viewer', 'analyst', 'admin']
    },
    { 
      label: 'Users', 
      path: '/users', 
      icon: Users,
      roles: ['admin'] // User management is admin-only
    }
  ];

  // Filter items based on user role
  const filteredItems = navItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <aside className="w-64 h-screen glass-card !rounded-none border-y-0 border-l-0 flex flex-col sticky top-0">
      {/* Brand Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary border border-primary/20 shadow-lg shadow-primary/10">
          <WalletMinimal size={24} />
        </div>
        <span className="font-bold text-xl tracking-tight text-white">FinancePanel</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
              ${isActive 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-text-secondary hover:bg-white/5 hover:text-white'}
            `}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Section / Logout */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white truncate w-32">{user?.name}</span>
            <span className="text-[10px] text-text-secondary uppercase tracking-wider">{user?.role}</span>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
