import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase = null;

// Initialize only if keys are present to support hybrid fallback mode
if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('🔌 Supabase client successfully initialized in Online Mode.');
  } catch (error) {
    console.error('⚠️ Failed to initialize Supabase client:', error);
  }
} else {
  console.log('🔌 Supabase environment variables missing. Operating in Offline Demo Mode.');
}

export { supabase };
