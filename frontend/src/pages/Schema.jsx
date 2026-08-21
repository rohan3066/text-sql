import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { Database, Table as TableIcon, Key, Link as LinkIcon, Search, AlertCircle } from 'lucide-react';

const Schema = () => {
  const [schemaData, setSchemaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);

  const fetchSchema = async () => {
    try {
      setLoading(true);
      const response = await api.get('/database/schema');
      const formattedData = Object.entries(response.data).map(([tableName, data]) => ({
        table_name: tableName,
        columns: data.columns.map(col => ({
          column_name: col.name,
          data_type: col.type,
          is_primary: data.primary_keys.includes(col.name),
          foreign_key_table: data.foreign_keys.find(fk => fk.constrained_columns.includes(col.name))?.referred_table,
          foreign_key_column: data.foreign_keys.find(fk => fk.constrained_columns.includes(col.name))?.referred_columns[0]
        }))
      }));
      setSchemaData(formattedData);
      if (formattedData.length > 0) {
        setSelectedTable(formattedData[0]);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load database schema.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchema();
  }, []);

  const filteredTables = schemaData.filter(table => 
    table.table_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 h-screen overflow-hidden">
      <Navbar title="Database Schema" />
      
      <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col overflow-hidden h-full">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2 shrink-0">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner text="Analyzing database structure..." />
          </div>
        ) : schemaData.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-850/50 rounded-xl border border-slate-200 dark:border-slate-700/50 border-dashed">
            <Database className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-slate-600 dark:text-slate-400 font-medium">No schema data found.</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden h-full">
            {/* Table List Sidebar */}
            <div className="w-full lg:w-72 flex flex-col bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shrink-0">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search tables..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-200"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredTables.map(table => (
                  <button
                    key={table.table_name}
                    onClick={() => setSelectedTable(table)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                      selectedTable?.table_name === table.table_name
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-medium'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:bg-slate-800 hover:text-slate-900 dark:text-slate-200 border border-transparent'
                    }`}
                  >
                    <TableIcon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{table.table_name}</span>
                  </button>
                ))}
                {filteredTables.length === 0 && (
                  <div className="p-4 text-center text-sm text-slate-500">
                    No tables match your search.
                  </div>
                )}
              </div>
            </div>

            {/* Table Details */}
            {selectedTable ? (
              <div className="flex-1 flex flex-col bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/30 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                      <TableIcon className="w-6 h-6 text-indigo-400" />
                      <span>{selectedTable.table_name}</span>
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                      {selectedTable.columns.length} columns
                    </p>
                  </div>
                </div>
                
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-white dark:bg-slate-800/50 sticky top-0 backdrop-blur-sm z-10">
                      <tr>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Column Name</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Data Type</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Key</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
                      {selectedTable.columns.map((col, idx) => (
                        <tr key={idx} className="hover:bg-white dark:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-mono text-sm text-indigo-300 font-medium">{col.column_name}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-slate-600 dark:text-slate-400">{col.data_type}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {col.is_primary && (
                              <span className="inline-flex items-center px-2 py-1 rounded bg-amber-500/10 text-amber-400 text-[10px] uppercase font-bold tracking-wider border border-amber-500/20 mr-2">
                                <Key className="w-3 h-3 mr-1" /> PK
                              </span>
                            )}
                            {col.foreign_key_table && (
                              <span className="inline-flex items-center px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-[10px] uppercase font-bold tracking-wider border border-blue-500/20" title={`References ${col.foreign_key_table}.${col.foreign_key_column}`}>
                                <LinkIcon className="w-3 h-3 mr-1" /> FK
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {col.foreign_key_table ? (
                              <span>→ {col.foreign_key_table}.{col.foreign_key_column}</span>
                            ) : col.is_primary ? (
                              <span>Primary Identifier</span>
                            ) : (
                              <span>-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl">
                <p className="text-slate-500">Select a table to view its schema.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Schema;
