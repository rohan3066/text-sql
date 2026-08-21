import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { Bookmark, Search, Trash2, Play, AlertCircle, Edit3, Save } from 'lucide-react';

const SavedQueries = () => {
  const [savedQueries, setSavedQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  
  const navigate = useNavigate();

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const response = await api.get('/saved');
      setSavedQueries(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load saved queries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this saved query?")) return;
    try {
      await api.delete(`/saved/${id}`);
      setSavedQueries(savedQueries.filter(item => item.id !== id));
    } catch (err) {
      alert("Failed to delete saved query.");
    }
  };

  const handleRun = (item) => {
    navigate('/ask-ai', { state: { question: item.name, sql: item.query_sql } });
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditName(item.name);
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/saved/${id}`, { name: editName });
      setSavedQueries(savedQueries.map(q => q.id === id ? { ...q, name: editName } : q));
      setEditingId(null);
    } catch (err) {
      alert("Failed to update query name.");
    }
  };

  const filteredQueries = savedQueries.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.query_sql?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 h-screen overflow-hidden">
      <Navbar title="Saved Queries" />
      
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full flex flex-col overflow-hidden space-y-6">
        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search saved queries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-200"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner text="Loading saved queries..." />
          </div>
        ) : filteredQueries.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-850/50 rounded-xl border border-slate-200 dark:border-slate-700/50 border-dashed">
            <Bookmark className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-slate-600 dark:text-slate-400 font-medium">No saved queries found.</p>
            <p className="text-slate-500 text-xs mt-1">Save queries from the Ask AI or SQL Editor pages.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 pb-12 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start content-start">
            {filteredQueries.map(item => (
              <div key={item.id} className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-lg flex flex-col hover:border-slate-300 dark:border-slate-600 transition-colors h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 mr-4">
                    {editingId === item.id ? (
                      <div className="flex items-center space-x-2">
                        <input 
                          autoFocus
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                        <button onClick={() => saveEdit(item.id)} className="p-1 text-emerald-400 hover:bg-emerald-400/10 rounded">
                          <Save className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 group">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-200 line-clamp-1 flex-1" title={item.name}>
                          {item.name}
                        </h3>
                        <button onClick={() => startEdit(item)} className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    <div className="text-xs text-slate-500 mt-1">
                      Saved on {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleRun(item)}
                      className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors shadow-lg shadow-indigo-900/20"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Run</span>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-600 dark:text-slate-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/80 rounded-lg p-3 border border-slate-200 dark:border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto whitespace-pre-wrap flex-1 content-start">
                  {item.query_sql}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SavedQueries;
