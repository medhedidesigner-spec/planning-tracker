import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wqagrynakfpjkscrfvao.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxYWdyeW5ha2ZwamtzY3JmdmFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NDY3NjksImV4cCI6MjA5ODMyMjc2OX0.-yR_InbzbpVMOuTPOMLC2ks2w_SWB-2UwpsQTcbwZLs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
