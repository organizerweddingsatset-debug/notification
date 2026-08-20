import express from 'express';
import cors from 'cors';
import pino from 'pino';
import QRCode from 'qrcode';
import dotenv from 'dotenv';
import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';
import { initSupabaseAuthState } from './supabaseAuthAdapter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kowupldtuweztpzhatvg.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

app.use(cors({ origin: '*' }));
app.use(express.json());

// Logger
const logger = pino({ level: 'silent' });

// Gateway State
let sock = null;
let currentQr = null;
let currentQrRaw = null;
let connectionStatus = 'disconnected'; // 'disconnected' | 'connecting' | 'qr' | 'connected'
let connectedUser = null;
let authAdapter = null;

// Format Indonesian phone numbers to WhatsApp JID (e.g. 08123456789 -> 628123456789@s.whatsapp.net)
function formatToJid(phone) {
  if (!phone) return null;
  let cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '628' + cleaned.slice(1);
  }
  if (!cleaned.endsWith('@s.whatsapp.net')) {
    cleaned = `${cleaned}@s.whatsapp.net`;
  }
  return cleaned;
}

// Initialize Baileys WhatsApp Connection
async function connectToWhatsApp() {
  try {
    connectionStatus = 'connecting';
    console.log('[WA-Bot] Initializing WhatsApp connection...');

    authAdapter = await initSupabaseAuthState(SUPABASE_URL, SUPABASE_KEY);
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`[WA-Bot] Using Baileys v${version.join('.')} (isLatest: ${isLatest})`);

    sock = makeWASocket({
      version,
      logger,
      printQRInTerminal: false,
      auth: {
        creds: authAdapter.state.creds,
        keys: makeCacheableSignalKeyStore(authAdapter.state.keys, logger),
      },
      generateHighQualityLinkPreview: true,
      syncFullHistory: false,
      markOnlineOnConnect: true,
    });

    sock.ev.on('creds.update', authAdapter.saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        currentQrRaw = qr;
        try {
          currentQr = await QRCode.toDataURL(qr);
          connectionStatus = 'qr';
          console.log('[WA-Bot] New QR code generated. Waiting for scan...');
        } catch (qrErr) {
          console.error('[WA-Bot] Error generating QR code data URL:', qrErr.message);
        }
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        console.log(`[WA-Bot] Connection closed. Status code: ${statusCode}. Reconnecting: ${shouldReconnect}`);

        currentQr = null;
        currentQrRaw = null;
        connectedUser = null;
        connectionStatus = 'disconnected';

        if (statusCode === DisconnectReason.loggedOut) {
          console.log('[WA-Bot] Device logged out. Clearing stored credentials...');
          await authAdapter.clearSession();
          setTimeout(connectToWhatsApp, 3000);
        } else if (shouldReconnect) {
          setTimeout(connectToWhatsApp, 4000);
        }
      } else if (connection === 'open') {
        connectionStatus = 'connected';
        currentQr = null;
        currentQrRaw = null;

        const userJid = sock.user?.id || '';
        const phone = userJid.split(':')[0] || userJid.split('@')[0] || '';
        connectedUser = {
          id: userJid,
          phone: phone,
          name: sock.user?.name || 'Gateway RT 09'
        };

        console.log(`[WA-Bot] ✅ WhatsApp connected successfully! Account: ${phone} (${connectedUser.name})`);
      }
    });

  } catch (err) {
    console.error('[WA-Bot] Fatal init error:', err.message);
    connectionStatus = 'disconnected';
    setTimeout(connectToWhatsApp, 5000);
  }
}

// -----------------------------------------------------------------------------
// REST API ENDPOINTS
// -----------------------------------------------------------------------------

// Health check endpoint (for keepalive & ping)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    wa_status: connectionStatus,
    connected_user: connectedUser
  });
});

// Get connection status & QR code
app.get('/api/wa/status', (req, res) => {
  res.json({
    status: connectionStatus,
    qr: currentQr,
    qrRaw: currentQrRaw,
    user: connectedUser,
    timestamp: new Date().toISOString()
  });
});

// Force restart connection or generate new QR
app.post('/api/wa/restart', async (req, res) => {
  try {
    if (sock) {
      sock.end(undefined);
    }
    setTimeout(connectToWhatsApp, 1000);
    res.json({ success: true, message: 'Restarting WhatsApp connection...' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Logout / Unlink Device
app.post('/api/wa/logout', async (req, res) => {
  try {
    if (sock) {
      try { await sock.logout(); } catch (e) {}
    }
    if (authAdapter) {
      await authAdapter.clearSession();
    }
    currentQr = null;
    currentQrRaw = null;
    connectedUser = null;
    connectionStatus = 'disconnected';

    setTimeout(connectToWhatsApp, 2000);
    res.json({ success: true, message: 'WhatsApp session logged out & cleared.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Send single message
app.post('/api/wa/send', async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ success: false, error: 'Parameters "to" and "message" are required.' });
  }

  if (connectionStatus !== 'connected' || !sock) {
    return res.status(503).json({
      success: false,
      error: 'WhatsApp Gateway is not connected. Please pair your device first.',
      status: connectionStatus
    });
  }

  try {
    const jid = formatToJid(to);
    const result = await sock.sendMessage(jid, { text: message });
    console.log(`[WA-Bot] Message sent to ${to} (${jid})`);
    res.json({ success: true, messageId: result.key.id, to: jid });
  } catch (err) {
    console.error(`[WA-Bot] Failed to send message to ${to}:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Broadcast message with delay
app.post('/api/wa/broadcast', async (req, res) => {
  const { numbers, message, delayMs = 1500 } = req.body;

  if (!Array.isArray(numbers) || numbers.length === 0 || !message) {
    return res.status(400).json({ success: false, error: 'Array "numbers" and "message" are required.' });
  }

  if (connectionStatus !== 'connected' || !sock) {
    return res.status(503).json({ success: false, error: 'WhatsApp Gateway is not connected.' });
  }

  // Run broadcast asynchronously so request doesn't timeout
  res.json({
    success: true,
    message: `Broadcast started to ${numbers.length} recipients.`,
    total: numbers.length
  });

  (async () => {
    let successCount = 0;
    let failCount = 0;

    for (const num of numbers) {
      try {
        const jid = formatToJid(num);
        if (jid) {
          await sock.sendMessage(jid, { text: message });
          successCount++;
          console.log(`[WA-Broadcast] Sent to ${num}`);
        }
      } catch (err) {
        failCount++;
        console.error(`[WA-Broadcast] Failed for ${num}:`, err.message);
      }
      // Delay between messages to prevent spam detection
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    console.log(`[WA-Broadcast] Finished: ${successCount} succeeded, ${failCount} failed.`);
  })();
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 WhatsApp Gateway Server running on port ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`====================================================`);
  connectToWhatsApp();
});
