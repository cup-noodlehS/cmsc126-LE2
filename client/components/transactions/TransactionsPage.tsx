"use client";

import { useState, useEffect } from "react";
import { TransactionsList } from "./TransactionsList";
import { TransactionForm } from "./TransactionForm";
import { TransactionApi, CategoryApi } from "@/lib/stores/budgethink";
import { 
  Transaction, 
  TransactionWriteInterface
} from "@/app/types";
import { useAuthStore } from "@/lib/stores/auth";
import { CategoryReadInterface } from "@/lib/types/budgethink";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

type TransactionType = "all" | "income" | "expense";
type SortField = "date" | "amount" | "title" | "category";
type SortDirection = "asc" | "desc";

export function TransactionsPage() {
  const { user } = useAuthStore();

  // Data states
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [categories, setCategories] = useState<CategoryReadInterface[]>([]);
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
  
  // States for delete confirmation
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<{ title: string; amount: string; date: string } | null>(null);

  // Fetch transactions and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [transactionsResponse, categoriesResponse] = await Promise.all([
          TransactionApi.filter({page: currentPage}),
          CategoryApi.filter()
        ]);
        
        setTransactions(transactionsResponse.objects);
        setTotalPages(transactionsResponse.num_pages);
        setCategories(categoriesResponse.objects);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentPage]);

  // Filter transactions based on search, type and category
  const fetchFilteredTransactions = async () => {
    try {
      setLoading(true);
      
      // Build filter parameters
      const filters: Record<string, string | number> = {
        page: currentPage
      };
      
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
      setTotalPages(response.num_pages);
    } catch (error) {
      console.error("Error fetching filtered transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Call the fetch filtered transactions whenever filters change
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    fetchFilteredTransactions();
  }, [searchTerm, transactionType, categoryFilter, sortField, sortDirection]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
    try {
      setIsDeleting(true);
      await TransactionApi.delete(id);
      // Refresh the transactions list
      await fetchFilteredTransactions();
      setIsDeleteModalOpen(false);
      setTransactionToDelete(null);
      setTransactionDetails(null);
    } catch (error) {
      console.error("Error deleting transaction:", error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Handle opening the delete confirmation modal
  const openDeleteModal = (transaction: Transaction) => {
    setTransactionToDelete(transaction.id);
    setTransactionDetails({
      title: transaction.title,
      amount: transaction.formatted_amount,
      date: new Date(transaction.transaction_date).toLocaleDateString()
    });
    setIsDeleteModalOpen(true);
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
              {categories.map((category: CategoryReadInterface) => (
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
          onDelete={openDeleteModal}
        />
      )}
      
      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center flex-wrap">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-l-md border ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:border-gray-600'
              }`}
              aria-label="Previous page"
            >
              <span aria-hidden="true">&laquo;</span>
            </button>
            
            {/* Improved pagination that shows limited page numbers */}
            {(() => {
              const pageNumbers = [];
              let startPage = Math.max(1, currentPage - 2);
              const endPage = Math.min(totalPages, startPage + 4);
              
              if (endPage - startPage < 4) {
                startPage = Math.max(1, endPage - 4);
              }
              
              // First page
              if (startPage > 1) {
                pageNumbers.push(
                  <button
                    key={1}
                    onClick={() => handlePageChange(1)}
                    className="px-3 py-1 border-t border-b bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:border-gray-600"
                  >
                    1
                  </button>
                );
                
                if (startPage > 2) {
                  pageNumbers.push(
                    <span key="ellipsis1" className="px-2 py-1 border-t border-b dark:border-gray-600">...</span>
                  );
                }
              }
              
              // Page numbers around current page
              for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(
                  <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-1 border-t border-b ${
                      currentPage === i
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:border-gray-600'
                    }`}
                  >
                    {i}
                  </button>
                );
              }
              
              // Last page
              if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                  pageNumbers.push(
                    <span key="ellipsis2" className="px-2 py-1 border-t border-b dark:border-gray-600">...</span>
                  );
                }
                
                pageNumbers.push(
                  <button
                    key={totalPages}
                    onClick={() => handlePageChange(totalPages)}
                    className="px-3 py-1 border-t border-b bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:border-gray-600"
                  >
                    {totalPages}
                  </button>
                );
              }
              
              return pageNumbers;
            })()}
            
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-r-md border ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:border-gray-600'
              }`}
              aria-label="Next page"
            >
              <span aria-hidden="true">&raquo;</span>
            </button>
          </nav>
        </div>
      )}
      
      {/* Transaction Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
            </h2>
            <TransactionForm
              transaction={editingTransaction}
              categories={categories}
              onSave={handleSaveTransaction}
              onClose={() => {
                setIsFormOpen(false);
                setEditingTransaction(null);
              }}
            />
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        itemName={transactionDetails ? `${transactionDetails.title} - ${transactionDetails.amount} (${transactionDetails.date})` : ''}
        itemType="transaction"
        onConfirm={() => transactionToDelete && handleDeleteTransaction(transactionToDelete)}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setTransactionToDelete(null);
          setTransactionDetails(null);
        }}
        isDeleting={isDeleting}
      />
    </div>
  );
} 