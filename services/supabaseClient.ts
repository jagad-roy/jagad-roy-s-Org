
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Using the provided credentials for the 'jagad-roy' Supabase project
const supabaseUrl = 'https://xqkihodpmqawnfctvhki.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhxa2lob2RwbXFhd25mY3R2aGtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMjU5MTEsImV4cCI6MjA4NTgwMTkxMX0.3i_M7M-6FGAfvJGFU9ldGIGDGYsfJxt3CHgh6d6pkJ0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
