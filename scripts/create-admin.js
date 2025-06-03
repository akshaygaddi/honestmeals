// Script to create an admin user
// Run with: node scripts/create-admin.js your-email@example.com

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Get email from command line args
const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address as an argument');
  console.error('Usage: node scripts/create-admin.js your-email@example.com');
  process.exit(1);
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase environment variables are missing');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  try {
    // Find the user by email
    const { data: user, error: userError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError) {
      console.error('Error finding user:', userError.message);
      
      // Check if the user exists in auth.users table directly
      const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error listing users:', authError.message);
        process.exit(1);
      }
      
      const matchedUser = authUser?.users?.find(u => u.email === email);
      
      if (!matchedUser) {
        console.error(`User with email ${email} not found`);
        process.exit(1);
      }
      
      // Use the user ID from auth.users
      const userId = matchedUser.id;
      
      // Update the profile role to admin
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin', updated_at: new Date().toISOString() })
        .eq('id', userId);
      
      if (updateError) {
        console.error('Error updating user role:', updateError.message);
        process.exit(1);
      }
      
      console.log(`User ${email} (${userId}) has been granted admin privileges`);
    } else {
      // User found, update the profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin', updated_at: new Date().toISOString() })
        .eq('id', user.id);
      
      if (updateError) {
        console.error('Error updating user role:', updateError.message);
        process.exit(1);
      }
      
      console.log(`User ${email} (${user.id}) has been granted admin privileges`);
    }
  } catch (error) {
    console.error('Unexpected error:', error.message);
    process.exit(1);
  }
}

main(); 