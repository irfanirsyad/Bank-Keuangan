-- Schema for Pencatatan Keuangan (ASFIN) - Supabase / PostgreSQL

-- 1. Create enum type for transaction type and wallet
CREATE TYPE transaction_type AS ENUM ('pemasukan', 'pengeluaran');
CREATE TYPE wallet_type AS ENUM ('Dana', 'Cash', 'Bank');
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- 2. Create Users Table (extends Supabase auth.users or custom user tables)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'user'::user_role NOT NULL,
    daily_limit NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow admins to read/write all profiles" ON public.profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role
        )
    );

-- 3. Create Transactions Table
CREATE TABLE public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type transaction_type NOT NULL,
    date DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    wallet wallet_type NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON public.transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" ON public.transactions
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins have full access to transactions" ON public.transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role
        )
    );

-- 4. Create Settings Table for CMS configurations
CREATE TABLE public.settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Init settings values with platform presets
INSERT INTO public.settings (key, value) VALUES
('platform_text', 'Revolusi Keuangan Dimulai dari ASFIN. Teknologi AI terdepan yang mengubah cara Anda mengelola keuangan.'),
('hero_image', 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6SuQjjsnP_YyM-waF2k0rTWLwCxVlxMjexHb9SVTQ6H0oiRZ2xBbopkJDpUnVLCvm_tqlDUNZ2ENVM_YgR16DsUN4OVq0ylsHGg5Rg24c1EfAFN9JwWgeD9welaWVrVnO4XzepqjYBMS_dJjLsoMN6HnGSXzJyMDJDjdEs3P8pHW1X2RBv45UCJ6bzyGqz2SHxg5Lvmu6D-BjGDAeAfkALyXR1P_LpJFhK4a-SVBiJ7eZUYN4RWGnMcEHLqGgG9yYZaHiphlxp8s'),
('announcement', 'Mulai hari ini, Anda dapat memanfaatkan pemindaian struk berbasis AI dengan Gemini 3.5 Flash secara instan!'),
('gemini_api_key', 'YOUR_API_KEY');

-- Enable RLS for Settings Table
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to system settings" ON public.settings
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify settings" ON public.settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role
        )
    );

-- 5. Create OTP verification table for custom credential flow
CREATE TABLE public.otps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code CHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for lightning fast searching
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(date);
CREATE INDEX idx_profiles_role ON public.profiles(role);
