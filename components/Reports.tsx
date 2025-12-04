import React, { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#64748b'];

const Reports: React.FC = () => {
  const { expenses, budgets } = useFinance();
  const currentMonth = new Date().toISOString().slice(0, 7);

  const data = useMemo(() => {
    // Filter for current month
    const thisMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonth));
    
    // Group by category
    const categoryData: Record<string, { spent: number, budget: number }> = {};
    
    thisMonthExpenses.forEach(exp => {
      if (!categoryData[exp.category]) {
        categoryData[exp.category] = { spent: 0, budget: 0 };
      }
      categoryData[exp.category].spent += exp.amount;
    });

    // Add budget data
    budgets.forEach(b => {
      if (b.month === currentMonth) {
        if (!categoryData[b.category]) {
          categoryData[b.category] = { spent: 0, budget: 0 };
        }
        categoryData[b.category].budget = b.limit;
      }
    });

    return Object.entries(categoryData).map(([name, vals]) => ({
      name,
      Spent: vals.spent,
      Budget: vals.budget
    }));
  }, [expenses, budgets, currentMonth]);

  const pieData = data.filter(d => d.Spent > 0);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Spending vs. Budget ({currentMonth})</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `$${val}`} />
              <Tooltip 
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend />
              <Bar dataKey="Spent" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Budget" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Expense Distribution</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="Spent"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Summary</h2>
            <div className="space-y-4">
                {pieData.map((d, idx) => (
                    <div key={d.name} className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length]}}></div>
                            <span className="text-slate-600 text-sm">{d.name}</span>
                        </div>
                        <span className="font-semibold text-slate-900">${d.Spent.toFixed(2)}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
