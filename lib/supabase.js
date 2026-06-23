import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = 'https://bmrxzctswklqutzwykuu.supabase.co'
const supabaseAnonKey = 'sb_publishable_vZ_nANfOc1DsFfTGLwJTpA_iQFaNRdu'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true
    }
})

