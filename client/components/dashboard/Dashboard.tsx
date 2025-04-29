/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { mockCategories } from "../../app/data/mockData";
import { useAuthStore } from "@/lib/stores/auth";
import { fetchDashboard } from "@/lib/stores/budgethink";
import { DashboardReadInterface } from "@/lib/types/budgethink";
import { useCategoriesStore } from "@/lib/stores/categories";

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
);

// Get category color
const getCategoryColor = (categoryName: string) => {
  const category = mockCategories.find(cat => cat.name === categoryName);
  return category ? category.color : "#808080"; // Default to gray if not found
};

// Function to determine if text should be black or white based on background color
const getContrastTextColor = (hexColor: string): string => {
  // Remove the # if present
  const hex = hexColor.replace('#', '');
  
  // Convert hex to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance using the formula for relative luminance in the sRGB color space
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for light backgrounds, white for dark backgrounds
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

export function Dashboard() {
  const { user } = useAuthStore();
  const { categories, fetchCategories } = useCategoriesStore();
  const [dashboardData, setDashboardData] = useState<DashboardReadInterface | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchDashboard({ months_span: 4 });
      console.log(data, 'here');
      setDashboardData(data);
    } catch (error) {
      console.error('Dashboard error:', error);
      setError(typeof error === 'object' ? 'Failed to load dashboard data' : String(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch dashboard data and categories
    Promise.all([
      fetchDashboardData(),
      fetchCategories()
    ]);
  }, []);

  // Function to get category color from our categories store
  const getCategoryColorFromStore = (categoryName: string): string => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.hex_color : "#808080"; // Default to gray if not found
  };

  // Prepare category data for pie chart
  const categoryData = {
    labels: dashboardData?.categories.map(cat => cat.category__name) || [],
    datasets: [
      {
        data: dashboardData?.categories.map(cat => cat.total) || [],
        backgroundColor: dashboardData?.categories.map(cat => {
          // Try to find the color in the categories store first
          const categoryColor = getCategoryColorFromStore(cat.category__name);
          // Make slightly transparent
          return categoryColor.includes('rgba') ? categoryColor : `${categoryColor}CC`;
        }) || [],
        borderColor: dashboardData?.categories.map(cat => getCategoryColorFromStore(cat.category__name)) || [],
        borderWidth: 1,
      },
    ],
  };

  // Prepare monthly comparison data for bar chart
  const monthlyComparisonData = {
    labels: dashboardData?.income_vs_expenses.map(month => month.month).reverse() || [],
    datasets: [
      {
        label: 'Income',
        data: dashboardData?.income_vs_expenses.map(month => month.income).reverse() || [],
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
      },
      {
        label: 'Expenses',
        data: dashboardData?.income_vs_expenses.map(month => month.expense).reverse() || [],
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
      },
    ],
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg text-red-700 dark:text-red-200">
          <h2 className="text-lg font-medium mb-2">Error loading dashboard</h2>
          <p>{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page title */}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Welcome, {user?.first_name} {user?.last_name}</h1>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <SummaryCard
          title="Income"
          value={`₱${dashboardData?.income?.toLocaleString() || '0'}`}
          type="income"
        />
        <SummaryCard
          title="Expenses"
          value={`₱${dashboardData?.expense?.toLocaleString() || '0'}`}
          type="expense"
        />
        <SummaryCard
          title="Balance"
          value={`₱${dashboardData?.balance?.toLocaleString() || '0'}`}
          type={(dashboardData?.balance || 0) >= 0 ? "positive" : "negative"}
        />
      </div>
      
      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Expenses by Category</h2>
          <div className="h-64 flex items-center justify-center">
            <Pie data={categoryData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Income vs Expenses</h2>
          <div className="h-64">
            <Bar
              data={monthlyComparisonData}
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(156, 163, 175, 0.15)',
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Recent transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {dashboardData?.recent_transactions?.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {transaction.title || transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {transaction.category && (

                    <span 
                      className="px-2 py-1 text-xs rounded-full"
                      style={{ 
                        backgroundColor: transaction.category?.hex_color || getCategoryColor(transaction.category.name || ''),
                        color: getContrastTextColor(transaction.category?.hex_color || getCategoryColor(transaction.category.name || ''))
                      }}
                    >
                      {transaction.category.name}
                    </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {new Date(transaction.transaction_date).toLocaleDateString()}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.formatted_amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <a href="/transactions" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
            View all transactions →
          </a>
        </div>
      </div>
    </div>
  );
}

type SummaryCardProps = {
  title: string;
  value: string;
  type: 'income' | 'expense' | 'positive' | 'negative';
};

function SummaryCard({ title, value, type }: SummaryCardProps) {
  const getColorClass = () => {
    switch (type) {
      case 'income':
      case 'positive':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'expense':
      case 'negative':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default:
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'income':
      case 'positive':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
          </svg>
        );
      case 'expense':
      case 'negative':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-full mr-4 ${getColorClass()}`}>
          {getIcon()}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
} 