import React, { useState, useMemo } from 'react';
import { Download, Search, ChevronLeft, ChevronRight, ListFilter } from 'lucide-react';

const ResultTable = ({ columns, rows }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter rows based on search
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    
    const term = searchTerm.toLowerCase();
    return rows.filter(row => {
      return Object.values(row).some(value => {
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(term);
      });
    });
  }, [rows, searchTerm]);

  // Reset page when search or row length changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, rows]);

  // Pagination calculation
  const totalRows = filteredRows.length;
  const totalPages = Math.ceil(totalRows / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRows);
  const paginatedRows = filteredRows.slice(startIndex, endIndex);

  // Export functions
  const downloadCSV = () => {
    if (totalRows === 0) return;
    
    // Header line
    const csvContent = [
      columns.join(','),
      ...filteredRows.map(row => 
        columns.map(col => {
          const val = row[col];
          if (val === null || val === undefined) return '';
          // Wrap string values containing comma or double quote
          const valStr = String(val);
          if (valStr.includes(',') || valStr.includes('"') || valStr.includes('\n')) {
            return `"${valStr.replace(/"/g, '""')}"`;
          }
          return valStr;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `query_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadJSON = () => {
    if (totalRows === 0) return;
    
    const jsonStr = JSON.stringify(filteredRows, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `query_results_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!columns || columns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/50">
        <ListFilter className="w-8 h-8 text-slate-500 mb-2" />
        <p className="text-slate-600 dark:text-slate-400 text-sm">No results to display. Run a valid query to inspect records.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-lg space-y-4">
      {/* Table toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-600 dark:text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-200"
          />
        </div>

        {/* Actions & Pagination Controls */}
        <div className="flex items-center space-x-3 self-end sm:self-auto">
          {/* Page size select */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-600 dark:text-slate-400">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-1 text-slate-900 dark:text-slate-200 focus:outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Export dropdown */}
          <div className="flex items-center space-x-2">
            <button
              onClick={downloadCSV}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-white dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs transition-colors"
              title="Export as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
            <button
              onClick={downloadJSON}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-white dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs transition-colors"
              title="Export as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Grid Container */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-slate-900 dark:text-slate-200">
          <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 font-semibold tracking-wide uppercase">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-6 py-3 font-semibold">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-white dark:bg-slate-800/30 transition-colors">
                  {columns.map((col) => {
                    const cellVal = row[col];
                    return (
                      <td key={col} className="px-6 py-3.5 max-w-xs truncate font-mono text-xs">
                        {cellVal === null || cellVal === undefined ? (
                          <span className="text-slate-600 italic">null</span>
                        ) : (
                          String(cellVal)
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-10 text-center text-slate-500">
                  No records match your search filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20">
        <div>
          Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{totalRows > 0 ? startIndex + 1 : 0}</span> to{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-300">{endIndex}</span> of{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-300">{totalRows}</span> records
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:bg-slate-700 disabled:opacity-30 disabled:hover:bg-white dark:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="text-slate-700 dark:text-slate-300">
            Page <span className="font-semibold">{currentPage}</span> of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:bg-slate-700 disabled:opacity-30 disabled:hover:bg-white dark:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultTable;
