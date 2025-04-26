"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Category } from "../types";

interface CategoryContextProps {
  categories: Category[];
  addCategory: (category: Omit<Category, "id">) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: number) => void;
}

const CategoryContext = createContext<CategoryContextProps | undefined>(undefined);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: "Food", color: "#FF5733" },
    { id: 2, name: "Transport", color: "#33FF57" },
    { id: 3, name: "Entertainment", color: "#3357FF" }
  ]);

  const addCategory = (category: Omit<Category, "id">) => {
    const newId = categories.length > 0 
      ? Math.max(...categories.map(c => c.id)) + 1 
      : 1;
    
    setCategories([...categories, { ...category, id: newId }]);
  };

  const updateCategory = (updatedCategory: Category) => {
    setCategories(categories.map(category => 
      category.id === updatedCategory.id ? updatedCategory : category
    ));
  };

  const deleteCategory = (id: number) => {
    setCategories(categories.filter(category => category.id !== id));
  };

  return (
    <CategoryContext.Provider value={{ categories, addCategory, updateCategory, deleteCategory }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
} 