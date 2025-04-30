"use client";

import { useState, useEffect, useCallback } from "react";
import { Layout } from "../../../components/layout/Layout";
import { BudgetForm } from "../../../components/budget/BudgetForm";
import { useBudgetStore } from "../../../lib/stores/budgets";
import { useCategoriesStore } from "../../../lib/stores/categories";
import { Budget } from "../../types";
import { BudgetProgressBar } from "../../../components/budget/BudgetProgressBar";

export default function BudgetPage() {
  const { budgets, addBudget, updateBudget, deleteBudget, getBudgetsByMonth, fetchBudgets } = useBudgetStore();
  const { categories, fetchCategories } = useCategoriesStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(3); // March
  const [selectedYear, setSelectedYear] = useState(2025);
  const [refreshKey, setRefreshKey] = useState(0); // Used to trigger rerenders

  // Fetch data on component mount and when month/year changes
  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, [selectedMonth, selectedYear, refreshKey]);

  const refreshData = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const getCategoryInfo = (categoryId: number | undefined) => {
    if (!categoryId) return { name: 'N/A', color: '#808080' };
    const category = categories.find(c => c.id === categoryId);
    return category ? { name: category.name, color: category.color } : { name: 'Unknown Category', color: '#808080' };
  };

  const handleCreateBudget = () => {
    setCurrentBudget(null);
    setIsModalOpen(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setCurrentBudget(budget);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentBudget(null);
  };

  const handleSaveBudget = async (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (budget.type === 'category') {
      const newSum = sumCategoryBudgets + budget.amount - (currentBudget && currentBudget.type === 'category' ? currentBudget.amount : 0);
      if (totalBudget > 0 && newSum > totalBudget) {
        alert('Adding this category budget would exceed the total budget for this period.');
        return;
      }
    }
    
    try {
      if (currentBudget) {
        await updateBudget(currentBudget.id, budget);
      } else {
        await addBudget(budget);
      }
      setIsModalOpen(false);
      refreshData(); // Refresh data after save
    } catch (error) {
      console.error("Error saving budget:", error);
      alert("Failed to save budget. Please try again.");
    }
  };

  const handleDeleteBudget = async (id: number) => {
    try {
      await deleteBudget(id);
      refreshData(); // Refresh data after delete
    } catch (error) {
      console.error("Error deleting budget:", error);
      alert("Failed to delete budget. Please try again.");
    }
  };

  const handleMonthChange = (newMonth: number) => {
    setSelectedMonth(newMonth);
    refreshData();
  };

  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear);
    refreshData();
  };

  const filteredBudgets = getBudgetsByMonth(selectedMonth, selectedYear);
  const totalBudgetObj = filteredBudgets.find(b => b.type === 'total');
  const totalBudget = totalBudgetObj ? totalBudgetObj.amount : 0;
  const categoryBudgets = filteredBudgets.filter(b => b.type === 'category');
  const sumCategoryBudgets = categoryBudgets.reduce((sum, b) => sum + b.amount, 0);
  const remainingBudget = totalBudget - sumCategoryBudgets;
  const overBudget = sumCategoryBudgets > totalBudget && totalBudget > 0;

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budgets</h1>
          <button
            onClick={handleCreateBudget}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Budget
          </button>
        </div>

        {/* Month/Year Filter */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="month" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Month
            </label>
            <select
              id="month"
              value={selectedMonth}
              onChange={(e) => handleMonthChange(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Year
            </label>
            <input
              type="number"
              id="year"
              value={selectedYear}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              min="2000"
              max="2100"
            />
          </div>
        </div>

        {/* Progress Bar */}
        <BudgetProgressBar
          totalBudget={totalBudget}
          categoryBudgets={categoryBudgets}
          categories={categories}
          remaining={remainingBudget}
        />

        {/* Budget Summary */}
        {overBudget && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded shadow">
            Warning: The sum of category budgets exceeds the total budget for this period!
          </div>
        )}

        {/* Budget List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Period
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredBudgets.length > 0 ? (
                  filteredBudgets.map((budget) => {
                    const categoryInfo = getCategoryInfo(budget.categoryId);
                    return (
                      <tr key={budget.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {budget.type === 'total' ? 'Total Budget' : 'Category Budget'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <span 
                            className="px-2 py-1 text-xs rounded-full text-white"
                            style={{ 
                              backgroundColor: categoryInfo.color,
                              color: '#FFFFFF' 
                            }}
                          >
                            {categoryInfo.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {budget.amount.toLocaleString('en-PH', {
                            style: 'currency',
                            currency: 'PHP',
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(2000, budget.month - 1).toLocaleString('default', { month: 'long' })} {budget.year}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditBudget(budget)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteBudget(budget.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No budgets found for this period. Click "Add Budget" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {currentBudget ? 'Edit Budget' : 'Add Budget'}
              </h2>
              <BudgetForm
                initialData={currentBudget || undefined}
                onSubmit={handleSaveBudget}
                onCancel={handleCloseModal}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 