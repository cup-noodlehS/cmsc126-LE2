import { create } from 'zustand';
import { CategoryApi } from './budgethink';
import { CategoryReadInterface, CategoryWriteInterface } from '@/lib/types/budgethink';
import { Category } from '@/app/types';
import { useAuthStore } from './auth';

// Helper to convert API type to UI type
const mapApiToUiCategory = (category: CategoryReadInterface): Category => ({
  id: category.id,
  name: category.name,
  color: category.hex_color || "#FF5733",
  total_income: category.total_income,
  income_count: category.income_count,
  total_expense: category.total_expense,
  expense_count: category.expense_count,
  total_balance: category.total_balance,
  transactions_count: category.transactions_count,
});

// Helper to convert UI type to API type
const mapUiToApiCategory = (category: Omit<Category, 'id'>, userId: number): CategoryWriteInterface => ({
  name: category.name,
  hex_color: category.color || "#FF5733",
  user_id: userId
});

interface CategoriesState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category | undefined>;
  updateCategory: (id: number, category: Omit<Category, 'id'>) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
}

export const useCategoriesStore = create<CategoriesState>((set) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await CategoryApi.filter();
      const mappedCategories = response.objects.map(mapApiToUiCategory);
      set({ categories: mappedCategories, isLoading: false });
    } catch (error) {
      console.error('Error fetching categories:', error);
      set({ error: 'Failed to fetch categories', isLoading: false });
    }
  },

  addCategory: async (categoryData) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ error: 'User not authenticated' });
      return undefined;
    }
    
    try {
      set({ isLoading: true, error: null });
      const apiCategoryData = mapUiToApiCategory(categoryData, user.id);
      const category = await CategoryApi.create(apiCategoryData);
      const uiCategory = mapApiToUiCategory(category);
      
      set(state => ({
        categories: [...state.categories, uiCategory],
        isLoading: false
      }));
      
      return uiCategory;
    } catch (error) {
      console.error('Error adding category:', error);
      set({ error: 'Failed to add category', isLoading: false });
      return undefined;
    }
  },

  updateCategory: async (id, categoryData) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ error: 'User not authenticated' });
      return;
    }
    
    try {
      set({ isLoading: true, error: null });
      const apiCategoryData = mapUiToApiCategory(categoryData, user.id);
      const category = await CategoryApi.update(id, apiCategoryData);
      const uiCategory = mapApiToUiCategory(category);
      
      set(state => ({
        categories: state.categories.map(cat => 
          cat.id === id ? uiCategory : cat
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating category:', error);
      set({ error: 'Failed to update category', isLoading: false });
    }
  },

  deleteCategory: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await CategoryApi.delete(id);
      
      set(state => ({
        categories: state.categories.filter(cat => cat.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting category:', error);
      set({ error: 'Failed to delete category', isLoading: false });
    }
  }
})); 