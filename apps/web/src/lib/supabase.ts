import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zzwfvorthznbkpgsidrq.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_MNuzV27PQzxHNBWDP3Geow_AJ_eVQ3-'

export const supabase = createClient(supabaseUrl, supabaseKey)
