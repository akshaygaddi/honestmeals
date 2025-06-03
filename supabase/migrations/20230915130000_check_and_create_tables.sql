-- Script to check and create required tables for HonestMeals app
-- This will validate the database structure and create tables/columns if missing

-- Function to check if a table exists
CREATE OR REPLACE FUNCTION table_exists(table_name text) RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = lower(table_name)
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check if a column exists in a table
CREATE OR REPLACE FUNCTION column_exists(table_name text, column_name text) RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = lower(table_name) 
    AND column_name = lower(column_name)
  );
END;
$$ LANGUAGE plpgsql;

-- Check and create required tables
DO $$
DECLARE
  uuid_extension_exists boolean;
BEGIN
  -- Check if uuid-ossp extension exists
  SELECT EXISTS (
    SELECT FROM pg_extension WHERE extname = 'uuid-ossp'
  ) INTO uuid_extension_exists;
  
  -- Create uuid-ossp extension if it doesn't exist
  IF NOT uuid_extension_exists THEN
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  END IF;

  -- Check and create meals table
  IF NOT table_exists('meals') THEN
    CREATE TABLE public.meals (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      calories INTEGER NOT NULL,
      protein DECIMAL(10,2) NOT NULL,
      carbs DECIMAL(10,2) NOT NULL,
      fat DECIMAL(10,2) NOT NULL,
      fiber DECIMAL(10,2),
      image_url TEXT,
      category_id UUID,
      dietary_type_id UUID,
      food_type BOOLEAN,
      is_available BOOLEAN DEFAULT true,
      spice_level INTEGER,
      cooking_time_minutes INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    RAISE NOTICE 'Created meals table';
  ELSE
    -- Check if required columns exist in meals table
    IF NOT column_exists('meals', 'id') THEN
      ALTER TABLE public.meals ADD COLUMN id UUID PRIMARY KEY DEFAULT uuid_generate_v4();
    END IF;
    
    IF NOT column_exists('meals', 'name') THEN
      ALTER TABLE public.meals ADD COLUMN name TEXT NOT NULL;
    END IF;
    
    IF NOT column_exists('meals', 'price') THEN
      ALTER TABLE public.meals ADD COLUMN price DECIMAL(10,2) NOT NULL;
    END IF;
    
    IF NOT column_exists('meals', 'calories') THEN
      ALTER TABLE public.meals ADD COLUMN calories INTEGER NOT NULL;
    END IF;
    
    IF NOT column_exists('meals', 'image_url') THEN
      ALTER TABLE public.meals ADD COLUMN image_url TEXT;
    END IF;
    
    IF NOT column_exists('meals', 'food_type') THEN
      ALTER TABLE public.meals ADD COLUMN food_type BOOLEAN;
    END IF;
    
    IF NOT column_exists('meals', 'category_id') THEN
      ALTER TABLE public.meals ADD COLUMN category_id UUID;
    END IF;
    
    IF NOT column_exists('meals', 'is_available') THEN
      ALTER TABLE public.meals ADD COLUMN is_available BOOLEAN DEFAULT true;
    END IF;
    
    RAISE NOTICE 'Verified meals table structure';
  END IF;
  
  -- Check and create meal_categories table
  IF NOT table_exists('meal_categories') THEN
    CREATE TABLE public.meal_categories (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    RAISE NOTICE 'Created meal_categories table';
  END IF;
  
  -- Check and create dietary_types table
  IF NOT table_exists('dietary_types') THEN
    CREATE TABLE public.dietary_types (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    RAISE NOTICE 'Created dietary_types table';
  END IF;
  
  -- Check and create favorites table
  IF NOT table_exists('favorites') THEN
    CREATE TABLE public.favorites (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      meal_id UUID NOT NULL REFERENCES public.meals(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      UNIQUE(user_id, meal_id)
    );
    
    -- Add RLS policies
    ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
    
    -- Policy: Allow users to view only their own favorites
    CREATE POLICY "Users can view their own favorites" 
      ON public.favorites 
      FOR SELECT 
      USING (auth.uid() = user_id);
    
    -- Policy: Allow users to insert their own favorites
    CREATE POLICY "Users can insert their own favorites" 
      ON public.favorites 
      FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
    
    -- Policy: Allow users to delete their own favorites
    CREATE POLICY "Users can delete their own favorites" 
      ON public.favorites 
      FOR DELETE 
      USING (auth.uid() = user_id);
    
    RAISE NOTICE 'Created favorites table with RLS policies';
  ELSE
    -- Check if required columns exist in favorites table
    IF NOT column_exists('favorites', 'user_id') THEN
      ALTER TABLE public.favorites ADD COLUMN user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT column_exists('favorites', 'meal_id') THEN
      ALTER TABLE public.favorites ADD COLUMN meal_id UUID NOT NULL REFERENCES public.meals(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT column_exists('favorites', 'created_at') THEN
      ALTER TABLE public.favorites ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
    
    RAISE NOTICE 'Verified favorites table structure';
  END IF;
  
  -- Check and create orders table
  IF NOT table_exists('orders') THEN
    CREATE TABLE public.orders (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      total_amount DECIMAL(10,2) NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      payment_status TEXT NOT NULL DEFAULT 'pending',
      payment_method TEXT NOT NULL DEFAULT 'COD',
      delivery_address TEXT,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    -- Add RLS policies
    ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
    
    -- Policy: Allow users to view only their own orders
    CREATE POLICY "Users can view their own orders" 
      ON public.orders 
      FOR SELECT 
      USING (auth.uid() = customer_id);
    
    RAISE NOTICE 'Created orders table with RLS policies';
  END IF;
  
  -- Check and create order_items table
  IF NOT table_exists('order_items') THEN
    CREATE TABLE public.order_items (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
      meal_id UUID REFERENCES public.meals(id) ON DELETE SET NULL,
      quantity INTEGER NOT NULL,
      unit_price DECIMAL(10,2) NOT NULL,
      total_price DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    -- Add RLS policies
    ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
    
    -- Policy: Allow users to view only their own order items
    CREATE POLICY "Users can view their own order items" 
      ON public.order_items 
      FOR SELECT 
      USING (
        EXISTS (
          SELECT 1 FROM public.orders
          WHERE orders.id = order_items.order_id
          AND orders.customer_id = auth.uid()
        )
      );
    
    RAISE NOTICE 'Created order_items table with RLS policies';
  END IF;
  
  -- Check and create profiles table
  IF NOT table_exists('profiles') THEN
    CREATE TABLE public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      full_name TEXT,
      phone_number TEXT,
      address TEXT,
      role TEXT DEFAULT 'customer',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    -- Add RLS policies
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    
    -- Policy: Allow users to view only their own profile
    CREATE POLICY "Users can view their own profile" 
      ON public.profiles 
      FOR SELECT 
      USING (auth.uid() = id);
    
    -- Policy: Allow users to update their own profile
    CREATE POLICY "Users can update their own profile" 
      ON public.profiles 
      FOR UPDATE 
      USING (auth.uid() = id);
    
    RAISE NOTICE 'Created profiles table with RLS policies';
  END IF;
  
  -- Create function to get favorites with order history
  CREATE OR REPLACE FUNCTION get_favorites_with_history(p_user_id UUID)
  RETURNS TABLE (
    id UUID,
    meal_id UUID,
    created_at TIMESTAMPTZ,
    meal_name TEXT,
    meal_price DECIMAL(10,2),
    meal_image_url TEXT,
    meal_food_type BOOLEAN,
    meal_category_id UUID,
    meal_calories INTEGER,
    meal_is_available BOOLEAN,
    last_ordered TIMESTAMPTZ,
    order_count BIGINT
  ) AS $$
  BEGIN
    RETURN QUERY
    SELECT 
      f.id,
      f.meal_id,
      f.created_at,
      m.name AS meal_name,
      m.price AS meal_price,
      m.image_url AS meal_image_url,
      m.food_type AS meal_food_type,
      m.category_id AS meal_category_id,
      m.calories AS meal_calories,
      m.is_available AS meal_is_available,
      (
        SELECT MAX(o.created_at)
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE oi.meal_id = f.meal_id
        AND o.customer_id = p_user_id
      ) AS last_ordered,
      (
        SELECT COUNT(oi.id)
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE oi.meal_id = f.meal_id
        AND o.customer_id = p_user_id
        AND o.status = 'delivered'
      ) AS order_count
    FROM favorites f
    JOIN meals m ON f.meal_id = m.id
    WHERE f.user_id = p_user_id;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
  
  RAISE NOTICE 'Database structure verification complete';
END $$; 