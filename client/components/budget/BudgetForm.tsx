"use client";

import { useState, useEffect } from "react";
import { Budget, BudgetType, Category } from "../../app/types";
import { useCategories } from "../../app/context/CategoryContext";

interface BudgetFormProps {
  initialData?: Budget;
  onSubmit: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function BudgetForm({ initialData, onSubmit, onCancel }: BudgetFormProps) {
  const { categories } = useCategories();
  const [type, setType] = useState<BudgetType>(initialData?.type || "total");
  const [categoryId, setCategoryId] = useState<number | undefined>(initialData?.categoryId);
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "");
  const [month, setMonth] = useState(initialData?.month || new Date().getMonth() + 1);
  const [year, setYear] = useState(initialData?.year || new Date().getFullYear());

  useEffect(() => {
    if (type === "total") {
      setCategoryId(undefined);
    }
  }, [type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    onSubmit({
      type,
      categoryId: type === "category" ? categoryId : undefined,
      amount: Number(amount),
      month,
      year,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type Toggle */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1">Budget Type</label>
        <div className="flex gap-2">
          <button
            type="button"
            className={`flex-1 px-4 py-2 rounded-md font-semibold transition-colors ${type === 'total' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            onClick={() => setType('total')}
          >
            Total
          </button>
          <button
            type="button"
            className={`flex-1 px-4 py-2 rounded-md font-semibold transition-colors ${type === 'category' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            onClick={() => setType('category')}
          >
            Category
          </button>
        </div>
      </div>

      {/* Category Dropdown or Placeholder */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1">Category</label>
        {type === 'category' ? (
          <select
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={categoryId ?? ''}
            onChange={e => setCategoryId(Number(e.target.value))}
            required
          >
            <option value="" disabled>Select a category</option>
            {categories.map((cat: Category) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        ) : (
          <input
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-gray-400 cursor-not-allowed"
            value="Total"
            disabled
          />
        )}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1">Amount</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">₱</span>
          </div>
          <input
            type="number"
            min="0.01"
            step="0.01"
            className="block w-full pl-7 pr-12 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">PHP</span>
          </div>
        </div>
      </div>

      {/* Date (Month/Year) */}
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-200 mb-1">Month</label>
          <select
            className="block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white"
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
            required
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-200 mb-1">Year</label>
          <input
            type="number"
            className="block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white"
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            min="2000"
            max="2100"
            required
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 mt-6">
        <button
          type="button"
          className="px-4 py-2 rounded-md bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
        >
          {initialData ? 'Save Changes' : 'Add Budget'}
        </button>
      </div>
    </form>
  );
} 