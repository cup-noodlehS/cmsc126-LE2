import api, { GenericApi } from "@/lib/utils/api";
import { BudgetReadInterface, BudgetWriteInterface, CategoryReadInterface, CategoryWriteInterface, TransactionReadInterface, TransactionWriteInterface, DashboardReadInterface, DashboardFilterInterface } from "@/lib/types/budgethink";

export const CategoryApi = new GenericApi<CategoryReadInterface, CategoryWriteInterface>('/budgethink/categories/');
export const TransactionApi = new GenericApi<TransactionReadInterface, TransactionWriteInterface>('/budgethink/transactions/');
export const BudgetApi = new GenericApi<BudgetReadInterface, BudgetWriteInterface>('/budgethink/budgets/');

export const fetchDashboard = async (filters: DashboardFilterInterface) => {
    const response = await api.get('/budgethink/transactions/dashboard/', { params: filters });
    return response.data as DashboardReadInterface;
};

