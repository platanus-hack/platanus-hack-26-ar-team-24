import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  supabaseAnonKey;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("Supabase credentials not configured for back/");
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  realtime: {
    transport: ws as unknown as never
  }
});

export async function getSupabaseUser(accessToken: string) {
  const { data, error } = await supabaseAdmin.auth.getUser(accessToken);

  if (error || !data.user) {
    throw new Error("Invalid Supabase access token");
  }

  return data.user;
}

export function createSupabaseUserClient(accessToken: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    realtime: {
      transport: ws as unknown as never
    }
  });
}
