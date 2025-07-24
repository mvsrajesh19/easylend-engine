export interface Customer {
  customer_id: string;
  name: string;
  created_at: string;
}

export interface Loan {
  loan_id: string;
  customer_id: string;
  principal_amount: number;
  total_amount: number;
  interest_rate: number;
  loan_period_years: number;
  monthly_emi: number;
  status: 'ACTIVE' | 'PAID_OFF';
  created_at: string;
  amount_paid: number;
  balance_amount: number;
  emis_left: number;
}

export interface Payment {
  payment_id: string;
  loan_id: string;
  amount: number;
  payment_type: 'EMI' | 'LUMP_SUM';
  payment_date: string;
}

export interface LoanCreationRequest {
  customer_id: string;
  loan_amount: number;
  loan_period_years: number;
  interest_rate_yearly: number;
}

export interface PaymentRequest {
  amount: number;
  payment_type: 'EMI' | 'LUMP_SUM';
}