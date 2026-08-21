import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import QueryInput from '../components/QueryInput';
import SqlEditor from '../components/SqlEditor';
import ResultTable from '../components/ResultTable';
import ChartRenderer from '../components/ChartRenderer';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Sparkles, 
  Play, 
  Save, 
  MessageSquare, 
  Trash2, 
  Clock, 
  Columns, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Cpu
} from 'lucide-react';

const AskAI = () => {
  // Question & generation states
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState('');
  
  // Conversation history
  const [history, setHistory] = useState([]);
  
  // AI Output
  const [generatedSql, setGeneratedSql] = useState('');
  const [explanation, setExplanation] = useState('');
  const [visualization, setVisualization] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState('');

  // Execution Output
  const [executionResult, setExecutionResult] = useState(null);
  const [executionError, setExecutionError] = useState('');

  // Save Query Modal state
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveQueryName, setSaveQueryName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Generate SQL from Natural Language
  const handleGenerateSql = async (question) => {
    setLoading(true);
    setError('');
    setExecutionError('');
    setExecutionResult(null);
    setCurrentQuestion(question);

    try {
      // Post to generate-sql with conversation history context
      const response = await api.post('/ai/generate-sql', {
        question,
        history: history.length > 0 ? history : null
      });

      if (!response.data.success) {
        setError(response.data.error || 'AI could not translate this query.');
        setLoading(false);
        return;
      }

      const sqlText = response.data.sql;
      const explainText = response.data.explanation;
      const visRec = response.data.visualization;

      setGeneratedSql(sqlText);
      setExplanation(explainText);
      setVisualization(visRec);

      // Append to local conversational context
      setHistory(prev => [
        ...prev,
        { role: 'user', content: question },
        { role: 'assistant', content: `SQL: ${sqlText}\nExplanation: ${explainText}` }
      ]);
      
      // Auto-run generated SQL right away for a smoother UI experience
      handleExecuteSql(sqlText, question, explainText);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to generate SQL.');
    } finally {
      setLoading(false);
    }
  };

  // Execute SQL Query
  const handleExecuteSql = async (sqlToRun, questionText = null, explainText = null) => {
    setExecuting(true);
    setExecutionError('');
    
    // We attempt execution
    try {
      const response = await api.post('/query/execute', {
        sql: sqlToRun,
        question: questionText || currentQuestion || null,
        explanation: explainText || explanation || null
      });

      if (!response.data.success) {
        // SQL failed execution! Trigger automatic AI correction (retrying once)
        const errorMsg = response.data.error;
        setExecutionError(errorMsg);
        
        if (questionText || currentQuestion) {
          await handleAutoCorrectSql(sqlToRun, errorMsg, questionText || currentQuestion);
        } else {
          setExecuting(false);
        }
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

  // SQL Error Correction (up to 1 automatic retry)
  const handleAutoCorrectSql = async (failedSql, errorMsg, questionText) => {
    try {
      console.log("SQL failed. Requesting auto-correction from Gemini...");
      const response = await api.post('/ai/correct-sql', {
        original_sql: failedSql,
        error_message: errorMsg,
        question: questionText
      });

      if (!response.data.success) {
        setExecutionError(`Execution error: ${errorMsg}. Correction failed: ${response.data.error}`);
        setExecuting(false);
        return;
      }

      const correctedSql = response.data.sql;
      setGeneratedSql(correctedSql);
      setExplanation(response.data.explanation);
      if (response.data.visualization) {
        setVisualization(response.data.visualization);
      }

      // Retry execution with corrected SQL
      console.log("Retrying execution with corrected SQL:", correctedSql);
      const retryResponse = await api.post('/query/execute', {
        sql: correctedSql,
        question: questionText,
        explanation: response.data.explanation
      });

      if (!retryResponse.data.success) {
        setExecutionError(`Failed retry: ${retryResponse.data.error}`);
      } else {
        setExecutionResult(retryResponse.data);
        setExecutionError(''); // Clear error on successful retry
      }
    } catch (err) {
      console.error("Auto correction failed:", err);
      setExecutionError(`Database Error: ${errorMsg}. (Auto-repair failed).`);
    } finally {
      setExecuting(false);
    }
  };

  // Save Query to Saved Queries list
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
        question: currentQuestion || 'Manually Executed Query',
        sql: generatedSql
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

  // Optimize generated SQL query
  const [optimizing, setOptimizing] = useState(false);
  const [optimization, setOptimization] = useState(null);

  const handleOptimizeSql = async () => {
    if (!generatedSql) return;
    setOptimizing(true);
    setOptimization(null);
    try {
      const response = await api.post('/ai/optimize-sql', { sql: generatedSql });
      setOptimization(response.data);
    } catch (err) {
      console.error("SQL Optimization failed:", err);
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50 dark:bg-slate-900">
      <Navbar title="Ask AI E-commerce Assistant" />

      <main className="p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Top prompt bar panel */}
        <div className="glass-card">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/50 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wide">
                Natural Language Analytics Engine
              </h2>
            </div>
            {history.length > 0 && (
              <button
                onClick={() => {
                  setHistory([]);
                  setGeneratedSql('');
                  setExplanation('');
                  setExecutionResult(null);
                  setOptimization(null);
                }}
                className="text-xs flex items-center space-x-1 text-slate-500 hover:text-red-400 transition-colors"
                title="Clear conversational memory"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Context</span>
              </button>
            )}
          </div>
          <QueryInput onGenerate={handleGenerateSql} loading={loading} />
        </div>

        {/* Errors */}
        {error && (
          <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading && <LoadingSpinner text="Gemini AI is analyzing schema and generating SQL query..." />}

        {/* Results and generated code */}
        {generatedSql && !loading && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
            {/* Left side: Code and Explanation */}
            <div className="xl:col-span-1 space-y-6">
              {/* SQL Editor */}
              <SqlEditor
                initialSql={generatedSql}
                onExecute={(sql) => handleExecuteSql(sql)}
                executing={executing}
              />

              {/* Save / Optimize actions panel */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSaveModalOpen(true)}
                  className="flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Query</span>
                </button>
                <button
                  onClick={handleOptimizeSql}
                  disabled={optimizing}
                  className="flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Cpu className="w-4 h-4" />
                  <span>{optimizing ? 'Optimizing...' : 'Optimize SQL'}</span>
                </button>
              </div>

              {/* Explanation Panel */}
              {explanation && (
                <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-lg space-y-2">
                  <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Explanation</h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{explanation}</p>
                </div>
              )}

              {/* Optimization Panel */}
              {optimization && (
                <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-lg space-y-3 animate-fadeIn">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wide flex items-center">
                    <Cpu className="w-4 h-4 mr-1" /> SQL Optimization Report
                  </h4>
                  <div className="space-y-2 text-xs">
                    <p className="text-slate-600 dark:text-slate-400">
                      Complexity Score: <span className="font-bold text-slate-900 dark:text-slate-200">{optimization.estimated_complexity}</span>
                    </p>
                    {optimization.suggestions?.length > 0 ? (
                      <ul className="list-disc pl-4 space-y-1.5 text-slate-700 dark:text-slate-300">
                        {optimization.suggestions.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-emerald-400 font-medium">Query structure is well optimized.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right side: Results, Table and Charts */}
            <div className="xl:col-span-2 space-y-6">
              {executing && (
                <div className="p-12 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg flex items-center justify-center">
                  <LoadingSpinner text="Executing query against MySQL e-commerce database..." />
                </div>
              )}

              {executionError && (
                <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{executionError}</span>
                </div>
              )}

              {executionResult && !executing && (
                <>
                  {/* Execution Metrics Header */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-850 border border-slate-750 p-3 rounded-lg flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-indigo-400" />
                      <div className="text-xs">
                        <p className="text-slate-600 dark:text-slate-400 font-medium">Execution Time</p>
                        <p className="font-mono font-bold text-slate-900 dark:text-slate-200">{executionResult.execution_time_ms} ms</p>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-850 border border-slate-750 p-3 rounded-lg flex items-center space-x-3">
                      <Columns className="w-5 h-5 text-emerald-400" />
                      <div className="text-xs">
                        <p className="text-slate-600 dark:text-slate-400 font-medium">Rows Fetched</p>
                        <p className="font-mono font-bold text-slate-900 dark:text-slate-200">{executionResult.row_count}</p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-850 border border-slate-750 p-3 rounded-lg flex items-center space-x-3">
                      <Cpu className="w-5 h-5 text-cyan-400" />
                      <div className="text-xs">
                        <p className="text-slate-600 dark:text-slate-400 font-medium">Query Status</p>
                        <p className="font-semibold text-emerald-400">Success</p>
                      </div>
                    </div>
                  </div>

                  {/* Chart Visualizer */}
                  {visualization && visualization.type !== 'table' && (
                    <ChartRenderer
                      data={executionResult.rows}
                      columns={executionResult.columns}
                      recommendation={visualization}
                    />
                  )}

                  {/* Data Grid Table */}
                  <ResultTable
                    columns={executionResult.columns}
                    rows={executionResult.rows}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Save Query Modal Dialog */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">Save Query</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Provide a clean name to store this generated SQL query.</p>
            
            {saveError && (
              <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-450 text-[11px]">
                {saveError}
              </div>
            )}

            {saveSuccess && (
              <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px]">
                Query saved successfully!
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400 tracking-wider">Query Name</label>
              <input
                type="text"
                placeholder="e.g. Monthly Sales 2026"
                value={saveQueryName}
                onChange={(e) => setSaveQueryName(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-200"
                disabled={saving}
              />
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => {
                  setSaveModalOpen(false);
                  setSaveQueryName('');
                  setSaveError('');
                }}
                className="flex-1 py-2 rounded bg-white dark:bg-slate-800 hover:bg-slate-100 dark:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQuery}
                className="flex-1 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow shadow-indigo-600/15 transition-colors cursor-pointer"
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

export default AskAI;
