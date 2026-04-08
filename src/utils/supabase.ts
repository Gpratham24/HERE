import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { KeychainStorage } from './KeychainStorage';

const SUPABASE_URL = 'https://tedrxvirhdculrlamahf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5_Eo2bERcuRlKZDIKygdFw_tepms7-T';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: KeychainStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
