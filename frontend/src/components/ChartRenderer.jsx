import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie,
  AreaChart, Area,
  XAxis, YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { BarChart3, LineChart as LineIcon, PieChart as PieIcon, AreaChart as AreaIcon, Table } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#f43f5e', '#06b6d4'];

const ChartRenderer = ({ data, columns, recommendation }) => {
  // Guess axes if not provided or incorrect in recommendation
  const axes = useMemo(() => {
    let x = recommendation?.x_axis;
    let y = recommendation?.y_axis;
    
    // Validate if they actually exist in columns
    const validX = x && columns.includes(x);
    const validY = y && columns.includes(y);
    
    if (validX && validY) {
      return { x, y };
    }
    
    // Guess X (string-like or first column)
    if (!validX && columns.length > 0) {
      // Find first column that is not numeric if possible, else first column
      const guessedX = columns.find(col => {
        if (data.length === 0) return true;
        const val = data[0][col];
        return typeof val === 'string' && isNaN(Number(val));
      }) || columns[0];
      x = guessedX;
    }
    
    // Guess Y (numeric column)
    if (!validY && columns.length > 0) {
      // Find first column containing numeric values, skipping X
      const guessedY = columns.find(col => {
        if (col === x) return false;
        if (data.length === 0) return false;
        const val = data[0][col];
        return !isNaN(Number(val)) && val !== null;
      }) || columns.find(col => col !== x) || columns[0];
      y = guessedY;
    }
    
    return { x, y };
  }, [data, columns, recommendation]);

  const { x, y } = axes;
  const chartType = recommendation?.type || 'bar';

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] bg-white dark:bg-slate-800/20 rounded-xl border border-slate-200 dark:border-slate-700/50">
        <p className="text-slate-500 text-sm">No dataset available for visualization.</p>
      </div>
    );
  }

  // Format data values for numeric fields
  const chartData = useMemo(() => {
    return data.map(row => {
      const formatted = { ...row };
      if (y && formatted[y] !== undefined) {
        formatted[y] = Number(formatted[y]);
      }
      return formatted;
    });
  }, [data, y]);

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis dataKey={x} stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
              labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
            <Line type="monotone" dataKey={y} name={y} stroke="#6366f1" strokeWidth={2.5} activeDot={{ r: 6 }} dot={{ r: 3 }} />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <defs>
              <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis dataKey={x} stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
              labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
            <Area type="monotone" dataKey={y} name={y} stroke="#6366f1" fillOpacity={1} fill="url(#colorArea)" strokeWidth={2} />
          </AreaChart>
        );

      case 'pie':
        // For pie charts, limit items to top 8 to prevent overcrowded slices
        const pieData = chartData.slice(0, 8);
        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={y}
              nameKey={x}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
          </PieChart>
        );

      case 'bar':
      default:
        return (
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis dataKey={x} stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
              labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
            <Bar dataKey={y} name={y} fill="#6366f1" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        );
    }
  };

  const icons = {
    bar: BarChart3,
    line: LineIcon,
    pie: PieIcon,
    area: AreaIcon,
    table: Table
  };
  const Icon = icons[chartType] || BarChart3;

  return (
    <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
            {chartType} Chart: {y} by {x}
          </h3>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 font-bold uppercase tracking-wider">
          AI Suggested
        </span>
      </div>

      <div className="w-full h-[300px] flex items-center justify-center">
        {chartType === 'table' ? (
          <div className="text-center space-y-2">
            <Table className="w-12 h-12 text-slate-500 mx-auto" />
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Table representation recommended for this dataset.</p>
            <p className="text-xs text-slate-500">Please review the raw data table below.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ChartRenderer;
