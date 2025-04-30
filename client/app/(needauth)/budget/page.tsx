"use client";

import { useState, useEffect, useCallback } from "react";
import { Layout } from "../../../components/layout/Layout";
import { BudgetForm } from "../../../components/budget/BudgetForm";
import { useBudgetStore } from "../../../lib/stores/budgets";
import { useCategoriesStore } from "../../../lib/stores/categories";
import { Budget } from "../../types";
import { BudgetProgressBar } from "../../../components/budget/BudgetProgressBar";
import { TransactionApi } from "@/lib/stores/budgethink";
import { TransactionReadInterface } from "@/lib/types/budgethink";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

// Function to determine if text should be black or white based on background color
const getContrastTextColor = (hexColor?: string): string => {
  // If hexColor is undefined or null, return white
  if (!hexColor) return '#FFFFFF';
  
  // Remove the # if present
  const hex = hexColor.replace('#', '');
  
  // Check if it's a valid hex color
  if (!/^([0-9A-F]{3}){1,2}$/i.test(hex)) {
    return '#FFFFFF'; // Default to white for invalid colors
  }
  
  // Convert hex to RGB
  const r = parseInt(hex.length === 3 ? hex.charAt(0) + hex.charAt(0) : hex.substr(0, 2), 16);
  const g = parseInt(hex.length === 3 ? hex.charAt(1) + hex.charAt(1) : hex.substr(2, 2), 16);
  const b = parseInt(hex.length === 3 ? hex.charAt(2) + hex.charAt(2) : hex.substr(4, 2), 16);
  
  // Calculate luminance using the formula for relative luminance in the sRGB color space
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for light backgrounds, white for dark backgrounds
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

export default function BudgetPage() {
  const { addBudget, updateBudget, deleteBudget, getBudgetsByMonth, fetchBudgets } = useBudgetStore();
  const { categories, fetchCategories } = useCategoriesStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Current month (1-12)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Current year
  const [refreshKey, setRefreshKey] = useState(0); // Used to trigger rerenders
  const [transactions, setTransactions] = useState<TransactionReadInterface[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);

  // Fetch data on component mount and when month/year changes
  useEffect(() => {
    fetchBudgets();
    fetchCategories();
    fetchTransactionsForMonth();
  }, [selectedMonth, selectedYear, refreshKey]);

  // Fetch transactions for the selected month and year
  const fetchTransactionsForMonth = async () => {
    try {
      // Format dates for API filter
      const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
      const lastDay = new Date(selectedYear, selectedMonth, 0).getDate(); // Get last day of the month
      const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      
      // Fetch transactions from the API with date range filter
      const response = await TransactionApi.filter({
        transaction_date__gte: startDate,
        transaction_date__lte: endDate
      });
      
      setTransactions(response.objects);
      console.log('Transactions for month:', response.objects);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const refreshData = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const getCategoryInfo = (categoryId: number | undefined) => {
    if (!categoryId) return { name: 'N/A', color: '#808080' };
    const category = categories.find(c => c.id === categoryId);
    return category ? { name: category.name, color: category.color } : { name: 'Unknown Category', color: '#808080' };
  };

  const handleCreateBudget = () => {
    // Check if a total budget already exists for the selected month/year
    
    // If a total budget exists, we'll default to creating a category budget
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
    try {
      // Check if trying to add a total budget
      if (budget.type === 'total') {
        // Check if we're updating an existing total budget
        const isUpdating = currentBudget && currentBudget.type === 'total';
        
        // If not updating, check if a total budget already exists for this month/year
        if (!isUpdating) {
          const existingTotalBudget = filteredBudgets.find(b => 
            b.type === 'total' && 
            b.month === budget.month && 
            b.year === budget.year
          );
          
          if (existingTotalBudget) {
            alert('A total budget already exists for this month. You can only have one total budget per month.');
            return;
          }
        }
      }
      
      // For category budgets, check if they exceed the total budget
      if (budget.type === 'category') {
        const budgetAmount = parseAmount(budget.amount);
        const currentBudgetAmount = currentBudget && currentBudget.type === 'category' ? parseAmount(currentBudget.amount) : 0;
        
        // Calculate what the new sum would be if this budget is added/updated
        const newSum = sumCategoryBudgets - currentBudgetAmount + budgetAmount;
        
        // Check if this would exceed the total budget
        if (parseAmount(totalBudget) > 0 && newSum > parseAmount(totalBudget)) {
          alert(`This budget would exceed your total budget for this period. Remaining budget available: ${formatCurrency(remainingBudget + currentBudgetAmount)}`);
          return;
        }
      }
      
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
      setIsDeleting(true);
      await deleteBudget(id);
      refreshData(); // Refresh data after delete
      setIsDeleteModalOpen(false);
      setBudgetToDelete(null);
    } catch (error) {
      console.error("Error deleting budget:", error);
      alert("Failed to delete budget. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteModal = (budget: Budget) => {
    setBudgetToDelete(budget);
    setIsDeleteModalOpen(true);
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
  
  // Ensure we're working with numbers
  const parseAmount = (amount: number | string | undefined | null): number => {
    if (typeof amount === 'string') return parseFloat(amount) || 0;
    return typeof amount === 'number' ? amount : 0;
  };
  
  // Format currency helper
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('en-PH', {
      style: 'currency',
      currency: 'PHP',
    });
  };
  
  // Calculate sum with safe handling - no toFixed 
  const sumCategoryBudgets = categoryBudgets.reduce(
    (sum, b) => sum + parseAmount(b.amount), 
    0
  );
  
  // Calculate spent amounts per category
  const getSpentAmountByCategory = (categoryId?: number): number => {
    return transactions
      .filter(t => 
        // If categoryId is undefined, sum up transactions without a category
        (categoryId === undefined ? !t.category : t.category?.id === categoryId) && 
        t.type === 'expense'
      )
      .reduce((sum, t) => sum + parseAmount(t.amount), 0);
  };

  // Calculate total spent this month (all categories)
  const totalSpent = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseAmount(t.amount), 0);
  
  // Calculate category budgets with spent amounts
  const categoryBudgetsWithSpent = categoryBudgets.map(budget => {
    const spent = getSpentAmountByCategory(budget.categoryId);
    return {
      ...budget,
      spent,
      remaining: parseAmount(budget.amount) - spent
    };
  });
  
  // Calculate unallocated transaction amounts (expenses without a category)
  const unallocatedSpent = getSpentAmountByCategory(undefined);
  
  // Calculate remaining budget considering actual spending
  const actualRemainingBudget = parseAmount(totalBudget) - totalSpent;
  
  // Calculate remaining budget (not considering actual spending)
  const remainingBudget = parseAmount(totalBudget) - sumCategoryBudgets;
  
  // Debug values
  console.log('Budget calculation:', {
    totalBudget,
    categoryBudgets: categoryBudgets.map(b => ({ name: getCategoryInfo(b.categoryId).name, amount: b.amount })),
    sumCategoryBudgets,
    remainingBudget,
    totalSpent,
    actualRemainingBudget,
    categoryBudgetsWithSpent,
    unallocatedSpent
  });
  
  const overBudget = sumCategoryBudgets > totalBudget && totalBudget > 0;
  const overActualBudget = totalSpent > parseAmount(totalBudget) && parseAmount(totalBudget) > 0;

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

        {/* Budget Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Budget</h3>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(parseAmount(totalBudget))}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Spent</h3>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(totalSpent)}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Actual Remaining</h3>
            <p className={`text-2xl font-bold ${actualRemainingBudget < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
              {formatCurrency(actualRemainingBudget)}
            </p>
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
          <div className="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 rounded shadow">
            Warning: The sum of category budgets exceeds the total budget for this period!
          </div>
        )}
        
        {overActualBudget && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded shadow">
            Alert: You have spent more than your total budget for this period!
          </div>
        )}

        {/* Category Spending Table */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white p-4 border-b border-gray-200 dark:border-gray-700">
            Category Spending
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Budget
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Spent
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Remaining
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {categoryBudgetsWithSpent.map((budget) => {
                  const categoryInfo = getCategoryInfo(budget.categoryId);
                  const percentage = parseAmount(budget.amount) > 0 
                    ? (budget.spent / parseAmount(budget.amount)) * 100 
                    : 0;
                  const isOverBudget = budget.spent > parseAmount(budget.amount);
                  
                  return (
                    <tr key={budget.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          <span 
                            className="px-2 py-1 text-xs rounded-full mr-2"
                            style={{ 
                              backgroundColor: categoryInfo.color,
                              color: getContrastTextColor(categoryInfo.color)
                            }}
                          >
                            {categoryInfo.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatCurrency(parseAmount(budget.amount))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatCurrency(budget.spent)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {formatCurrency(budget.remaining)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${isOverBudget ? 'bg-red-600' : 'bg-green-600'}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                          {percentage.toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
                
                {/* Unallocated spending row */}
                {unallocatedSpent > 0 && (
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 bg-gray-50 dark:bg-gray-900">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center">
                        <span 
                          className="px-2 py-1 text-xs rounded-full mr-2"
                          style={{ 
                            backgroundColor: "#808080",
                            color: getContrastTextColor("#808080")
                          }}
                        >
                          Unallocated Expenses
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      N/A
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400 font-medium">
                      {formatCurrency(unallocatedSpent)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      N/A
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Not budgeted
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Budget List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white p-4 border-b border-gray-200 dark:border-gray-700">
            Budget Allocations
          </h2>
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
                            className="px-2 py-1 text-xs rounded-full"
                            style={{ 
                              backgroundColor: categoryInfo.color,
                              color: getContrastTextColor(categoryInfo.color)
                            }}
                          >
                            {categoryInfo.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatCurrency(parseAmount(budget.amount))}
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
                            onClick={() => openDeleteModal(budget)}
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
                      No budgets found for this period. Click &quot;Add Budget&quot; to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Budget Modal */}
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

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          title={`Delete ${budgetToDelete?.type === 'total' ? 'Total' : 'Category'} Budget`}
          message={
            budgetToDelete?.type === 'total'
              ? `Are you sure you want to delete the total budget for ${new Date(2000, budgetToDelete?.month - 1).toLocaleString('default', { month: 'long' })} ${budgetToDelete?.year}?`
              : `Are you sure you want to delete the budget for ${getCategoryInfo(budgetToDelete?.categoryId).name}?`
          }
          itemName={
            budgetToDelete
              ? `${formatCurrency(parseAmount(budgetToDelete.amount))} - ${
                  new Date(2000, budgetToDelete.month - 1).toLocaleString('default', { month: 'long' })
                } ${budgetToDelete.year}`
              : ''
          }
          itemType="budget"
          onConfirm={() => budgetToDelete && handleDeleteBudget(budgetToDelete.id)}
          onCancel={() => {
            setIsDeleteModalOpen(false);
            setBudgetToDelete(null);
          }}
          isDeleting={isDeleting}
        />
      </div>
    </Layout>
  );
} 