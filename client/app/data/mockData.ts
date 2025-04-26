// Mock Categories
export const mockCategories = [
  { id: 1, name: "Food", color: "#FF6384" },
  { id: 2, name: "Transportation", color: "#36A2EB" },
  { id: 3, name: "Housing", color: "#FFCE56" },
  { id: 4, name: "Entertainment", color: "#4BC0C0" },
  { id: 5, name: "Health", color: "#9966FF" },
  { id: 6, name: "Utilities", color: "#FF9F40" },
  { id: 7, name: "Shopping", color: "#C9CBCF" },
  { id: 8, name: "Income", color: "#7CFC00" },
  { id: 9, name: "Education", color: "#8A2BE2" },
  { id: 10, name: "Others", color: "#808080" },
];

// Mock Transactions
export const mockTransactions = [
  {
    id: 1,
    title: "Groceries",
    amount: -120.50,
    date: "2023-10-15",
    category: "Food",
    notes: "Weekly grocery shopping at Walmart"
  },
  {
    id: 2,
    title: "Salary",
    amount: 3500,
    date: "2023-10-01",
    category: "Income",
    notes: "Monthly salary from work"
  },
  {
    id: 3,
    title: "Electric Bill",
    amount: -85.20,
    date: "2023-10-10",
    category: "Utilities",
    notes: "October electricity bill"
  },
  {
    id: 4,
    title: "Restaurant",
    amount: -65.80,
    date: "2023-10-14",
    category: "Food",
    notes: "Dinner with friends at Italian restaurant"
  },
  {
    id: 5,
    title: "Uber",
    amount: -22.50,
    date: "2023-10-12",
    category: "Transportation",
    notes: "Ride to work"
  },
  {
    id: 6,
    title: "Netflix",
    amount: -14.99,
    date: "2023-10-05",
    category: "Entertainment",
    notes: "Monthly subscription"
  },
  {
    id: 7,
    title: "Gym Membership",
    amount: -49.99,
    date: "2023-10-03",
    category: "Health",
    notes: "Monthly gym membership fee"
  },
  {
    id: 8,
    title: "Water Bill",
    amount: -45.00,
    date: "2023-10-08",
    category: "Utilities",
    notes: "October water bill"
  },
  {
    id: 9,
    title: "Shoes",
    amount: -89.99,
    date: "2023-10-16",
    category: "Shopping",
    notes: "New running shoes"
  },
  {
    id: 10,
    title: "Freelance Work",
    amount: 350.00,
    date: "2023-10-18",
    category: "Income",
    notes: "Website design for client"
  },
  {
    id: 11,
    title: "Internet Bill",
    amount: -65.00,
    date: "2023-10-07",
    category: "Utilities",
    notes: "Monthly internet service"
  },
  {
    id: 12,
    title: "Birthday Gift",
    amount: -50.00,
    date: "2023-10-20",
    category: "Shopping",
    notes: "Gift for mom's birthday"
  },
  {
    id: 13,
    title: "Rent",
    amount: -1200.00,
    date: "2023-10-01",
    category: "Housing",
    notes: "Monthly apartment rent"
  },
  {
    id: 14,
    title: "Gasoline",
    amount: -45.75,
    date: "2023-10-13",
    category: "Transportation",
    notes: "Filled up gas tank"
  },
  {
    id: 15,
    title: "Online Course",
    amount: -99.00,
    date: "2023-10-09",
    category: "Education",
    notes: "React development course"
  }
];

// Mock Budgets
import { BudgetType } from "../types";

export const mockBudgets = [
  {
    id: 1,
    type: "total" as BudgetType,
    amount: 5000,
    month: 3,
    year: 2025,
    createdAt: "2025-03-01T00:00:00.000Z",
    updatedAt: "2025-03-01T00:00:00.000Z"
  },
  {
    id: 2,
    type: "category" as BudgetType,
    categoryId: 1,
    amount: 800,
    month: 3,
    year: 2025,
    createdAt: "2025-03-01T00:00:00.000Z",
    updatedAt: "2025-03-01T00:00:00.000Z"
  },
  {
    id: 3,
    type: "category" as BudgetType,
    categoryId: 2,
    amount: 400,
    month: 3,
    year: 2025,
    createdAt: "2025-03-01T00:00:00.000Z",
    updatedAt: "2025-03-01T00:00:00.000Z"
  },
  {
    id: 4,
    type: "category" as BudgetType,
    categoryId: 3,
    amount: 1200,
    month: 3,
    year: 2025,
    createdAt: "2025-03-01T00:00:00.000Z",
    updatedAt: "2025-03-01T00:00:00.000Z"
  },
  {
    id: 5,
    type: "category" as BudgetType,
    categoryId: 3,
    amount: 300,
    month: 3,
    year: 2025,
    createdAt: "2025-03-01T00:00:00.000Z",
    updatedAt: "2025-03-01T00:00:00.000Z"
  },
  {
    id: 6,
    type: "category" as BudgetType,
    categoryId: 3,
    amount: 200,
    month: 3,
    year: 2025,
    createdAt: "2025-03-01T00:00:00.000Z",
    updatedAt: "2025-03-01T00:00:00.000Z"
  },
  {
    id: 7,
    type: "category" as BudgetType,
    categoryId: 2,
    amount: 300,
    month: 3,
    year: 2025,
    createdAt: "2025-03-01T00:00:00.000Z",
    updatedAt: "2025-03-01T00:00:00.000Z"
  },
  {
    id: 8,
    type: "total" as BudgetType,
    amount: 4500,
    month: 4,
    year: 2025,
    createdAt: "2025-04-01T00:00:00.000Z",
    updatedAt: "2025-04-01T00:00:00.000Z"
  },
  {
    id: 9,
    type: "category" as BudgetType,
    categoryId: 1,
    amount: 700,
    month: 4,
    year: 2025,
    createdAt: "2025-04-01T00:00:00.000Z",
    updatedAt: "2025-04-01T00:00:00.000Z"
  },
  {
    id: 10,
    type: "category" as BudgetType,
    categoryId: 2,
    amount: 350,
    month: 4,
    year: 2025,
    createdAt: "2025-04-01T00:00:00.000Z",
    updatedAt: "2025-04-01T00:00:00.000Z"
  }
]; 