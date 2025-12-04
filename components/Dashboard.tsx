import React, { useMemo, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { DollarSign, AlertTriangle, PieChart as PieIcon, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import { getFinancialInsights } from '../services/geminiService';

const Dashboard: React.FC = () => {
  const { expenses, alerts, dismissAlert, budgets } = useFinance();
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthName = new Date().toLocaleDateString('default', { month: 'long', year: 'numeric' });

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

  const percentageSpent = stats.totalBudget > 0 ? (stats.totalSpent / stats.totalBudget) * 100 : 0;
  const isOverBudget = stats.totalSpent > stats.totalBudget;

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-slate-500 mt-1 font-medium">Financial summary for {monthName}</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
           <TrendingUp className="w-4 h-4" />
           <span>Budget active</span>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Spent Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300 animate-fade-in delay-100 group">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Spent</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-bold text-slate-900 tracking-tight">
                ${stats.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <p className="text-sm text-slate-500 mt-2 font-medium">
             Across {stats.count} transactions
          </p>
        </div>

        {/* Budget Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300 animate-fade-in delay-200 group">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
              <PieIcon className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Budget Status</span>
          </div>
          
          <div className="flex items-baseline justify-between mb-2">
             <h3 className="text-2xl font-bold text-slate-900">
                {percentageSpent.toFixed(0)}% <span className="text-sm font-normal text-slate-500">used</span>
             </h3>
             <span className="text-sm font-medium text-slate-500">
                ${stats.totalBudget.toLocaleString()} Limit
             </span>
          </div>
          
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${isOverBudget ? 'bg-red-500' : 'bg-blue-500'}`} 
              style={{ width: `${Math.min(percentageSpent, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-slate-500 mt-4 font-medium flex items-center gap-1">
             {isOverBudget ? 'Over budget by' : 'Remaining'}: 
             <span className={`${isOverBudget ? 'text-red-600' : 'text-emerald-600'} font-bold`}>
                ${Math.abs(stats.totalBudget - stats.totalSpent).toFixed(2)}
             </span>
          </p>
        </div>

        {/* AI Insights Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 shadow-lg shadow-indigo-200 text-white animate-fade-in delay-300 relative overflow-hidden">
          {/* Decorative background circles */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-indigo-500/30 rounded-full blur-xl"></div>
          
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl">
              <Sparkles className="w-6 h-6 text-indigo-100" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">AI Assistant</span>
          </div>
          
          <div className="relative z-10 min-h-[100px]">
            {!insight ? (
              <div className="flex flex-col h-full justify-between">
                 <p className="text-indigo-100 font-medium mb-4">
                   Get personalized spending analysis and saving tips based on your recent activity.
                 </p>
                 <button 
                  onClick={generateInsight}
                  disabled={loadingInsight}
                  className="w-full py-2.5 bg-white text-indigo-700 font-semibold rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 text-sm shadow-sm"
                >
                  {loadingInsight ? (
                     <>
                        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        Analyzing...
                     </>
                  ) : (
                     <>Generate Insights <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-sm text-white/90 leading-relaxed animate-fade-in">
                <div className="whitespace-pre-line">{insight}</div>
                <button 
                  onClick={() => setInsight(null)}
                  className="mt-4 text-xs font-medium text-indigo-200 hover:text-white underline decoration-indigo-400/50 hover:decoration-white"
                >
                  Refresh
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="space-y-4 animate-fade-in delay-300">
           <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              Notifications
              <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">{alerts.length}</span>
           </h3>
           <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-50">
            {alerts.map(alert => (
              <div key={alert.id} className={`p-4 flex gap-4 transition-colors hover:bg-slate-50 ${alert.type === 'danger' ? 'border-l-4 border-red-500' : 'border-l-4 border-amber-500'}`}>
                <div className={`p-2 rounded-full flex-shrink-0 h-fit ${alert.type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                   <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className={`text-sm font-semibold ${alert.type === 'danger' ? 'text-slate-900' : 'text-slate-900'}`}>
                        {alert.type === 'danger' ? 'Budget Exceeded' : 'Budget Warning'}
                    </p>
                    <button 
                      onClick={() => dismissAlert(alert.id)}
                      className="text-slate-400 hover:text-slate-600 text-xs font-medium px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    {alert.message}
                  </p>
                  <p className="text-xs text-slate-400 mt-2 font-medium">{new Date(alert.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;