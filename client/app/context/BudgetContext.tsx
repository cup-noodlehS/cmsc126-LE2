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
    const newBudget: Budget = {
      ...budget,
      id: Date.now(), // Temporary ID until backend integration
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setBudgets((prev) => [...prev, newBudget]);
  };

  const updateBudget = (id: number, budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => {
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