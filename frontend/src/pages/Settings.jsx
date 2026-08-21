import React from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { User, Shield, Bell, Moon, Database } from 'lucide-react';

const Settings = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 h-screen overflow-hidden">
      <Navbar title="Settings" />
      
      <main className="flex-1 p-8 max-w-4xl mx-auto w-full overflow-y-auto pb-12">
        <div className="space-y-8">
          
          {/* Profile Section */}
          <section className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center mb-6">
              <User className="w-5 h-5 mr-2 text-indigo-400" />
              Profile Settings
            </h2>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Username</label>
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300">
                  {user?.username || 'admin'}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Role</label>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider">
                    Administrator
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Preferences Section */}
          <section className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center mb-6">
              <Moon className="w-5 h-5 mr-2 text-indigo-400" />
              Preferences
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700/50">
                <div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">Dark Mode</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Toggle dark theme for the interface.</p>
                </div>
                <div className="w-11 h-6 bg-indigo-600 rounded-full relative cursor-not-allowed opacity-80">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                </div>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">SQL Auto-Formatting</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Automatically format generated SQL.</p>
                </div>
                <div className="w-11 h-6 bg-indigo-600 rounded-full relative cursor-not-allowed opacity-80">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                </div>
              </div>
            </div>
          </section>

          {/* Database Info */}
          <section className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center mb-6">
              <Database className="w-5 h-5 mr-2 text-indigo-400" />
              Database Connection
            </h2>
            <div className="grid grid-cols-2 gap-4 max-w-md text-sm">
              <div className="text-slate-600 dark:text-slate-400">Host:</div>
              <div className="text-slate-900 dark:text-slate-200 font-mono">db (MySQL 8.0)</div>
              <div className="text-slate-600 dark:text-slate-400">Status:</div>
              <div className="text-emerald-400 font-medium flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span> Connected
              </div>
              <div className="text-slate-600 dark:text-slate-400">AI Model:</div>
              <div className="text-slate-900 dark:text-slate-200 font-mono">Gemini 3.1 Pro</div>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-6">
            <h2 className="text-lg font-bold text-rose-400 flex items-center mb-6">
              <Shield className="w-5 h-5 mr-2" />
              Danger Zone
            </h2>
            <button
              onClick={logout}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Log Out Securely
            </button>
          </section>

        </div>
      </main>
    </div>
  );
};

export default Settings;
