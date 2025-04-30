"use client";

import { useState, useEffect } from "react";
import { Budget, BudgetType, Category } from "../../app/types";
import { useCategoriesStore } from "../../lib/stores/categories";
import { useBudgetStore } from "../../lib/stores/budgets";

interface BudgetFormProps {
  initialData?: Budget;
  onSubmit: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  selectedMonth?: number;
  selectedYear?: number;
}

export function BudgetForm({ initialData, onSubmit, onCancel, selectedMonth, selectedYear }: BudgetFormProps) {
  const { categories } = useCategoriesStore();
  const { budgets } = useBudgetStore();
  const [type, setType] = useState<BudgetType>(initialData?.type || "total");
  const [categoryId, setCategoryId] = useState<number | undefined>(initialData?.categoryId);
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "");
  const [month, setMonth] = useState(initialData?.month || selectedMonth || new Date().getMonth() + 1);
  const [year, setYear] = useState(initialData?.year || selectedYear || new Date().getFullYear());

  // Update month and year when selectedMonth or selectedYear props change
  useEffect(() => {
    if (selectedMonth && !initialData) {
      setMonth(selectedMonth);
    }
    if (selectedYear && !initialData) {
      setYear(selectedYear);
    }
  }, [selectedMonth, selectedYear, initialData]);

  // Get categories that already have budgets for the selected month and year
  const existingCategoryBudgets = budgets.filter(
    b => b.type === 'category' && b.month === month && b.year === year
  ).map(b => b.categoryId);

  // Check if a total budget exists for the selected month and year
  const hasTotalBudget = budgets.some(
    b => b.type === 'total' && b.month === month && b.year === year
  );

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
            disabled={hasTotalBudget && !initialData}
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
            {categories.map((cat: Category) => {
              const isDisabled = existingCategoryBudgets.includes(cat.id) && initialData?.categoryId !== cat.id;
              return (
                <option 
                  key={cat.id} 
                  value={cat.id}
                  disabled={isDisabled}
                  className={isDisabled ? 'bg-gray-700 text-gray-400' : ''}
                >
                  {cat.name}
                </option>
              );
            })}
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
        <input
          type="number"
          className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          min="0"
          step="0.01"
        />
      </div>

      {/* Month and Year */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">Month</label>
          <select
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            required
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">Year</label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            required
            min="2000"
            max="2100"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="px-4 py-2 text-gray-300 hover:text-white"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {initialData ? 'Update' : 'Create'} Budget
        </button>
      </div>
    </form>
  );
} 