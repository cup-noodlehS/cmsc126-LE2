"use client";

import { useState, useEffect } from "react";
import { TransactionsList } from "./TransactionsList";
import { TransactionForm } from "./TransactionForm";
import { TransactionApi, CategoryApi } from "@/lib/stores/budgethink";
import { 
  Transaction, 
  Category, 
  TransactionWriteInterface
} from "@/app/types";
import { useAuthStore } from "@/lib/stores/auth";

type TransactionType = "all" | "income" | "expense";
type SortField = "date" | "amount" | "title" | "category";
type SortDirection = "asc" | "desc";

export function TransactionsPage() {
  const { user } = useAuthStore();

  // Data states
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States for filtering and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [transactionType, setTransactionType] = useState<TransactionType>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  
  // States for add/edit transaction
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Fetch transactions and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [transactionsResponse, categoriesResponse] = await Promise.all([
          TransactionApi.filter(),
          CategoryApi.filter()
        ]);
        
        setTransactions(transactionsResponse.objects);
        setCategories(categoriesResponse.objects);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter transactions based on search, type and category
  const fetchFilteredTransactions = async () => {
    try {
      setLoading(true);
      
      // Build filter parameters
      const filters: Record<string, string | number> = {};
      
      if (searchTerm) {
        filters.search = searchTerm;
      }
      
      if (transactionType !== "all") {
        filters.type = transactionType;
      }
      
      if (categoryFilter) {
        filters.category = categoryFilter;
      }
      
      // Add sorting parameters
      if (sortField === "date") {
        filters.order_by = sortDirection === "asc" ? "transaction_date" : "-transaction_date";
      } else if (sortField === "amount") {
        filters.order_by = sortDirection === "asc" ? "amount" : "-amount";
      } else if (sortField === "title") {
        filters.order_by = sortDirection === "asc" ? "title" : "-title";
      } else if (sortField === "category") {
        filters.order_by = sortDirection === "asc" ? "category__name" : "-category__name";
      }
      
      const response = await TransactionApi.filter(filters);
      setTransactions(response.objects);
    } catch (error) {
      console.error("Error fetching filtered transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Call the fetch filtered transactions whenever filters change
  useEffect(() => {
    fetchFilteredTransactions();
  }, [searchTerm, transactionType, categoryFilter, sortField, sortDirection]);

  // Handle adding a new transaction
  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };
  
  // Handle editing a transaction
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  // Handle saving a transaction (create or update)
  const handleSaveTransaction = async (formData: TransactionWriteInterface) => {
    setLoading(true);
    if (!user) {
      console.error("User not found");
      setLoading(false);
      return;
    }
    
    try {
      const transactionData: TransactionWriteInterface = {
        title: formData.title,
        amount: formData.amount,
        transaction_date: formData.transaction_date,
        type: formData.type,
        category_id: formData.category_id || null,
        user_id: user.id,
        description: formData.description || null
      };
      
      if (editingTransaction?.id) {
        // Update existing transaction
        await TransactionApi.update(editingTransaction.id, transactionData);
      } else {
        // Create new transaction
        await TransactionApi.create(transactionData);
      }
      
      // Refresh the transactions list
      await fetchFilteredTransactions();
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving transaction:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a transaction
  const handleDeleteTransaction = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      setLoading(true);
      
      try {
        await TransactionApi.delete(id);
        // Refresh the transactions list
        await fetchFilteredTransactions();
      } catch (error) {
        console.error("Error deleting transaction:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">Transactions</h1>
        
        <button
          onClick={handleAddTransaction}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center text-sm"
          disabled={loading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Transaction
        </button>
      </div>
      
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search transactions..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          {/* Transaction Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type
            </label>
            <select
              id="type"
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value as TransactionType)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Transactions</option>
              <option value="income">Income Only</option>
              <option value="expense">Expenses Only</option>
            </select>
          </div>
          
          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              id="category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Categories</option>
              {categories.map((category: Category) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Sort By */}
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sort By
            </label>
            <select
              id="sort"
              value={`${sortField}-${sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-');
                setSortField(field as SortField);
                setSortDirection(direction as SortDirection);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="date-desc">Date (Newest First)</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="amount-desc">Amount (Highest First)</option>
              <option value="amount-asc">Amount (Lowest First)</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
              <option value="category-asc">Category (A-Z)</option>
              <option value="category-desc">Category (Z-A)</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {/* Transactions List */}
      {!loading && (
        <TransactionsList 
          transactions={transactions}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
        />
      )}
      
      {/* Add/Edit Transaction Form Dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
              </h2>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <TransactionForm 
              transaction={editingTransaction}
              categories={categories}
              onSave={handleSaveTransaction}
              onClose={() => setIsFormOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
} 