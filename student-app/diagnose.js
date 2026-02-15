const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing connectivity to:', url);

if (!url || !key) {
  console.error('Environment variables missing!');
  process.exit(1);
}

const supabase = createClient(url, key);

async function test() {
  try {
    const { data, error } = await supabase.from('courses').select('id').limit(1);
    if (error) {
      console.error('Query Error:', error);
    } else {
      console.log('Success! Data fetched:', data);
    }
  } catch (err) {
    console.error('Fatal Fetch Error:', err);
  }
}

test();
