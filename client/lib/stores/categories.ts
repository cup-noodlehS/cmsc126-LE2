import { create } from 'zustand';
import { CategoryApi } from './budgethink';
import { CategoryReadInterface, CategoryWriteInterface } from '@/lib/types/budgethink';
import { useAuthStore } from './auth';

interface CategoriesState {
  categories: CategoryReadInterface[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  addCategory: (category: Omit<CategoryWriteInterface, 'user_id'>) => Promise<void>;
  updateCategory: (id: number, category: Omit<CategoryWriteInterface, 'user_id'>) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await CategoryApi.filter();
      set({ categories: response.objects, isLoading: false });
    } catch (error) {
      console.error('Error fetching categories:', error);
      set({ error: 'Failed to fetch categories', isLoading: false });
    }
  },

  addCategory: async (categoryData) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ error: 'User not authenticated' });
      return;
    }
    
    try {
      set({ isLoading: true, error: null });
      const category = await CategoryApi.create({
        ...categoryData,
        user_id: user.id,
      });
      
      set(state => ({
        categories: [...state.categories, category],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error adding category:', error);
      set({ error: 'Failed to add category', isLoading: false });
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
      const updatedCategory = await CategoryApi.update(id, {
        ...categoryData,
        user_id: user.id,
      });
      
      set(state => ({
        categories: state.categories.map(cat => 
          cat.id === id ? updatedCategory : cat
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