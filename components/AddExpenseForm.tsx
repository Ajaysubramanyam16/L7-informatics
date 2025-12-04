import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CATEGORIES } from '../constants';
import { Category } from '../types';
import { parseExpenseFromText } from '../services/geminiService';
import { Plus, Wand2, Loader2, Calendar, FileText, DollarSign, Tag } from 'lucide-react';

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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
         <h2 className="text-lg font-bold text-slate-800">New Transaction</h2>
      </div>

      {/* Smart Input */}
      <div className="mb-8 relative overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-2xl border border-indigo-100/50">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wand2 className="w-16 h-16 text-indigo-600" />
        </div>
        
        <label className="block text-sm font-semibold text-indigo-900 mb-2 flex items-center gap-2">
          <div className="p-1.5 bg-indigo-200 rounded-md">
            <Wand2 className="w-3.5 h-3.5 text-indigo-700" />
          </div>
          AI Smart Add
        </label>
        
        <form onSubmit={handleSmartParse} className="flex gap-2 relative z-10">
          <input
            type="text"
            value={smartInput}
            onChange={(e) => setSmartInput(e.target.value)}
            placeholder="e.g., 'Starbucks $12 yesterday'"
            className="flex-1 text-sm border-0 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm placeholder:text-slate-400"
          />
          <button 
            type="submit"
            disabled={isParsing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-md shadow-indigo-200 disabled:opacity-70 disabled:shadow-none flex items-center justify-center w-12"
          >
            {isParsing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
          </button>
        </form>
        <p className="text-[11px] text-indigo-600/80 mt-2 font-medium ml-1">
            ✨ Tip: Just type normally. The AI extracts details automatically.
        </p>
      </div>

      <div className="flex items-center gap-4 mb-6">
         <div className="h-px bg-slate-100 flex-1"></div>
         <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Or enter manually</span>
         <div className="h-px bg-slate-100 flex-1"></div>
      </div>

      {/* Manual Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Date</label>
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Description</label>
          <div className="relative">
             <FileText className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What did you buy?"
                className="w-full text-sm border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Amount</label>
            <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                type="number"
                required
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full text-sm border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Category</label>
            <div className="relative">
                <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full text-sm border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none bg-white"
                >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-4 shadow-lg shadow-slate-900/20"
        >
          <Plus className="w-5 h-5" />
          Add Transaction
        </button>
      </form>
    </div>
  );
};

export default AddExpenseForm;