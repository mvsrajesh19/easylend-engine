import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Customer, Loan, Payment } from '@/types/banking';
import { calculateRemainingDetails } from '@/lib/bankingCalculations';
import { useToast } from '@/hooks/use-toast';

export const useBankingDataSupabase = () => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [customersData, loansData, paymentsData] = await Promise.all([
        supabase.from('customers').select('*').order('created_at', { ascending: false }),
        supabase.from('loans').select('*').order('created_at', { ascending: false }),
        supabase.from('payments').select('*').order('payment_date', { ascending: false })
      ]);

      if (customersData.data) setCustomers(customersData.data);
      if (loansData.data) setLoans(loansData.data as Loan[]);
      if (paymentsData.data) setPayments(paymentsData.data as Payment[]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load banking data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (customer: Customer) => {
    try {
      const { error } = await supabase
        .from('customers')
        .insert([customer]);

      if (error) throw error;

      setCustomers(prev => [customer, ...prev]);
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add customer",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
  };

  const addLoan = async (loan: Loan) => {
    try {
      const { error } = await supabase
        .from('loans')
        .insert([loan]);

      if (error) throw error;

      setLoans(prev => [loan, ...prev]);
      
      toast({
        title: "Loan Created",
        description: `Loan ${loan.loan_id} has been successfully created.`,
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create loan",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
  };

  const addPayment = async (payment: Payment) => {
    try {
      // Insert payment
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([payment]);

      if (paymentError) throw paymentError;

      // Update loan details
      const loan = loans.find(l => l.loan_id === payment.loan_id);
      if (loan) {
        const allPayments = [...payments, payment].filter(p => p.loan_id === loan.loan_id);
        const remainingDetails = calculateRemainingDetails(loan, allPayments);
        const updatedLoan = {
          ...loan,
          ...remainingDetails,
          status: (remainingDetails.balance_amount <= 0 ? 'PAID_OFF' : 'ACTIVE') as 'ACTIVE' | 'PAID_OFF'
        };

        const { error: loanError } = await supabase
          .from('loans')
          .update({
            amount_paid: updatedLoan.amount_paid,
            balance_amount: updatedLoan.balance_amount,
            emis_left: updatedLoan.emis_left,
            status: updatedLoan.status
          })
          .eq('loan_id', loan.loan_id);

        if (loanError) throw loanError;

        setLoans(prev => prev.map(l => l.loan_id === loan.loan_id ? updatedLoan : l));
      }

      setPayments(prev => [payment, ...prev]);
      
      toast({
        title: "Payment Recorded",
        description: `Payment of ${payment.amount} has been recorded successfully.`,
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to record payment",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
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
    loading,
    addCustomer,
    addLoan,
    addPayment,
    getLoanById,
    getPaymentsByLoanId,
    getLoansByCustomerId,
    getCustomerById,
    refreshData: loadData
  };
};