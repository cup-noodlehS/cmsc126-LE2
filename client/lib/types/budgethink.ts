import { UserInterface } from "./auth";

export interface CategoryReadInterface {
    id: number;
    name: string;
    description: string | null;
    hex_color: string;
    user: UserInterface;
    created_at: string;
    updated_at: string;

    // computed fields
    transactions_count: number;
    income_count: number;
    total_income: number;
    expense_count: number;
    total_expense: number;
    total_balance: number;
}

export interface CategoryWriteInterface {
    name: string;
    description?: string | null;
    hex_color?: string | null;
    user_id: number;
}


export interface TransactionReadInterface {
    id: number;
    category: CategoryReadInterface | null;
    user: UserInterface;
    title: string;
    description: string | null;
    type: 'expense' | 'income';
    amount: number;
    transaction_date: string;
    created_at: string;
    updated_at: string;
    
    // computed fields
    formatted_amount: string; // +99 or -99
}

export interface TransactionWriteInterface {
    category_id?: number | null;
    user_id: number;
    title: string;
    description?: string | null;
    type: 'expense' | 'income';
    amount: number;
    transaction_date: string;
}


export interface BudgetReadInterface {
    id: number;
    category: CategoryReadInterface | null; // null if it's a global budget
    user: UserInterface;
    name: string | null;
    amount_limit: number;
    created_at: string;
    updated_at: string;
}

export interface BudgetWriteInterface {
    category_id?: number | null;
    user_id: number;
    name?: string | null;
    amount_limit: number;
}


export interface DashboardReadInterface {
    recent_transactions: TransactionReadInterface[];
    income: number;
    expense: number;
    balance: number;
    categories: Array<{
        category__name: string;
        total: number;
    }>;
    income_vs_expenses: Array<{ // last 4 months by default
        month: string;
        income: number;
        expense: number;
    }>;
}

export interface DashboardFilterInterface {
    months_span?: number; // 4 by default, used for income_vs_expenses
}