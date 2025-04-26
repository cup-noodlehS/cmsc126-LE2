// Transaction Types
export type Transaction = {
  id: number;
  title: string;
  amount: number;
  date: string;
  category: string;
  notes?: string;
};

// Category Types
export type Category = {
  id: number;
  name: string;
  color: string;
};

// Budget Types

export type BudgetType = 'category' | 'total';

export interface Budget {
  id: number;
  type: BudgetType;
  categoryId?: number; // Only for category type budgets
  amount: number;
  month: number;
  year: number;
  createdAt: string;
  updatedAt: string;
} 