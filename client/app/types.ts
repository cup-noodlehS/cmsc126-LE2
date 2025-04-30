// Re-export types from budgethink.ts
export type {
  CategoryReadInterface as Category,
  TransactionReadInterface as Transaction,
  BudgetReadInterface as Budget,
  CategoryWriteInterface,
  TransactionWriteInterface,
  BudgetWriteInterface,
  DashboardReadInterface,
  DashboardFilterInterface
} from '@/lib/types/budgethink';

// Budget type (can be 'category' or 'total')
export type BudgetType = 'category' | 'total';

export interface Category {
  id: number;
  name: string;
  color: string;
  total_income?: number;
  income_count?: number;
  total_expense?: number;
  expense_count?: number;
  total_balance?: number;
  transactions_count?: number;
}

export interface Budget {
  id: number;
  type: BudgetType;
  categoryId?: number;
  amount: number;
  month: number;
  year: number;
  createdAt: string;
  updatedAt: string;
} 