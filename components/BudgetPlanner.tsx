import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CATEGORIES, DEFAULT_ALERT_THRESHOLD } from '../constants';
import { Category } from '../types';
import { Save } from 'lucide-react';

const BudgetPlanner: React.FC = () => {
  const { setBudget, getBudgetForCategory } = useFinance();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Budget Planner</h2>
          <input 
            type="month" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map(category => (
            <BudgetCard 
              key={category} 
              category={category} 
              month={selectedMonth} 
              onSave={setBudget} 
              currentBudget={getBudgetForCategory(category, selectedMonth)}
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
}

const BudgetCard: React.FC<BudgetCardProps> = ({ category, month, onSave, currentBudget }) => {
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

  return (
    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-slate-700">{category}</h3>
        {currentBudget && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Active</span>}
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="text-xs text-slate-500 font-medium uppercase tracking-wider">Monthly Limit ($)</label>
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            placeholder="0.00"
            className="w-full mt-1 text-sm border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        
        <div>
          <label className="text-xs text-slate-500 font-medium uppercase tracking-wider">Alert Threshold (%)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="100"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="w-full mt-1 text-sm border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <span className="text-sm text-slate-400 mt-1">%</span>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full mt-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold py-2 rounded flex items-center justify-center gap-1 transition-colors"
        >
          <Save className="w-3 h-3" />
          Set Budget
        </button>
      </div>
    </div>
  );
};

export default BudgetPlanner;
