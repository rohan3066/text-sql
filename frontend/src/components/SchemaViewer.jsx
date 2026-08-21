import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import { Database, Key, HelpCircle, TableProperties, Network, Search, Binary } from 'lucide-react';

const SchemaViewer = () => {
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const response = await api.get('/database/schema');
        setSchema(response.data);
        const tables = Object.keys(response.data);
        if (tables.length > 0) {
          setSelectedTable(tables[0]);
        }
      } catch (error) {
        console.error("Failed to load database schema:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchema();
  }, []);

  // Filter table list based on search term
  const filteredTables = Object.keys(schema || {}).filter(table =>
    table.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner text="Reflecting database structures..." />;
  }

  if (!schema || Object.keys(schema).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl">
        <Database className="w-12 h-12 text-slate-500 mb-2 animate-bounce" />
        <p className="text-slate-600 dark:text-slate-400 text-sm">Failed to reflect schema. Please check database connectivity.</p>
      </div>
    );
  }

  const tableData = schema[selectedTable];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
      {/* Tables sidebar list */}
      <div className="lg:col-span-1 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden flex flex-col h-full shadow-lg">
        {/* Search */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-6 top-6" />
          <input
            type="text"
            placeholder="Search tables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-805 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-200"
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredTables.map(tableName => (
            <button
              key={tableName}
              onClick={() => setSelectedTable(tableName)}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide text-left transition-colors cursor-pointer ${
                selectedTable === tableName
                  ? 'bg-indigo-600 text-white shadow shadow-indigo-600/25'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:bg-slate-800/60 hover:text-slate-900 dark:text-slate-200'
              }`}
            >
              <TableProperties className="w-4 h-4 shrink-0" />
              <span className="truncate">{tableName}</span>
            </button>
          ))}
          {filteredTables.length === 0 && (
            <p className="text-center text-xs text-slate-500 py-6">No matching tables.</p>
          )}
        </div>
      </div>

      {/* Selected Table details */}
      <div className="lg:col-span-3 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-6 overflow-y-auto flex flex-col h-full shadow-lg space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-indigo-400 font-mono">
              TABLE: {selectedTable}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Attributes mapping, relational schemas, keys, and metadata index declarations.
            </p>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold font-mono">
            {tableData?.columns?.length || 0} Columns
          </span>
        </div>

        {/* Columns Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Columns</h3>
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-2.5">Key</th>
                  <th className="px-4 py-2.5">Field</th>
                  <th className="px-4 py-2.5">Type</th>
                  <th className="px-4 py-2.5">Null</th>
                  <th className="px-4 py-2.5">Default</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-slate-700 dark:text-slate-300">
                {tableData?.columns?.map(col => {
                  const isPK = tableData.primary_keys.includes(col.name);
                  const fkMatch = tableData.foreign_keys.find(fk => fk.constrained_columns.includes(col.name));
                  
                  return (
                    <tr key={col.name} className="hover:bg-white dark:bg-slate-800/10">
                      <td className="px-4 py-2">
                        {isPK ? (
                          <Key className="w-3.5 h-3.5 text-amber-400" title="Primary Key" />
                        ) : fkMatch ? (
                          <Key className="w-3.5 h-3.5 text-indigo-400" title={`Foreign Key referencing ${fkMatch.referred_table}`} />
                        ) : (
                          <span className="text-slate-700">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2 font-semibold text-slate-900 dark:text-slate-200">{col.name}</td>
                      <td className="px-4 py-2 text-indigo-300">{col.type}</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{col.nullable ? 'YES' : 'NO'}</td>
                      <td className="px-4 py-2 text-slate-500">{col.default || 'NULL'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Relationships and Foreign Keys info */}
        {tableData?.foreign_keys?.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center">
              <Network className="w-4 h-4 mr-1 text-indigo-400" /> Relationships
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tableData.foreign_keys.map((fk, idx) => (
                <div key={idx} className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 text-xs flex flex-col space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-slate-600 dark:text-slate-400">
                    <span>Relation #{idx + 1}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400">Many-to-One</span>
                  </div>
                  <div className="font-mono text-slate-700 dark:text-slate-300 flex items-center flex-wrap gap-1 mt-1 text-[11px]">
                    <span className="font-semibold text-indigo-300">{selectedTable}.{fk.constrained_columns.join(',')}</span>
                    <span className="text-slate-500">→ references →</span>
                    <span className="font-semibold text-emerald-400">{fk.referred_table}.{fk.referred_columns.join(',')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Index properties metadata */}
        {tableData?.indexes?.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center">
              <Binary className="w-4 h-4 mr-1 text-amber-400" /> Declared Indexes
            </h3>
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-2">Index Name</th>
                    <th className="px-4 py-2">Columns</th>
                    <th className="px-4 py-2">Unique</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-slate-700 dark:text-slate-300">
                  {tableData.indexes.map(idx => (
                    <tr key={idx.name} className="hover:bg-white dark:bg-slate-800/10">
                      <td className="px-4 py-2 font-semibold text-indigo-300">{idx.name}</td>
                      <td className="px-4 py-2">{idx.column_names.join(',')}</td>
                      <td className="px-4 py-2">
                        {idx.unique ? (
                          <span className="text-amber-400">UNIQUE</span>
                        ) : (
                          <span className="text-slate-500">NON-UNIQUE</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchemaViewer;
