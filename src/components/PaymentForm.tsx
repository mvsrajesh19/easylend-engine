import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loan, Payment } from '@/types/banking';
import { formatCurrency, generatePaymentId } from '@/lib/bankingCalculations';

interface PaymentFormProps {
  loans: Loan[];
  onPaymentRecorded: (payment: Payment) => void;
}

export const PaymentForm = ({ loans, onPaymentRecorded }: PaymentFormProps) => {
  const [formData, setFormData] = useState({
    loan_id: '',
    amount: '',
    payment_type: '' as 'EMI' | 'LUMP_SUM' | ''
  });

  const selectedLoan = loans.find(loan => loan.loan_id === formData.loan_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.loan_id || !formData.amount || !formData.payment_type) {
      toast.error('Please fill in all fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    
    if (amount <= 0) {
      toast.error('Payment amount must be greater than 0');
      return;
    }

    if (selectedLoan && amount > selectedLoan.balance_amount) {
      toast.error('Payment amount cannot exceed the remaining balance');
      return;
    }

    const newPayment: Payment = {
      payment_id: generatePaymentId(),
      loan_id: formData.loan_id,
      amount: amount,
      payment_type: formData.payment_type,
      payment_date: new Date().toISOString()
    };

    onPaymentRecorded(newPayment);
    
    // Reset form
    setFormData({
      loan_id: '',
      amount: '',
      payment_type: ''
    });

    toast.success('Payment recorded successfully!');
  };

  const suggestEmiAmount = () => {
    if (selectedLoan) {
      setFormData(prev => ({
        ...prev,
        amount: selectedLoan.monthly_emi.toString(),
        payment_type: 'EMI'
      }));
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Record Payment</CardTitle>
        <CardDescription>
          Record an EMI or lump sum payment for an existing loan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="loan">Select Loan</Label>
            <Select onValueChange={(value) => setFormData(prev => ({ ...prev, loan_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a loan" />
              </SelectTrigger>
              <SelectContent>
                {loans.filter(loan => loan.status === 'ACTIVE').map((loan) => (
                  <SelectItem key={loan.loan_id} value={loan.loan_id}>
                    {loan.loan_id} - Balance: {formatCurrency(loan.balance_amount)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedLoan && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-sm">Loan Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Monthly EMI</p>
                  <p className="font-semibold">{formatCurrency(selectedLoan.monthly_emi)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Remaining Balance</p>
                  <p className="font-semibold">{formatCurrency(selectedLoan.balance_amount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">EMIs Left</p>
                  <p className="font-semibold">{selectedLoan.emis_left}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-semibold text-success">{selectedLoan.status}</p>
                </div>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={suggestEmiAmount}
              >
                Use EMI Amount
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="18055.56"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_type">Payment Type</Label>
              <Select onValueChange={(value: 'EMI' | 'LUMP_SUM') => setFormData(prev => ({ ...prev, payment_type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMI">EMI Payment</SelectItem>
                  <SelectItem value="LUMP_SUM">Lump Sum Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Record Payment
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};