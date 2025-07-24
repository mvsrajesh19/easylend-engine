import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Customer, Loan } from '@/types/banking';
import { formatCurrency } from '@/lib/bankingCalculations';
import { User, TrendingUp, Clock, DollarSign } from 'lucide-react';

interface CustomerOverviewProps {
  customer: Customer;
  loans: Loan[];
}

export const CustomerOverview = ({ customer, loans }: CustomerOverviewProps) => {
  const totalLoans = loans.length;
  const activeLoans = loans.filter(loan => loan.status === 'ACTIVE').length;
  const totalPrincipal = loans.reduce((sum, loan) => sum + loan.principal_amount, 0);
  const totalAmount = loans.reduce((sum, loan) => sum + loan.total_amount, 0);
  const totalPaid = loans.reduce((sum, loan) => sum + loan.amount_paid, 0);
  const totalBalance = loans.reduce((sum, loan) => sum + loan.balance_amount, 0);

  const paymentProgress = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Customer Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Customer Name</p>
              <p className="text-2xl font-bold">{customer.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Customer ID</p>
                <p className="font-mono">{customer.customer_id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p>{formatDate(customer.created_at)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Portfolio Summary
          </CardTitle>
          <CardDescription>
            Overview of all loans and payment status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{totalLoans}</p>
              <p className="text-sm text-muted-foreground">Total Loans</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{activeLoans}</p>
              <p className="text-sm text-muted-foreground">Active Loans</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{formatCurrency(totalPrincipal)}</p>
              <p className="text-sm text-muted-foreground">Total Principal</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{formatCurrency(totalAmount - totalPrincipal)}</p>
              <p className="text-sm text-muted-foreground">Total Interest</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Payment Progress</span>
                <span>{paymentProgress.toFixed(1)}%</span>
              </div>
              <Progress value={paymentProgress} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-success/10 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Amount Paid</p>
                <p className="text-lg font-bold text-success">{formatCurrency(totalPaid)}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Balance Amount</p>
                <p className="text-lg font-bold">{formatCurrency(totalBalance)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Loans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Loan Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No loans found for this customer</p>
            </div>
          ) : (
            <div className="space-y-4">
              {loans.map((loan) => (
                <div key={loan.loan_id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{loan.loan_id}</h3>
                    <Badge variant={loan.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {loan.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Principal</p>
                      <p className="font-semibold">{formatCurrency(loan.principal_amount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Amount</p>
                      <p className="font-semibold">{formatCurrency(loan.total_amount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Monthly EMI</p>
                      <p className="font-semibold text-primary">{formatCurrency(loan.monthly_emi)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">EMIs Left</p>
                      <p className="font-semibold">{loan.emis_left}</p>
                    </div>
                  </div>

                  {loan.status === 'ACTIVE' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Payment Progress</span>
                        <span>{((loan.amount_paid / loan.total_amount) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={(loan.amount_paid / loan.total_amount) * 100} className="h-1" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};