import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hjuvtleiahtkzuzxoswc.supabase.co'
const supabaseKey = 'sb_publishable_koVZfbtBAv75xPODbileVg_LWxHoeLf'

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
})