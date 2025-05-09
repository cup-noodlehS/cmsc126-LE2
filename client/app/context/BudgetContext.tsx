"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Budget, BudgetType } from "../types";
import { mockBudgets } from "../data/mockData";

interface BudgetContextType {
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBudget: (id: number, budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteBudget: (id: number) => void;
  getBudget: (id: number) => Budget | undefined;
  getBudgetsByMonth: (month: number, year: number) => Budget[];
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets);

  const addBudget = (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Check if a total budget already exists for this month and year
    if (budget.type === 'total') {
      const existingTotalBudget = budgets.find(
        b => b.type === 'total' && 
        b.month === budget.month && 
        b.year === budget.year
      );
      
      if (existingTotalBudget) {
        throw new Error('A total budget already exists for this period');
      }
    }

    // Check if a category budget already exists for this category, month, and year
    if (budget.type === 'category' && budget.categoryId) {
      const existingCategoryBudget = budgets.find(
        b => b.type === 'category' && 
        b.categoryId === budget.categoryId && 
        b.month === budget.month && 
        b.year === budget.year
      );
      
      if (existingCategoryBudget) {
        throw new Error('A budget already exists for this category in the selected period');
      }
    }

    const newBudget: Budget = {
      ...budget,
      id: Date.now(), // Temporary ID until backend integration
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setBudgets((prev) => [...prev, newBudget]);
  };

  const updateBudget = (id: number, budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Check if a total budget already exists for this month and year
    if (budget.type === 'total') {
      const existingTotalBudget = budgets.find(
        b => b.id !== id && 
        b.type === 'total' && 
        b.month === budget.month && 
        b.year === budget.year
      );
      
      if (existingTotalBudget) {
        throw new Error('A total budget already exists for this period');
      }
    }

    // Check if a category budget already exists for this category, month, and year
    if (budget.type === 'category' && budget.categoryId) {
      const existingCategoryBudget = budgets.find(
        b => b.id !== id && 
        b.type === 'category' && 
        b.categoryId === budget.categoryId && 
        b.month === budget.month && 
        b.year === budget.year
      );
      
      if (existingCategoryBudget) {
        throw new Error('A budget already exists for this category in the selected period');
      }
    }

    setBudgets((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...budget,
              id,
              createdAt: b.createdAt,
              updatedAt: new Date().toISOString(),
            }
          : b
      )
    );
  };

  const deleteBudget = (id: number) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  const getBudget = (id: number) => {
    return budgets.find((b) => b.id === id);
  };

  const getBudgetsByMonth = (month: number, year: number) => {
    return budgets.filter((b) => b.month === month && b.year === year);
  };

  return (
    <BudgetContext.Provider
      value={{
        budgets,
        addBudget,
        updateBudget,
        deleteBudget,
        getBudget,
        getBudgetsByMonth,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudgets() {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error("useBudgets must be used within a BudgetProvider");
  }
  return context;
} 