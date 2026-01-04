import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization to ensure environment variables are loaded first
let _supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!_supabase) {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        'Missing Supabase environment variables. Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local'
      );
    }

    // Create Supabase client with service role key (bypasses RLS)
    _supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return _supabase;
}

// Export a getter function that initializes on first access
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = (client as any)[prop];
    // If it's a function, bind it to the client
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

// For client-side usage (if needed)
export const createSupabaseClient = (accessToken?: string) => {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL environment variable');
  }
  
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: accessToken ? {
        Authorization: `Bearer ${accessToken}`,
      } : {},
    },
  });
  return client;
};


