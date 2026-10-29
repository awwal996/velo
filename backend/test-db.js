/**
 * Quick Database Connection Test
 * Run this to verify Supabase setup is complete
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

console.log('\n🧪 Testing Supabase Connection...\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing credentials in .env file!');
  console.log('   Add SUPABASE_URL and SUPABASE_SERVICE_KEY\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('✅ Credentials found');
  console.log(`📡 Connecting to: ${supabaseUrl}\n`);
  
  // Test 1: Check if tables exist
  console.log('Test 1: Checking database tables...');
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (error) throw error;
    
    const tableNames = data?.map(t => t.table_name) || [];
    const requiredTables = ['sessions', 'conversations', 'messages', 'memories', 'search_history', 'feedback'];
    const missingTables = requiredTables.filter(t => !tableNames.includes(t));
    
    if (missingTables.length > 0) {
      console.log('❌ Missing tables:', missingTables.join(', '));
      console.log('\n💡 Solution:');
      console.log('   1. Open Supabase Dashboard → SQL Editor');
      console.log('   2. Copy contents of backend/schema.sql');
      console.log('   3. Paste and click RUN\n');
      process.exit(1);
    }
    
    console.log('✅ All required tables exist!');
    console.log('   Found:', requiredTables.join(', '));
  } catch (err) {
    console.error('❌ Table check failed:', err.message);
    console.log('\n💡 Make sure you ran backend/schema.sql in Supabase SQL Editor\n');
    process.exit(1);
  }
  
  // Test 2: Try to create a test session
  console.log('\nTest 2: Testing write permissions...');
  try {
    const testId = 'test-' + Date.now();
    const { data, error } = await supabase
      .from('sessions')
      .insert({ session_id: testId })
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('✅ Write test passed!');
    
    // Clean up
    await supabase.from('sessions').delete().eq('session_id', testId);
  } catch (err) {
    console.error('❌ Write test failed:', err.message);
    console.log('\n💡 Check your Supabase service_role key in .env\n');
    process.exit(1);
  }
  
  // Test 3: Try to read
  console.log('\nTest 3: Testing read permissions...');
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    console.log('✅ Read test passed!');
  } catch (err) {
    console.error('❌ Read test failed:', err.message);
    process.exit(1);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🎉 ALL TESTS PASSED!');
  console.log('='.repeat(50));
  console.log('\nYour Supabase database is ready to use!');
  console.log('Start the server with: node server.js\n');
}

test().catch(err => {
  console.error('\n❌ Unexpected error:', err);
  process.exit(1);
});
