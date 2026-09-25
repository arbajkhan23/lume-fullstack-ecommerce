import React from 'react';
import { Menu, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ title, onMenuClick }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-base/90 backdrop-blur border-b border-border px-4 sm:px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button className="lg:hidden text-muted" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={22} />
        </button>
        <h1 className="text-lg sm:text-xl font-display">{title}</h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <button className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-muted hover:text-accent transition-colors" aria-label="Notifications">
          <Bell size={16} />
        </button>
        <div className="hidden sm:flex flex-col items-end leading-tight">
          <span className="text-sm font-medium">{admin?.name}</span>
          <span className="text-xs text-muted capitalize">{admin?.role}</span>
        </div>
        <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-sm font-semibold">
          {admin?.name?.charAt(0)?.toUpperCase() || 'A'}
        </div>
        <button onClick={handleLogout} className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-muted hover:text-danger hover:border-danger/40 transition-colors" aria-label="Log out">
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
