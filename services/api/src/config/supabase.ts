import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import { config } from './env.js';

const supabaseUrl = config.supabase.url;
const supabaseKey = config.supabase.anonKey;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not configured');
}

export const supabaseClient = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    transport: ws,
  },
});

export const supabaseAdmin = createClient(
  supabaseUrl,
  config.supabase.serviceKey || supabaseKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    realtime: {
      transport: ws,
    },
  }
);
