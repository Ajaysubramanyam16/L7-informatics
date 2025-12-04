import React, { useMemo, useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { DollarSign, TrendingUp, AlertTriangle, PieChart as PieIcon, Sparkles } from 'lucide-react';
import { getFinancialInsights } from '../services/geminiService';

const Dashboard: React.FC = () => {
  const { expenses, alerts, dismissAlert, budgets } = useFinance();
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7);

  const stats = useMemo(() => {
    const thisMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonth));
    const totalSpent = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Calculate total budget for this month
    const totalBudget = budgets
      .filter(b => b.month === currentMonth)
      .reduce((sum, b) => sum + b.limit, 0);

    return { totalSpent, totalBudget, count: thisMonthExpenses.length };
  }, [expenses, budgets, currentMonth]);

  const generateInsight = async () => {
    setLoadingInsight(true);
    const result = await getFinancialInsights(expenses);
    setInsight(result);
    setLoadingInsight(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500">Overview for {new Date().toLocaleDateString('default', { month: 'long', year: 'numeric' })}</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium">Total Spent</h3>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">${stats.totalSpent.toFixed(2)}</p>
          <p className="text-sm text-slate-500 mt-2">{stats.count} transactions this month</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium">Monthly Budget</h3>
            <div className="p-2 bg-blue-100 rounded-lg">
              <PieIcon className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">${stats.totalBudget.toFixed(2)}</p>
          <div className="w-full bg-slate-100 h-2 mt-4 rounded-full overflow-hidden">
            <div 
              className={`h-full ${stats.totalSpent > stats.totalBudget ? 'bg-red-500' : 'bg-blue-500'}`} 
              style={{ width: `${Math.min((stats.totalSpent / (stats.totalBudget || 1)) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium">AI Insights</h3>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          {!insight ? (
            <button 
              onClick={generateInsight}
              disabled={loadingInsight}
              className="text-sm font-medium text-purple-600 hover:text-purple-700 disabled:opacity-50"
            >
              {loadingInsight ? 'Analyzing...' : 'Generate Spend Analysis'}
            </button>
          ) : (
            <div className="text-sm text-slate-700 prose prose-sm">
              <div className="whitespace-pre-line">{insight}</div>
            </div>
          )}
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-slate-700">Notifications</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {alerts.map(alert => (
              <div key={alert.id} className={`p-4 flex justify-between items-start ${alert.type === 'danger' ? 'bg-red-50' : 'bg-amber-50'}`}>
                <div>
                  <p className={`text-sm font-medium ${alert.type === 'danger' ? 'text-red-800' : 'text-amber-800'}`}>
                    {alert.message}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{new Date(alert.date).toLocaleDateString()}</p>
                </div>
                <button 
                  onClick={() => dismissAlert(alert.id)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
