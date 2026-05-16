CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.customers (
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

CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
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

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  sku TEXT,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  specifications JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_stages (
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

CREATE TABLE IF NOT EXISTS public.order_pricing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  previous_total_amount NUMERIC(10,2),
  new_total_amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  change_note TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  changed_by TEXT
);

ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS is_active BOOLEAN;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS is_active BOOLEAN;
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS currency TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS expected_delivery DATE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS placed_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS specifications JSONB;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;

ALTER TABLE public.order_stages ADD COLUMN IF NOT EXISTS stage_note TEXT;
ALTER TABLE public.order_stages ADD COLUMN IF NOT EXISTS is_completed BOOLEAN;
ALTER TABLE public.order_stages ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE public.order_stages ADD COLUMN IF NOT EXISTS updated_by TEXT;

ALTER TABLE public.order_pricing_history ADD COLUMN IF NOT EXISTS previous_total_amount NUMERIC(10,2);
ALTER TABLE public.order_pricing_history ADD COLUMN IF NOT EXISTS currency TEXT;
ALTER TABLE public.order_pricing_history ADD COLUMN IF NOT EXISTS change_note TEXT;
ALTER TABLE public.order_pricing_history ADD COLUMN IF NOT EXISTS changed_at TIMESTAMPTZ;
ALTER TABLE public.order_pricing_history ADD COLUMN IF NOT EXISTS changed_by TEXT;

UPDATE public.customers SET is_active = true WHERE is_active IS NULL;
UPDATE public.customers SET created_at = now() WHERE created_at IS NULL;
UPDATE public.admins SET is_active = true WHERE is_active IS NULL;
UPDATE public.admins SET created_at = now() WHERE created_at IS NULL;
UPDATE public.orders SET status = 'Order Received' WHERE status IS NULL OR trim(status) = '';
UPDATE public.orders SET currency = 'USD' WHERE currency IS NULL OR trim(currency) = '';
UPDATE public.orders SET payment_status = 'pending' WHERE payment_status IS NULL OR trim(payment_status) = '';
UPDATE public.orders SET placed_at = now() WHERE placed_at IS NULL;
UPDATE public.order_items SET created_at = now() WHERE created_at IS NULL;
UPDATE public.order_stages SET is_completed = true WHERE is_completed IS NULL;
UPDATE public.order_stages SET completed_at = now() WHERE completed_at IS NULL;
UPDATE public.order_pricing_history SET currency = 'USD' WHERE currency IS NULL OR trim(currency) = '';
UPDATE public.order_pricing_history SET changed_at = now() WHERE changed_at IS NULL;

ALTER TABLE public.customers ALTER COLUMN is_active SET DEFAULT true;
ALTER TABLE public.customers ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.admins ALTER COLUMN is_active SET DEFAULT true;
ALTER TABLE public.admins ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'Order Received';
ALTER TABLE public.orders ALTER COLUMN currency SET DEFAULT 'USD';
ALTER TABLE public.orders ALTER COLUMN payment_status SET DEFAULT 'pending';
ALTER TABLE public.orders ALTER COLUMN placed_at SET DEFAULT now();
ALTER TABLE public.order_items ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.order_stages ALTER COLUMN is_completed SET DEFAULT true;
ALTER TABLE public.order_stages ALTER COLUMN completed_at SET DEFAULT now();
ALTER TABLE public.order_pricing_history ALTER COLUMN currency SET DEFAULT 'USD';
ALTER TABLE public.order_pricing_history ALTER COLUMN changed_at SET DEFAULT now();

ALTER TABLE public.customers ALTER COLUMN is_active SET NOT NULL;
ALTER TABLE public.customers ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE public.admins ALTER COLUMN is_active SET NOT NULL;
ALTER TABLE public.admins ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE public.orders ALTER COLUMN status SET NOT NULL;
ALTER TABLE public.orders ALTER COLUMN currency SET NOT NULL;
ALTER TABLE public.orders ALTER COLUMN payment_status SET NOT NULL;
ALTER TABLE public.orders ALTER COLUMN placed_at SET NOT NULL;
ALTER TABLE public.order_items ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE public.order_stages ALTER COLUMN is_completed SET NOT NULL;
ALTER TABLE public.order_stages ALTER COLUMN completed_at SET NOT NULL;
ALTER TABLE public.order_pricing_history ALTER COLUMN currency SET NOT NULL;
ALTER TABLE public.order_pricing_history ALTER COLUMN changed_at SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'customers_full_name_not_blank'
  ) THEN
    ALTER TABLE public.customers
      ADD CONSTRAINT customers_full_name_not_blank CHECK (char_length(trim(full_name)) > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'customers_email_not_blank'
  ) THEN
    ALTER TABLE public.customers
      ADD CONSTRAINT customers_email_not_blank CHECK (char_length(trim(email)) > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'admins_full_name_not_blank'
  ) THEN
    ALTER TABLE public.admins
      ADD CONSTRAINT admins_full_name_not_blank CHECK (char_length(trim(full_name)) > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'admins_email_not_blank'
  ) THEN
    ALTER TABLE public.admins
      ADD CONSTRAINT admins_email_not_blank CHECK (char_length(trim(email)) > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_status_not_blank'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_status_not_blank CHECK (char_length(trim(status)) > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_total_amount_non_negative'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_total_amount_non_negative CHECK (total_amount >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_currency_not_blank'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_currency_not_blank CHECK (char_length(trim(currency)) > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_payment_status_valid'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_payment_status_valid CHECK (payment_status IN ('pending', 'paid', 'partial', 'overdue'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'order_items_product_name_not_blank'
  ) THEN
    ALTER TABLE public.order_items
      ADD CONSTRAINT order_items_product_name_not_blank CHECK (char_length(trim(product_name)) > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'order_items_quantity_positive'
  ) THEN
    ALTER TABLE public.order_items
      ADD CONSTRAINT order_items_quantity_positive CHECK (quantity > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'order_items_unit_price_non_negative'
  ) THEN
    ALTER TABLE public.order_items
      ADD CONSTRAINT order_items_unit_price_non_negative CHECK (unit_price >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'order_items_total_price_non_negative'
  ) THEN
    ALTER TABLE public.order_items
      ADD CONSTRAINT order_items_total_price_non_negative CHECK (total_price >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'order_stages_stage_name_not_blank'
  ) THEN
    ALTER TABLE public.order_stages
      ADD CONSTRAINT order_stages_stage_name_not_blank CHECK (char_length(trim(stage_name)) > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'order_pricing_history_new_total_amount_non_negative'
  ) THEN
    ALTER TABLE public.order_pricing_history
      ADD CONSTRAINT order_pricing_history_new_total_amount_non_negative CHECK (new_total_amount >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'order_pricing_history_previous_total_amount_non_negative'
  ) THEN
    ALTER TABLE public.order_pricing_history
      ADD CONSTRAINT order_pricing_history_previous_total_amount_non_negative CHECK (
        previous_total_amount IS NULL OR previous_total_amount >= 0
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'order_pricing_history_currency_not_blank'
  ) THEN
    ALTER TABLE public.order_pricing_history
      ADD CONSTRAINT order_pricing_history_currency_not_blank CHECK (char_length(trim(currency)) > 0);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON public.admins(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_placed_at ON public.orders(placed_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_stages_order_id ON public.order_stages(order_id);
CREATE INDEX IF NOT EXISTS idx_order_stages_order_id_stage_number ON public.order_stages(order_id, stage_number);
CREATE INDEX IF NOT EXISTS idx_order_pricing_history_order_id ON public.order_pricing_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_pricing_history_order_id_changed_at ON public.order_pricing_history(order_id, changed_at DESC);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_dual_role_profiles()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_TABLE_NAME = 'admins' THEN
    IF EXISTS (SELECT 1 FROM public.customers WHERE user_id = NEW.user_id) THEN
      RAISE EXCEPTION 'A user cannot exist in both admins and customers.';
    END IF;
  ELSIF TG_TABLE_NAME = 'customers' THEN
    IF EXISTS (SELECT 1 FROM public.admins WHERE user_id = NEW.user_id) THEN
      RAISE EXCEPTION 'A user cannot exist in both customers and admins.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.order_stage_name(stage_no INTEGER)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE stage_no
    WHEN 1 THEN 'Order Received'
    WHEN 2 THEN 'Raw Material / Leather Received'
    WHEN 3 THEN 'Manufacturing Started'
    WHEN 4 THEN 'Product in Production'
    WHEN 5 THEN 'Quality Check in Progress'
    WHEN 6 THEN 'Packaging Started'
    WHEN 7 THEN 'Order Dispatched from India'
    WHEN 8 THEN 'Shipment in Transit'
    WHEN 9 THEN 'Customs / International Transit'
    WHEN 10 THEN 'Out for Delivery'
    WHEN 11 THEN 'Delivered'
    ELSE NULL
  END;
$$;

CREATE OR REPLACE FUNCTION public.record_order_price_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.order_pricing_history (
      order_id,
      previous_total_amount,
      new_total_amount,
      currency,
      change_note,
      changed_at,
      changed_by
    )
    VALUES (
      NEW.id,
      NULL,
      NEW.total_amount,
      NEW.currency,
      'Initial order price recorded.',
      coalesce(NEW.placed_at, now()),
      'system'
    );

    RETURN NEW;
  END IF;

  IF NEW.total_amount IS DISTINCT FROM OLD.total_amount
     OR NEW.currency IS DISTINCT FROM OLD.currency THEN
    INSERT INTO public.order_pricing_history (
      order_id,
      previous_total_amount,
      new_total_amount,
      currency,
      change_note,
      changed_at,
      changed_by
    )
    VALUES (
      NEW.id,
      OLD.total_amount,
      NEW.total_amount,
      NEW.currency,
      'Order price updated.',
      now(),
      'system'
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
  user_name TEXT;
BEGIN
  user_role := lower(coalesce(new.raw_app_meta_data ->> 'role', new.raw_user_meta_data ->> 'role', 'customer'));
  user_name := coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, ''), '@', 1));

  IF user_role = 'admin' THEN
    DELETE FROM public.customers WHERE user_id = new.id;

    INSERT INTO public.admins (
      user_id,
      full_name,
      email,
      phone,
      is_active,
      updated_at
    )
    VALUES (
      new.id,
      user_name,
      new.email,
      new.raw_user_meta_data ->> 'phone',
      true,
      now()
    )
    ON CONFLICT (user_id) DO UPDATE
    SET
      full_name = EXCLUDED.full_name,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      is_active = true,
      updated_at = now();
  ELSE
    DELETE FROM public.admins WHERE user_id = new.id;

    INSERT INTO public.customers (
      user_id,
      full_name,
      email,
      phone,
      company_name,
      country,
      is_active,
      updated_at
    )
    VALUES (
      new.id,
      user_name,
      new.email,
      new.raw_user_meta_data ->> 'phone',
      new.raw_user_meta_data ->> 'company_name',
      new.raw_user_meta_data ->> 'country',
      true,
      now()
    )
    ON CONFLICT (user_id) DO UPDATE
    SET
      full_name = EXCLUDED.full_name,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      company_name = EXCLUDED.company_name,
      country = EXCLUDED.country,
      is_active = true,
      updated_at = now();
  END IF;

  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user(check_user_id UUID DEFAULT null)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admins
    WHERE user_id = coalesce(check_user_id, auth.uid())
      AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.update_order_stage(
  target_order_id UUID,
  target_stage_number INTEGER,
  target_stage_note TEXT DEFAULT null,
  updated_by_label TEXT DEFAULT null
)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  resolved_stage_name TEXT;
  updated_order public.orders;
BEGIN
  resolved_stage_name := public.order_stage_name(target_stage_number);

  IF resolved_stage_name IS NULL THEN
    RAISE EXCEPTION 'Invalid stage number: %', target_stage_number;
  END IF;

  INSERT INTO public.order_stages (
    order_id,
    stage_number,
    stage_name,
    stage_note,
    is_completed,
    completed_at,
    updated_by
  )
  VALUES (
    target_order_id,
    target_stage_number,
    resolved_stage_name,
    nullif(trim(target_stage_note), ''),
    true,
    now(),
    updated_by_label
  )
  ON CONFLICT (order_id, stage_number) DO UPDATE
  SET
    stage_name = EXCLUDED.stage_name,
    stage_note = EXCLUDED.stage_note,
    is_completed = true,
    completed_at = now(),
    updated_by = EXCLUDED.updated_by;

  UPDATE public.orders
  SET
    status = resolved_stage_name,
    updated_at = now()
  WHERE id = target_order_id
  RETURNING * INTO updated_order;

  IF updated_order.id IS NULL THEN
    RAISE EXCEPTION 'Order not found: %', target_order_id;
  END IF;

  RETURN updated_order;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_order_expected_delivery(
  target_order_id UUID,
  target_expected_delivery DATE
)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  updated_order public.orders;
BEGIN
  UPDATE public.orders
  SET
    expected_delivery = target_expected_delivery,
    updated_at = now()
  WHERE id = target_order_id
  RETURNING * INTO updated_order;

  IF updated_order.id IS NULL THEN
    RAISE EXCEPTION 'Order not found: %', target_order_id;
  END IF;

  RETURN updated_order;
END;
$$;

DROP TRIGGER IF EXISTS prevent_dual_role_admins ON public.admins;
CREATE TRIGGER prevent_dual_role_admins
  BEFORE INSERT OR UPDATE ON public.admins
  FOR EACH ROW
  EXECUTE PROCEDURE public.prevent_dual_role_profiles();

DROP TRIGGER IF EXISTS prevent_dual_role_customers ON public.customers;
CREATE TRIGGER prevent_dual_role_customers
  BEFORE INSERT OR UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE PROCEDURE public.prevent_dual_role_profiles();

DROP TRIGGER IF EXISTS customers_set_updated_at ON public.customers;
CREATE TRIGGER customers_set_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS admins_set_updated_at ON public.admins;
CREATE TRIGGER admins_set_updated_at
  BEFORE UPDATE ON public.admins
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS orders_set_updated_at ON public.orders;
CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS orders_record_price_change ON public.orders;
CREATE TRIGGER orders_record_price_change
  AFTER INSERT OR UPDATE OF total_amount, currency ON public.orders
  FOR EACH ROW
  EXECUTE PROCEDURE public.record_order_price_change();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_auth_user();

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_pricing_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "customers_own" ON public.customers;
DROP POLICY IF EXISTS "admins_own" ON public.admins;
DROP POLICY IF EXISTS "orders_own" ON public.orders;
DROP POLICY IF EXISTS "order_items_own" ON public.order_items;
DROP POLICY IF EXISTS "order_stages_own" ON public.order_stages;
DROP POLICY IF EXISTS "pricing_history_own" ON public.order_pricing_history;
DROP POLICY IF EXISTS "admins_read_customers" ON public.customers;
DROP POLICY IF EXISTS "admins_read_admins" ON public.admins;
DROP POLICY IF EXISTS "admins_read_orders" ON public.orders;
DROP POLICY IF EXISTS "admins_update_orders" ON public.orders;
DROP POLICY IF EXISTS "admins_read_items" ON public.order_items;
DROP POLICY IF EXISTS "admins_read_stages" ON public.order_stages;
DROP POLICY IF EXISTS "admins_upsert_stages" ON public.order_stages;
DROP POLICY IF EXISTS "admins_update_stages" ON public.order_stages;
DROP POLICY IF EXISTS "admins_read_pricing_history" ON public.order_pricing_history;
DROP POLICY IF EXISTS "admins_insert_pricing_history" ON public.order_pricing_history;

CREATE POLICY "customers_own" ON public.customers
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "admins_own" ON public.admins
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "orders_own" ON public.orders
  FOR SELECT TO authenticated
  USING (
    customer_id IN (
      SELECT id
      FROM public.customers
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "order_items_own" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    order_id IN (
      SELECT o.id
      FROM public.orders o
      JOIN public.customers c ON c.id = o.customer_id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "order_stages_own" ON public.order_stages
  FOR SELECT TO authenticated
  USING (
    order_id IN (
      SELECT o.id
      FROM public.orders o
      JOIN public.customers c ON c.id = o.customer_id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "pricing_history_own" ON public.order_pricing_history
  FOR SELECT TO authenticated
  USING (
    order_id IN (
      SELECT o.id
      FROM public.orders o
      JOIN public.customers c ON c.id = o.customer_id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "admins_read_customers" ON public.customers
  FOR SELECT TO authenticated
  USING (public.is_admin_user());

CREATE POLICY "admins_read_admins" ON public.admins
  FOR SELECT TO authenticated
  USING (public.is_admin_user());

CREATE POLICY "admins_read_orders" ON public.orders
  FOR SELECT TO authenticated
  USING (public.is_admin_user());

CREATE POLICY "admins_update_orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

CREATE POLICY "admins_read_items" ON public.order_items
  FOR SELECT TO authenticated
  USING (public.is_admin_user());

CREATE POLICY "admins_read_stages" ON public.order_stages
  FOR SELECT TO authenticated
  USING (public.is_admin_user());

CREATE POLICY "admins_upsert_stages" ON public.order_stages
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_user());

CREATE POLICY "admins_update_stages" ON public.order_stages
  FOR UPDATE TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

CREATE POLICY "admins_read_pricing_history" ON public.order_pricing_history
  FOR SELECT TO authenticated
  USING (public.is_admin_user());

CREATE POLICY "admins_insert_pricing_history" ON public.order_pricing_history
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_user());

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.order_stages;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END $$;
