export type AccountType =
  | "cash"
  | "bank"
  | "ewallet"
  | "credit"
  | "investment"
  | "other";

export interface Account {
  id: number;
  name: string;
  type: AccountType;
  currency: string;
  opening_balance: number;
  color: string;
  icon: string;
  note: string | null;
  archived: number;
  created_at: string;
}

export interface AccountWithBalance extends Account {
  balance: number;
}

export type TxType = "income" | "expense" | "transfer";

export interface Category {
  id: number;
  name: string;
  kind: "income" | "expense";
  icon: string;
  color: string;
  parent_id: number | null;
  archived: number;
  created_at: string;
}

export interface Transaction {
  id: number;
  type: TxType;
  amount: number;
  account_id: number;
  to_account_id: number | null;
  category_id: number | null;
  occurred_at: string;
  note: string | null;
  tags: string | null;
  created_at: string;
}

export interface TransactionExpanded extends Transaction {
  account_name: string;
  account_color: string;
  account_icon: string;
  to_account_name: string | null;
  category_name: string | null;
  category_color: string | null;
  category_icon: string | null;
}

export interface Budget {
  id: number;
  category_id: number;
  month: string;
  amount: number;
  note: string | null;
  created_at: string;
}

export interface BudgetExpanded extends Budget {
  category_name: string;
  category_color: string;
  category_icon: string;
  spent: number;
}

export interface Goal {
  id: number;
  name: string;
  target_amount: number;
  saved_amount: number;
  deadline: string | null;
  account_id: number | null;
  color: string;
  icon: string;
  note: string | null;
  completed: number;
  created_at: string;
}

export interface Debt {
  id: number;
  kind: "hutang" | "piutang";
  party: string;
  amount: number;
  paid: number;
  due_date: string | null;
  note: string | null;
  settled: number;
  created_at: string;
}
