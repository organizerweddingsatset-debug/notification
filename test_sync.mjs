import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kowupldtuweztpzhatvg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtvd3VwbGR0dXdlenRwemhhdHZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NjY5NjQsImV4cCI6MjA1MjQ0Mjk2NH0.Qs2p1lB4a6g1k3Z8x9y0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAllTables() {
  console.log('--- TESTING SUPABASE CONNECTION ---');
  const tables = [
    'users',
    'warga_profiles',
    'tagihan_iuran',
    'kas_keuangan',
    'surat_pengantar',
    'inventaris_rt',
    'peminjaman_inventaris',
    'pengumuman'
  ];

  const results = {};

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*');
      if (error) {
        results[table] = { status: 'ERROR', error: error.message };
        console.log(`❌ Table [${table}]: ERROR ->`, error.message);
      } else {
        results[table] = { status: 'OK', count: data ? data.length : 0 };
        console.log(`✅ Table [${table}]: OK -> ${data ? data.length : 0} rows found`);
      }
    } catch (e) {
      results[table] = { status: 'EXCEPTION', error: e.message };
      console.log(`⚠️ Table [${table}]: EXCEPTION ->`, e.message);
    }
  }

  console.log('\n--- SUMMARY ---');
  console.log(JSON.stringify(results, null, 2));
}

testAllTables();
