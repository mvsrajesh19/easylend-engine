import { Loan, Payment } from '@/types/banking';

export const calculateLoanDetails = (
  principal: number,
  years: number,
  interestRate: number
) => {
  // Simple Interest: I = P * N * (R / 100)
  const totalInterest = principal * years * (interestRate / 100);
  
  // Total Amount: A = P + I
  const totalAmount = principal + totalInterest;
  
  // Monthly EMI: A / (N * 12)
  const monthlyEmi = totalAmount / (years * 12);
  
  return {
    totalInterest,
    totalAmount,
    monthlyEmi
  };
};

export const calculateRemainingDetails = (
  loan: Loan,
  payments: Payment[]
) => {
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const balanceAmount = loan.total_amount - totalPaid;
  const emisLeft = balanceAmount > 0 ? Math.ceil(balanceAmount / loan.monthly_emi) : 0;
  
  return {
    amount_paid: totalPaid,
    balance_amount: Math.max(0, balanceAmount),
    emis_left: emisLeft
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
};

export const generateLoanId = (): string => {
  return 'LOAN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

export const generatePaymentId = (): string => {
  return 'PAY_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};