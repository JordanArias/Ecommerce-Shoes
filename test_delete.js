require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lrhkbdkbbbrjvynieqta.supabase.co';
const supabaseKey = 'sb_publishable_xnH6P0xsJrsEPnnXqZ3OVw_ZibqFkhd';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  // We don't have a JWT to act as admin, but we can see what error we get.
  // If the function doesn't exist, we get 'Could not find the function'
  // If it exists but we aren't admin, we get 'Acceso denegado'
  const { data, error } = await supabase.rpc('delete_user_admin', { target_user_id: '11111111-1111-1111-1111-111111111111' });
  console.log('Result:', data);
  console.log('Error:', error);
}

test();
