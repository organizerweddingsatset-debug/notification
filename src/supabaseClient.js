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

export const isSupabaseConfigured = () => {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  if (!url || !anonKey) return false;
  // If still set to the expired demo project URL without user override
  if (url.includes('kowupldtuweztpzhatvg.supabase.co')) return false;
  return url.startsWith('http');
};

let activeClient = createClient(getSupabaseUrl(), getSupabaseAnonKey());

// Chainable mock query builder for safe offline / unconfigured operation
function createOfflineQuery() {
  const query = {
    select: () => query,
    insert: () => query,
    update: () => query,
    upsert: () => query,
    delete: () => query,
    eq: () => query,
    neq: () => query,
    gt: () => query,
    gte: () => query,
    lt: () => query,
    lte: () => query,
    like: () => query,
    ilike: () => query,
    is: () => query,
    in: () => query,
    contains: () => query,
    containedBy: () => query,
    order: () => query,
    limit: () => query,
    range: () => query,
    single: () => Promise.resolve({ data: null, error: { message: 'Database offline: Supabase belum dikonfigurasi' } }),
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    then: (resolve) => Promise.resolve({ data: null, error: { message: 'Database offline: Supabase belum dikonfigurasi' } }).then(resolve),
    catch: (reject) => Promise.resolve({ data: null, error: { message: 'Database offline: Supabase belum dikonfigurasi' } }).catch(reject)
  };
  return query;
}

// Proxy wrapper guarantees stable reference across all imports even after reinitSupabase()
export const supabase = new Proxy({}, {
  get(_target, prop) {
    if (prop === 'from' && !isSupabaseConfigured()) {
      return () => createOfflineQuery();
    }
    if (prop === 'auth' && !isSupabaseConfigured()) {
      return {
        ...activeClient.auth,
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Offline mode' } }),
        signOut: () => Promise.resolve({ error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      };
    }
    const value = activeClient[prop];
    return typeof value === 'function' ? value.bind(activeClient) : value;
  }
});

export const reinitSupabase = (url, anonKey) => {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem('rt_supabase_url', url);
    if (anonKey) localStorage.setItem('rt_supabase_anon_key', anonKey);
  }
  activeClient = createClient(url || getSupabaseUrl(), anonKey || getSupabaseAnonKey());
  return activeClient;
};
