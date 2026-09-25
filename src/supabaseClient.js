'use strict';

const { createClient } = require('@supabase/supabase-js');

// Replace these placeholders in the browser bridge for the static frontend.
const SUPABASE_URL = 'https://YOUR-PROJECT-REF.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    params: { eventsPerSecond: 10 }
  }
});

module.exports = { supabase, SUPABASE_URL, SUPABASE_ANON_KEY };