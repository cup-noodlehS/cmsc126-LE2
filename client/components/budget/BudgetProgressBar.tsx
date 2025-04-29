import React from "react";
import { Budget, Category } from "../../app/types";
import { mockTransactions } from "../../app/data/mockData";

interface BudgetProgressBarProps {
  totalBudget: number;
  categoryBudgets: Budget[];
  categories: Category[];
  remaining: number;
}

interface CategoryExpenses {
  [key: string]: number;
}

export function BudgetProgressBar({ totalBudget, categoryBudgets, categories, remaining }: BudgetProgressBarProps) {
  // Calculate the width percentage for each category
  const getCategoryColor = (categoryId: number | undefined) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.color : "#808080";
  };

  const getCategoryName = (categoryId: number | undefined) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : "Unknown";
  };

  // Calculate expenses for each category for the current month and year
  const calculateCategoryExpenses = () => {
    const expenses: CategoryExpenses = {};
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based
    const currentYear = currentDate.getFullYear();

    mockTransactions.forEach(transaction => {
      if (transaction.amount < 0) { // Only consider expenses (negative amounts)
        const transactionDate = new Date(transaction.date);
        const transactionMonth = transactionDate.getMonth() + 1;
        const transactionYear = transactionDate.getFullYear();

        if (transactionMonth === currentMonth && transactionYear === currentYear) {
          const categoryName = transaction.category;
          if (!expenses[categoryName]) {
            expenses[categoryName] = 0;
          }
          expenses[categoryName] += Math.abs(transaction.amount);
        }
      }
    });
    return expenses;
  };

  const categoryExpenses = calculateCategoryExpenses();

  const segments = categoryBudgets.map((budget) => {
    const width = totalBudget > 0 ? (budget.amount / totalBudget) * 100 : 0;
    const categoryName = getCategoryName(budget.categoryId);
    const expenses = categoryExpenses[categoryName] || 0;
    const expensePercentage = budget.amount > 0 ? (expenses / budget.amount) * 100 : 0;

    return {
      key: budget.id,
      width: `${width}%`,
      color: getCategoryColor(budget.categoryId),
      name: categoryName,
      budget: budget.amount,
      expenses,
      expensePercentage: Math.min(expensePercentage, 100)
    };
  });

  // Remaining segment
  const remainingWidth = totalBudget > 0 ? (remaining / totalBudget) * 100 : 0;

  return (
    <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-2">
        <div className="text-lg font-bold text-gray-900 dark:text-white">
          Total Budget:
          <span className="ml-2 text-blue-600 dark:text-blue-400 text-2xl">
            {totalBudget.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
          </span>
        </div>
        <div className="text-lg font-bold text-gray-900 dark:text-white">
          Remaining:
          <span className={`ml-2 text-2xl ${remaining < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            {remaining.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
          </span>
        </div>
      </div>
      <hr className="my-3 border-gray-300 dark:border-gray-700" />
      
      {/* Main progress bar */}
      <div className="flex w-full h-10 rounded-xl overflow-hidden shadow border border-gray-300 dark:border-gray-700 bg-gray-200 dark:bg-gray-700">
        {segments.map((seg, idx) => (
          <div
            key={seg.key}
            className="h-full transition-all duration-300"
            style={{
              width: seg.width,
              backgroundColor: seg.color,
              borderTopLeftRadius: idx === 0 ? '0.75rem' : 0,
              borderBottomLeftRadius: idx === 0 ? '0.75rem' : 0,
              borderTopRightRadius: idx === segments.length - 1 && remaining <= 0 ? '0.75rem' : 0,
              borderBottomRightRadius: idx === segments.length - 1 && remaining <= 0 ? '0.75rem' : 0,
            }}
            title={seg.name}
          />
        ))}
        {remaining > 0 && (
          <div
            className="h-full bg-gray-400 dark:bg-gray-500 transition-all duration-300"
            style={{
              width: `${remainingWidth}%`,
              borderTopRightRadius: '0.75rem',
              borderBottomRightRadius: '0.75rem',
            }}
            title="Remaining"
          />
        )}
      </div>

      {/* Category sub-progress bars */}
      <div className="mt-6 space-y-4">
        {segments.map((seg) => (
          <div key={seg.key} className="space-y-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{seg.name}</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {seg.expenses.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })} of {seg.budget.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${seg.expensePercentage}%`,
                  backgroundColor: seg.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 