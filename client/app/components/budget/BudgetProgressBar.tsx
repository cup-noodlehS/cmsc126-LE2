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
    <div className="mb-4">
      <div className="flex w-full h-6 rounded overflow-hidden shadow bg-gray-200 dark:bg-gray-700">
        {segments.map(seg => (
          <div
            key={seg.key}
            className="h-full"
            style={{ width: seg.width, backgroundColor: seg.color }}
            title={seg.name}
          />
        ))}
        {remaining > 0 && (
          <div
            className="h-full bg-gray-400 dark:bg-gray-500"
            style={{ width: `${remainingWidth}%` }}
            title="Remaining"
          />
        )}
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-700 dark:text-gray-300">
        <span>Total: {totalBudget.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}</span>
        <span>Remaining: {remaining.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}</span>
      </div>
    </div>
  );
} 