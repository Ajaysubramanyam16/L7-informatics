import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Expense, Budget, Alert, Category } from '../types';

interface FinanceContextType {
  expenses: Expense[];
  budgets: Budget[];
  alerts: Alert[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  setBudget: (budget: Budget) => void;
  dismissAlert: (id: string) => void;
  getBudgetForCategory: (category: Category, month: string) => Budget | undefined;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Helper to generate sample data for demonstration
const generateSampleData = () => {
  const today = new Date();
  const currentMonthStr = today.toISOString().slice(0, 7);
  
  // Create Budgets
  const budgets: Budget[] = [
      { id: 'b1', category: 'Food', month: currentMonthStr, limit: 600, alertThreshold: 80 },
      { id: 'b2', category: 'Transport', month: currentMonthStr, limit: 300, alertThreshold: 90 },
      { id: 'b3', category: 'Entertainment', month: currentMonthStr, limit: 200, alertThreshold: 75 },
      { id: 'b4', category: 'Housing', month: currentMonthStr, limit: 1500, alertThreshold: 90 },
      { id: 'b5', category: 'Utilities', month: currentMonthStr, limit: 250, alertThreshold: 85 },
      { id: 'b6', category: 'Shopping', month: currentMonthStr, limit: 150, alertThreshold: 80 },
  ];

  // Create Expenses spread across the month
  const expenses: Expense[] = [
      { id: 'e1', date: new Date(today.getFullYear(), today.getMonth(), 2).toISOString().slice(0, 10), amount: 1200, category: 'Housing', description: 'Monthly Rent' },
      { id: 'e2', date: new Date(today.getFullYear(), today.getMonth(), 5).toISOString().slice(0, 10), amount: 85.50, category: 'Food', description: 'Grocery Haul' },
      { id: 'e3', date: new Date(today.getFullYear(), today.getMonth(), 6).toISOString().slice(0, 10), amount: 45.00, category: 'Transport', description: 'Weekly Gas' },
      { id: 'e4', date: new Date(today.getFullYear(), today.getMonth(), 8).toISOString().slice(0, 10), amount: 120.00, category: 'Utilities', description: 'Electric Bill' },
      { id: 'e5', date: new Date(today.getFullYear(), today.getMonth(), 10).toISOString().slice(0, 10), amount: 25.00, category: 'Entertainment', description: 'Cinema' },
      { id: 'e6', date: new Date(today.getFullYear(), today.getMonth(), 12).toISOString().slice(0, 10), amount: 15.90, category: 'Food', description: 'Lunch' },
      { id: 'e7', date: new Date(today.getFullYear(), today.getMonth(), 15).toISOString().slice(0, 10), amount: 210.00, category: 'Transport', description: 'Car Service' }, // High transport expense
      { id: 'e8', date: new Date(today.getFullYear(), today.getMonth(), 18).toISOString().slice(0, 10), amount: 160.00, category: 'Entertainment', description: 'Concert Tickets' }, // Puts ent near limit
      { id: 'e9', date: new Date(today.getFullYear(), today.getMonth(), 20).toISOString().slice(0, 10), amount: 350.00, category: 'Food', description: 'Fancy Dinner & Drinks' }, // Puts food high
      { id: 'e10', date: new Date(today.getFullYear(), today.getMonth(), 22).toISOString().slice(0, 10), amount: 180.00, category: 'Shopping', description: 'New Shoes' }, // Puts shopping over budget
  ];
  
  return { budgets, expenses };
};

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('expenses');
    if (saved) return JSON.parse(saved);
    const { expenses: sample } = generateSampleData();
    return sample;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('budgets');
    if (saved) return JSON.parse(saved);
    const { budgets: sample } = generateSampleData();
    return sample;
  });

  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
    checkBudgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
    checkBudgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budgets]);

  const checkBudgets = () => {
    const newAlerts: Alert[] = [];
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    // Group expenses by category for the current month
    const expensesByCat: Record<string, number> = {};
    expenses.forEach(exp => {
      if (exp.date.startsWith(currentMonth)) {
        expensesByCat[exp.category] = (expensesByCat[exp.category] || 0) + exp.amount;
      }
    });

    budgets.forEach(budget => {
      if (budget.month === currentMonth) {
        const spent = expensesByCat[budget.category] || 0;
        const percentage = (spent / budget.limit) * 100;
        
        if (spent > budget.limit) {
          newAlerts.push({
            id: `over-${budget.id}-${Date.now()}`,
            type: 'danger',
            message: `Over Budget: You've spent $${spent} on ${budget.category}, exceeding your limit of $${budget.limit}.`,
            date: new Date().toISOString(),
            isRead: false
          });
        } else if (percentage >= budget.alertThreshold) {
          const remainingPercent = 100 - percentage;
          newAlerts.push({
            id: `warn-${budget.id}-${Date.now()}`,
            type: 'warning',
            message: `Budget Alert: Only ${remainingPercent.toFixed(1)}% remaining for ${budget.category}. Used $${spent} of $${budget.limit}.`,
            date: new Date().toISOString(),
            isRead: false
          });
        }
      }
    });

    // Deduplicate alerts based on message
    setAlerts(prev => {
      const existingMessages = new Set(prev.map(a => a.message));
      const uniqueNewAlerts = newAlerts.filter(a => !existingMessages.has(a.message));
      if (uniqueNewAlerts.length === 0) return prev;
      return [...uniqueNewAlerts, ...prev];
    });
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: crypto.randomUUID() };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const setBudget = (budget: Budget) => {
    setBudgets(prev => {
      // Upsert
      const existing = prev.findIndex(b => b.category === budget.category && b.month === budget.month);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = budget;
        return updated;
      }
      return [...prev, budget];
    });
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const getBudgetForCategory = (category: Category, month: string) => {
    return budgets.find(b => b.category === category && b.month === month);
  };

  return (
    <FinanceContext.Provider value={{
      expenses,
      budgets,
      alerts,
      addExpense,
      deleteExpense,
      setBudget,
      dismissAlert,
      getBudgetForCategory
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error("useFinance must be used within a FinanceProvider");
  return context;
};