import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoanCreationForm } from './LoanCreationForm';
import { PaymentForm } from './PaymentForm';
import { LoanLedger } from './LoanLedger';
import { CustomerOverview } from './CustomerOverview';
import { AddCustomerForm } from './AddCustomerForm';
import { useBankingDataSupabase } from '@/hooks/useBankingDataSupabase';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/lib/bankingCalculations';
import { 
  CreditCard, 
  Receipt, 
  FileText, 
  User, 
  DollarSign, 
  TrendingUp,
  Users,
  Activity,
  LogOut
} from 'lucide-react';

export const BankingDashboard = () => {
  const { signOut } = useAuth();
  const {
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
    refreshData
  } = useBankingDataSupabase();

  const [selectedLoanId, setSelectedLoanId] = useState<string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  // Dashboard statistics
  const activeLoans = loans.filter(loan => loan.status === 'ACTIVE').length;
  const totalLoanAmount = loans.reduce((sum, loan) => sum + loan.total_amount, 0);
  const totalAmountPaid = loans.reduce((sum, loan) => sum + loan.amount_paid, 0);
  const totalBalance = loans.reduce((sum, loan) => sum + loan.balance_amount, 0);

  const selectedLoan = selectedLoanId ? getLoanById(selectedLoanId) : undefined;
  const selectedCustomer = selectedCustomerId ? getCustomerById(selectedCustomerId) : undefined;

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading banking data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Bank Lending System</h1>
              <p className="text-muted-foreground">Comprehensive loan management platform</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-success" />
                <span className="text-sm font-medium">System Active</span>
              </div>
              <AddCustomerForm onCustomerAdded={addCustomer} />
              <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Customers</p>
                  <p className="text-2xl font-bold">{customers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <CreditCard className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Loans</p>
                  <p className="text-2xl font-bold">{activeLoans}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Disbursed</p>
                  <p className="text-lg font-bold">{formatCurrency(totalLoanAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount Collected</p>
                  <p className="text-lg font-bold">{formatCurrency(totalAmountPaid)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="create-loan" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="create-loan" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Create Loan
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Record Payment
            </TabsTrigger>
            <TabsTrigger value="ledger" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Loan Ledger
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create-loan" className="space-y-6">
            <div className="flex justify-center">
              <LoanCreationForm
                customers={customers}
                onLoanCreated={addLoan}
              />
            </div>
          </TabsContent>

          <TabsContent value="payment" className="space-y-6">
            <div className="flex justify-center">
              <PaymentForm
                loans={loans}
                onPaymentRecorded={addPayment}
              />
            </div>
          </TabsContent>

          <TabsContent value="ledger" className="space-y-6">
            <Card className="max-w-md mx-auto mb-6">
              <CardHeader>
                <CardTitle>Select Loan</CardTitle>
                <CardDescription>Choose a loan to view its complete ledger</CardDescription>
              </CardHeader>
              <CardContent>
                <Select onValueChange={setSelectedLoanId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a loan" />
                  </SelectTrigger>
                  <SelectContent>
                    {loans.map((loan) => {
                      const customer = getCustomerById(loan.customer_id);
                      return (
                        <SelectItem key={loan.loan_id} value={loan.loan_id}>
                          {loan.loan_id} - {customer?.name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {selectedLoan && (
              <LoanLedger
                loan={selectedLoan}
                payments={getPaymentsByLoanId(selectedLoan.loan_id)}
                customer={getCustomerById(selectedLoan.customer_id)!}
              />
            )}
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <Card className="max-w-md mx-auto mb-6">
              <CardHeader>
                <CardTitle>Select Customer</CardTitle>
                <CardDescription>Choose a customer to view their loan portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                <Select onValueChange={setSelectedCustomerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.customer_id} value={customer.customer_id}>
                        {customer.name} ({customer.customer_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {selectedCustomer && (
              <CustomerOverview
                customer={selectedCustomer}
                loans={getLoansByCustomerId(selectedCustomer.customer_id)}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};