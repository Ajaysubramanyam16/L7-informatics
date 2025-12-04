import React, { useState } from 'react';
import { Users, UserPlus, Calculator } from 'lucide-react';

// Simplified local-only splitting logic
const SplitBill: React.FC = () => {
  const [friends, setFriends] = useState<string[]>(['Alice', 'Bob']);
  const [newFriend, setNewFriend] = useState('');
  const [amount, setAmount] = useState('');
  const [payer, setPayer] = useState('Me');
  const [splitResult, setSplitResult] = useState<string[]>([]);

  const addFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFriend && !friends.includes(newFriend)) {
      setFriends([...friends, newFriend]);
      setNewFriend('');
    }
  };

  const calculateSplit = () => {
    const total = parseFloat(amount);
    if (isNaN(total)) return;

    const allPeople = ['Me', ...friends];
    const perPerson = total / allPeople.length;
    
    const results = allPeople.map(p => {
        if (p === payer) {
            return `${p} pays total $${total.toFixed(2)} (gets back $${(total - perPerson).toFixed(2)})`;
        } else {
            return `${p} owes ${payer} $${perPerson.toFixed(2)}`;
        }
    });

    setSplitResult(results);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg">
            <Users className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
            <h2 className="text-xl font-bold text-slate-800">Split Expenses</h2>
            <p className="text-sm text-slate-500">Calculate who owes what</p>
        </div>
      </div>

      <div className="mb-6">
        <form onSubmit={addFriend} className="flex gap-2 mb-4">
            <input 
                type="text" 
                value={newFriend}
                onChange={(e) => setNewFriend(e.target.value)}
                placeholder="Add friend name..."
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button type="submit" className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                <UserPlus className="w-4 h-4" /> Add
            </button>
        </form>
        <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600">Me</span>
            {friends.map(f => (
                <span key={f} className="px-3 py-1 bg-indigo-50 rounded-full text-xs font-medium text-indigo-600">{f}</span>
            ))}
        </div>
      </div>

      <div className="space-y-4 border-t border-slate-100 pt-6">
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Total Amount ($)</label>
                <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Paid By</label>
                <select 
                    value={payer}
                    onChange={(e) => setPayer(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="Me">Me</option>
                    {friends.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
            </div>
        </div>

        <button 
            onClick={calculateSplit}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
            <Calculator className="w-4 h-4" /> Calculate Split
        </button>

        {splitResult.length > 0 && (
            <div className="bg-slate-50 p-4 rounded-lg mt-4">
                <h3 className="font-semibold text-slate-700 mb-2">Results</h3>
                <ul className="space-y-1">
                    {splitResult.map((r, i) => (
                        <li key={i} className="text-sm text-slate-600">{r}</li>
                    ))}
                </ul>
            </div>
        )}
      </div>
    </div>
  );
};

export default SplitBill;
