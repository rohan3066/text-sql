import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  MessageSquareCode, 
  History, 
  BookmarkCheck, 
  Database, 
  Settings, 
  LogOut,
  Sparkles,
  Terminal
} from 'lucide-react';

const Sidebar = () => {
  const { logout, user } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Ask AI', path: '/ask-ai', icon: MessageSquareCode },
    { name: 'SQL Editor', path: '/sql-editor', icon: Terminal },
    { name: 'Query History', path: '/history', icon: History },
    { name: 'Saved Queries', path: '/saved-queries', icon: BookmarkCheck },
    { name: 'Database Schema', path: '/schema', icon: Database },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Sparkles className="w-5 h-5 text-indigo-100 animate-pulse" />
          </div>
          <span className="font-extrabold text-lg bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            SQLytics AI
          </span>
        </div>

        {/* User Info info summary */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800/50 bg-white dark:bg-slate-800/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-center justify-center font-bold text-indigo-400 uppercase">
              {user?.name?.slice(0, 2) || 'US'}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 truncate">{user?.name}</p>
              <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/10">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:bg-slate-800/60 hover:text-slate-900 dark:text-slate-200'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout Action */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-150"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
