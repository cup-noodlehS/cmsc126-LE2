import React from "react";
import { Budget, Category } from "../../types";

interface BudgetProgressBarProps {
  totalBudget: number;
  categoryBudgets: Budget[];
  categories: Category[];
  remaining: number;
}

export function BudgetProgressBar({ totalBudget, categoryBudgets, categories, remaining }: BudgetProgressBarProps) {
  // Calculate the width percentage for each category
  const getCategoryColor = (categoryId: number | undefined) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.color : "#808080";
  };

  const segments = categoryBudgets.map((budget) => {
    const width = totalBudget > 0 ? (budget.amount / totalBudget) * 100 : 0;
    return {
      key: budget.id,
      width: `${width}%`,
      color: getCategoryColor(budget.categoryId),
      name: categories.find(c => c.id === budget.categoryId)?.name || "Category"
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
      <hr className="my-3 border-gray-300 dark:border-gray-700" />
      <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-700 dark:text-gray-300">
        {segments.map(seg => (
          <span key={seg.key} className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
            {seg.name}
          </span>
        ))}
        {remaining > 0 && (
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-500" />
            Remaining
          </span>
        )}
      </div>
    </div>
  );
} 