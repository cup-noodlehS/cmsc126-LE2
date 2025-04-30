import { create } from 'zustand';
import { BudgetApi } from './budgethink';
import { Budget, BudgetType } from '@/app/types';
import { BudgetReadInterface, BudgetWriteInterface } from '@/lib/types/budgethink';
import { useAuthStore } from './auth';

// Helper to convert API type to UI type
const mapApiToUiBudget = (budget: BudgetReadInterface): Budget => {
  console.log('API Budget received:', budget);
  return {
    id: budget.id,
    type: budget.category ? 'category' : 'total',
    categoryId: budget.category?.id,
    amount: budget.amount_limit,
    month: budget.month !== undefined ? budget.month : new Date(budget.created_at).getMonth() + 1,
    year: budget.year !== undefined ? budget.year : new Date(budget.created_at).getFullYear(),
    createdAt: budget.created_at,
    updatedAt: budget.updated_at
  };
};

// Helper to convert UI type to API type
const mapUiToApiBudget = (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>, userId: number): BudgetWriteInterface => {
  const data = {
    category_id: budget.type === 'category' ? budget.categoryId : null,
    user_id: userId,
    name: budget.type === 'total' ? `Budget for ${budget.month}/${budget.year}` : null,
    amount_limit: budget.amount,
    month: budget.month,
    year: budget.year
  };
  console.log('Sending budget data to API:', data);
  return data;
};

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
      console.log('Fetched budgets from API:', response.objects);
      const mappedBudgets = response.objects.map(mapApiToUiBudget);
      console.log('Mapped budgets for UI:', mappedBudgets);
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
      // Check if trying to add a total budget and one already exists for this month/year
      if (budgetData.type === 'total') {
        const { budgets } = get();
        const existingTotalBudget = budgets.find(
          b => b.type === 'total' && 
               b.month === budgetData.month && 
               b.year === budgetData.year
        );
        
        if (existingTotalBudget) {
          const errorMsg = `A total budget of ${existingTotalBudget.amount.toLocaleString('en-US', {style: 'currency', currency: 'USD'})} already exists for ${new Date(2000, existingTotalBudget.month - 1).toLocaleString('default', { month: 'long' })} ${existingTotalBudget.year}.`;
          set({ error: errorMsg });
          throw new Error(errorMsg);
        }
      }
      
      set({ isLoading: true, error: null });
      const apiBudgetData = mapUiToApiBudget(budgetData, user.id);
      const budget = await BudgetApi.create(apiBudgetData);
      console.log('Created budget from API:', budget);
      const uiBudget = mapApiToUiBudget(budget);
      console.log('Mapped new budget for UI:', uiBudget);
      
      set(state => ({
        budgets: [...state.budgets, uiBudget],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error adding budget:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to add budget', isLoading: false });
      throw error;
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
      console.log('Updated budget from API:', budget);
      const uiBudget = mapApiToUiBudget(budget);
      console.log('Mapped updated budget for UI:', uiBudget);
      
      set(state => ({
        budgets: state.budgets.map(b => 
          b.id === id ? uiBudget : b
        ),
        isLoading: false
      }));
      
      return uiBudget;
    } catch (error) {
      console.error('Error updating budget:', error);
      set({ error: 'Failed to update budget', isLoading: false });
      throw error;
    }
  },

  deleteBudget: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await BudgetApi.delete(id);
      console.log('Deleted budget with ID:', id);
      
      set(state => ({
        budgets: state.budgets.filter(budget => budget.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting budget:', error);
      set({ error: 'Failed to delete budget', isLoading: false });
      throw error;
    }
  },

  getBudgetsByMonth: (month, year) => {
    return get().budgets.filter(budget => budget.month === month && budget.year === year);
  }
})); 