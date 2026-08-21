import React, { useState } from 'react';
import { Send, Sparkles, CornerDownLeft, RefreshCcw } from 'lucide-react';

const QueryInput = ({ onGenerate, loading }) => {
  const [question, setQuestion] = useState('');

  const suggestions = [
    "What is the total revenue?",
    "Show monthly revenue for 2026.",
    "Which category generated the highest revenue?",
    "Show the top 10 selling products.",
    "Which products have low inventory?",
    "Who are the top 10 customers by spending?",
    "Which payment method is used most?",
    "What is the average order value?"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (question.trim() && !loading) {
      onGenerate(question);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="space-y-4">
      {/* Suggestions Slider/List */}
      <div>
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Suggested Questions</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setQuestion(s)}
              className="text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:bg-slate-700 hover:border-slate-300 dark:border-slate-600 transition-all cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Input Text Box */}
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about the database (e.g., 'What are the top 5 products by revenue in 2026?')..."
          className="w-full min-h-[100px] p-4 pb-12 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-y font-sans text-sm"
          disabled={loading}
        />
        <div className="absolute right-3 bottom-3 flex items-center space-x-2">
          {question.trim() && (
            <button
              type="button"
              onClick={() => setQuestion('')}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-slate-200 transition-colors"
              title="Clear input"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            disabled={!question.trim() || loading}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-white dark:bg-slate-800 text-white disabled:text-slate-500 font-medium text-xs shadow-lg shadow-indigo-600/20 disabled:shadow-none transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <span>Generate SQL</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
        <div className="absolute left-4 bottom-3.5 hidden md:flex items-center text-[10px] text-slate-500">
          <CornerDownLeft className="w-3 h-3 mr-1" />
          <span>Press Enter to generate, Shift+Enter for new line</span>
        </div>
      </form>
    </div>
  );
};

export default QueryInput;
