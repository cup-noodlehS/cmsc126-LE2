"use client";

import { useState } from "react";
import { Layout } from "../components/layout/Layout";
import { BudgetForm } from "../components/budget/BudgetForm";
import { useBudgets } from "../context/BudgetContext";
import { useCategories } from "../context/CategoryContext";
import { Budget } from "../types";

export default function BudgetPage() {
  const { budgets, addBudget, updateBudget, deleteBudget } = useBudgets();
  const { categories } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);

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

  const handleSaveBudget = (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (currentBudget) {
      updateBudget(currentBudget.id, budget);
    } else {
      addBudget(budget);
    }
    setIsModalOpen(false);
  };

  const handleDeleteBudget = (id: number) => {
    deleteBudget(id);
  };

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
                {budgets.map((budget) => {
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
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {currentBudget ? 'Edit Budget' : 'Create Budget'}
              </h2>
              <BudgetForm
                initialData={currentBudget || undefined}
                onSubmit={handleSaveBudget}
                onCancel={handleCloseModal}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 