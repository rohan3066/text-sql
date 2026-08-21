import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { History as HistoryIcon, Search, Trash2, Code, Play, AlertCircle, Clock } from 'lucide-react';

const History = () => {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/history');
      setHistoryItems(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load query history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this history item?")) return;
    try {
      await api.delete(`/history/${id}`);
      setHistoryItems(historyItems.filter(item => item.id !== id));
    } catch (err) {
      alert("Failed to delete item.");
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear ALL query history?")) return;
    try {
      await api.delete('/history');
      setHistoryItems([]);
    } catch (err) {
      alert("Failed to clear history.");
    }
  };

  const handleRunAgain = (item) => {
    // Navigate to AskAI and pass the natural language question if available
    navigate('/ask-ai', { state: { question: item.natural_language_question } });
  };

  const filteredItems = historyItems.filter(item => 
    (item.natural_language_question?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.generated_sql?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 h-screen overflow-hidden">
      <Navbar title="Query History" />
      
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full flex flex-col overflow-hidden space-y-6">
        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search past queries by question or SQL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-200"
            />
          </div>
          <button
            onClick={handleClearAll}
            disabled={historyItems.length === 0}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-medium text-xs border border-rose-500/20 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner text="Loading query history..." />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-850/50 rounded-xl border border-slate-200 dark:border-slate-700/50 border-dashed">
            <HistoryIcon className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-slate-600 dark:text-slate-400 font-medium">No history found.</p>
            <p className="text-slate-500 text-xs mt-1">Queries you execute will appear here.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-12">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-lg flex flex-col space-y-4 hover:border-slate-300 dark:border-slate-600 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 pr-6">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-200">
                      {item.natural_language_question || "Manually Executed Query"}
                    </h3>
                    <div className="flex items-center space-x-4 text-xs text-slate-500">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded font-medium text-[10px] uppercase tracking-wider ${
                        item.execution_status === 'Success' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {item.execution_status}
                      </span>
                      {item.execution_status === 'Success' && (
                        <span>{item.row_count} rows • {item.execution_time}ms</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleRunAgain(item)}
                      className="p-1.5 rounded bg-white dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-600 dark:text-slate-400 transition-colors"
                      title="Run Again"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded bg-white dark:bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-600 dark:text-slate-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 border border-slate-200 dark:border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto whitespace-pre-wrap">
                  {item.generated_sql}
                </div>
                
                {item.explanation && (
                  <div className="text-xs text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-3">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 mr-2">AI Explanation:</span>
                    {item.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
