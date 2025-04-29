import axios from "axios";
import api, { GenericApi } from "@/lib/utils/api";
import { BudgetReadInterface, BudgetWriteInterface, CategoryReadInterface, CategoryWriteInterface, TransactionReadInterface, TransactionWriteInterface, DashboardReadInterface, DashboardFilterInterface } from "@/lib/types/budgethink";

export const CategoryApi = new GenericApi<CategoryReadInterface, CategoryWriteInterface>('/budgethink/categories');
export const TransactionApi = new GenericApi<TransactionReadInterface, TransactionWriteInterface>('/budgethink/transactions');
export const BudgetApi = new GenericApi<BudgetReadInterface, BudgetWriteInterface>('/budgethink/budgets');

export const fetchDashboard = async (filters: DashboardFilterInterface) => {
    try {
        const response = await api.get('/budgethink/transactions/dashboard/', { params: filters });
        return response.data as DashboardReadInterface;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            // Return empty dashboard data structure when not authenticated
            return {
                income: 0,
                expense: 0,
                balance: 0,
                categories: [],
                income_vs_expenses: [],
                recent_transactions: []
            } as DashboardReadInterface;
        }
        console.error('Error fetching dashboard:', error);
        throw error;
    }
};

