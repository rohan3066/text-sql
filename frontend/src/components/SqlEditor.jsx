import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Copy, Check, AlignLeft, ShieldCheck, AlertTriangle } from 'lucide-react';
import api from '../services/api';

const SqlEditor = ({ initialSql, onExecute, executing }) => {
  const [sql, setSql] = useState(initialSql || '');
  const [copied, setCopied] = useState(false);
  const [validationResult, setValidationResult] = useState({ valid: true, error: null });
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    setSql(initialSql || '');
  }, [initialSql]);

  // Auto-validate SQL as the user edits (with a debounce)
  useEffect(() => {
    if (!sql.trim()) return;
    
    const delayDebounce = setTimeout(async () => {
      setValidating(true);
      try {
        const response = await api.post('/query/validate', { sql });
        setValidationResult(response.data);
      } catch (error) {
        setValidationResult({ valid: false, error: "Validation request failed." });
      } finally {
        setValidating(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [sql]);

  const handleCopy = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFormat = () => {
    // Basic SQL keywords capitalization and indentation formatting
    const keywords = [
      'select', 'from', 'where', 'join', 'left join', 'right join', 'inner join',
      'group by', 'order by', 'limit', 'and', 'or', 'as', 'on', 'sum', 'count',
      'avg', 'min', 'max', 'having', 'desc', 'asc', 'union', 'with'
    ];
    
    let formatted = sql;
    keywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      formatted = formatted.replace(regex, kw.toUpperCase());
    });
    
    setSql(formatted);
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 overflow-hidden shadow-lg">
      {/* Editor Header Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">SQL EDITOR</span>
          {validating ? (
            <span className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 animate-pulse">
              Validating...
            </span>
          ) : validationResult.valid ? (
            <span className="flex items-center text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 font-medium">
              <ShieldCheck className="w-3 h-3 mr-1" /> Safe Query (SELECT Only)
            </span>
          ) : (
            <span className="flex items-center text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/10 font-medium max-w-[200px] truncate" title={validationResult.error}>
              <AlertTriangle className="w-3 h-3 mr-1 shrink-0" /> {validationResult.error}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleFormat}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded bg-white dark:bg-slate-850 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs border border-slate-200 dark:border-slate-700 transition-colors"
            title="Capitalize keywords"
          >
            <AlignLeft className="w-3.5 h-3.5" />
            <span>Format</span>
          </button>
          
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded bg-white dark:bg-slate-850 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs border border-slate-200 dark:border-slate-700 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
          
          <button
            onClick={() => onExecute(sql)}
            disabled={executing || !validationResult.valid}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 disabled:bg-white dark:bg-slate-800 text-white disabled:text-slate-500 font-bold text-xs shadow shadow-indigo-600/10 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{executing ? 'Running...' : 'Execute'}</span>
          </button>
        </div>
      </div>

      {/* Editor Instance */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <Editor
          height="180px"
          language="sql"
          theme="vs-dark"
          value={sql}
          onChange={(val) => setSql(val || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineHeight: 18,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 12, bottom: 12 }
          }}
        />
      </div>
    </div>
  );
};

export default SqlEditor;
