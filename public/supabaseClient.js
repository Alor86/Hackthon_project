import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Replace these placeholders with values from Supabase Project Settings > API.
export const SUPABASE_URL = 'https://gntkddvfrosdqpyelaju.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_JN90tUOw0kiz14vRAQPyaQ_75oONy_P';

export const isSupabaseConfigured =
  !SUPABASE_URL.includes('YOUR-PROJECT-REF') &&
  !SUPABASE_ANON_KEY.includes('YOUR_SUPABASE_ANON_KEY');

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    params: { eventsPerSecond: 10 }
  }
});
