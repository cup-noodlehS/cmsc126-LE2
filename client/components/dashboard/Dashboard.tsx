/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { mockCategories } from "../../app/data/mockData";
import { useAuthStore } from "@/lib/stores/auth";
import { fetchDashboard } from "@/lib/stores/budgethink";
import { DashboardReadInterface } from "@/lib/types/budgethink";

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

// Mock data
const mockMonthlyData = {
  income: 3500,
  expenses: 2850,
  balance: 650,
  month: 'October',
  year: 2023
};

const mockRecentTransactions = [
  { id: 1, title: 'Groceries', amount: -120.50, date: '2023-10-15', category: 'Food' },
  { id: 2, title: 'Salary', amount: 3500, date: '2023-10-01', category: 'Income' },
  { id: 3, title: 'Electric Bill', amount: -85.20, date: '2023-10-10', category: 'Utilities' },
  { id: 4, title: 'Restaurant', amount: -65.80, date: '2023-10-14', category: 'Food' },
  { id: 5, title: 'Uber', amount: -22.50, date: '2023-10-12', category: 'Transportation' },
];

// Category spending mock data with colors from mockCategories
const categoryColors = mockCategories.reduce((acc, cat) => {
  acc[cat.name] = cat.color;
  return acc;
}, {} as Record<string, string>);

const mockCategoryData = {
  labels: ['Food', 'Utilities', 'Transportation', 'Entertainment', 'Healthcare'],
  datasets: [
    {
      data: [650, 400, 300, 200, 150],
      backgroundColor: [
        categoryColors['Food'] || 'rgba(255, 99, 132, 0.7)',
        categoryColors['Utilities'] || 'rgba(54, 162, 235, 0.7)',
        categoryColors['Transportation'] || 'rgba(255, 206, 86, 0.7)',
        categoryColors['Entertainment'] || 'rgba(75, 192, 192, 0.7)',
        categoryColors['Health'] || 'rgba(153, 102, 255, 0.7)',
      ],
      borderColor: [
        categoryColors['Food'] || 'rgba(255, 99, 132, 1)',
        categoryColors['Utilities'] || 'rgba(54, 162, 235, 1)',
        categoryColors['Transportation'] || 'rgba(255, 206, 86, 1)',
        categoryColors['Entertainment'] || 'rgba(75, 192, 192, 1)',
        categoryColors['Health'] || 'rgba(153, 102, 255, 1)',
      ],
      borderWidth: 1,
    },
  ],
};

// Monthly income vs expenses mock data
const mockMonthlyComparisonData = {
  labels: ['Jul', 'Aug', 'Sep', 'Oct'],
  datasets: [
    {
      label: 'Income',
      data: [3200, 3200, 3400, 3500],
      backgroundColor: categoryColors['Income'] || 'rgba(75, 192, 192, 0.7)',
    },
    {
      label: 'Expenses',
      data: [2700, 2900, 2600, 2850],
      backgroundColor: 'rgba(255, 99, 132, 0.7)',
    },
  ],
};

// Get category color
const getCategoryColor = (categoryName: string) => {
  const category = mockCategories.find(cat => cat.name === categoryName);
  return category ? category.color : "#808080"; // Default to gray if not found
};

export function Dashboard() {
  const { user } = useAuthStore();
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
      setError(error as string);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="p-6">
      {/* Page title */}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Welcome, {user?.first_name} {user?.last_name}</h1>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <SummaryCard
          title="Income"
          value={`₱${mockMonthlyData.income.toLocaleString()}`}
          type="income"
        />
        <SummaryCard
          title="Expenses"
          value={`₱${mockMonthlyData.expenses.toLocaleString()}`}
          type="expense"
        />
        <SummaryCard
          title="Balance"
          value={`₱${mockMonthlyData.balance.toLocaleString()}`}
          type={mockMonthlyData.balance >= 0 ? "positive" : "negative"}
        />
      </div>
      
      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Expenses by Category</h2>
          <div className="h-64 flex items-center justify-center">
            <Pie data={mockCategoryData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Income vs Expenses</h2>
          <div className="h-64">
            <Bar
              data={mockMonthlyComparisonData}
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
              {mockRecentTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{transaction.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    <span 
                      className="px-2 py-1 text-xs rounded-full text-white"
                      style={{ 
                        backgroundColor: getCategoryColor(transaction.category),
                        color: '#FFFFFF' 
                      }}
                    >
                      {transaction.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(transaction.date).toLocaleDateString()}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    transaction.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.amount >= 0 ? '+' : ''}{transaction.amount.toLocaleString('en-PH', {
                      style: 'currency',
                      currency: 'PHP',
                    })}
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