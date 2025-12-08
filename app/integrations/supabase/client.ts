
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';

const SUPABASE_URL = "https://veaigefhopjggahseszb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlYWlnZWZob3BqZ2dhaHNlc3piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1Mjc3NTUsImV4cCI6MjA3OTEwMzc1NX0.WsOhDm8Ec5YO8Wy5YRFRLYZ5MeYM-nsEcFaYhqYGO4E";

console.log('🔧 Initializing Supabase client...');

let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

try {
  supabaseInstance = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  console.log('✅ Supabase client initialized successfully');
} catch (error) {
  console.error('❌ Error initializing Supabase client:', error);
  // Create a fallback client that won't crash the app
  supabaseInstance = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export const supabase = supabaseInstance!;
