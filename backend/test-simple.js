require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('Testing connection to:', process.env.SUPABASE_URL);

// Simple ping test
supabase
  .from('sessions')
  .select('count')
  .limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ Error:', error.message);
      console.error('Full error:', error);
    } else {
      console.log('✅ Connected successfully!');
      console.log('Data:', data);
    }
    process.exit(error ? 1 : 0);
  })
  .catch(err => {
    console.error('❌ Fetch failed:', err.message);
    console.error('This might be a network/firewall issue or the project is still initializing');
    process.exit(1);
  });
