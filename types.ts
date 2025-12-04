export type Category = 'Food' | 'Transport' | 'Entertainment' | 'Housing' | 'Utilities' | 'Health' | 'Shopping' | 'Other';

export interface Expense {
  id: string;
  date: string; // ISO Date string
  amount: number;
  category: Category;
  description: string;
  splitGroupId?: string; // For the "Splitwise" feature
}

export interface Budget {
  id: string;
  category: Category;
  month: string; // YYYY-MM
  limit: number;
  alertThreshold: number; // Percentage (e.g., 90)
}

export interface Alert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  message: string;
  date: string;
  isRead: boolean;
}

export interface SplitGroup {
  id: string;
  name: string;
  members: string[];
  totalAmount: number;
}
