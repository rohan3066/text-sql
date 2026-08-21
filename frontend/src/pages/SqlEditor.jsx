import React, { useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import SqlEditorComponent from '../components/SqlEditor';
import ResultTable from '../components/ResultTable';
import LoadingSpinner from '../components/LoadingSpinner';
import { Play, Save, Database, AlertCircle, FileCode, CheckCircle, ShieldCheck } from 'lucide-react';

const SqlEditor = () => {
  const [sql, setSql] = useState('SELECT * FROM products LIMIT 10;');
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [executionError, setExecutionError] = useState('');
  
  // Save Query Modal state
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveQueryName, setSaveQueryName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleExecuteSql = async (sqlToRun) => {
    setExecuting(true);
    setExecutionError('');
    setExecutionResult(null);

    try {
      const response = await api.post('/query/execute', {
        sql: sqlToRun,
        question: 'Manually Executed Query',
        explanation: 'Executed via raw SQL Editor'
      });

      if (!response.data.success) {
        setExecutionError(response.data.error || 'SQL execution failed.');
        return;
      }

      setExecutionResult(response.data);
    } catch (err) {
      console.error(err);
      setExecutionError(err.response?.data?.detail || 'Failed to execute query.');
    } finally {
      setExecuting(false);
    }
  };

  const handleSaveQuery = async () => {
    if (!saveQueryName.trim()) {
      setSaveError('Please provide a name.');
      return;
    }

    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      await api.post('/saved-queries', {
        name: saveQueryName,
        question: 'Manually Executed Query',
        sql: sql
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveModalOpen(false);
        setSaveQueryName('');
        setSaveSuccess(false);
      }, 1500);
    } catch (err) {
      setSaveError(err.response?.data?.detail || 'Failed to save query.');
    } finally {
      setSaving(false);
    }
  };

  // Quick templates to load into editor
  const templates = [
    { name: 'List Products', sql: 'SELECT * FROM products LIMIT 10;' },
    { name: 'Total Revenue by Customer', sql: 'SELECT c.name, SUM(o.total_amount) as total_spent \nFROM customers c \nJOIN orders o ON c.id = o.customer_id \nGROUP BY c.id \nORDER BY total_spent DESC;' },
    { name: 'Inventory Status', sql: 'SELECT name, stock, price FROM products WHERE stock < 20 ORDER BY stock ASC;' },
    { name: 'Recent Orders', sql: 'SELECT o.id, c.name as customer, o.order_date, o.total_amount, o.status \nFROM orders o \nJOIN customers c ON o.customer_id = c.id \nORDER BY o.order_date DESC \nLIMIT 5;' }
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 h-screen overflow-hidden">
      <Navbar title="SQL Query Editor" />

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full overflow-y-auto space-y-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Left panel: Quick templates & metadata */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-lg space-y-4">
              <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center">
                <Database className="w-4 h-4 mr-2 text-indigo-400" />
                Query Templates
              </h3>
              <div className="space-y-2">
                {templates.map((tmpl, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSql(tmpl.sql);
                      setExecutionResult(null);
                      setExecutionError('');
                    }}
                    className="w-full text-left p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 hover:bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-medium transition-all duration-150 flex items-start space-x-2"
                  >
                    <FileCode className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{tmpl.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {executionResult && (
              <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-lg space-y-2">
                <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-2 text-emerald-400" />
                  Execution Info
                </h3>
                <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-mono">
                  <div>Rows: <span className="text-slate-800 dark:text-slate-100">{executionResult.row_count}</span></div>
                  <div>Time: <span className="text-slate-800 dark:text-slate-100">{executionResult.execution_time_ms} ms</span></div>
                </div>
              </div>
            )}
          </div>

          {/* Right panel: Editor & Results */}
          <div className="lg:col-span-3 space-y-6">
            <div className="space-y-4">
              <SqlEditorComponent
                initialSql={sql}
                onExecute={(newSql) => {
                  setSql(newSql);
                  handleExecuteSql(newSql);
                }}
                executing={executing}
              />

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleExecuteSql(sql)}
                  disabled={executing}
                  className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-white dark:bg-slate-800 text-white disabled:text-slate-500 font-bold text-sm shadow-lg shadow-indigo-600/10 transition-colors cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  <span>{executing ? 'Running...' : 'Run Query'}</span>
                </button>
                
                <button
                  onClick={() => setSaveModalOpen(true)}
                  disabled={executing}
                  className="px-6 flex items-center justify-center space-x-1.5 py-2.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-200 font-semibold text-sm border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Query</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {executionError && (
              <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2 animate-fadeIn">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{executionError}</span>
              </div>
            )}

            {/* Results Table */}
            {executing ? (
              <div className="py-12 flex justify-center">
                <LoadingSpinner text="Executing query against analytics database..." />
              </div>
            ) : (
              executionResult && (
                <div className="animate-fadeIn">
                  <ResultTable
                    columns={executionResult.columns}
                    rows={executionResult.rows}
                  />
                </div>
              )
            )}
          </div>
        </div>
      </main>

      {/* Save Query Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-indigo-400">
              <Save className="w-5 h-5" />
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Save Query</h3>
            </div>
            
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Save this SQL query to access it later from the Saved Queries tab.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">Query Title</label>
              <input
                type="text"
                placeholder="e.g. Low Stock Alert"
                value={saveQueryName}
                onChange={(e) => setSaveQueryName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                disabled={saving || saveSuccess}
              />
            </div>

            {saveError && (
              <p className="text-xs text-rose-400 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1 shrink-0" />
                {saveError}
              </p>
            )}

            {saveSuccess && (
              <p className="text-xs text-emerald-400 flex items-center">
                <CheckCircle className="w-4 h-4 mr-1 shrink-0" />
                Query saved successfully!
              </p>
            )}

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setSaveModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-slate-200 transition-colors"
                disabled={saving || saveSuccess}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQuery}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors"
                disabled={saving || saveSuccess}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SqlEditor;
