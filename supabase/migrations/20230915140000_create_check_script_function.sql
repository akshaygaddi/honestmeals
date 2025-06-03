-- Create a function that can be called from the API to run the database check script
-- This function is accessible via RPC and runs with elevated privileges to make schema changes

CREATE OR REPLACE FUNCTION run_table_check_script()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- This runs with the privileges of the owner
AS $$
DECLARE
  log_messages text[] := ARRAY[]::text[];
  check_result boolean;
BEGIN
  -- Check each table in sequence and log results
  
  -- Check if uuid-ossp extension exists
  SELECT EXISTS (
    SELECT FROM pg_extension WHERE extname = 'uuid-ossp'
  ) INTO check_result;
  
  IF NOT check_result THEN
    -- Create uuid-ossp extension if it doesn't exist
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    log_messages := array_append(log_messages, 'Created uuid-ossp extension');
  ELSE
    log_messages := array_append(log_messages, 'uuid-ossp extension exists');
  END IF;

  -- Check tables existence
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'meals') THEN
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
    log_messages := array_append(log_messages, 'Created meals table');
  ELSE
    log_messages := array_append(log_messages, 'Meals table exists');
  END IF;

  -- Check meal_categories table
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'meal_categories') THEN
    CREATE TABLE public.meal_categories (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    log_messages := array_append(log_messages, 'Created meal_categories table');
  ELSE
    log_messages := array_append(log_messages, 'Meal categories table exists');
  END IF;
  
  -- Check dietary_types table
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dietary_types') THEN
    CREATE TABLE public.dietary_types (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    log_messages := array_append(log_messages, 'Created dietary_types table');
  ELSE
    log_messages := array_append(log_messages, 'Dietary types table exists');
  END IF;

  -- Check favorites table
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'favorites') THEN
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
    
    log_messages := array_append(log_messages, 'Created favorites table with RLS policies');
  ELSE
    log_messages := array_append(log_messages, 'Favorites table exists');
  END IF;

  -- Check orders table
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
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
    
    log_messages := array_append(log_messages, 'Created orders table with RLS policies');
  ELSE
    log_messages := array_append(log_messages, 'Orders table exists');
  END IF;

  -- Check order_items table
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'order_items') THEN
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
    
    log_messages := array_append(log_messages, 'Created order_items table with RLS policies');
  ELSE
    log_messages := array_append(log_messages, 'Order items table exists');
  END IF;

  -- Check profiles table
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
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
    
    log_messages := array_append(log_messages, 'Created profiles table with RLS policies');
  ELSE
    log_messages := array_append(log_messages, 'Profiles table exists');
  END IF;
  
  -- Check for and create get_favorites_with_history function
  IF NOT EXISTS (
    SELECT FROM pg_proc 
    WHERE proname = 'get_favorites_with_history' 
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    -- Create function to get favorites with order history
    EXECUTE $func$
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
    ) AS $inner$
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
    $inner$ LANGUAGE plpgsql SECURITY DEFINER;
    $func$;
    
    log_messages := array_append(log_messages, 'Created get_favorites_with_history function');
  ELSE
    log_messages := array_append(log_messages, 'get_favorites_with_history function exists');
  END IF;

  -- Return results as JSON
  RETURN json_build_object(
    'success', true,
    'tables_checked', array_length(log_messages, 1),
    'log', log_messages
  );
END;
$$; 