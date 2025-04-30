"use client";

import { useState, useEffect } from "react";
import { useCategoriesStore } from "@/lib/stores/categories";
import { CategoryForm } from "@/components/categories/CategoryForm";
import { Layout } from "@/components/layout/Layout";
import { Category } from "@/app/types";
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
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance using the formula for relative luminance in the sRGB color space
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for light backgrounds, white for dark backgrounds
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

export default function CategoriesPage() {
  const { categories, isLoading, error, fetchCategories, addCategory, updateCategory, deleteCategory } = useCategoriesStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  
  // States for delete confirmation
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreateCategory = () => {
    setCurrentCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setCurrentCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCategory(null);
  };

  const handleSaveCategory = async (category: { name: string, color: string }) => {
    if (currentCategory) {
      // Update existing category
      await updateCategory(currentCategory.id, {
        name: category.name,
        color: category.color,
      });
    } else {
      // Add new category
      await addCategory({
        name: category.name,
        color: category.color,
      });
    }
    setIsModalOpen(false);
  };

  const openDeleteModal = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    try {
      setIsDeleting(true);
      await deleteCategory(categoryToDelete.id);
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Format currency helper
  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
          <button
            onClick={handleCreateCategory}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Category
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-100 rounded-md">
            {error}
          </div>
        )}

        {/* Loading state */}
        {isLoading && !categories.length ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700 dark:border-gray-300"></div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Loading categories...</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Expenses
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Income
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        <span 
                          className="px-3 py-1.5 text-xs rounded-full"
                          style={{ 
                            backgroundColor: category.color,
                            color: getContrastTextColor(category.color)
                          }}
                        >
                          {category.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(category.total_expense || 0)} ({category.expense_count || 0})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(category.total_income || 0)} ({category.income_count || 0})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal(category)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        <span 
                          className="px-3 py-1.5 text-xs rounded-full"
                          style={{ 
                            backgroundColor: '#808080',
                            color: getContrastTextColor('#808080')
                          }}
                        >
                          No Category
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(0)} (0)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(0)} (0)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {/* No actions for "No Category" */}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Category Form Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {currentCategory ? "Edit Category" : "Create Category"}
              </h2>
              <CategoryForm 
                category={
                  currentCategory ? 
                  {
                    id: currentCategory.id,
                    name: currentCategory.name,
                    color: currentCategory.color
                  } : null
                } 
                onSave={handleSaveCategory} 
                onCancel={handleCloseModal} 
              />
            </div>
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          title="Delete Category"
          message={
            categoryToDelete && (categoryToDelete.expense_count || categoryToDelete.income_count)
              ? `This category has ${categoryToDelete.expense_count || 0} expense(s) and ${categoryToDelete.income_count || 0} income transaction(s) associated with it. Are you sure you want to delete it?`
              : "Are you sure you want to delete this category?"
          }
          itemName={categoryToDelete ? 
            `${categoryToDelete.name} ${
              (categoryToDelete.expense_count || categoryToDelete.income_count) 
                ? `(${formatCurrency(categoryToDelete.total_expense || 0)} in expenses, ${formatCurrency(categoryToDelete.total_income || 0)} in income)`
                : ''
            }` 
            : ''
          }
          itemType="category"
          onConfirm={handleDeleteCategory}
          onCancel={() => {
            setIsDeleteModalOpen(false);
            setCategoryToDelete(null);
          }}
          isDeleting={isDeleting}
        />
      </div>
    </Layout>
  );
} 