import { createClient } from '@supabase/supabase-js'

// Server-side only. Import this exclusively from Route Handlers or Server
// Components. SUPABASE_SERVICE_ROLE_KEY bypasses Row Level Security and
// must never be exposed to the client bundle (no NEXT_PUBLIC_ prefix).
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)
