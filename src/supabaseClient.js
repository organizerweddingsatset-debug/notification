import { createClient } from '@supabase/supabase-js';

const getSupabaseUrl = () => {
  if (typeof window !== 'undefined') {
    const localUrl = localStorage.getItem('rt_supabase_url');
    if (localUrl && localUrl.trim().startsWith('http')) return localUrl.trim();
  }
  return import.meta.env.VITE_SUPABASE_URL || 'https://kowupldtuweztpzhatvg.supabase.co';
};

const getSupabaseAnonKey = () => {
  if (typeof window !== 'undefined') {
    const localKey = localStorage.getItem('rt_supabase_anon_key');
    if (localKey && localKey.trim().length > 10) return localKey.trim();
  }
  return import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtvd3VwbGR0dXdlenRwemhhdHZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMDU4NjksImV4cCI6MjEwMTY4MTg2OX0.0K4ll5wDNB-aY_0Wis5RWm61k7YjhsF8h3b-v5Al7WA';
};

export let supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey());

export const reinitSupabase = (url, anonKey) => {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem('rt_supabase_url', url);
    if (anonKey) localStorage.setItem('rt_supabase_anon_key', anonKey);
  }
  supabase = createClient(url || getSupabaseUrl(), anonKey || getSupabaseAnonKey());
  return supabase;
};
