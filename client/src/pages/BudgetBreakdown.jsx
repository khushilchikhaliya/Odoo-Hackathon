import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { CategoryDoughnutChart, DayByDayBarChart } from '../components/BudgetCharts';
import {
  DollarSign,
  PieChart,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  Layers,
  Calendar,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';

export default function BudgetBreakdown() {
  const { id } = useParams();
  const { formatPrice } = useCurrency();

  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadBudget = async () => {
    try {
      setLoading(true);
      const res = await api.getTripBudget(id);
      setBudgetData(res.budget);
    } catch (err) {
      console.error('Failed to load trip budget:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudget();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Calculating your financial analytics & charts...</p>
      </div>
    );
  }

  if (!budgetData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-600">Budget data not found</p>
        <Link to="/trips" className="text-emerald-600 font-bold mt-2 inline-block">Back to My Trips</Link>
      </div>
    );
  }

  const {
    totalBudget,
    totalEstimatedCost,
    remainingBudget,
    percentageUsed,
    isOverbudget,
    totalDays,
    averageCostPerDay,
    averageDailyBudget,
    categories,
    dayBreakdown,
    alerts
  } = budgetData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link to={`/trips/${id}`} className="hover:text-emerald-600 font-medium">Itinerary</Link>
            <span>•</span>
            <span className="font-semibold text-emerald-600">Financial Hub</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Trip Budget & Cost Breakdown</h1>
          <p className="text-sm text-slate-500 mt-1">{budgetData.tripTitle}</p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to={`/trips/${id}/builder`}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
          >
            Adjust in Builder
          </Link>
          <Link
            to={`/trips/${id}`}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors"
          >
            View Itinerary
          </Link>
        </div>
      </div>

      {/* Overbudget Alerts Banner */}
      {alerts && alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center space-x-3 shadow-xs"
            >
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <div className="flex-1">
                <span className="font-bold">{alert.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Target Budget */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Target Budget
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{formatPrice(totalBudget)}</span>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              {totalDays} Days
            </span>
          </div>
          <p className="text-xs text-slate-400">Target allowance: {formatPrice(averageDailyBudget)}/day</p>
        </div>

        {/* Estimated Expenses */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Estimated Cost
          </span>
          <div className="flex items-baseline justify-between">
            <span className={`text-3xl font-black ${isOverbudget ? 'text-rose-600' : 'text-emerald-700'}`}>
              {formatPrice(totalEstimatedCost)}
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${isOverbudget ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
              {percentageUsed}% used
            </span>
          </div>
          <p className="text-xs text-slate-400">Avg. actual: {formatPrice(averageCostPerDay)}/day</p>
        </div>

        {/* Remaining / Variance */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Remaining Surplus / Deficit
          </span>
          <div className="flex items-baseline justify-between">
            <span className={`text-3xl font-black ${remainingBudget >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {remainingBudget >= 0 ? `+${formatPrice(remainingBudget)}` : `-${formatPrice(Math.abs(remainingBudget))}`}
            </span>
            {remainingBudget >= 0 ? (
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-500" />
            )}
          </div>
          <p className="text-xs text-slate-400">
            {remainingBudget >= 0 ? 'Comfortably within budget target' : 'Over allocated budget target'}
          </p>
        </div>

        {/* Cost Optimization Score */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
            Budget Health
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black">
              {percentageUsed <= 100 ? `${Math.max(10, 100 - (percentageUsed > 80 ? (percentageUsed - 80) * 2 : 0))}/100` : 'Warning'}
            </span>
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-xs text-slate-300">
            {percentageUsed <= 80 ? 'Optimal expense distribution' : 'Consider reviewing luxury activities'}
          </p>
        </div>

      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Category Breakdown Doughnut Chart */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-base text-slate-900">Expenses by Category</h3>
            </div>
            <span className="text-xs text-slate-400">Stay, Transport & Activities</span>
          </div>

          <CategoryDoughnutChart categories={categories} />
        </div>

        {/* Day-by-Day Timeline Bar Chart */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-base text-slate-900">Day-by-Day Expense Distribution</h3>
            </div>
            <span className="text-xs text-slate-400">Red = Above daily threshold</span>
          </div>

          <DayByDayBarChart dayBreakdown={dayBreakdown} dailyBudget={averageDailyBudget} />
        </div>

      </div>

      {/* Category Line Items Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900">Category Expense Itemization</h3>
          <span className="text-xs text-slate-400">Aggregated from accommodation, transport, and scheduled sights</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-6">Category</th>
                <th className="py-3 px-6">Subtotal</th>
                <th className="py-3 px-6">% of Total Spent</th>
                <th className="py-3 px-6">Avg. Daily Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((cat, i) => {
                const share = totalEstimatedCost > 0 ? Math.round((cat.amount / totalEstimatedCost) * 100) : 0;
                return (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-slate-800 flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span>{cat.name}</span>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-slate-900">
                      {formatPrice(cat.amount)}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${share}%`, backgroundColor: cat.color }}
                          />
                        </div>
                        <span className="font-semibold">{share}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-slate-500 font-medium">
                      {formatPrice(cat.amount / (totalDays || 1))}/day
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
