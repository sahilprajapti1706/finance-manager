import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, User as UserIcon, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useNotifications } from '../../hooks/useNotifications';

const Header: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif: any) => {
    if (!notif.is_read) {
      await markAsRead(notif.id);
    }
    
    if (notif.related_record_id) {
      navigate(`/records?recordId=${notif.related_record_id}`);
      setShowNotifications(false);
    }
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard Overview';
      case '/records': return 'Financial Records';
      case '/users': return 'User Management';
      default: return 'Finance Dashboard';
    }
  };

  return (
    <header className="h-20 glass-card !rounded-none border-x-0 border-t-0 flex items-center justify-between px-8 sticky top-0 z-10">
      {/* Search & Breadcrumbs */}
      <div className="flex items-center gap-8">
        <h1 className="text-xl font-bold text-white tracking-tight">{getPageTitle()}</h1>
      </div>

      {/* Actions & User Profile */}
      <div className="flex items-center gap-4">
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 glass-card flex items-center justify-center text-text-secondary hover:text-white hover:border-white/20 transition-all relative group"
          >
            <Bell size={18} className={unreadCount > 0 ? 'animate-pulse text-white' : ''} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-background shadow-lg shadow-primary/40">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-4 w-96 glass-card shadow-2xl border-white/20 z-[100] animate-fade-in overflow-hidden">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-widest">Notifications</span>
                <button 
                  onClick={() => { markAllAsRead(); setShowNotifications(false); }}
                  className="text-[10px] text-primary hover:text-primary-hover font-black uppercase tracking-[0.1em]"
                >
                  Mark all read
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center text-text-secondary italic text-xs">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] cursor-pointer group transition-colors ${!notif.is_read ? 'bg-primary/5' : ''}`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${notif.is_read ? 'bg-white/10' : 'bg-primary shadow-[0_0_8px_rgba(99,102,241,0.6)]'}`} />
                        <div className="flex-1">
                          <p className={`text-xs leading-relaxed ${notif.is_read ? 'text-text-secondary' : 'text-white font-medium'}`}>
                            {notif.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                             <span className="text-[10px] text-text-secondary/60 uppercase font-bold tracking-tighter">
                               {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </span>
                             {notif.related_record_id && (
                               <button 
                                 className="flex items-center gap-1 text-[10px] font-black text-primary hover:text-primary-hover uppercase tracking-widest"
                               >
                                 View Details <ExternalLink size={10} />
                               </button>
                             )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="text-right flex flex-col justify-center">
            <span className="text-sm font-semibold text-white leading-tight">{user?.name}</span>
            <span className="text-[10px] text-text-secondary font-medium tracking-tight truncate max-w-[120px]">{user?.email}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-text-secondary">
            <UserIcon size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
