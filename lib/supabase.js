import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://tedrxvirhdculrlamahf.supabase.co'; // Replace with your Supabase URL
const supabaseAnonKey = 'sb_publishable_5_Eo2bERcuRlKZDIKygdFw_tepms7-T'; // Replace with your Supabase Anon Key

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
