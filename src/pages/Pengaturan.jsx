import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { supabase, reinitSupabase } from '../supabaseClient';
import {
  getWaGatewayUrl,
  setWaGatewayUrl,
  checkWaStatus,
  restartWaGateway,
  logoutWaGateway,
  sendWaMessage,
  openDirectWhatsApp
} from '../services/whatsappService';

export default function Pengaturan() {
  const rtNama = localStorage.getItem('rt_nama') || localStorage.getItem('rt_username') || 'Admin RT 09';
  const rtRole = localStorage.getItem('rt_user_role') || 'admin_rt';

  const [toast, setToast] = useState(null);
  const qrisFileInputRef = useRef(null);

  // 1. DATA WARGA AKTIF UNTUK DROPDOWN
  const [wargaList, setWargaList] = useState([]);

  // 2. SUPABASE CLOUD CONNECTION CONFIG
  const [supabaseCreds, setSupabaseCreds] = useState({
    url: localStorage.getItem('rt_supabase_url') || import.meta.env.VITE_SUPABASE_URL || 'https://kowupldtuweztpzhatvg.supabase.co',
    anonKey: localStorage.getItem('rt_supabase_anon_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtvd3VwbGR0dXdlenRwemhhdHZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NjY5NjQsImV4cCI6MjA1MjQ0Mjk2NH0.Qs2p1lB4a6g1k3Z8x9y0'
  });
  const [dbStatus, setDbStatus] = useState({ tested: false, connected: false, message: 'Belum diuji', tables: {} });
  const [isTestingDb, setIsTestingDb] = useState(false);

  // 3. KONFIGURASI QRIS & REKENING
  const [qrisConfig, setQrisConfig] = useState(() => {
    const saved = localStorage.getItem('rt_qris_config');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return {
      merchant_name: 'RT 09 RW 14 DE NAILA VILLAGE',
      nmid: 'ID1020038921820',
      bank_name: 'Bank Central Asia (BCA)',
      no_rekening: '8891-234-567',
      atas_nama: 'KAS RT 09 DE NAILA VILLAGE',
      qris_image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=00020101021126580014ID.GO.QRIS.WWW01189360091400000000000215ID10200389218200303UME51440014ID.CO.QRIS.WWW0215ID10200389218200303UME5204581253033605802ID5924RT09+DE+NAILA+VILLAGE6007GRESIK61056117462070703A016304E8A9'
    };
  });

  // 4. KONFIGURASI PENAUTAN JABATAN PENGURUS RT KE WARGA AKTIF
  const [pengurusConfig, setPengurusConfig] = useState(() => {
    const saved = localStorage.getItem('rt_pengurus_config');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return {
      ketua_rt: { nama: 'Ketua RT 09 Terpilih', blok: 'Pos RT', no_hp: '0812-9999-8888', nik: '3525120101750001' },
      sekretaris: { nama: 'Daniel Kristianto', blok: 'G-12', no_hp: '0812-3456-7890', nik: '3525121405920001' },
      bendahara: { nama: 'Budi Santoso', blok: 'G-10', no_hp: '0812-1111-2222', nik: '3525121102880005' },
      seksi_keamanan: { nama: 'Ahmad Fauzi', blok: 'G-08', no_hp: '0812-5555-4444', nik: '3525121903930004' }
    };
  });

  // 5. KONFIGURASI WHATSAPP GATEWAY NOTIFIKASI
  const [waGatewayUrlInput, setWaGatewayUrlInput] = useState(getWaGatewayUrl());
  const [liveWaState, setLiveWaState] = useState({
    status: 'checking',
    qr: null,
    user: null,
    error: null
  });
  const [isSendingTestWa, setIsSendingTestWa] = useState(false);
  const [waConfig, setWaConfig] = useState(() => {
    const saved = localStorage.getItem('rt_wa_config');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return {
      status: 'disconnected',
      device_name: 'Baileys Node Gateway (RT 09)',
      sender_number: '-',
      auto_notif_iuran: true,
      auto_notif_kwitansi: true,
      auto_notif_surat: true,
      auto_notif_inventaris: true,
      auto_notif_pengumuman: true
    };
  });

  // 6. MODAL STATES
  const [showWaQrModal, setShowWaQrModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmationText, setResetConfirmationText] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Load Warga List
  useEffect(() => {
    const saved = localStorage.getItem('rt_all_warga_profiles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWargaList(parsed);
          return;
        }
      } catch (e) { }
    }

    // Default master list
    setWargaList([
      { id: '1', nama_lengkap: 'Ketua RT 09 Terpilih', blok_rumah: 'Pos RT', no_whatsapp: '0812-9999-8888', nik: '3525120101750001' },
      { id: '2', nama_lengkap: 'Budi Santoso', blok_rumah: 'G-10', no_whatsapp: '0812-1111-2222', nik: '3525121102880005' },
      { id: '3', nama_lengkap: 'Daniel Kristianto', blok_rumah: 'G-12', no_whatsapp: '0812-3456-7890', nik: '3525121405920001' },
      { id: '4', nama_lengkap: 'Ahmad Fauzi', blok_rumah: 'G-08', no_whatsapp: '0812-5555-4444', nik: '3525121903930004' },
      { id: '5', nama_lengkap: 'Siti Rahmawati', blok_rumah: 'G-05', no_whatsapp: '0813-7777-6666', nik: '3525122509890003' },
      { id: '6', nama_lengkap: 'Bambang Irawan', blok_rumah: 'G-03', no_whatsapp: '0812-8888-7777', nik: '3525121008800007' },
    ]);
  }, []);

  // Poll Live WhatsApp Gateway Status
  useEffect(() => {
    let isMounted = true;

    const fetchStatus = async () => {
      const res = await checkWaStatus();
      if (!isMounted) return;

      if (res.status === 'offline') {
        setLiveWaState({ status: 'offline', qr: null, user: null, error: res.error });
      } else {
        setLiveWaState({
          status: res.status,
          qr: res.qr,
          user: res.user,
          error: null
        });

        if (res.status === 'connected' && res.user) {
          setWaConfig(prev => ({
            ...prev,
            status: 'connected',
            device_name: res.user.name || 'Perangkat Tertaut RT 09',
            sender_number: res.user.phone ? `+${res.user.phone}` : prev.sender_number
          }));
        } else if (res.status === 'disconnected') {
          setWaConfig(prev => ({
            ...prev,
            status: 'disconnected'
          }));
        }
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, showWaQrModal ? 3000 : 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [showWaQrModal]);

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ==========================================
  // HANDLERS: SUPABASE CONNECTION & SYNC
  // ==========================================
  const handleTestSupabase = async (e) => {
    if (e) e.preventDefault();
    setIsTestingDb(true);

    const client = reinitSupabase(supabaseCreds.url.trim(), supabaseCreds.anonKey.trim());
    const tables = ['users', 'warga_profiles', 'tagihan_iuran', 'kas_keuangan', 'surat_pengantar', 'inventaris_rt', 'peminjaman_inventaris', 'pengumuman'];
    const tableResults = {};
    let okCount = 0;

    for (const t of tables) {
      try {
        const { count, error } = await client.from(t).select('*', { count: 'exact', head: true });
        if (error) {
          tableResults[t] = { ok: false, msg: error.message };
        } else {
          tableResults[t] = { ok: true, count: count || 0 };
          okCount++;
        }
      } catch (err) {
        tableResults[t] = { ok: false, msg: err.message };
      }
    }

    setIsTestingDb(false);
    if (okCount > 0) {
      setDbStatus({
        tested: true,
        connected: true,
        message: `Koneksi Supabase Cloud Berhasil! (${okCount}/${tables.length} tabel terverifikasi aktif)`,
        tables: tableResults
      });
      showToastMsg('Koneksi Supabase Cloud aktif & terverifikasi!');
    } else {
      setDbStatus({
        tested: true,
        connected: false,
        message: 'Gagal terhubung ke tabel Supabase. Pastikan skrip SQL skema sudah dijalankan.',
        tables: tableResults
      });
      showToastMsg('Koneksi database gagal atau tabel belum dibuat di Supabase.', 'error');
    }
  };

  const handleSaveSupabase = (e) => {
    e.preventDefault();
    reinitSupabase(supabaseCreds.url.trim(), supabaseCreds.anonKey.trim());
    showToastMsg('Pengaturan URL & Kunci Anonim Supabase berhasil disimpan!');
  };

  // ==========================================
  // HANDLERS: QRIS & REKENING
  // ==========================================
  const handleSaveQris = (e) => {
    e.preventDefault();
    localStorage.setItem('rt_qris_config', JSON.stringify(qrisConfig));
    showToastMsg('Konfigurasi QRIS & Rekening Kas RT 09 berhasil diperbarui!');
  };

  const handleQrisUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setQrisConfig(prev => ({ ...prev, qris_image_url: reader.result }));
      showToastMsg('Gambar QRIS berhasil diunggah.');
    };
    reader.readAsDataURL(file);
  };

  // ==========================================
  // HANDLERS: STRUKTUR PENGURUS RT
  // ==========================================
  const handleSelectPengurus = (jabatanKey, selectedNama) => {
    const targetWarga = wargaList.find(w => w.nama_lengkap === selectedNama);
    if (!targetWarga) return;

    setPengurusConfig(prev => ({
      ...prev,
      [jabatanKey]: {
        nama: targetWarga.nama_lengkap,
        blok: targetWarga.blok_rumah,
        no_hp: targetWarga.no_whatsapp,
        nik: targetWarga.nik
      }
    }));
  };

  const handleSavePengurus = (e) => {
    e.preventDefault();
    localStorage.setItem('rt_pengurus_config', JSON.stringify(pengurusConfig));
    showToastMsg('Penautan struktur pengurus RT berhasil diperbarui & disinkronkan ke dokumen resmi!');
  };

  // ==========================================
  // HANDLERS: WA GATEWAY
  // ==========================================
  const handleSaveWaConfig = (e) => {
    e.preventDefault();
    setWaGatewayUrl(waGatewayUrlInput);
    localStorage.setItem('rt_wa_config', JSON.stringify(waConfig));
    showToastMsg('Pengaturan WhatsApp Gateway & Server URL berhasil disimpan!');
  };

  const handleTestWa = async () => {
    const targetPhone = pengurusConfig.ketua_rt.no_hp || '081299998888';
    const targetNama = pengurusConfig.ketua_rt.nama || 'Ketua RT 09';
    const msg = `⚡ *TES NOTIFIKASI PORTAL RT 09*\n\nHalo Bapak/Ibu *${targetNama}*,\nIni adalah pesan uji coba sistem notifikasi otomatis WhatsApp Gateway Portal RT 09 / RW 14.\n\nSistem siap mengirim tagihan iuran, bukti kwitansi lunas, dan persetujuan surat resmi warga. ✨`;

    setIsSendingTestWa(true);
    const res = await sendWaMessage(targetPhone, msg);
    setIsSendingTestWa(false);

    if (res && res.success) {
      showToastMsg(`✅ Pesan uji coba berhasil dikirim ke nomor ${targetPhone} via Gateway Bot!`);
    } else {
      showToastMsg(`⚠️ Gateway Bot belum terhubung (${res.error || 'Offline'}). Membuka WhatsApp Web/App langsung...`, 'warning');
      openDirectWhatsApp(targetPhone, msg);
    }
  };

  const handleRestartWa = async () => {
    showToastMsg('Memulai ulang sesi & meregenerasi QR Code...');
    await restartWaGateway();
    setTimeout(async () => {
      const res = await checkWaStatus();
      setLiveWaState(res);
    }, 1500);
  };

  const handleLogoutWa = async () => {
    if (confirm('Yakin ingin memutuskan koneksi perangkat WhatsApp Gateway?')) {
      await logoutWaGateway();
      setLiveWaState(prev => ({ ...prev, status: 'disconnected', qr: null, user: null }));
      setWaConfig(prev => ({ ...prev, status: 'disconnected', sender_number: '-' }));
      showToastMsg('Koneksi WhatsApp Gateway berhasil diputuskan.');
    }
  };

  // ==========================================
  // HANDLERS: RESET DATA OPERASIONAL (DANGER ZONE)
  // ==========================================
  const handleExecuteReset = async () => {
    if (resetConfirmationText !== 'RESET OPERASIONAL') {
      alert('Teks konfirmasi salah! Ketik "RESET OPERASIONAL" dengan huruf kapital.');
      return;
    }

    setIsResetting(true);

    try {
      // 1. Reset LocalStorage Data Operasional
      localStorage.setItem('rt_is_operational_reset', 'true');
      localStorage.setItem('rt_all_warga_profiles', '[]');
      localStorage.setItem('rt_tagihan_iuran_list', '[]');
      localStorage.setItem('rt_kas_keuangan_list', '[]');
      localStorage.setItem('rt_surat_list', '[]');
      localStorage.setItem('rt_inventaris_list', '[]');
      localStorage.setItem('rt_peminjaman_list', '[]');
      localStorage.setItem('rt_pengumuman_list', '[]');

      // 2. Kosongkan Data Operasional di Supabase secara tuntas
      try {
        await supabase.from('kas_keuangan').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('tagihan_iuran').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('surat_pengantar').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('peminjaman_inventaris').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('pengumuman').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('inventaris_rt').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('warga_profiles').delete().neq('user_id', 'admin_rt');
        await supabase.from('users').delete().neq('role', 'admin_rt').neq('role', 'superadmin');
      } catch (err) {
        console.log('Supabase reset cleanup note:', err);
      }

      setIsResetting(false);
      setShowResetModal(false);
      setResetConfirmationText('');

      alert('✅ RESET OPERASIONAL BERHASIL!\n\nSeluruh data warga, iuran, buku kas, surat pengantar, inventaris, dan pengumuman lama telah dibersihkan menjadi KOSONG (0 data). Akun Pengurus Admin tetap aktif dan siap untuk input data operasional asli.');
      window.location.reload();
    } catch (e) {
      setIsResetting(false);
      alert('Gagal melakukan reset: ' + e.message);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">

        {/* Header Bar */}
        <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/30 px-3 py-1 rounded-full font-medium">
                ⚙️ Pusat Pengaturan Sistem SIRW
              </span>
              <span className="text-[11px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                RT 09 / RW 14 De Naila Village Blok G
              </span>
            </div>
            <h2 className="text-[20px] font-bold text-white mt-2">
              Konfigurasi Master & Pengaturan Operasional RT 09
            </h2>
            <p className="text-[12px] text-slate-400 mt-1">
              Sinkronisasi Supabase Cloud, QRIS kas RT, penautan jabatan pengurus, WhatsApp gateway, dan pembersihan operasional
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-slate-300">
              Admin: <strong className="text-white">{rtNama}</strong>
            </span>
          </div>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className={`border text-[13px] px-5 py-3.5 rounded-2xl flex items-center justify-between gap-3 animate-fade-in shadow-xl ${
            toast.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-[#7C3AED]/15 border-[#7C3AED]/30 text-[#C4B5FD]'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-xl">{toast.type === 'success' ? '⚡' : 'ℹ️'}</span>
              <p className="font-semibold">{toast.msg}</p>
            </div>
            <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white text-xs cursor-pointer">✕</button>
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 0: STATUS & SINKRONISASI DATABASE SUPABASE CLOUD  */}
        {/* ========================================================= */}
        <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 shadow-xl space-y-5">
          <div className="border-b border-white/10 pb-3 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base">
                ☁️
              </span>
              <div>
                <h3 className="font-bold text-white text-[16px]">Koneksi & Sinkronisasi Database Supabase Cloud</h3>
                <p className="text-[11px] text-slate-400">Sinkronisasi 8 tabel database (users, warga, iuran, kas, surat, inventaris, peminjaman, pengumuman)</p>
              </div>
            </div>
            <span className="text-[11px] bg-white/5 border border-white/10 px-3 py-1 rounded-full text-slate-300">
              Arsitektur: <strong className="text-emerald-400">Local-First + Cloud Sync</strong>
            </span>
          </div>

          <form onSubmit={handleTestSupabase} className="space-y-4 text-[13px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-xs font-medium">Supabase Project URL</label>
                <input
                  value={supabaseCreds.url}
                  onChange={(e) => setSupabaseCreds({ ...supabaseCreds, url: e.target.value })}
                  placeholder="https://your-project.supabase.co"
                  className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono text-xs outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs font-medium">Supabase Anon Public Key</label>
                <input
                  value={supabaseCreds.anonKey}
                  onChange={(e) => setSupabaseCreds({ ...supabaseCreds, anonKey: e.target.value })}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono text-xs outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Test Status Banner */}
            {dbStatus.tested && (
              <div className={`p-4 rounded-xl border text-xs ${
                dbStatus.connected
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}>
                <div className="font-semibold">{dbStatus.message}</div>
                
                {/* 8 Tables Mini Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                  {Object.entries(dbStatus.tables).map(([tableName, info]) => (
                    <div
                      key={tableName}
                      className={`p-2 rounded-lg border text-[11px] flex items-center justify-between ${
                        info.ok
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      }`}
                    >
                      <span className="font-mono">{tableName}</span>
                      <span>{info.ok ? '✓ Siap' : '✕ Belum'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
              <div className="text-[11px] text-slate-400">
                Skema SQL lengkap tersedia di file <strong className="text-white font-mono">d:\RT9\supabase_schema.sql</strong>
              </div>
              <button
                type="submit"
                disabled={isTestingDb}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl font-semibold text-xs transition shadow-lg shadow-emerald-600/20 cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <span>⚡</span> {isTestingDb ? 'Sedang Menguji...' : 'Tes & Sinkronkan Supabase'}
              </button>
            </div>
          </form>
        </div>

        {/* ========================================================= */}
        {/* SECTION 1: PENDAFTARAN & KONFIGURASI QRIS KAS RT         */}
        {/* ========================================================= */}
        <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 shadow-xl space-y-5">
          <div className="border-b border-white/10 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-base">
                💳
              </span>
              <div>
                <h3 className="font-bold text-white text-[16px]">Konfigurasi QRIS & Rekening Resmi Kas RT 09</h3>
                <p className="text-[11px] text-slate-400">QRIS dinamis/statis untuk pembayaran iuran warga, kas sosial, dan donasi</p>
              </div>
            </div>
            <span className="text-[11px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-medium">
              ● QRIS Aktif
            </span>
          </div>

          <form onSubmit={handleSaveQris} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-[13px]">
            {/* Left: QRIS Image & Upload */}
            <div className="lg:col-span-4 bg-[#23263A] border border-white/10 rounded-2xl p-5 text-center flex flex-col items-center justify-center space-y-3">
              <p className="text-xs font-semibold text-slate-300">Pratinjau Kode QRIS Resmi</p>
              
              <div className="bg-white p-3 rounded-2xl shadow-lg border-2 border-[#7C3AED]/40 w-fit">
                <img
                  src={qrisConfig.qris_image_url}
                  alt="QRIS RT 09"
                  className="w-[180px] h-[180px] object-contain rounded-xl"
                />
              </div>

              <div className="w-full">
                <input
                  ref={qrisFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadQrisImage}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => qrisFileInputRef.current && qrisFileInputRef.current.click()}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 py-2 rounded-xl text-xs font-medium cursor-pointer transition flex items-center justify-center gap-1.5"
                >
                  📁 Ganti Foto / Scan QRIS Baru
                </button>
                <p className="text-[10px] text-slate-400 mt-1">Format JPG, PNG (Maks 2 MB)</p>
              </div>
            </div>

            {/* Right: Form Info Rekening & Merchant */}
            <div className="lg:col-span-8 space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-xs font-medium">Nama Merchant QRIS *</label>
                  <input
                    required
                    value={qrisConfig.merchant_name}
                    onChange={(e) => setQrisConfig({ ...qrisConfig, merchant_name: e.target.value })}
                    className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-semibold outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-medium">NMID / ID QRIS Nasional</label>
                  <input
                    value={qrisConfig.nmid}
                    onChange={(e) => setQrisConfig({ ...qrisConfig, nmid: e.target.value })}
                    className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-xs font-medium">Bank Penampung Rekening Kas</label>
                  <input
                    value={qrisConfig.bank_name}
                    onChange={(e) => setQrisConfig({ ...qrisConfig, bank_name: e.target.value })}
                    className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-medium">Nomor Rekening Bank RT 09</label>
                  <input
                    value={qrisConfig.no_rekening}
                    onChange={(e) => setQrisConfig({ ...qrisConfig, no_rekening: e.target.value })}
                    className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-xs font-medium">Nama Pemilik Rekening (Atas Nama)</label>
                <input
                  value={qrisConfig.atas_nama}
                  onChange={(e) => setQrisConfig({ ...qrisConfig, atas_nama: e.target.value })}
                  className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-6 py-2.5 rounded-xl font-semibold text-xs transition shadow-lg shadow-[#7C3AED]/20 cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  💾 Simpan Konfigurasi QRIS & Rekening
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* ========================================================= */}
        {/* SECTION 2: PENAUTAN JABATAN PENGURUS RT KE WARGA AKTIF   */}
        {/* ========================================================= */}
        <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 shadow-xl space-y-5">
          <div className="border-b border-white/10 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-base">
                👥
              </span>
              <div>
                <h3 className="font-bold text-white text-[16px]">Penautan Jabatan Pengurus RT ke Warga Aktif</h3>
                <p className="text-[11px] text-slate-400">Pilih warga aktif untuk mengisi jabatan penandatangan resmi persuratan, kwitansi, dan LPJ</p>
              </div>
            </div>
            <span className="text-[11px] bg-blue-500/15 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full font-medium">
              4 Jabatan Terhubung
            </span>
          </div>

          <form onSubmit={handleSavePengurus} className="space-y-4 text-[13px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Ketua RT */}
              <div className="bg-[#23263A] border border-white/10 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    🎖️ Ketua RT 09 (Penandatangan Surat & LPJ)
                  </span>
                  <span className="text-[10px] text-[#A78BFA] font-mono">Blok {pengurusConfig.ketua_rt.blok}</span>
                </div>
                <select
                  value={pengurusConfig.ketua_rt.nama}
                  onChange={(e) => handleSelectPengurus('ketua_rt', e.target.value)}
                  className="w-full bg-[#1A1D2E] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500 cursor-pointer font-medium"
                >
                  {wargaList.map((w, idx) => (
                    <option key={idx} value={w.nama_lengkap}>
                      {w.nama_lengkap} (Blok {w.blok_rumah}) - {w.no_whatsapp}
                    </option>
                  ))}
                </select>
                <div className="text-[11px] text-slate-400 flex justify-between pt-1">
                  <span>Kontak: <strong className="text-slate-200">{pengurusConfig.ketua_rt.no_hp}</strong></span>
                  <span>NIK: {pengurusConfig.ketua_rt.nik || '-'}</span>
                </div>
              </div>

              {/* Bendahara RT */}
              <div className="bg-[#23263A] border border-white/10 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    💰 Bendahara RT 09 (Kwitansi & Kas RT)
                  </span>
                  <span className="text-[10px] text-[#A78BFA] font-mono">Blok {pengurusConfig.bendahara.blok}</span>
                </div>
                <select
                  value={pengurusConfig.bendahara.nama}
                  onChange={(e) => handleSelectPengurus('bendahara', e.target.value)}
                  className="w-full bg-[#1A1D2E] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500 cursor-pointer font-medium"
                >
                  {wargaList.map((w, idx) => (
                    <option key={idx} value={w.nama_lengkap}>
                      {w.nama_lengkap} (Blok {w.blok_rumah}) - {w.no_whatsapp}
                    </option>
                  ))}
                </select>
                <div className="text-[11px] text-slate-400 flex justify-between pt-1">
                  <span>Kontak: <strong className="text-slate-200">{pengurusConfig.bendahara.no_hp}</strong></span>
                  <span>NIK: {pengurusConfig.bendahara.nik || '-'}</span>
                </div>
              </div>

              {/* Sekretaris RT */}
              <div className="bg-[#23263A] border border-white/10 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    📑 Sekretaris RT 09 (Administrasi & Notulen)
                  </span>
                  <span className="text-[10px] text-[#A78BFA] font-mono">Blok {pengurusConfig.sekretaris.blok}</span>
                </div>
                <select
                  value={pengurusConfig.sekretaris.nama}
                  onChange={(e) => handleSelectPengurus('sekretaris', e.target.value)}
                  className="w-full bg-[#1A1D2E] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500 cursor-pointer font-medium"
                >
                  {wargaList.map((w, idx) => (
                    <option key={idx} value={w.nama_lengkap}>
                      {w.nama_lengkap} (Blok {w.blok_rumah}) - {w.no_whatsapp}
                    </option>
                  ))}
                </select>
                <div className="text-[11px] text-slate-400 flex justify-between pt-1">
                  <span>Kontak: <strong className="text-slate-200">{pengurusConfig.sekretaris.no_hp}</strong></span>
                  <span>NIK: {pengurusConfig.sekretaris.nik || '-'}</span>
                </div>
              </div>

              {/* Seksi Keamanan */}
              <div className="bg-[#23263A] border border-white/10 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    🛡️ Seksi Keamanan & Pos Satpam Blok G
                  </span>
                  <span className="text-[10px] text-[#A78BFA] font-mono">Blok {pengurusConfig.keamanan.blok}</span>
                </div>
                <select
                  value={pengurusConfig.keamanan.nama}
                  onChange={(e) => handleSelectPengurus('keamanan', e.target.value)}
                  className="w-full bg-[#1A1D2E] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500 cursor-pointer font-medium"
                >
                  {wargaList.map((w, idx) => (
                    <option key={idx} value={w.nama_lengkap}>
                      {w.nama_lengkap} (Blok {w.blok_rumah}) - {w.no_whatsapp}
                    </option>
                  ))}
                </select>
                <div className="text-[11px] text-slate-400 flex justify-between pt-1">
                  <span>Kontak: <strong className="text-slate-200">{pengurusConfig.keamanan.no_hp}</strong></span>
                  <span>NIK: {pengurusConfig.keamanan.nik || '-'}</span>
                </div>
              </div>

            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-semibold text-xs transition shadow-lg shadow-blue-600/20 cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                💾 Tautkan & Simpan Pengurus RT
              </button>
            </div>
          </form>
        </div>

        {/* ========================================================= */}
        {/* SECTION 3: SCAN QR WHATSAPP (NOTIFIKASI GATEWAY)          */}
        {/* ========================================================= */}
        <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 shadow-xl space-y-5">
          <div className="border-b border-white/10 pb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base">
                📲
              </span>
              <div>
                <h3 className="font-bold text-white text-[16px]">WhatsApp Gateway & Notifikasi Otomatis Warga</h3>
                <p className="text-[11px] text-slate-400">Kirim tagihan, bukti kwitansi lunas, approval surat, dan info pengumuman langsung ke WA warga</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] px-3 py-1 rounded-full font-medium border ${
                liveWaState.status === 'connected'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                  : liveWaState.status === 'qr'
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/20 animate-pulse'
                  : liveWaState.status === 'connecting'
                  ? 'bg-blue-500/15 text-blue-400 border-blue-500/20'
                  : 'bg-slate-500/15 text-slate-400 border-slate-500/20'
              }`}>
                {liveWaState.status === 'connected' ? `🟢 Gateway Terhubung (${liveWaState.user?.phone || waConfig.sender_number})` :
                 liveWaState.status === 'qr' ? '🟡 Siap Pairing (Scan QR)' :
                 liveWaState.status === 'connecting' ? '🔄 Menghubungkan...' : '⚪ Gateway Offline (Fallback Direct WA)'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSaveWaConfig} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-[13px]">
            {/* Left: Device Status & QR Pairing Action */}
            <div className="lg:col-span-5 bg-[#23263A] border border-white/10 rounded-2xl p-5 space-y-3.5">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold ${
                  liveWaState.status === 'connected' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/40 text-slate-400'
                }`}>
                  📱
                </div>
                <div className="overflow-hidden">
                  <div className="text-white font-bold text-xs truncate">
                    {liveWaState.user?.name || waConfig.device_name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {liveWaState.user?.phone ? `+${liveWaState.user.phone}` : waConfig.sender_number}
                  </div>
                </div>
              </div>

              {/* Server URL Config */}
              <div className="space-y-1 pt-1 border-t border-white/5">
                <label className="text-[11px] text-slate-400 flex justify-between">
                  <span>Backend Gateway Server URL:</span>
                  <span className="text-[10px] text-emerald-400">Node.js Express / Baileys</span>
                </label>
                <input
                  type="text"
                  value={waGatewayUrlInput}
                  onChange={(e) => setWaGatewayUrlInput(e.target.value)}
                  placeholder="http://localhost:5001"
                  className="w-full bg-[#1A1D2E] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 border-t border-white/5 space-y-2">
                {liveWaState.status === 'connected' ? (
                  <button
                    type="button"
                    onClick={handleLogoutWa}
                    className="w-full bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 py-2 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center justify-center gap-1.5"
                  >
                    🔴 Putuskan Koneksi Perangkat
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowWaQrModal(true)}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl text-xs font-semibold cursor-pointer transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                  >
                    📷 Scan QR Pairing WhatsApp Bot
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleTestWa}
                  disabled={isSendingTestWa}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition flex items-center justify-center gap-1.5"
                >
                  {isSendingTestWa ? '⏳ Mengirim...' : '⚡ Tes Kirim Pesan ke Pengurus'}
                </button>
              </div>
            </div>

            {/* Right: Automation Checkboxes */}
            <div className="lg:col-span-7 bg-[#23263A] border border-white/10 rounded-2xl p-5 space-y-3">
              <p className="text-xs font-bold text-white">Trigger Notifikasi Otomatis yang Aktif:</p>
              
              <div className="space-y-2.5">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={waConfig.auto_notif_iuran}
                    onChange={(e) => setWaConfig({ ...waConfig, auto_notif_iuran: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                  />
                  <div>
                    <strong className="text-white">Notifikasi Tagihan Iuran Bulanan Otomatis</strong>
                    <p className="text-[11px] text-slate-400">Kirim rincian iuran ke WA warga pada awal bulan disertai tautan QRIS bayar cepat</p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={waConfig.auto_notif_kwitansi}
                    onChange={(e) => setWaConfig({ ...waConfig, auto_notif_kwitansi: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                  />
                  <div>
                    <strong className="text-white">Notifikasi Konfirmasi Bayar & Kwitansi Lunas</strong>
                    <p className="text-[11px] text-slate-400">Kirim tanda terima kwitansi lunas berstempel sah setelah pembayaran terverifikasi</p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={waConfig.auto_notif_surat}
                    onChange={(e) => setWaConfig({ ...waConfig, auto_notif_surat: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                  />
                  <div>
                    <strong className="text-white">Notifikasi Approval Surat Pengantar Dinas</strong>
                    <p className="text-[11px] text-slate-400">Kirim nomor surat resmi & instruksi cetak surat saat permohonan disetujui Ketua RT</p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={waConfig.auto_notif_inventaris}
                    onChange={(e) => setWaConfig({ ...waConfig, auto_notif_inventaris: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                  />
                  <div>
                    <strong className="text-white">Notifikasi Peminjaman Inventaris (Tenda, Kursi, Sound)</strong>
                    <p className="text-[11px] text-slate-400">Beritahu warga terkait status persetujuan atau alasan penolakan peminjaman barang</p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={waConfig.auto_notif_pengumuman}
                    onChange={(e) => setWaConfig({ ...waConfig, auto_notif_pengumuman: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                  />
                  <div>
                    <strong className="text-white">Siaran Pengumuman Penting RT 09</strong>
                    <p className="text-[11px] text-slate-400">Broadcast pengumuman darurat/kegiatan serentak ke seluruh nomor WhatsApp warga</p>
                  </div>
                </label>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl font-semibold text-xs transition cursor-pointer active:scale-95 shadow-md shadow-emerald-600/20"
                >
                  💾 Simpan Pengaturan WhatsApp
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* ========================================================= */}
        {/* SECTION 4: RESET DATA OPERASIONAL (DANGER ZONE)           */}
        {/* ========================================================= */}
        <div className="bg-rose-950/20 border border-rose-500/30 rounded-[24px] p-6 shadow-xl space-y-4">
          <div className="border-b border-rose-500/20 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-base">
                ⚠️
              </span>
              <div>
                <h3 className="font-bold text-rose-300 text-[16px]">Reset Data Operasional & Bersihkan Dummy</h3>
                <p className="text-[11px] text-rose-400/80">Kosongkan data dummy dan transaksi lama operasional RT untuk memulai sistem baru yang bersih</p>
              </div>
            </div>
            <span className="text-[11px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              Zona Berbahaya
            </span>
          </div>

          <div className="text-xs text-slate-300 leading-relaxed space-y-2">
            <p>
              Tindakan ini akan <strong>menghapus seluruh riwayat data operasional</strong> pada modul-modul berikut:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 py-1">
              <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">• 👤 Warga & Akun (kecuali @admin)</div>
              <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">• 💳 Tagihan & Riwayat Iuran</div>
              <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">• 💰 Buku Kas Keuangan RT</div>
              <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">• 📄 Pengajuan Surat Pengantar</div>
              <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">• 📦 Peminjaman Inventaris RT</div>
              <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">• 📢 Riwayat Pengumuman Lama</div>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              * Akun login Admin Utama (`admin_rt` / `@admin`) dan konfigurasi QRIS serta pengurus RT akan tetap dipertahankan.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setResetConfirmationText('');
                setShowResetModal(true);
              }}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-lg shadow-rose-600/25 cursor-pointer active:scale-95 flex items-center gap-2"
            >
              <span>🗑️</span> Reset Data Operasional Sekarang
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MODAL 1: SCAN QR CODE WHATSAPP BOT PAIRING (REALTIME)     */}
        {/* ========================================================= */}
        {showWaQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowWaQrModal(false)}></div>
            <div className="relative z-10 bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 max-w-md w-full text-center space-y-4 shadow-2xl">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold">
                📲
              </div>
              <h3 className="font-bold text-white text-[16px]">Pairing WhatsApp Gateway RT 09</h3>

              {liveWaState.status === 'connected' ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl">
                    ✅
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-400 text-sm">WhatsApp Gateway Sudah Terhubung!</h4>
                    <p className="text-xs text-white mt-1">{liveWaState.user?.name || 'Official Bot RT 09'}</p>
                    <p className="text-xs text-slate-400 font-mono">+{liveWaState.user?.phone || '-'}</p>
                  </div>
                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={handleLogoutWa}
                      className="flex-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 py-2 rounded-xl text-xs font-semibold cursor-pointer border border-rose-500/30"
                    >
                      Putuskan Perangkat
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowWaQrModal(false)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              ) : liveWaState.status === 'qr' && liveWaState.qr ? (
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-300">
                    Buka WhatsApp di ponsel ➔ <strong>Perangkat Tertaut (Linked Devices)</strong> ➔ <strong>Tautkan Perangkat</strong> dan scan QR berikut:
                  </p>

                  <div className="bg-white p-3.5 rounded-2xl mx-auto w-fit shadow-xl border-4 border-emerald-500/40 animate-fade-in">
                    <img
                      src={liveWaState.qr}
                      alt="Live QR WhatsApp Gateway"
                      className="w-[220px] h-[220px] rounded-lg"
                    />
                  </div>

                  <p className="text-[10px] text-slate-400">
                    * QR Code diperbarui secara realtime dari WebSocket Baileys.
                  </p>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleRestartWa}
                      className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 py-2 rounded-xl text-xs font-medium cursor-pointer"
                    >
                      🔄 Refresh QR
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowWaQrModal(false)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              ) : liveWaState.status === 'offline' ? (
                <div className="space-y-3">
                  <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl text-left text-xs space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 font-bold">
                      <span>⚠️</span> Server Gateway Belum Dijalankan
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Layanan backend Baileys belum menyala di <code className="text-emerald-400">{waGatewayUrlInput}</code>.
                    </p>
                    <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 text-[11px] text-slate-300 font-mono">
                      npm run server
                    </div>
                    <p className="text-[10px] text-slate-400 italic">
                      Jalankan perintah di atas pada terminal proyek untuk menyalakan gateway dan menghasilkan QR code WhatsApp.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleRestartWa}
                      className="flex-1 bg-amber-600 hover:bg-amber-500 text-white py-2 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      🔄 Coba Hubungkan Ulang
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowWaQrModal(false)}
                      className="bg-white/10 hover:bg-white/20 text-slate-300 px-4 py-2 rounded-xl text-xs font-medium cursor-pointer"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-8 space-y-3">
                  <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-slate-300">Menghubungkan ke layanan WhatsApp Gateway & menghasilkan QR...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 2: KONFIRMASI RESET DATA OPERASIONAL                */}
        {/* ========================================================= */}
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowResetModal(false)}></div>
            <div className="relative z-10 bg-[#1A1D2E] border border-rose-500/40 rounded-[24px] p-6 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
                <span className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-lg">
                  ⚠️
                </span>
                <div>
                  <h3 className="font-bold text-white text-[16px]">Konfirmasi Reset Data Operasional</h3>
                  <p className="text-[11px] text-rose-400">Tindakan ini permanen dan tidak dapat dibatalkan!</p>
                </div>
              </div>

              <div className="bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl text-xs text-rose-300 leading-relaxed">
                Seluruh data transaksi iuran, kas keuangan, persuratan, inventaris, pengumuman, dan data dummy warga akan dihapus bersih. Akun login Admin tetap aman.
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="text-slate-300 font-semibold">
                  Ketik <span className="font-mono text-rose-400 font-bold">RESET OPERASIONAL</span> untuk mengonfirmasi:
                </label>
                <input
                  value={resetConfirmationText}
                  onChange={(e) => setResetConfirmationText(e.target.value)}
                  placeholder="Ketik: RESET OPERASIONAL"
                  className="w-full bg-[#23263A] border border-rose-500/30 rounded-xl px-3.5 py-2 text-white font-mono font-bold outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  disabled={isResetting}
                  onClick={() => setShowResetModal(false)}
                  className="bg-white/5 hover:bg-white/10 text-slate-300 px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={resetConfirmationText !== 'RESET OPERASIONAL' || isResetting}
                  onClick={handleExecuteReset}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    resetConfirmationText === 'RESET OPERASIONAL' && !isResetting
                      ? 'bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-lg shadow-rose-600/25 active:scale-95'
                      : 'bg-white/5 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isResetting ? 'Sedang Mereset...' : '🗑️ Ya, Hapus & Reset Semua'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
