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