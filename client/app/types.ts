// Transaction Types
export type Transaction = {
  id: number;
  title: string;
  amount: number;
  date: string;
  category: string;
  notes?: string;
};

// Category Types
export type Category = {
  id: number;
  name: string;
  color: string;
}; 