import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.warn(
    '[supabaseAdmin] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set — ' +
      'database writes will fail until these are added to backend/.env'
  );
}

export const supabaseAdmin = url && serviceRoleKey ? createClient(url, serviceRoleKey) : null;
