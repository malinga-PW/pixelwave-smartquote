import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://supabasekong-uh7w2lgy5fmp5c7c5rjprb3c.46.202.164.69.sslip.io';
const supabaseAnonKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MDkxNTg2MCwiZXhwIjo0OTM2NTg5NDYwLCJyb2xlIjoiYW5vbiJ9.kY_dinwiUQWbx1ndhY0jj1gYtnh6XxlSr8pR7wZDzlo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔌 Connecting to Supabase...');
  
  // 1. Check pricing_materials
  const { data: materials, error: mError } = await supabase
    .from('pricing_materials')
    .select('name, category, cost_per_sheet')
    .limit(3);

  if (mError) {
    console.error('❌ Connection failed or schema missing:', mError.message);
    return;
  }

  console.log('\n✅ Successfully connected to Supabase database!');
  console.log('📦 Fetched Sample Data from [pricing_materials]:');
  console.table(materials);

  // 2. Check quotations count
  const { count, error: qError } = await supabase
    .from('quotations')
    .select('*', { count: 'exact', head: true });
  
  if (qError) {
    console.error('❌ Failed to fetch quotations:', qError.message);
  } else {
    console.log(`\n📄 Total Quotations stored in database: ${count}`);
  }

  // 3. Check pnl_expenses count
  const { count: pnlCount, error: pError } = await supabase
    .from('pnl_expenses')
    .select('*', { count: 'exact', head: true });
    
  if (pError) {
    console.error('❌ Failed to fetch pnl_expenses:', pError.message);
  } else {
    console.log(`💰 Total Expenses stored in database: ${pnlCount}`);
    console.log('\n✅ Data Sync is ACTIVE and working normally.');
  }
}

testConnection();
