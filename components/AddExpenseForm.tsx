import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CATEGORIES } from '../constants';
import { Category } from '../types';
import { parseExpenseFromText } from '../services/geminiService';
import { Plus, Wand2, Loader2 } from 'lucide-react';

const AddExpenseForm: React.FC = () => {
  const { addExpense } = useFinance();
  const [smartInput, setSmartInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Food');

  const handleSmartParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smartInput.trim()) return;

    setIsParsing(true);
    const result = await parseExpenseFromText(smartInput);
    setIsParsing(false);

    if (result) {
      if (result.description) setDescription(result.description);
      if (result.amount) setAmount(result.amount.toString());
      if (result.category && CATEGORIES.includes(result.category as Category)) {
        setCategory(result.category as Category);
      }
      if (result.date) setDate(result.date);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    addExpense({
      date,
      description,
      amount: parseFloat(amount),
      category
    });

    // Reset form
    setDescription('');
    setAmount('');
    setSmartInput('');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Add Expense</h2>

      {/* Smart Input */}
      <div className="mb-6 bg-purple-50 p-4 rounded-lg border border-purple-100">
        <label className="block text-sm font-medium text-purple-900 mb-2 flex items-center gap-2">
          <Wand2 className="w-4 h-4" />
          Smart Add with Gemini
        </label>
        <form onSubmit={handleSmartParse} className="flex gap-2">
          <input
            type="text"
            value={smartInput}
            onChange={(e) => setSmartInput(e.target.value)}
            placeholder="e.g., 'Lunch at Burger King $15 yesterday'"
            className="flex-1 text-sm border border-purple-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button 
            type="submit"
            disabled={isParsing}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Parse'}
          </button>
        </form>
        <p className="text-xs text-purple-700 mt-2">Type naturally and let AI fill the details below.</p>
      </div>

      <div className="border-t border-slate-100 my-4"></div>

      {/* Manual Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <input
            type="text"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What did you buy?"
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </form>
    </div>
  );
};

export default AddExpenseForm;
