import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hoemkcyjfucmouzxcebe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvZW1rY3lqZnVjbW91enhjZWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NjI1MDEsImV4cCI6MjA1NDIzODUwMX0.9EkgsNbpAqVm6g-zQrX427DjP2goLT4VHA7cyz-re-E';

export const supabase = createClient(supabaseUrl, supabaseKey);