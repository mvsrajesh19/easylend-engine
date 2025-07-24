import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loan, Payment, Customer } from '@/types/banking';
import { formatCurrency } from '@/lib/bankingCalculations';
import { CalendarDays, CreditCard, Banknote } from 'lucide-react';

interface LoanLedgerProps {
  loan: Loan;
  payments: Payment[];
  customer: Customer;
}

export const LoanLedger = ({ loan, payments, customer }: LoanLedgerProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const sortedPayments = [...payments].sort((a, b) => 
    new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Loan Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Loan Details
              </CardTitle>
              <CardDescription>
                Loan ID: {loan.loan_id} | Customer: {customer.name}
              </CardDescription>
            </div>
            <Badge variant={loan.status === 'ACTIVE' ? 'default' : 'secondary'}>
              {loan.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Principal Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(loan.principal_amount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(loan.total_amount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly EMI</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(loan.monthly_emi)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Interest Rate</p>
              <p className="text-2xl font-bold">{loan.interest_rate}% per year</p>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-success/10 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Amount Paid</p>
              <p className="text-xl font-bold text-success">{formatCurrency(loan.amount_paid)}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Balance Amount</p>
              <p className="text-xl font-bold">{formatCurrency(loan.balance_amount)}</p>
            </div>
            <div className="bg-primary/10 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">EMIs Left</p>
              <p className="text-xl font-bold text-primary">{loan.emis_left}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Transaction History
          </CardTitle>
          <CardDescription>
            Complete payment history for this loan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedPayments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No payments recorded yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPayments.map((payment) => (
                  <TableRow key={payment.payment_id}>
                    <TableCell className="font-mono text-sm">
                      {payment.payment_id}
                    </TableCell>
                    <TableCell>{formatDate(payment.payment_date)}</TableCell>
                    <TableCell>
                      <Badge variant={payment.payment_type === 'EMI' ? 'default' : 'secondary'}>
                        {payment.payment_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};