/**
 * WhatsApp Gateway & Direct Chat Service for Portal RT 09
 */

export const getWaGatewayUrl = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('rt_wa_gateway_url');
    if (saved && saved.trim().startsWith('http')) return saved.trim();
  }
  return import.meta.env.VITE_WA_GATEWAY_URL || 'http://localhost:5001';
};

export const setWaGatewayUrl = (url) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('rt_wa_gateway_url', url.trim());
  }
};

// Format phone number to Indonesian international format (e.g. 081234 -> 6281234)
export const formatIndonesianPhone = (phone) => {
  if (!phone) return '';
  let cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '628' + cleaned.slice(1);
  }
  return cleaned;
};

// Check backend status & QR
export const checkWaStatus = async () => {
  try {
    const res = await fetch(`${getWaGatewayUrl()}/api/wa/status`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
};

// Restart or regenerate QR
export const restartWaGateway = async () => {
  try {
    const res = await fetch(`${getWaGatewayUrl()}/api/wa/restart`, { method: 'POST' });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// Logout WhatsApp session
export const logoutWaGateway = async () => {
  try {
    const res = await fetch(`${getWaGatewayUrl()}/api/wa/logout`, { method: 'POST' });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// Send message via Gateway Bot
export const sendWaMessage = async (to, message) => {
  try {
    const formattedPhone = formatIndonesianPhone(to);
    const res = await fetch(`${getWaGatewayUrl()}/api/wa/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: formattedPhone, message }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// Open Direct WhatsApp (wa.me) Click-to-Chat
export const openDirectWhatsApp = (phone, message) => {
  const formatted = formatIndonesianPhone(phone);
  if (!formatted) {
    alert('Nomor WhatsApp tidak valid atau belum diisi.');
    return;
  }
  const url = `https://wa.me/${formatted}?text=${encodeURIComponent(message || '')}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

// -----------------------------------------------------------------------------
// MESSAGE TEMPLATES
// -----------------------------------------------------------------------------

export const createTagihanMessage = ({ nama, blok, periode, nominal, rincian = [] }) => {
  const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
  
  let rincianText = '';
  if (Array.isArray(rincian) && rincian.length > 0) {
    rincianText = '\n📋 *Rincian Iuran:* \n' + rincian.map(r => `• ${r.nama || r.kategori}: ${fmt(r.nominal)}`).join('\n');
  }

  return `🔔 *TAGIHAN IURAN WARGA RT 09 / RW 14*
*Perumahan De Naila Village Blok G*

Yth. Bapak/Ibu *${nama || 'Warga'}* (Blok ${blok || '-'})

Berikut adalah informasi tagihan iuran lingkungan RT 09:
📅 *Periode:* ${periode || 'Bulan Ini'}
💰 *Total Tagihan:* *${fmt(nominal)}*${rincianText}

💳 *Metode Pembayaran:*
1. Scan QRIS Kas RT 09 pada Portal Warga
2. Transfer Bank ke Rekening Resmi Kas RT 09
3. Tunai melalui Bendahara RT 09

Mohon konfirmasi pembayaran atau unggah bukti transfer melalui Portal Warga RT 09.
Terima kasih atas partisipasi aktif Bapak/Ibu dalam menjaga kebersihan, keamanan, dan kerukunan lingkungan RT 09. 🙏✨

_Pesan otomatis dari Sistem Informasi RT 09 De Naila Village_`;
};

export const createKwitansiMessage = ({ noKwitansi, nama, blok, nominal, tanggal, periode, metode }) => {
  const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  return `🧾 *BUKTI PEMBAYARAN IURAN LUNAS (KWITANSI SAH)*
*Rukun Tetangga 09 / RW 14 De Naila Village*

Telah diterima pembayaran iuran warga dengan rincian:
🆔 *No. Kwitansi:* #${noKwitansi || 'KW-' + Date.now().toString().slice(-6)}
👤 *Nama Warga:* ${nama}
🏠 *Alamat/Blok:* Blok ${blok}
📅 *Periode Iuran:* ${periode}
💵 *Nominal:* *${fmt(nominal)}*
💳 *Metode:* ${metode || 'QRIS Kas RT'}
🗓️ *Tanggal Bayar:* ${tanggal || new Date().toLocaleDateString('id-ID')}
✅ *Status:* *LUNAS / VERIFIED*

Terima kasih atas pembayaran iuran tepat waktu. Bukti kwitansi resmi digital ini dapat diunduh/dilihat kembali pada akun Portal RT 09 Anda. 🌟

_Salam hangat, Pengurus & Bendahara RT 09 De Naila Village_`;
};

export const createSuratApprovalMessage = ({ nama, jenisSurat, noSurat, status, catatan }) => {
  const isApproved = status === 'Disetujui' || status === 'approved';

  return `📄 *STATUS PENGAJUAN SURAT PENGANTAR RT 09*
*De Naila Village Blok G*

Yth. *${nama}*,

Permohonan surat pengantar Anda telah diproses oleh Pengurus RT 09:
📑 *Jenis Surat:* ${jenisSurat}
🔢 *Nomor Surat:* ${noSurat || '-'}
📌 *Status:* *${isApproved ? '✅ DISETUJUI' : '⚠️ ' + (status || 'DIPROSES')}*
${catatan ? `💬 *Catatan Pengurus:* ${catatan}\n` : ''}
${isApproved ? 'Surat pengantar resmi digital sudah dapat diunduh dan dicetak melalui menu *Surat Pengantar* di Portal RT 09.' : 'Silakan lengkapi berkas atau hubungi pengurus RT jika ada pertanyaan.'}

Terima kasih. 🙏
_Pengurus RT 09 / RW 14 Sumputsarirejo, Driyorejo_`;
};
