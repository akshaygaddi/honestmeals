-- Create favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_id UUID NOT NULL REFERENCES public.meals(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
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

-- Create function to create favorites table via RPC
CREATE OR REPLACE FUNCTION create_favorites_table()
RETURNS json AS $$
BEGIN
  -- The table creation happens in the migration, 
  -- this function is just a placeholder for the API to call
  RETURN json_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 