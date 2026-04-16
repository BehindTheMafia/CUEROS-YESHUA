import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://kqaphpyjxehxaridrvcx.supabase.co';

const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_0EUz8PO5WEtZXPqEt_sJvg_zP4bJUEo';

export const supabase = createClient(supabaseUrl, supabaseKey);
