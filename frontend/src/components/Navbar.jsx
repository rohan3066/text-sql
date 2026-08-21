import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Database, AlertTriangle, CheckCircle, RefreshCw, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ title }) => {
  const [dbHealth, setDbHealth] = useState({ status: 'Checking...', tables_count: 0, connection_latency_ms: 0 });
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const response = await api.get('/database/health');
      setDbHealth(response.data);
    } catch (error) {
      setDbHealth({ status: 'Disconnected', tables_count: 0, connection_latency_ms: 0, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    // Auto-poll health every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10 transition-colors duration-200">
      {/* Title */}
      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h1>

      {/* Actions */}
      <div className="flex items-center space-x-6">
        {/* Database Connection Status and Metadata */}
        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
          dbHealth.status === 'Connected'
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
            : dbHealth.status === 'Checking...'
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
        }`}>
          {dbHealth.status === 'Connected' ? (
            <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          ) : dbHealth.status === 'Checking...' ? (
            <RefreshCw className="w-4 h-4 text-slate-400 animate-spin" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
          )}
          <span>MySQL: {dbHealth.status}</span>
          {dbHealth.status === 'Connected' && (
            <span className="text-[10px] text-emerald-600/80 dark:text-emerald-500/80 font-bold border-l border-emerald-500/30 pl-2">
              {dbHealth.tables_count} Tables ({dbHealth.connection_latency_ms}ms)
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            title="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          
          {/* Manual database check trigger */}
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
            title="Refresh database connection health"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
