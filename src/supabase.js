import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase URL and anon key
const supabaseUrl = 'https://yswgnpivknjjbauqkttx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzd2ducGl2a25qamJhdXFrdHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTQ4ODEsImV4cCI6MjA2MzA5MDg4MX0.YL4vLOteh3jZIpBUI0BMvuBqOZHONGiH3OkTs2SXMcc';

// Create a Supabase client with simplified configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
}); 