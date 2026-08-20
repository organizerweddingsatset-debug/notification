import fs from 'fs';
import path from 'path';
import { useMultiFileAuthState } from '@whiskeysockets/baileys';
import { createClient } from '@supabase/supabase-js';

const SESSION_DIR = path.resolve('session_auth');

export async function initSupabaseAuthState(supabaseUrl, supabaseKey) {
  if (!fs.existsSync(SESSION_DIR)) {
    fs.mkdirSync(SESSION_DIR, { recursive: true });
  }

  let supabase = null;
  if (supabaseUrl && supabaseKey) {
    try {
      supabase = createClient(supabaseUrl, supabaseKey);
    } catch (err) {
      console.warn('[WA-Session] Supabase client init warning:', err.message);
    }
  }

  // 1. Try restore from Supabase if local folder is empty
  if (supabase) {
    try {
      const localFiles = fs.readdirSync(SESSION_DIR);
      if (localFiles.length === 0) {
        console.log('[WA-Session] Local session empty. Attempting to restore from Supabase...');
        const { data, error } = await supabase
          .from('whatsapp_sessions')
          .select('id, data')
          .limit(200);

        if (!error && data && data.length > 0) {
          for (const item of data) {
            const filePath = path.join(SESSION_DIR, item.id);
            fs.writeFileSync(filePath, typeof item.data === 'string' ? item.data : JSON.stringify(item.data));
          }
          console.log(`[WA-Session] Successfully restored ${data.length} session files from Supabase.`);
        }
      }
    } catch (err) {
      console.warn('[WA-Session] Supabase restore skipped:', err.message);
    }
  }

  // 2. Initialize standard Baileys multi-file state
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);

  // 3. Wrapper to save to both disk and Supabase
  const wrappedSaveCreds = async () => {
    await saveCreds();

    if (supabase) {
      try {
        const credsPath = path.join(SESSION_DIR, 'creds.json');
        if (fs.existsSync(credsPath)) {
          const credsContent = JSON.parse(fs.readFileSync(credsPath, 'utf-8'));
          await supabase.from('whatsapp_sessions').upsert({
            id: 'creds.json',
            data: credsContent,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
        }
      } catch (err) {
        // Silent fail if table not yet created
      }
    }
  };

  const clearSession = async () => {
    try {
      if (fs.existsSync(SESSION_DIR)) {
        fs.rmSync(SESSION_DIR, { recursive: true, force: true });
        fs.mkdirSync(SESSION_DIR, { recursive: true });
      }
      if (supabase) {
        await supabase.from('whatsapp_sessions').delete().neq('id', 'dummy');
      }
      console.log('[WA-Session] Session cleared successfully.');
    } catch (err) {
      console.error('[WA-Session] Error clearing session:', err.message);
    }
  };

  return {
    state,
    saveCreds: wrappedSaveCreds,
    clearSession,
    sessionDir: SESSION_DIR
  };
}
