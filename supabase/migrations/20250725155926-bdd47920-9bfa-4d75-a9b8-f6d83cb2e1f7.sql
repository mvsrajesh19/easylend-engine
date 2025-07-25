-- Create profiles table for employee information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  employee_id TEXT UNIQUE,
  role TEXT DEFAULT 'employee',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create customers table in Supabase
CREATE TABLE public.customers (
  customer_id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create policies for customers (employees can manage all customers)
CREATE POLICY "Authenticated users can view all customers" 
ON public.customers 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create customers" 
ON public.customers 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update customers" 
ON public.customers 
FOR UPDATE 
TO authenticated
USING (true);

-- Create loans table in Supabase
CREATE TABLE public.loans (
  loan_id TEXT NOT NULL PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES public.customers(customer_id),
  principal_amount DECIMAL NOT NULL,
  total_amount DECIMAL NOT NULL,
  interest_rate DECIMAL NOT NULL,
  loan_period_years INTEGER NOT NULL,
  monthly_emi DECIMAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  amount_paid DECIMAL NOT NULL DEFAULT 0,
  balance_amount DECIMAL NOT NULL,
  emis_left INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on loans
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

-- Create policies for loans
CREATE POLICY "Authenticated users can view all loans" 
ON public.loans 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create loans" 
ON public.loans 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update loans" 
ON public.loans 
FOR UPDATE 
TO authenticated
USING (true);

-- Create payments table in Supabase
CREATE TABLE public.payments (
  payment_id TEXT NOT NULL PRIMARY KEY,
  loan_id TEXT NOT NULL REFERENCES public.loans(loan_id),
  amount DECIMAL NOT NULL,
  payment_type TEXT NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create policies for payments
CREATE POLICY "Authenticated users can view all payments" 
ON public.payments 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create payments" 
ON public.payments 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates on profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, employee_name, employee_id)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data ->> 'employee_name', 'Employee'),
    COALESCE(new.raw_user_meta_data ->> 'employee_id', 'EMP' || EXTRACT(EPOCH FROM now())::bigint)
  );
  RETURN new;
END;
$$;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();