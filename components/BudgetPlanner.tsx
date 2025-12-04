import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CATEGORIES, DEFAULT_ALERT_THRESHOLD } from '../constants';
import { Category } from '../types';
import { Save, Bell, TrendingUp, CheckCircle2 } from 'lucide-react';

const BudgetPlanner: React.FC = () => {
  const { setBudget, getBudgetForCategory } = useFinance();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Budget Planner</h2>
            <p className="text-slate-500 mt-1">Set limits and alert thresholds for your spending categories.</p>
          </div>
          <div className="relative">
             <input 
                type="month" 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="text-sm border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-medium"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((category, idx) => (
            <BudgetCard 
              key={category} 
              category={category} 
              month={selectedMonth} 
              onSave={setBudget} 
              currentBudget={getBudgetForCategory(category, selectedMonth)}
              delay={idx * 50}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface BudgetCardProps {
  category: Category;
  month: string;
  onSave: (budget: any) => void;
  currentBudget: any;
  delay: number;
}

const BudgetCard: React.FC<BudgetCardProps> = ({ category, month, onSave, currentBudget, delay }) => {
  const [limit, setLimit] = useState(currentBudget?.limit.toString() || '');
  const [threshold, setThreshold] = useState(currentBudget?.alertThreshold.toString() || DEFAULT_ALERT_THRESHOLD.toString());

  const handleSave = () => {
    if (!limit) return;
    onSave({
      id: `${category}-${month}`,
      category,
      month,
      limit: parseFloat(limit),
      alertThreshold: parseFloat(threshold)
    });
  };

  const limitNum = parseFloat(limit) || 0;
  const thresholdNum = parseFloat(threshold) || 80;
  const remainingAlertAmount = limitNum * ((100 - thresholdNum) / 100);

  return (
    <div 
        className={`rounded-2xl p-5 border transition-all duration-300 animate-fade-in ${currentBudget ? 'bg-white border-emerald-200 shadow-sm shadow-emerald-500/5' : 'bg-slate-50 border-slate-100'}`}
        style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
             <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentBudget ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                {currentBudget ? <TrendingUp className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-slate-400"></div>}
             </div>
             <div>
                <h3 className="font-bold text-slate-800">{category}</h3>
                {currentBudget && <p className="text-[10px] uppercase tracking-wide font-semibold text-emerald-600">Active</p>}
             </div>
        </div>
        {currentBudget && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Monthly Limit ($)</label>
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            placeholder="0.00"
            className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${currentBudget ? 'border-emerald-100 bg-emerald-50/30 text-emerald-900 font-medium' : 'border-slate-200 bg-white text-slate-900'}`}
          />
        </div>
        
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            <div className="flex items-center gap-1">
              <Bell className="w-3 h-3" />
              Alert Threshold (%)
            </div>
          </label>
          <div className="flex items-center gap-2">
             <div className="relative flex-1">
                <input
                type="number"
                min="1"
                max="100"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className={`w-full text-sm border rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${currentBudget ? 'border-emerald-100 bg-emerald-50/30' : 'border-slate-200 bg-white'}`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">%</span>
             </div>
          </div>
          {limitNum > 0 && (
            <p className="text-[10px] text-slate-500 mt-2 bg-slate-100/50 p-2 rounded-lg">
              Alert triggers when <span className="font-semibold text-slate-700">${remainingAlertAmount.toFixed(0)}</span> remains.
            </p>
          )}
        </div>

        <button
          onClick={handleSave}
          className={`w-full text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] ${
            currentBudget 
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20' 
            : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/20'
          }`}
        >
          <Save className="w-3.5 h-3.5" />
          {currentBudget ? 'Update Budget' : 'Set Budget'}
        </button>
      </div>
    </div>
  );
};

export default BudgetPlanner;