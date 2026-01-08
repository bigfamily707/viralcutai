import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ndxlhkvzohqovzwdtvbf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5keGxoa3Z6b2hxb3Z6d2R0dmJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4ODM1MzYsImV4cCI6MjA4MzQ1OTUzNn0.BmQ1x5FbdQRXBFIC1Da8d_i-0L9FH3UIzlWS4RYwnIg';

export const supabase = createClient(supabaseUrl, supabaseKey);