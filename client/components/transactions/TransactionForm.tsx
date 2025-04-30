"use client";

import { useState, useEffect } from "react";
import { Transaction, TransactionWriteInterface } from "../../app/types";
import { useAuthStore } from "@/lib/stores/auth";
import { CategoryReadInterface } from "@/lib/types/budgethink";
import { useCategoriesStore } from "@/lib/stores/categories";
import { CategoryForm } from "@/components/categories/CategoryForm";

export interface TransactionFormProps {
  transaction?: Transaction | null;
  categories: CategoryReadInterface[];
  onSave: (transaction: TransactionWriteInterface) => void;
  onClose: () => void;
}

export function TransactionForm({ transaction, categories: propCategories, onSave, onClose }: TransactionFormProps) {
  const { user } = useAuthStore();
  const { addCategory } = useCategoriesStore();
  
  // Local categories state that can be updated when a new category is added
  const [categories, setCategories] = useState<CategoryReadInterface[]>([]);
  
  // Form state
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  
  // New category modal state
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  
  // Initialize categories from props
  useEffect(() => {
    setCategories(propCategories);
  }, [propCategories]);
  
  // Initialize form with transaction data if editing
  useEffect(() => {
    if (transaction) {
      setTitle(transaction.title);
      // Store amount as positive
      setAmount(Math.abs(transaction.amount).toString());
      setType(transaction.type);
      setDate(transaction.transaction_date.substring(0, 10)); // Format YYYY-MM-DD
      
      // Set category ID if exists
      setCategoryId(transaction.category?.id.toString() || "");
      
      setNotes(transaction.description || "");
    } else {
      // Default values for new transaction
      setDate(new Date().toISOString().substring(0, 10));
    }
  }, [transaction, categories]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Convert amount to number
    const numericAmount = parseFloat(amount);
    
    // Create transaction object
    const formData: TransactionWriteInterface = {
      title,
      amount: numericAmount,
      type: type,
      transaction_date: date,
      category_id: categoryId ? parseInt(categoryId) : null,
      description: notes || null,
      user_id: user.id
    };
    
    // Save transaction via callback
    onSave(formData);
  };

  const handleAddCategory = async (categoryData: { name: string, color: string }) => {
    try {
      // Add the category
      const newCategory = await addCategory({
        name: categoryData.name,
        color: categoryData.color
      });
      
      // Close the modal
      setIsNewCategoryModalOpen(false);
      
      // If the category was successfully created
      if (newCategory && newCategory.id) {
        // Add the new category to our local categories state
        const newCategoryAsReadInterface: CategoryReadInterface = {
          id: newCategory.id,
          name: newCategory.name,
          hex_color: newCategory.color,
          total_income: 0,
          income_count: 0,
          total_expense: 0,
          expense_count: 0,
          total_balance: 0,
          transactions_count: 0,
          user_id: user?.id || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Update local categories list
        setCategories(prevCategories => [...prevCategories, newCategoryAsReadInterface]);
        
        // Set the newly created category as selected
        setCategoryId(newCategory.id.toString());
      }
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Transaction Type
            </label>
            <div className="flex rounded-md shadow-sm">
              <button
                type="button"
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-md border focus:outline-none ${
                  type === "expense"
                    ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                }`}
                onClick={() => setType("expense")}
              >
                Expense
              </button>
              <button
                type="button"
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-md border focus:outline-none ${
                  type === "income"
                    ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                }`}
                onClick={() => setType("income")}
              >
                Income
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title
            </label>
            <input
              type="text"
              id="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="E.g., Grocery shopping, Salary payment..."
            />
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Amount
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400 sm:text-sm">₱</span>
              </div>
              <input
                type="number"
                id="amount"
                required
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="0.00"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400 sm:text-sm">PHP</span>
              </div>
            </div>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date
            </label>
            <input
              type="date"
              id="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Category
            </label>
            <div className="flex gap-2">
              <select
                id="category"
                required
                value={categoryId}
                onChange={(e) => {
                  const value = e.target.value;
                  setCategoryId(value);
                  
                  // If "Add new category" is selected, open the modal automatically
                  if (value === "add_new") {
                    setIsNewCategoryModalOpen(true);
                  }
                }}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="" disabled>Select a category</option>
                {categories.map((cat: CategoryReadInterface) => (
                  <option 
                    key={cat.id} 
                    value={cat.id.toString()}
                  >
                    {cat.name}
                  </option>
                ))}
                <option value="add_new" className="font-medium text-blue-600 dark:text-blue-400">+ Add new category</option>
              </select>
              <button
                type="button"
                onClick={() => setIsNewCategoryModalOpen(true)}
                className="mt-1 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Add any additional details here..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              {transaction ? "Update Transaction" : "Add Transaction"}
            </button>
          </div>
        </div>
      </form>

      {/* New Category Modal */}
      {isNewCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create New Category
              </h2>
              <button
                onClick={() => setIsNewCategoryModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <CategoryForm 
              category={null} 
              onSave={handleAddCategory} 
              onCancel={() => setIsNewCategoryModalOpen(false)} 
            />
          </div>
        </div>
      )}
    </>
  );
} 