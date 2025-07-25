import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Customer, Loan } from '@/types/banking';
import { calculateLoanDetails, formatCurrency, generateLoanId } from '@/lib/bankingCalculations';

interface LoanCreationFormProps {
  customers: Customer[];
  onLoanCreated: (loan: Loan) => Promise<{ success: boolean; error?: string }>;
}

export const LoanCreationForm = ({ customers, onLoanCreated }: LoanCreationFormProps) => {
  const [formData, setFormData] = useState({
    customer_id: '',
    loan_amount: '',
    loan_period_years: '',
    interest_rate_yearly: ''
  });
  const [calculatedDetails, setCalculatedDetails] = useState<{
    totalInterest: number;
    totalAmount: number;
    monthlyEmi: number;
  } | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Recalculate when amounts change
    if (['loan_amount', 'loan_period_years', 'interest_rate_yearly'].includes(field)) {
      const newData = { ...formData, [field]: value };
      if (newData.loan_amount && newData.loan_period_years && newData.interest_rate_yearly) {
        const details = calculateLoanDetails(
          parseFloat(newData.loan_amount),
          parseFloat(newData.loan_period_years),
          parseFloat(newData.interest_rate_yearly)
        );
        setCalculatedDetails(details);
      } else {
        setCalculatedDetails(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_id || !formData.loan_amount || !formData.loan_period_years || !formData.interest_rate_yearly) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!calculatedDetails) {
      toast.error('Calculation error');
      return;
    }

    const newLoan: Loan = {
      loan_id: generateLoanId(),
      customer_id: formData.customer_id,
      principal_amount: parseFloat(formData.loan_amount),
      total_amount: calculatedDetails.totalAmount,
      interest_rate: parseFloat(formData.interest_rate_yearly),
      loan_period_years: parseFloat(formData.loan_period_years),
      monthly_emi: calculatedDetails.monthlyEmi,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      amount_paid: 0,
      balance_amount: calculatedDetails.totalAmount,
      emis_left: parseFloat(formData.loan_period_years) * 12
    };

    const result = await onLoanCreated(newLoan);
    
    if (result.success) {
      // Reset form
      setFormData({
        customer_id: '',
        loan_amount: '',
        loan_period_years: '',
        interest_rate_yearly: ''
      });
      setCalculatedDetails(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create New Loan</CardTitle>
        <CardDescription>
          Fill in the details below to create a new loan for a customer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Select onValueChange={(value) => handleInputChange('customer_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.customer_id} value={customer.customer_id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="loan_amount">Loan Amount (₹)</Label>
              <Input
                id="loan_amount"
                type="number"
                placeholder="500000"
                value={formData.loan_amount}
                onChange={(e) => handleInputChange('loan_amount', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="loan_period">Loan Period (Years)</Label>
              <Input
                id="loan_period"
                type="number"
                placeholder="3"
                value={formData.loan_period_years}
                onChange={(e) => handleInputChange('loan_period_years', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interest_rate">Interest Rate (% per year)</Label>
              <Input
                id="interest_rate"
                type="number"
                step="0.1"
                placeholder="10.5"
                value={formData.interest_rate_yearly}
                onChange={(e) => handleInputChange('interest_rate_yearly', e.target.value)}
              />
            </div>
          </div>

          {calculatedDetails && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-sm">Loan Calculation Preview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Interest</p>
                  <p className="font-semibold">{formatCurrency(calculatedDetails.totalInterest)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Amount</p>
                  <p className="font-semibold">{formatCurrency(calculatedDetails.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Monthly EMI</p>
                  <p className="font-semibold text-primary">{formatCurrency(calculatedDetails.monthlyEmi)}</p>
                </div>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={!calculatedDetails}
          >
            Create Loan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};