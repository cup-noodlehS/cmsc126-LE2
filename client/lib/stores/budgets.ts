import { create } from 'zustand';
import { BudgetApi } from './budgethink';
import { Budget, BudgetType } from '@/app/types';
import { BudgetReadInterface, BudgetWriteInterface } from '@/lib/types/budgethink';
import { useAuthStore } from './auth';

// Helper to convert API type to UI type
const mapApiToUiBudget = (budget: BudgetReadInterface): Budget => ({
  id: budget.id,
  type: budget.category ? 'category' : 'total',
  categoryId: budget.category?.id,
  amount: budget.amount_limit,
  month: new Date(budget.created_at).getMonth() + 1, // Extract month from created_at
  year: new Date(budget.created_at).getFullYear(), // Extract year from created_at
  createdAt: budget.created_at,
  updatedAt: budget.updated_at
});

// Helper to convert UI type to API type
const mapUiToApiBudget = (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>, userId: number): BudgetWriteInterface => ({
  category_id: budget.type === 'category' ? budget.categoryId : null,
  user_id: userId,
  name: budget.type === 'total' ? `Budget for ${budget.month}/${budget.year}` : null,
  amount_limit: budget.amount
});

interface BudgetState {
  budgets: Budget[];
  isLoading: boolean;
  error: string | null;
  fetchBudgets: () => Promise<void>;
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBudget: (id: number, budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteBudget: (id: number) => Promise<void>;
  getBudgetsByMonth: (month: number, year: number) => Budget[];
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgets: [],
  isLoading: false,
  error: null,

  fetchBudgets: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await BudgetApi.filter();
      const mappedBudgets = response.objects.map(mapApiToUiBudget);
      set({ budgets: mappedBudgets, isLoading: false });
    } catch (error) {
      console.error('Error fetching budgets:', error);
      set({ error: 'Failed to fetch budgets', isLoading: false });
    }
  },

  addBudget: async (budgetData) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ error: 'User not authenticated' });
      return;
    }
    
    try {
      set({ isLoading: true, error: null });
      const apiBudgetData = mapUiToApiBudget(budgetData, user.id);
      const budget = await BudgetApi.create(apiBudgetData);
      const uiBudget = mapApiToUiBudget(budget);
      
      set(state => ({
        budgets: [...state.budgets, uiBudget],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error adding budget:', error);
      set({ error: 'Failed to add budget', isLoading: false });
    }
  },

  updateBudget: async (id, budgetData) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ error: 'User not authenticated' });
      return;
    }
    
    try {
      set({ isLoading: true, error: null });
      const apiBudgetData = mapUiToApiBudget(budgetData, user.id);
      const budget = await BudgetApi.update(id, apiBudgetData);
      const uiBudget = mapApiToUiBudget(budget);
      
      set(state => ({
        budgets: state.budgets.map(b => 
          b.id === id ? uiBudget : b
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating budget:', error);
      set({ error: 'Failed to update budget', isLoading: false });
    }
  },

  deleteBudget: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await BudgetApi.delete(id);
      
      set(state => ({
        budgets: state.budgets.filter(budget => budget.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting budget:', error);
      set({ error: 'Failed to delete budget', isLoading: false });
    }
  },

  getBudgetsByMonth: (month, year) => {
    return get().budgets.filter(budget => budget.month === month && budget.year === year);
  }
})); 