import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Expense, Budget, Alert, Category } from '../types';
import { DEFAULT_ALERT_THRESHOLD } from '../constants';

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

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('budgets');
    return saved ? JSON.parse(saved) : [];
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
            message: `You have exceeded your ${budget.category} budget for ${currentMonth}! Spent: $${spent}, Limit: $${budget.limit}`,
            date: new Date().toISOString(),
            isRead: false
          });
        } else if (percentage >= budget.alertThreshold) {
          newAlerts.push({
            id: `warn-${budget.id}-${Date.now()}`,
            type: 'warning',
            message: `You have used ${percentage.toFixed(0)}% of your ${budget.category} budget for ${currentMonth}.`,
            date: new Date().toISOString(),
            isRead: false
          });
        }
      }
    });

    // Deduplicate alerts crudely based on message to avoid spamming the user on every render
    // In a real app, we'd have more sophisticated state tracking for "alert already shown"
    setAlerts(prev => {
      const existingMessages = new Set(prev.map(a => a.message));
      const uniqueNewAlerts = newAlerts.filter(a => !existingMessages.has(a.message));
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
