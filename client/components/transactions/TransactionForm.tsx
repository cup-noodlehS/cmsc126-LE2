"use client";

import { useState, useEffect } from "react";
import { Transaction, TransactionWriteInterface } from "../../app/types";
import { useAuthStore } from "@/lib/stores/auth";
import { CategoryReadInterface } from "@/lib/types/budgethink";
export interface TransactionFormProps {
  transaction?: Transaction | null;
  categories: CategoryReadInterface[];
  onSave: (transaction: TransactionWriteInterface) => void;
  onClose: () => void;
}

export function TransactionForm({ transaction, categories, onSave, onClose }: TransactionFormProps) {
  const { user } = useAuthStore();
  // Form state
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
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

  // Handle opening the category modal
  const handleOpenCategoryModal = () => {
    setIsCategoryModalOpen(true);
  };

  // Handle closing the category modal
  const handleCloseCategoryModal = () => {
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
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="" disabled>Select a category</option>
              {categories.map((cat: CategoryReadInterface) => (
                <option 
                  key={cat.id} 
                  value={cat.id.toString()}
                  style={{
                    backgroundColor: cat.hex_color,
                    color: "#FFFFFF"
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
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Add New Category
              </h2>
              <button 
                onClick={handleCloseCategoryModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* We'll comment out the CategoryForm for now since we're not implementing it */}
            <div className="p-4 text-center">
              <p>New category functionality is not implemented yet.</p>
              <button
                onClick={handleCloseCategoryModal}
                className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
} 