import { createClient } from "@/utils/supabase/server"

/**
 * This is a server function to create the favorites table in Supabase
 * It can be run on-demand or during setup by calling this API endpoint
 */
export async function createFavoritesTable() {
  const supabase = await createClient()
  
  // SQL to create the favorites table if it doesn't exist
  const { error } = await supabase.rpc('create_favorites_table', {})
  
  if (error) {
    console.error('Error creating favorites table:', error)
    return { success: false, error }
  }
  
  return { success: true }
}

// Usage in an API route:
export async function POST(request: Request) {
  try {
    const result = await createFavoritesTable()
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
      status: result.success ? 200 : 500
    })
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    })
  }
} 