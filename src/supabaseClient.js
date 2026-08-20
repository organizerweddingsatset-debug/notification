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
  return import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtvd3VwbGR0dXdlenRwemhhdHZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NjY5NjQsImV4cCI6MjA1MjQ0Mjk2NH0.Qs2p1lB4a6g1k3Z8x9y0';
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
