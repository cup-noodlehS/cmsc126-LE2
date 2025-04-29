"use client";

import { useState, useEffect, useMemo } from "react";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { DashboardReadInterface } from "@/lib/types/budgethink";

// Register ChartJS components needed for line chart
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DetailedChartsProps {
  dashboardData: DashboardReadInterface | null;
  selectedMonth: string | null;
}

export function DetailedCharts({ dashboardData, selectedMonth }: DetailedChartsProps) {
  // Prepare data for trends chart (line chart)
  const trendData = useMemo(() => {
    if (!dashboardData) return null;
    
    return {
      labels: dashboardData.income_vs_expenses.map(month => month.month).reverse(),
      datasets: [
        {
          label: 'Income',
          data: dashboardData.income_vs_expenses.map(month => month.income).reverse(),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.3,
        },
        {
          label: 'Expenses',
          data: dashboardData.income_vs_expenses.map(month => month.expense).reverse(),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.3,
        },
        {
          label: 'Balance',
          data: dashboardData.income_vs_expenses.map(month => month.income - month.expense).reverse(),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          tension: 0.3,
          fill: true,
        }
      ]
    };
  }, [dashboardData]);
  
  // Calculate savings rate
  const savingsData = useMemo(() => {
    if (!dashboardData) return null;
    
    return {
      labels: dashboardData.income_vs_expenses.map(month => month.month).reverse(),
      datasets: [
        {
          label: 'Savings Rate (%)',
          data: dashboardData.income_vs_expenses.map(month => {
            const income = month.income;
            if (income === 0) return 0;
            const savings = income - month.expense;
            return Math.round((savings / income) * 100);
          }).reverse(),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.3,
          fill: true,
        }
      ]
    };
  }, [dashboardData]);

  if (!dashboardData) {
    return <div className="text-gray-500 dark:text-gray-400">No data available</div>;
  }

  // Calculate summary metrics
  const totalIncome = dashboardData.income_vs_expenses.reduce((sum, month) => sum + month.income, 0);
  const totalExpenses = dashboardData.income_vs_expenses.reduce((sum, month) => sum + month.expense, 0);
  const avgSavingsRate = totalIncome > 0 
    ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) 
    : 0;
  
  // Calculate trend
  const expenses = [...dashboardData.income_vs_expenses].reverse().map(m => m.expense);
  const isIncreasing = expenses.length > 1 ? expenses[expenses.length - 1] > expenses[0] : false;
  const changePercent = expenses.length > 1 
    ? Math.round(((expenses[expenses.length - 1] - expenses[0]) / expenses[0]) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Average Monthly Income</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ₱{Math.round(totalIncome / dashboardData.income_vs_expenses.length).toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Over {dashboardData.income_vs_expenses.length} months
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Average Monthly Expenses</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ₱{Math.round(totalExpenses / dashboardData.income_vs_expenses.length).toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {isIncreasing 
              ? <span className="text-red-500">↑ Increasing trend ({changePercent}%)</span>
              : <span className="text-green-500">↓ Decreasing trend ({Math.abs(changePercent)}%)</span>
            }
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Average Savings Rate</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgSavingsRate}%</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {avgSavingsRate >= 20 
              ? <span className="text-green-500">Excellent</span>
              : avgSavingsRate >= 10 
                ? <span className="text-yellow-500">Good</span>
                : avgSavingsRate >= 0 
                  ? <span className="text-orange-500">Needs improvement</span>
                  : <span className="text-red-500">Spending exceeds income</span>
            }
          </p>
        </div>
      </div>

      {/* Financial Trends */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Financial Trends Over Time</h2>
        <div className="h-80">
          {trendData && (
            <Line
              data={trendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(156, 163, 175, 0.15)',
                    },
                    ticks: {
                      callback: function(value) {
                        return '₱' + value.toLocaleString();
                      }
                    }
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.dataset.label || '';
                        const value = context.raw as number;
                        return `${label}: ₱${value.toLocaleString()}`;
                      }
                    }
                  },
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Income, Expenses and Balance Over Time'
                  },
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Savings Rate Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Monthly Savings Rate</h2>
        <div className="h-80">
          {savingsData && (
            <Line
              data={savingsData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(156, 163, 175, 0.15)',
                    },
                    ticks: {
                      callback: function(value) {
                        return value + '%';
                      }
                    }
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.dataset.label || '';
                        const value = context.raw as number;
                        return `${label}: ${value}%`;
                      }
                    }
                  },
                  legend: {
                    display: false,
                  },
                  title: {
                    display: true,
                    text: 'Percentage of Income Saved Each Month'
                  },
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Insights Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Financial Insights</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-md mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600 dark:text-blue-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-800 dark:text-white">Spending Overview</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              {(() => {
                if (avgSavingsRate < 0) {
                  return `Over the past ${dashboardData.income_vs_expenses.length} months, you've been spending more than your income. Consider reviewing your budget to cut expenses.`;
                } else if (avgSavingsRate < 10) {
                  return `Your average savings rate is ${avgSavingsRate}%. Try to aim for saving at least 15-20% of your income.`;
                } else if (avgSavingsRate < 20) {
                  return `You're saving about ${avgSavingsRate}% of your income, which is a good start. Can you push it to 20% or more?`;
                } else {
                  return `Great job! You're saving ${avgSavingsRate}% of your income, which is excellent for building long-term wealth.`;
                }
              })()}
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-md mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-600 dark:text-green-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-800 dark:text-white">Expense Trend</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              {(() => {
                if (dashboardData.income_vs_expenses.length < 2) return "Not enough data to analyze expense trends.";
                
                if (isIncreasing && changePercent > 5) {
                  return `Your expenses have increased by ${changePercent}% over this period. Consider reviewing your spending habits.`;
                } else if (!isIncreasing && Math.abs(changePercent) > 5) {
                  return `Your expenses have decreased by ${Math.abs(changePercent)}% over this period. Great job managing your spending!`;
                } else {
                  return `Your expenses have remained relatively stable over this period (changed by ${changePercent}%).`;
                }
              })()}
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-md mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-purple-600 dark:text-purple-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-800 dark:text-white">Recommendations</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              {(() => {
                if (avgSavingsRate < 0) {
                  return "Focus on reducing expenses or increasing income to avoid depleting savings or accumulating debt.";
                } else if (avgSavingsRate < 10) {
                  return "Consider setting up automated transfers to a savings account when you receive income to build your savings rate.";
                } else if (isIncreasing && changePercent > 10) {
                  return "Your expenses are growing rapidly. Review your recent spending to identify areas where you can cut back.";
                } else if (avgSavingsRate >= 20) {
                  return "You're saving well! Consider investing your surplus to beat inflation and grow wealth over time.";
                } else {
                  return "Track your spending in specific categories to identify areas where you might be able to save more.";
                }
              })()}
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-md mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-yellow-600 dark:text-yellow-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-800 dark:text-white">Next Steps</h3>
            </div>
            <ul className="text-gray-600 dark:text-gray-300 space-y-2 list-disc pl-5">
              <li>Set a monthly savings target based on your income</li>
              <li>Review your largest expense categories</li>
              <li>Create a budget for next month and track progress</li>
              <li>Consider setting up an emergency fund (3-6 months of expenses)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 