import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createSupabaseClient = () => {
    if (!supabaseUrl || !supabaseAnonKey) {
        console.error("Supabase environment variables are missing!");
    }
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// Singleton instance that is safe for both client and server use
export const supabase = createSupabaseClient();
