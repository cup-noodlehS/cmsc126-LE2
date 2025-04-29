/**
 * Utility functions for exporting data to various formats
 */

import { DashboardReadInterface } from "../types/budgethink";

/**
 * Convert data to CSV format
 */
export function generateCSV(
  dashboardData: DashboardReadInterface | null, 
  selectedMonth: string | null,
  categories: Array<{ id: number; name: string; hex_color: string }> | undefined
): string {
  if (!dashboardData) return "";
  
  // Create headers
  const headers = ['Date', 'Type', 'Category', 'Amount', 'Notes'];
  
  // Start with header row
  let csvContent = headers.join(',') + '\n';
  
  // Add transaction data
  const transactions = dashboardData.recent_transactions
    .filter(transaction => {
      // Apply month filter if selected
      if (selectedMonth) {
        const transactionDate = new Date(transaction.transaction_date);
        const transactionMonth = transactionDate.toLocaleString('default', { month: 'long' }) + ' ' + 
                                transactionDate.getFullYear();
        return transactionMonth === selectedMonth;
      }
      return true;
    })
    .map(transaction => {
      // Format date
      const date = new Date(transaction.transaction_date).toISOString().split('T')[0];
      
      // Get type (income or expense)
      const type = transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1);
      
      // Get category name
      const categoryName = transaction.category?.name || 'Uncategorized';
      
      // Format amount (remove currency symbol for CSV)
      const amount = transaction.amount.toString();
      
      // Use description or title as notes
      const notes = (transaction.description || transaction.title || '').replace(/,/g, ' ');
      
      // Return CSV row
      return [date, type, categoryName, amount, notes].join(',');
    });
  
  // Add monthly summary if requested
  if (selectedMonth || dashboardData.income_vs_expenses.length > 0) {
    // Add a separator
    csvContent += '\n"Monthly Summary"\n';
    csvContent += 'Month,Income,Expenses,Balance\n';
    
    const filteredMonths = selectedMonth 
      ? dashboardData.income_vs_expenses.filter(m => m.month === selectedMonth)
      : dashboardData.income_vs_expenses;
      
    filteredMonths.forEach(monthData => {
      const balance = monthData.income - monthData.expense;
      csvContent += `${monthData.month},${monthData.income},${monthData.expense},${balance}\n`;
    });
  }
  
  // Add category breakdown
  csvContent += '\n"Category Breakdown"\n';
  csvContent += 'Category,Total\n';
  
  // Get filtered categories based on month
  const categoryTotals = dashboardData.categories
    .filter(cat => {
      // This would be replaced with actual logic if the API supported monthly category filtering
      return true;
    })
    .sort((a, b) => b.total - a.total);
  
  categoryTotals.forEach(cat => {
    csvContent += `${cat.category__name},${cat.total}\n`;
  });
  
  return csvContent;
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // Create a blob with the CSV data
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create a download link
  const link = document.createElement('a');
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Set link attributes
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Add to document, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
} 