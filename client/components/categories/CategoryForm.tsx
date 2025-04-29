"use client";

import { useState, useEffect } from "react";

interface Category {
  id: number;
  name: string;
  color: string;
}

interface CategoryFormProps {
  category: Category | null;
  onSave: (category: { name: string, color: string }) => void;
  onCancel: () => void;
}

export function CategoryForm({ category, onSave, onCancel }: CategoryFormProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#FF5733");
  const [errors, setErrors] = useState({ name: "" });

  useEffect(() => {
    if (category) {
      setName(category.name);
      setColor(category.color);
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!name.trim()) {
      setErrors({ name: "Category name is required" });
      return;
    }

    onSave({
      name,
      color
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label 
          htmlFor="name" 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Category Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (e.target.value.trim()) {
              setErrors({ ...errors, name: "" });
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Enter category name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
        )}
      </div>

      <div className="mb-6">
        <label 
          htmlFor="color" 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Category Color
        </label>
        <div className="flex items-center">
          <input
            type="color"
            id="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-10 w-10 border-none cursor-pointer"
          />
          <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">{color}</span>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {category ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
} 