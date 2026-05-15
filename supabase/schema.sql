CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  company_name TEXT,
  country TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  order_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Order Received',
  total_amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  expected_delivery DATE,
  placed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  sku TEXT,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  specifications JSONB
);

CREATE TABLE public.order_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  stage_number INTEGER NOT NULL CHECK (stage_number BETWEEN 1 AND 11),
  stage_name TEXT NOT NULL,
  stage_note TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT true,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by TEXT,
  UNIQUE (order_id, stage_number)
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customers_own" ON public.customers
  FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);

CREATE POLICY "admins_own" ON public.admins
  FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);

CREATE POLICY "orders_own" ON public.orders
  FOR SELECT TO authenticated USING (
    customer_id IN (
      SELECT id FROM public.customers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "order_items_own" ON public.order_items
  FOR SELECT TO authenticated USING (
    order_id IN (
      SELECT o.id
      FROM public.orders o
      JOIN public.customers c ON c.id = o.customer_id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "order_stages_own" ON public.order_stages
  FOR SELECT TO authenticated USING (
    order_id IN (
      SELECT o.id
      FROM public.orders o
      JOIN public.customers c ON c.id = o.customer_id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "admins_read_customers" ON public.customers
  FOR SELECT TO authenticated USING (
    exists (
      select 1
      from public.admins a
      where a.user_id = (select auth.uid())
        and a.is_active = true
    )
  );

CREATE POLICY "admins_read_admins" ON public.admins
  FOR SELECT TO authenticated USING (
    exists (
      select 1
      from public.admins a
      where a.user_id = (select auth.uid())
        and a.is_active = true
    )
  );

CREATE POLICY "admins_read_orders" ON public.orders
  FOR SELECT TO authenticated USING (
    exists (
      select 1
      from public.admins a
      where a.user_id = (select auth.uid())
        and a.is_active = true
    )
  );

CREATE POLICY "admins_update_orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (
    exists (
      select 1
      from public.admins a
      where a.user_id = (select auth.uid())
        and a.is_active = true
    )
  )
  WITH CHECK (
    exists (
      select 1
      from public.admins a
      where a.user_id = (select auth.uid())
        and a.is_active = true
    )
  );

CREATE POLICY "admins_read_items" ON public.order_items
  FOR SELECT TO authenticated USING (
    exists (
      select 1
      from public.admins a
      where a.user_id = (select auth.uid())
        and a.is_active = true
    )
  );

CREATE POLICY "admins_read_stages" ON public.order_stages
  FOR SELECT TO authenticated USING (
    exists (
      select 1
      from public.admins a
      where a.user_id = (select auth.uid())
        and a.is_active = true
    )
  );

CREATE POLICY "admins_upsert_stages" ON public.order_stages
  FOR INSERT TO authenticated
  WITH CHECK (
    exists (
      select 1
      from public.admins a
      where a.user_id = (select auth.uid())
        and a.is_active = true
    )
  );

CREATE POLICY "admins_update_stages" ON public.order_stages
  FOR UPDATE TO authenticated
  USING (
    exists (
      select 1
      from public.admins a
      where a.user_id = (select auth.uid())
        and a.is_active = true
    )
  )
  WITH CHECK (
    exists (
      select 1
      from public.admins a
      where a.user_id = (select auth.uid())
        and a.is_active = true
    )
  );

ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_stages;
