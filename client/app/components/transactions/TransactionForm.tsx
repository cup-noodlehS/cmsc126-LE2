"use client";

import { useState, useEffect } from "react";
import { Transaction, Category } from "../../types";
import { CategoryForm } from "@/app/components/categories/CategoryForm";
import { useCategories } from "@/app/context/CategoryContext";

interface TransactionFormProps {
  transaction?: Transaction | null;
  onClose: () => void;
}

export function TransactionForm({ transaction, onClose }: TransactionFormProps) {
  // Form state
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  // Get categories from context instead of mock data
  const { categories, addCategory } = useCategories();
  
  // Initialize form with transaction data if editing
  useEffect(() => {
    if (transaction) {
      setTitle(transaction.title);
      // Store amount as positive and set type accordingly
      setAmount(Math.abs(transaction.amount).toString());
      setType(transaction.amount >= 0 ? "income" : "expense");
      setDate(transaction.date.substring(0, 10)); // Format YYYY-MM-DD
      setCategory(transaction.category);
      setNotes(transaction.notes || "");
    } else {
      // Default values for new transaction
      setDate(new Date().toISOString().substring(0, 10));
    }
  }, [transaction]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert amount to number and apply sign based on type
    const numericAmount = parseFloat(amount);
    const finalAmount = type === "expense" ? -Math.abs(numericAmount) : Math.abs(numericAmount);
    
    // Create transaction object
    const formData = {
      id: transaction?.id || Date.now(),
      title,
      amount: finalAmount,
      date,
      category,
      notes: notes || undefined,
    };
    
    // In a real app, this would save to API
    console.log("Saving transaction:", formData);
    
    // Close form
    onClose();
  };

  // Handle opening the category modal
  const handleOpenCategoryModal = () => {
    setIsCategoryModalOpen(true);
  };

  // Handle closing the category modal
  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
  };

  // Handle saving a new category
  const handleSaveCategory = (newCategory: Category) => {
    addCategory({
      name: newCategory.name,
      color: newCategory.color,
    });
    setCategory(newCategory.name);
    setIsCategoryModalOpen(false);
  };

  return (
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
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="" disabled>Select a category</option>
              {categories.map((cat: Category) => (
                <option 
                  key={cat.id} 
                  value={cat.name}
                  style={{ 
                    backgroundColor: cat.color,
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                >
                  {cat.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleOpenCategoryModal}
              className="mt-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
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

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Create New Category
            </h2>
            <CategoryForm 
              category={null} 
              onSave={handleSaveCategory} 
              onCancel={handleCloseCategoryModal} 
            />
          </div>
        </div>
      )}
    </form>
  );
} 