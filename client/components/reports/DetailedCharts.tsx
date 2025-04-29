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

  return (
    <div className="space-y-8">
      {/* Financial Trends */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
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
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
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
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Financial Insights</h2>
        
        <div className="space-y-4">
          {dashboardData.income_vs_expenses.length > 0 && (
            <>
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white mb-2">Spending Overview</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {(() => {
                    const totalIncome = dashboardData.income_vs_expenses.reduce((sum, month) => sum + month.income, 0);
                    const totalExpenses = dashboardData.income_vs_expenses.reduce((sum, month) => sum + month.expense, 0);
                    const avgSavingsRate = totalIncome > 0 
                      ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) 
                      : 0;
                    
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
              
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white mb-2">Expense Trend</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {(() => {
                    if (dashboardData.income_vs_expenses.length < 2) return "Not enough data to analyze expense trends.";
                    
                    const expenses = [...dashboardData.income_vs_expenses].reverse().map(m => m.expense);
                    const isIncreasing = expenses[expenses.length - 1] > expenses[0];
                    const changePercent = Math.round(
                      ((expenses[expenses.length - 1] - expenses[0]) / expenses[0]) * 100
                    );
                    
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
            </>
          )}
        </div>
      </div>
    </div>
  );
} 