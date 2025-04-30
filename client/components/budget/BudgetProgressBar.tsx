import React from "react";
import { Budget, Category } from "../../app/types";

interface BudgetProgressBarProps {
  totalBudget: number | string;
  categoryBudgets: Budget[];
  categories: Category[];
  remaining: number | string;
}

export function BudgetProgressBar({ totalBudget, categoryBudgets, categories, remaining }: BudgetProgressBarProps) {
  // Parse values to ensure we're working with numbers
  const parsedTotalBudget = typeof totalBudget === 'string' ? parseFloat(totalBudget) : (totalBudget || 0);
  
  // Format currency helper
  const formatCurrency = (amount: number) => {
    // Handle NaN, undefined, or null values
    if (isNaN(amount) || amount === undefined || amount === null) {
      amount = 0;
    }
    return amount.toLocaleString('en-PH', { 
      style: 'currency', 
      currency: 'PHP' 
    });
  };

  // Debug values
  console.log('BudgetProgressBar received values:', { 
    totalBudget, 
    categoryBudgetsSum: categoryBudgets.reduce((sum, b) => {
      const amount = typeof b.amount === 'string' ? parseFloat(b.amount) : (b.amount || 0);
      return sum + amount;
    }, 0),
    categoryBudgets: categoryBudgets.map(b => b.amount),
    remaining,
    remainingType: typeof remaining
  });
  
  // Safely parse budget amounts accounting for string values
  const sumOfCategories = categoryBudgets.reduce((sum, budget) => {
    const amount = typeof budget.amount === 'string' ? parseFloat(budget.amount) : (budget.amount || 0);
    return sum + amount;
  }, 0);
  
  // Calculate actual remaining manually
  const calculatedRemaining = parsedTotalBudget - sumOfCategories;
  console.log('Calculated remaining:', calculatedRemaining);

  // Use the provided remaining or calculate it if it's invalid
  const parsedRemaining = typeof remaining === 'string' ? parseFloat(remaining) : remaining;
  const actualRemaining = !isNaN(parsedRemaining) ? parsedRemaining : calculatedRemaining;
  
  // Ensure remaining is a valid number
  const safeRemaining = isNaN(actualRemaining) ? 0 : actualRemaining;
  
  // Calculate the width percentage for each category
  const getCategoryColor = (categoryId: number | undefined) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.color : "#808080";
  };

  const getCategoryName = (categoryId: number | undefined) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : "Unknown";
  };

  // For this implementation, we'll assume expenses are tracked in a separate system
  // In a real app, you would fetch transaction data and calculate expenses here
  const segments = categoryBudgets.map((budget) => {
    // Parse budget amount if it's a string
    const budgetAmount = typeof budget.amount === 'string' ? parseFloat(budget.amount) : (budget.amount || 0);
    const width = parsedTotalBudget > 0 ? (budgetAmount / parsedTotalBudget) * 100 : 0;
    const categoryName = getCategoryName(budget.categoryId);
    // Placeholder for real expense data
    const expenses = 0; 
    const expensePercentage = 0;

    return {
      key: budget.id,
      width: `${width}%`,
      color: getCategoryColor(budget.categoryId),
      name: categoryName,
      budget: budgetAmount,
      expenses,
      expensePercentage
    };
  });

  // Remaining segment
  const remainingWidth = parsedTotalBudget > 0 ? (safeRemaining / parsedTotalBudget) * 100 : 0;
  // Ensure the width is a valid number between 0 and 100
  const safeRemainingWidth = isNaN(remainingWidth) || remainingWidth < 0 ? 0 : 
                             remainingWidth > 100 ? 100 : remainingWidth;

  return (
    <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-2">
        <div className="text-lg font-bold text-gray-900 dark:text-white">
          Total Budget:
          <span className="ml-2 text-blue-600 dark:text-blue-400 text-2xl">
            {formatCurrency(parsedTotalBudget)}
          </span>
        </div>
        <div className="text-lg font-bold text-gray-900 dark:text-white">
          Remaining:
          <span className={`ml-2 text-2xl ${safeRemaining < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            {formatCurrency(safeRemaining)}
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
              borderTopRightRadius: idx === segments.length - 1 && safeRemaining <= 0 ? '0.75rem' : 0,
              borderBottomRightRadius: idx === segments.length - 1 && safeRemaining <= 0 ? '0.75rem' : 0,
            }}
            title={seg.name}
          />
        ))}
        {safeRemaining > 0 && (
          <div
            className="h-full bg-gray-400 dark:bg-gray-500 transition-all duration-300"
            style={{
              width: `${safeRemainingWidth}%`,
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
                {formatCurrency(seg.expenses)} of {formatCurrency(seg.budget)}
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