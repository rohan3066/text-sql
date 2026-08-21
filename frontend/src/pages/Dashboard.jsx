import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import ChartRenderer from '../components/ChartRenderer';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package, 
  TrendingUp, 
  ShoppingBag,
  Award,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [sumRes, trendRes, topRes, catRes] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/dashboard/revenue'),
          api.get('/dashboard/top-products'),
          api.get('/dashboard/category-sales'),
        ]);
        setSummary(sumRes.data);
        setTrends(trendRes.data);
        setTopProducts(topRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error("Failed to load dashboard metrics:", err);
        setError("Could not load dashboard analytics. Verify database seeding.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <Navbar title="Dashboard" />
        <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
          <LoadingSpinner text="Crunching e-commerce analytics database..." />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50 dark:bg-slate-900">
      <Navbar title="Dashboard" />
      
      <main className="p-8 space-y-8 max-w-7xl mx-auto w-full">
        {error && (
          <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Summary Cards Grid */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Revenue */}
            <div className="glass-card flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Total Revenue</p>
                <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
                  ₹{summary.total_revenue.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            {/* Orders */}
            <div className="glass-card flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Total Orders</p>
                <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
                  {summary.total_orders.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
                <ShoppingCart className="w-6 h-6" />
              </div>
            </div>

            {/* Customers */}
            <div className="glass-card flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Active Customers</p>
                <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
                  {summary.total_customers.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/10">
                <Users className="w-6 h-6" />
              </div>
            </div>

            {/* Products */}
            <div className="glass-card flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Products Catalog</p>
                <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
                  {summary.total_products.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/10">
                <Package className="w-6 h-6" />
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Over Time (Line Chart) */}
          <ChartRenderer
            data={trends}
            columns={['month', 'revenue']}
            recommendation={{ type: 'line', x_axis: 'month', y_axis: 'revenue' }}
          />

          {/* Sales by Category (Pie Chart) */}
          <ChartRenderer
            data={categories}
            columns={['category', 'revenue']}
            recommendation={{ type: 'pie', x_axis: 'category', y_axis: 'revenue' }}
          />
        </div>

        {/* Bottom Lists Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products (Bar Chart) */}
          <ChartRenderer
            data={topProducts}
            columns={['product_name', 'revenue']}
            recommendation={{ type: 'bar', x_axis: 'product_name', y_axis: 'revenue' }}
          />

          {/* Recent Orders Overview / Info Panel */}
          <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <div className="border-b border-slate-200 dark:border-slate-700 pb-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">Business Overview</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-bold uppercase tracking-wider">
                Summary Stats
              </span>
            </div>

            <div className="flex-1 flex flex-col justify-center py-4 space-y-4 text-sm text-slate-700 dark:text-slate-300">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4.5 h-4.5 text-indigo-400" />
                  <span>Average Order Value:</span>
                </div>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                  ₹{summary && summary.total_orders > 0 ? (summary.total_revenue / summary.total_orders).toFixed(2) : '0.00'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <Award className="w-4.5 h-4.5 text-amber-400" />
                  <span>Top Selling Category:</span>
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {categories.length > 0 ? categories[0].category : 'N/A'}
                </span>
              </div>
            </div>

            <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-800">
              Data is read directly from the analytics connection pool in real-time.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
