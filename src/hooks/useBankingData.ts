import { useState, useEffect } from 'react';
import { Customer, Loan, Payment } from '@/types/banking';
import { calculateRemainingDetails } from '@/lib/bankingCalculations';

// Mock data for demonstration
const mockCustomers: Customer[] = [
  {
    customer_id: 'CUST001',
    name: 'Rajesh Kumar',
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    customer_id: 'CUST002', 
    name: 'Priya Sharma',
    created_at: '2024-02-20T14:45:00Z'
  },
  {
    customer_id: 'CUST003',
    name: 'Amit Patel',
    created_at: '2024-03-10T09:15:00Z'
  }
];

export const useBankingData = () => {
  const [customers] = useState<Customer[]>(mockCustomers);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Initialize with some sample data
  useEffect(() => {
    const sampleLoans: Loan[] = [
      {
        loan_id: 'LOAN_1735030800000_abc123def',
        customer_id: 'CUST001',
        principal_amount: 500000,
        total_amount: 650000,
        interest_rate: 10,
        loan_period_years: 3,
        monthly_emi: 18055.56,
        status: 'ACTIVE',
        created_at: '2024-01-20T10:00:00Z',
        amount_paid: 72222.24,
        balance_amount: 577777.76,
        emis_left: 32
      }
    ];

    const samplePayments: Payment[] = [
      {
        payment_id: 'PAY_1735030800001_xyz789',
        loan_id: 'LOAN_1735030800000_abc123def',
        amount: 18055.56,
        payment_type: 'EMI',
        payment_date: '2024-02-20T10:00:00Z'
      },
      {
        payment_id: 'PAY_1735030800002_xyz790',
        loan_id: 'LOAN_1735030800000_abc123def',
        amount: 18055.56,
        payment_type: 'EMI',
        payment_date: '2024-03-20T10:00:00Z'
      },
      {
        payment_id: 'PAY_1735030800003_xyz791',
        loan_id: 'LOAN_1735030800000_abc123def',
        amount: 36111.12,
        payment_type: 'LUMP_SUM',
        payment_date: '2024-04-15T10:00:00Z'
      }
    ];

    setLoans(sampleLoans);
    setPayments(samplePayments);
  }, []);

  const addLoan = (loan: Loan) => {
    setLoans(prev => [...prev, loan]);
  };

  const addPayment = (payment: Payment) => {
    setPayments(prev => [...prev, payment]);
    
    // Update loan details
    setLoans(prev => prev.map(loan => {
      if (loan.loan_id === payment.loan_id) {
        const loanPayments = [...payments, payment].filter(p => p.loan_id === loan.loan_id);
        const remainingDetails = calculateRemainingDetails(loan, loanPayments);
        return {
          ...loan,
          ...remainingDetails,
          status: remainingDetails.balance_amount <= 0 ? 'PAID_OFF' : 'ACTIVE'
        } as Loan;
      }
      return loan;
    }));
  };

  const getLoanById = (loanId: string): Loan | undefined => {
    return loans.find(loan => loan.loan_id === loanId);
  };

  const getPaymentsByLoanId = (loanId: string): Payment[] => {
    return payments.filter(payment => payment.loan_id === loanId);
  };

  const getLoansByCustomerId = (customerId: string): Loan[] => {
    return loans.filter(loan => loan.customer_id === customerId);
  };

  const getCustomerById = (customerId: string): Customer | undefined => {
    return customers.find(customer => customer.customer_id === customerId);
  };

  return {
    customers,
    loans,
    payments,
    addLoan,
    addPayment,
    getLoanById,
    getPaymentsByLoanId,
    getLoansByCustomerId,
    getCustomerById
  };
};