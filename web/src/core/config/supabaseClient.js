import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.REACT_APP_SUPABASE_URL ||
  ''
).trim();

const supabaseAnonKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.REACT_APP_SUPABASE_API_KEY ||
  import.meta.env.REACT_APP_SUPABASE_ANON_KEY ||
  ''
).trim();

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Core:Supabase] Estamos teniendo problemas con la conexión a nuestros servidores.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
