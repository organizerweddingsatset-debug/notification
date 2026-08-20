import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../supabaseClient';

const INITIAL_PENGUMUMAN = [
  {
    id: 'ann-0',
    judul: 'Jadwal kerja Bhakti Agustus',
    kategori: 'Kerja Bakti',
    kategoriIcon: '🧹',
    konten: `<h3><strong>📢 PANGGILAN GOTONG ROYONG UNTUK SELURUH WARGA BLOK G! 📢</strong></h3>
<p>Halo Bapak/Ibu Warga De Naila Village Blok G yang budiman,</p>
<p>Semangat Merdeka! 🇮🇩🔥<br>Tidak terasa kita akan segera menyambut HUT Kemerdekaan RI ke-81. Agar komplek tercinta kita tampil beda, semarak, dan penuh aura merah putih, kami mengundang seluruh warga untuk turun tangan dan seru-seruan bareng dalam acara <strong>Kerja Bakti & Hias Komplek!</strong></p>
<p>Mari kita buktikan kekompakan dan semangat persaudaraan kita pada:</p>
<ol>
  <li><strong>Hari/Tanggal:</strong> Sabtu, 25 Agustus 2026<br><strong>Waktu:</strong> 19.30 WIB - Selesai</li>
  <li><strong>Hari/Tanggal:</strong> Minggu, 26 Agustus 2026<br><strong>Waktu:</strong> 07.00 WIB - Selesai</li>
</ol>
<p>📍 <strong>Lokasi:</strong> Fasum / Semesta De Naila Village Blok G<br>👕 <strong>Pakaian:</strong> Kaos bebas & nyaman & sopan</p>`,
    penulis: 'Pengurus RT 09 / RW 14',
    blok_penulis: 'Pos RT',
    tanggal: '20 Agustus 2026',
    pin: true,
    status: 'Disetujui',
    media_url: '',
    media_nama: 'gotong-royong-upacara-17-agustus-hut-ri-undika(1).jpg',
    alasan_reject: ''
  },
  {
    id: 'ann-1',
    judul: 'Fogging Nyamuk DBD Serentak Blok G',
    kategori: 'Kesehatan & Lingkungan',
    kategoriIcon: '💉',
    konten: `<h3><strong>Pemberitahuan Penyemprotan Fogging Serentak</strong></h3>
<p>Diberitahukan kepada seluruh warga <strong>RT 09 / RW 14 De Naila Village Blok G</strong>, sehubungan dengan upaya pencegahan demam berdarah (DBD), akan diadakan fogging pada:</p>
<ul>
  <li><strong>Hari / Tanggal:</strong> Sabtu, 24 Agustus 2026</li>
  <li><strong>Waktu:</strong> Pukul 07.30 s/d 11.00 WIB</li>
  <li><strong>Area:</strong> Seluruh jalan utama, selokan, dan halaman rumah Blok G</li>
</ul>
<blockquote>Mohon warga menutup wadah makanan/minuman, mengamankan hewan peliharaan, dan membuka ventilasi udara agar asap masuk optimal.</blockquote>`,
    penulis: 'Pengurus RT 09 / RW 14',
    blok_penulis: 'Pos RT',
    tanggal: '20 Agustus 2026',
    pin: true,
    status: 'Disetujui',
    media_url: '',
    media_nama: '',
    alasan_reject: ''
  },
  {
    id: 'ann-2',
    judul: 'Pemberlakuan Jam Tutup Portal Malam & Tamu Wajib Lapor',
    kategori: 'Keamanan & Ketertiban',
    kategoriIcon: '🛡️',
    konten: `<h3><strong>Aturan Keamanan Lingkungan RT 09</strong></h3>
<p>Untuk meningkatkan ketertiban dan keamanan bersama di lingkungan Perum De Naila Village Blok G:</p>
<ol>
  <li>Portal Barat akan <strong>ditutup mulai pukul 22.00 WIB s/d 05.00 WIB</strong> setiap malam.</li>
  <li>Tamu luar/ojek online yang masuk di atas pukul 22.00 wajib melapor dan meninggalkan identitas di <strong>Pos Satpam Utama Blok G</strong>.</li>
  <li>Bagi warga yang pulang larut malam, satpam siap membukakan portal dengan membunyikan klakson pelan/lampu dekat.</li>
</ol>`,
    penulis: 'Seksi Keamanan RT 09',
    blok_penulis: 'Pos RT',
    tanggal: '18 Agustus 2026',
    pin: true,
    status: 'Disetujui',
    media_url: '',
    media_nama: '',
    alasan_reject: ''
  },
  {
    id: 'ann-3',
    judul: 'Kerja Bakti Saluran Air & Pembersihan Fasum Blok G',
    kategori: 'Kerja Bakti',
    kategoriIcon: '🧹',
    konten: `<p>Menyambut musim penghujan, pengurus RT mengundang bapak-bapak warga RT 09 untuk berpartisipasi dalam agenda <strong>Kerja Bakti Massal</strong>:</p>
<ul>
  <li><strong>Hari:</strong> Minggu pagi, 28 Agustus 2026</li>
  <li><strong>Kumpul:</strong> Pukul 06.30 WIB di Lapangan Fasum Barat</li>
  <li><strong>Peralatan:</strong> Cangkul, sekop, sapu lidi, dan karung sampah disediakan RT</li>
</ul>
<p><em>Disediakan kopi, teh hangat, dan sarapan bersama setelah kegiatan selesai.</em></p>`,
    penulis: 'Ketua RT 09',
    blok_penulis: 'Pos RT',
    tanggal: '15 Agustus 2026',
    pin: false,
    status: 'Disetujui',
    media_url: '',
    media_nama: '',
    alasan_reject: ''
  },
  {
    id: 'ann-4',
    judul: 'Info Ditemukan Kucing Persia Putih di Depan Rumah G-07',
    kategori: 'Warga & Sosial',
    kategoriIcon: '📢',
    konten: `<p>Assalamu'alaikum bapak/ibu warga RT 09, tadi pagi ditemukan seekor <strong>kucing persia ras bulu putih</strong> memakai kalung merah lonceng kecil di depan rumah Blok G-07.</p>
<p>Bagi warga yang merasa kehilangan atau mengenali pemiliknya, silakan menghubungi kami di <strong>Blok G-08</strong> atau via WhatsApp.</p>`,
    penulis: 'Maya Kartika',
    blok_penulis: 'G-08',
    tanggal: '20 Agustus 2026',
    pin: false,
    status: 'Menunggu Approval',
    media_url: '',
    media_nama: '',
    alasan_reject: ''
  }
];

const KATEGORI_LIST = [
  { id: 'Keamanan & Ketertiban', label: '🛡️ Keamanan & Pos Ronda', icon: '🛡️', color: 'border-blue-500/30 text-blue-400 bg-blue-500/10' },
  { id: 'Kesehatan & Lingkungan', label: '💉 Kesehatan & Fogging/Posyandu', icon: '💉', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' },
  { id: 'Kerja Bakti', label: '🧹 Kerja Bakti & Kebersihan', icon: '🧹', color: 'border-amber-500/30 text-amber-400 bg-amber-500/10' },
  { id: 'Iuran & Kas RT', label: '💰 Iuran & Keuangan Kas', icon: '💰', color: 'border-purple-500/30 text-purple-400 bg-purple-500/10' },
  { id: 'Acara & Kegiatan Warga', label: '🎪 Acara & Peringatan Warga', icon: '🎪', color: 'border-pink-500/30 text-pink-400 bg-pink-500/10' },
  { id: 'Warga & Sosial', label: '📢 Informasi Warga & Sosial', icon: '📢', color: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10' },
];

export default function Pengumuman() {
  const rtNama = localStorage.getItem('rt_nama') || localStorage.getItem('rt_username') || 'Daniel Kristianto';
  const rtBlok = localStorage.getItem('rt_blok') || 'G-12';
  const rtRole = localStorage.getItem('rt_user_role') || 'warga';
  const isAdmin = ['superadmin', 'ketua_rt', 'sekretaris', 'bendahara', 'admin', 'admin_rt'].includes(rtRole);

  // States
  const [pengumumanList, setPengumumanList] = useState(() => {
    const isReset = localStorage.getItem('rt_is_operational_reset') === 'true';
    const saved = localStorage.getItem('rt_pengumuman_list');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { }
    }
    if (isReset) return [];
    return INITIAL_PENGUMUMAN;
  });

  const [activeTab, setActiveTab] = useState('terbit'); // 'terbit' | 'approval' | 'pengajuan_saya'
  const [filterKategori, setFilterKategori] = useState('Semua');
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRejectItem, setSelectedRejectItem] = useState(null);
  const [alasanReject, setAlasanReject] = useState('');
  const [toast, setToast] = useState(null);

  // Rich Text Editor State
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [editorMode, setEditorMode] = useState('edit'); // 'edit' | 'preview'
  const [formData, setFormData] = useState({
    id: '',
    judul: '',
    kategori: 'Warga & Sosial',
    pin: false,
    media_url: '',
    media_nama: '',
    media_size: 0,
    konten: ''
  });

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const persistPengumuman = (newList) => {
    setPengumumanList(newList);
    localStorage.setItem('rt_pengumuman_list', JSON.stringify(newList));
  };

  // Realtime Cross-tab Sync
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'rt_pengumuman_list' && e.newValue) {
        try {
          setPengumumanList(JSON.parse(e.newValue));
        } catch (err) { }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Sync Supabase on mount
  useEffect(() => {
    async function loadFromSupabase() {
      try {
        const isReset = localStorage.getItem('rt_is_operational_reset') === 'true';
        const { data, error } = await supabase.from('pengumuman').select('*');
        if (data && !error) {
          if (data.length === 0 && isReset) {
            setPengumumanList([]);
            localStorage.setItem('rt_pengumuman_list', '[]');
            return;
          }

          const mapped = data.map(d => ({
            id: d.id,
            judul: d.judul,
            kategori: d.kategori || 'Warga & Sosial',
            kategoriIcon: '📢',
            konten: d.konten,
            penulis: d.penulis || 'Pengurus RT 09',
            blok_penulis: 'Pos RT',
            tanggal: d.created_at ? new Date(d.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '20 Agustus 2026',
            pin: Boolean(d.pin),
            status: 'Disetujui',
            media_url: '',
            media_nama: '',
            alasan_reject: ''
          }));

          if (!isReset) {
            INITIAL_PENGUMUMAN.forEach(init => {
              if (!mapped.some(m => m.id === init.id || m.judul === init.judul)) {
                mapped.push(init);
              }
            });
          }

          // Check if local has pending ones
          const savedLocal = localStorage.getItem('rt_pengumuman_list');
          if (savedLocal) {
            try {
              const parsedLocal = JSON.parse(savedLocal);
              if (Array.isArray(parsedLocal)) {
                parsedLocal.forEach(p => {
                  if (!mapped.some(m => m.id === p.id)) {
                    mapped.push(p);
                  }
                });
              }
            } catch (e) { }
          }

          persistPengumuman(mapped);
        }
      } catch (err) {
        console.log('Supabase pengumuman note:', err);
      }
    }
    loadFromSupabase();
  }, []);

  // CKE / Rich Text Formatting Commands
  const formatDoc = (cmd, val = null) => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) {
      setFormData(prev => ({ ...prev, konten: editorRef.current.innerHTML }));
    }
  };

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Strict 1MB size limit validation
    const MAX_SIZE = 1 * 1024 * 1024; // 1 MB in bytes
    if (file.size > MAX_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      alert(`⚠️ Ukuran file media melebihi batas maksimal 1 MB!\n\nUkuran file Anda: ${sizeMB} MB.\nMohon kompres atau pilih gambar di bawah 1 MB.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target.result;
      setFormData(prev => ({
        ...prev,
        media_url: base64Url,
        media_nama: file.name,
        media_size: (file.size / 1024).toFixed(1)
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setFormData(prev => ({ ...prev, media_url: '', media_nama: '', media_size: 0 }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openFormModal = () => {
    setFormData({
      id: '',
      judul: '',
      kategori: 'Warga & Sosial',
      pin: false,
      media_url: '',
      media_nama: '',
      media_size: 0,
      konten: ''
    });
    setEditorMode('edit');
    setShowEditorModal(true);
  };

  const handleSavePengumuman = async (e) => {
    e.preventDefault();
    const content = editorRef.current ? editorRef.current.innerHTML : formData.konten;
    if (!formData.judul.trim()) {
      alert('Judul pengumuman wajib diisi!');
      return;
    }
    if (!content.trim() || content === '<p><br></p>') {
      alert('Isi konten pengumuman tidak boleh kosong!');
      return;
    }

    const katObj = KATEGORI_LIST.find(k => k.id === formData.kategori) || KATEGORI_LIST[5];
    const isAutoApprove = isAdmin;

    const newRecord = {
      id: 'ann-' + Date.now(),
      judul: formData.judul.trim(),
      kategori: formData.kategori,
      kategoriIcon: katObj.icon,
      konten: content,
      penulis: isAdmin ? (rtNama.toLowerCase().includes('admin') ? 'Pengurus RT 09 / RW 14' : rtNama) : rtNama,
      blok_penulis: rtBlok,
      tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      pin: isAdmin ? formData.pin : false,
      status: isAutoApprove ? 'Disetujui' : 'Menunggu Approval',
      media_url: formData.media_url,
      media_nama: formData.media_nama,
      alasan_reject: ''
    };

    const updated = [newRecord, ...pengumumanList];
    persistPengumuman(updated);
    setShowEditorModal(false);

    // Sync to Supabase if approved
    if (isAutoApprove) {
      try {
        await supabase.from('pengumuman').insert({
          judul: newRecord.judul,
          kategori: newRecord.kategori,
          konten: newRecord.konten,
          penulis: newRecord.penulis,
          pin: newRecord.pin
        });
      } catch (err) { }
      showToastMsg(`Pengumuman "${newRecord.judul}" berhasil diterbitkan secara resmi!`);
    } else {
      showToastMsg(`Pengajuan pengumuman "${newRecord.judul}" berhasil dikirim! Menunggu approval Pengurus RT 09.`);
    }
  };

  // Approval Handlers
  const handleApprove = async (item) => {
    const updated = pengumumanList.map(p => {
      if (p.id === item.id) {
        return { ...p, status: 'Disetujui' };
      }
      return p;
    });
    persistPengumuman(updated);

    // Sync to Supabase
    try {
      await supabase.from('pengumuman').insert({
        judul: item.judul,
        kategori: item.kategori,
        konten: item.konten,
        penulis: item.penulis,
        pin: item.pin
      });
    } catch (e) { }

    showToastMsg(`Pengumuman dari ${item.penulis} (Blok ${item.blok_penulis}) DISETUJUI dan telah terbit untuk seluruh warga!`);
  };

  const openReject = (item) => {
    setSelectedRejectItem(item);
    setAlasanReject('Konten pengumuman di luar ketentuan/perlu perbaikan redaksi.');
    setShowRejectModal(true);
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (!alasanReject.trim()) {
      alert('Wajib mengisi alasan penolakan!');
      return;
    }
    const updated = pengumumanList.map(p => {
      if (p.id === selectedRejectItem.id) {
        return {
          ...p,
          status: 'Ditolak',
          alasan_reject: alasanReject.trim()
        };
      }
      return p;
    });
    persistPengumuman(updated);
    setShowRejectModal(false);
    showToastMsg(`Pengajuan pengumuman telah ditolak dengan alasan dicatat.`, 'info');
  };

  const handleTogglePin = (id) => {
    const updated = pengumumanList.map(p => {
      if (p.id === id) {
        return { ...p, pin: !p.pin };
      }
      return p;
    });
    persistPengumuman(updated);
  };

  const handleDelete = (id, judul) => {
    if (!confirm(`Hapus pengumuman "${judul}"?`)) return;
    const updated = pengumumanList.filter(p => p.id !== id);
    persistPengumuman(updated);
    showToastMsg(`Pengumuman telah dihapus.`);
  };

  // Filtered lists
  const listTerbit = pengumumanList.filter(p => p.status === 'Disetujui');
  const listPending = pengumumanList.filter(p => p.status === 'Menunggu Approval');
  const listSaya = pengumumanList.filter(p => p.penulis === rtNama || p.blok_penulis === rtBlok);

  const displayedList = activeTab === 'terbit'
    ? listTerbit.filter(p => filterKategori === 'Semua' || p.kategori === filterKategori)
    : activeTab === 'approval'
    ? listPending
    : listSaya;

  // Sorting: Pinned first
  const sortedList = [...displayedList].sort((a, b) => (b.pin ? 1 : 0) - (a.pin ? 1 : 0));

  return (
    <Layout>
      <div className="space-y-6">

        {/* Header Bar */}
        <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/30 px-3 py-1 rounded-full font-medium">
                📢 Papan Informasi Digital Warga RT 09
              </span>
              <span className="text-[11px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                De Naila Village Blok G
              </span>
            </div>
            <h2 className="text-[20px] font-bold text-white mt-2">
              Pemberitahuan & Pengumuman Resmi RT 09 / RW 14
            </h2>
            <p className="text-[12px] text-slate-400 mt-1">
              Desa Sumputsarirejo, Kec. Driyorejo • Media komunikasi warga & penerbitan info kegiatan
            </p>
          </div>

          <button
            onClick={openFormModal}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold transition shadow-lg shadow-[#7C3AED]/25 cursor-pointer flex items-center gap-1.5 active:scale-95 whitespace-nowrap"
          >
            <span>+</span> {isAdmin ? 'Buat Pengumuman Resmi' : 'Ajukan Pengumuman Warga'}
          </button>
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

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('terbit')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'terbit' ? 'bg-[#7C3AED] text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>📰</span> Pengumuman Terbit ({listTerbit.length})
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('approval')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
                  activeTab === 'approval' ? 'bg-[#7C3AED] text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>🛡️</span> Approval Pengajuan Warga
                {listPending.length > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] px-2 py-0.2 rounded-full animate-bounce">
                    {listPending.length} Baru
                  </span>
                )}
              </button>
            )}

            {!isAdmin && (
              <button
                onClick={() => setActiveTab('pengajuan_saya')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
                  activeTab === 'pengajuan_saya' ? 'bg-[#7C3AED] text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>👤</span> Pengajuan Saya ({listSaya.length})
              </button>
            )}
          </div>

          {activeTab === 'terbit' && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Filter Kategori:</span>
              <select
                value={filterKategori}
                onChange={(e) => setFilterKategori(e.target.value)}
                className="bg-[#1A1D2E] border border-white/10 text-white rounded-lg px-2.5 py-1 text-xs outline-none cursor-pointer"
              >
                <option value="Semua">Semua Kategori</option>
                {KATEGORI_LIST.map(k => (
                  <option key={k.id} value={k.id}>{k.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* List of Announcements */}
        <div className="space-y-4">
          {sortedList.length === 0 ? (
            <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-12 text-center text-slate-400 text-xs">
              Belum ada pengumuman pada kategori ini.
            </div>
          ) : (
            sortedList.map((item) => {
              const kat = KATEGORI_LIST.find(k => k.id === item.kategori) || KATEGORI_LIST[5];
              const isPending = item.status === 'Menunggu Approval';
              const isRejected = item.status === 'Ditolak';

              return (
                <div
                  key={item.id}
                  className={`bg-[#1A1D2E] border rounded-[24px] p-6 transition relative overflow-hidden shadow-xl ${
                    item.pin
                      ? 'border-[#7C3AED]/50 bg-gradient-to-br from-[#1A1D2E] to-[#1E1B4B]/60'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Pinned Badge */}
                  {item.pin && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-[#7C3AED] to-[#6D28D9] text-white text-[10px] font-bold px-4 py-1 rounded-bl-xl shadow flex items-center gap-1 uppercase tracking-wider">
                      📌 PENGUMUMAN PENTING
                    </div>
                  )}

                  {/* Header Item */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[11px] px-3 py-1 rounded-full font-medium border ${kat.color}`}>
                      {kat.icon} {item.kategori}
                    </span>

                    {isPending && (
                      <span className="text-[11px] bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-medium">
                        ⏳ Menunggu Approval Admin RT
                      </span>
                    )}

                    {isRejected && (
                      <span className="text-[11px] bg-rose-500/15 text-rose-400 border border-rose-500/20 px-2.5 py-0.5 rounded-full font-medium">
                        ✕ Ditolak
                      </span>
                    )}

                    <span className="text-[11px] text-slate-400 ml-auto">
                      📅 {item.tanggal}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-white font-bold text-[17px] mt-3">
                    {item.judul}
                  </h3>

                  {/* Author */}
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span>Oleh: <strong className="text-slate-200">{item.penulis}</strong></span>
                    <span>•</span>
                    <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10 text-[10px] text-[#A78BFA]">
                      Blok {item.blok_penulis}
                    </span>
                  </div>

                  {/* Media Image Banner if Attached */}
                  {item.media_url && (
                    <div className="mt-4 rounded-xl overflow-hidden border border-white/10 max-w-lg bg-black/40">
                      <img
                        src={item.media_url}
                        alt="Lampiran Pengumuman"
                        className="w-full max-h-[300px] object-cover hover:scale-105 transition duration-300"
                      />
                      {item.media_nama && (
                        <div className="p-2 text-[10px] text-slate-400 bg-[#23263A] border-t border-white/5 flex justify-between">
                          <span>📎 {item.media_nama}</span>
                          <span>Max &lt; 1MB</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Rich Text HTML Content */}
                  <div
                    className="mt-4 text-[13px] text-slate-200 leading-relaxed bg-[#23263A]/60 rounded-2xl p-4 border border-white/5 prose prose-invert max-w-none space-y-2"
                    dangerouslySetInnerHTML={{ __html: item.konten }}
                  />

                  {/* Reason if Rejected */}
                  {isRejected && item.alasan_reject && (
                    <div className="mt-3 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-xs text-rose-300">
                      <strong className="block text-[10px] uppercase text-rose-400 mb-0.5">Alasan Penolakan:</strong>
                      "{item.alasan_reject}"
                    </div>
                  )}

                  {/* Action Buttons for Admin or Owner */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      {isAdmin && (
                        <button
                          onClick={() => handleTogglePin(item.id)}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                            item.pin
                              ? 'bg-[#7C3AED]/20 border-[#7C3AED]/40 text-[#C4B5FD]'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          📌 {item.pin ? 'Lepas Pin' : 'Pin ke Atas'}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                      {isAdmin && isPending && (
                        <>
                          <button
                            onClick={() => handleApprove(item)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95"
                          >
                            ✓ Approve & Terbitkan
                          </button>
                          <button
                            onClick={() => openReject(item)}
                            className="bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shadow-md shadow-rose-600/20 active:scale-95"
                          >
                            ✕ Tolak
                          </button>
                        </>
                      )}

                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(item.id, item.judul)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                          title="Hapus Pengumuman"
                        >
                          🗑️ Hapus
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ========================================================= */}
        {/* MODAL: RICH TEXT (CKE STYLE) FORM PENGUMUMAN              */}
        {/* ========================================================= */}
        {showEditorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowEditorModal(false)}></div>
            <div className="relative z-10 bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 max-w-3xl w-full my-8 space-y-4 shadow-2xl">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-[#7C3AED]/20 text-[#A78BFA] flex items-center justify-center font-bold text-lg">
                    ✍️
                  </span>
                  <div>
                    <h3 className="font-bold text-white text-[16px]">
                      {isAdmin ? 'Form Publikasi Pengumuman Resmi RT 09' : 'Form Pengajuan Pengumuman Warga'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Editor teks lengkap (CKE) • Format teks kaya & lampiran media (maksimal 1 MB)
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowEditorModal(false)} className="text-slate-400 hover:text-white text-lg cursor-pointer">✕</button>
              </div>

              <form onSubmit={handleSavePengumuman} className="space-y-3.5 text-[13px]">
                <div>
                  <label className="text-slate-300 font-semibold text-xs">Judul Pengumuman *</label>
                  <input
                    required
                    placeholder="Contoh: Kerja Bakti Saluran Air / Pemberitahuan Jadwal Posyandu"
                    value={formData.judul}
                    onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                    className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#7C3AED] font-semibold text-[14px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-xs">Kategori Informasi</label>
                    <select
                      value={formData.kategori}
                      onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#7C3AED] cursor-pointer"
                    >
                      {KATEGORI_LIST.map(k => (
                        <option key={k.id} value={k.id}>{k.label}</option>
                      ))}
                    </select>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-2 pt-6">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-xs">
                        <input
                          type="checkbox"
                          checked={formData.pin}
                          onChange={(e) => setFormData({ ...formData, pin: e.target.checked })}
                          className="w-4 h-4 rounded text-[#7C3AED] accent-[#7C3AED] cursor-pointer"
                        />
                        <span>📌 Jadikan <strong>Pengumuman Penting</strong> (Sematkan di Atas)</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* ========================================================= */}
                {/* CKE / RICH TEXT FORMATTING TOOLBAR                        */}
                {/* ========================================================= */}
                <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#23263A]">
                  <div className="p-2 bg-white/[0.03] border-b border-white/10 flex flex-wrap items-center gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => formatDoc('bold')}
                      className="p-1.5 px-2 bg-white/5 hover:bg-white/15 rounded text-white font-bold"
                      title="Tebal (Bold)"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => formatDoc('italic')}
                      className="p-1.5 px-2 bg-white/5 hover:bg-white/15 rounded text-white italic"
                      title="Miring (Italic)"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => formatDoc('underline')}
                      className="p-1.5 px-2 bg-white/5 hover:bg-white/15 rounded text-white underline"
                      title="Garis Bawah (Underline)"
                    >
                      U
                    </button>
                    <button
                      type="button"
                      onClick={() => formatDoc('strikeThrough')}
                      className="p-1.5 px-2 bg-white/5 hover:bg-white/15 rounded text-white line-through"
                      title="Coret (Strikethrough)"
                    >
                      S
                    </button>
                    <span className="h-4 w-px bg-white/10 mx-1"></span>

                    <button
                      type="button"
                      onClick={() => formatDoc('formatBlock', '<h3>')}
                      className="p-1.5 px-2 bg-white/5 hover:bg-white/15 rounded text-white font-semibold"
                      title="Heading 3 (Subjudul)"
                    >
                      H3
                    </button>
                    <button
                      type="button"
                      onClick={() => formatDoc('formatBlock', '<p>')}
                      className="p-1.5 px-2 bg-white/5 hover:bg-white/15 rounded text-white"
                      title="Paragraf Biasa"
                    >
                      P
                    </button>
                    <span className="h-4 w-px bg-white/10 mx-1"></span>

                    <button
                      type="button"
                      onClick={() => formatDoc('insertUnorderedList')}
                      className="p-1.5 px-2 bg-white/5 hover:bg-white/15 rounded text-white"
                      title="Daftar Simbol (Bullet List)"
                    >
                      • List
                    </button>
                    <button
                      type="button"
                      onClick={() => formatDoc('insertOrderedList')}
                      className="p-1.5 px-2 bg-white/5 hover:bg-white/15 rounded text-white"
                      title="Daftar Angka (Numbered List)"
                    >
                      1. List
                    </button>
                    <button
                      type="button"
                      onClick={() => formatDoc('formatBlock', '<blockquote>')}
                      className="p-1.5 px-2 bg-white/5 hover:bg-white/15 rounded text-white italic"
                      title="Kutipan / Catatan Penting"
                    >
                      ❝ Quote
                    </button>

                    <div className="ml-auto flex gap-1">
                      <button
                        type="button"
                        onClick={() => setEditorMode(editorMode === 'edit' ? 'preview' : 'edit')}
                        className="text-[11px] bg-[#7C3AED]/20 text-[#C4B5FD] px-2.5 py-1 rounded-lg hover:bg-[#7C3AED]/30 transition"
                      >
                        {editorMode === 'edit' ? '👁️ Preview' : '✏️ Mode Tulis'}
                      </button>
                    </div>
                  </div>

                  {/* Editor Editable Area */}
                  {editorMode === 'edit' ? (
                    <div
                      ref={editorRef}
                      contentEditable
                      suppressContentEditableWarning
                      onInput={(e) => setFormData({ ...formData, konten: e.currentTarget.innerHTML })}
                      className="p-4 min-h-[160px] max-h-[300px] overflow-y-auto text-white text-[13px] outline-none leading-relaxed prose prose-invert"
                      placeholder="Tuliskan isi pengumuman secara rinci di sini..."
                    />
                  ) : (
                    <div
                      className="p-4 min-h-[160px] max-h-[300px] overflow-y-auto text-slate-200 text-[13px] leading-relaxed bg-black/20 prose prose-invert"
                      dangerouslySetInnerHTML={{ __html: formData.konten || '<p className="text-slate-500 italic">Belum ada konten...</p>' }}
                    />
                  )}
                </div>

                {/* Media Attachment (Max 1MB) */}
                <div className="bg-[#23263A] border border-white/10 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-slate-300 font-semibold text-xs flex items-center gap-1.5">
                        🖼️ Lampirkan Foto / Media Brosur (Maksimal 1 MB)
                      </span>
                      <p className="text-[10px] text-slate-400">Format JPG, PNG, atau WebP (Ukuran &le; 1 MB)</p>
                    </div>
                    {formData.media_url && (
                      <button
                        type="button"
                        onClick={removeMedia}
                        className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
                      >
                        ✕ Hapus Media
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleMediaUpload}
                    className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#7C3AED] file:text-white hover:file:bg-[#6D28D9] cursor-pointer"
                  />

                  {formData.media_url && (
                    <div className="mt-2 flex items-center gap-3 bg-[#1A1D2E] p-2 rounded-xl border border-white/10">
                      <img src={formData.media_url} alt="Preview" className="w-14 h-14 object-cover rounded-lg border border-white/10" />
                      <div className="text-xs">
                        <div className="text-white font-medium truncate max-w-xs">{formData.media_nama}</div>
                        <div className="text-[10px] text-emerald-400">✓ Valid: {formData.media_size} KB (&lt; 1024 KB)</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowEditorModal(false)}
                    className="bg-white/5 hover:bg-white/10 text-slate-300 px-4 py-2.5 rounded-xl text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-6 py-2.5 rounded-xl text-xs cursor-pointer shadow-lg shadow-[#7C3AED]/20 active:scale-95 flex items-center gap-1.5"
                  >
                    🚀 {isAdmin ? 'Terbitkan Pengumuman Sekarang' : 'Kirim Pengajuan Pengumuman'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: REJECT PENGAJUAN PENGUMUMAN DENGAN ALASAN         */}
        {/* ========================================================= */}
        {showRejectModal && selectedRejectItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowRejectModal(false)}></div>
            <div className="relative z-10 bg-[#1A1D2E] border border-rose-500/30 rounded-[24px] p-6 max-w-md w-full my-8 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                    ✕
                  </span>
                  <div>
                    <h3 className="font-bold text-white text-[16px]">Tolak Pengajuan Pengumuman</h3>
                    <p className="text-[11px] text-slate-400">{selectedRejectItem.judul} (Oleh: {selectedRejectItem.penulis})</p>
                  </div>
                </div>
                <button onClick={() => setShowRejectModal(false)} className="text-slate-400 hover:text-white text-lg cursor-pointer">✕</button>
              </div>

              <form onSubmit={handleConfirmReject} className="space-y-3.5 text-[13px]">
                <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-xs text-rose-300">
                  ⚠️ Masukkan alasan penolakan secara jelas agar warga pemohon mengetahui alasan tidak diterbitkannya informasi ini.
                </div>

                <div>
                  <label className="text-slate-300 font-semibold text-xs">Alasan Penolakan Resmi *</label>
                  <textarea
                    required
                    rows={3}
                    value={alasanReject}
                    onChange={(e) => setAlasanReject(e.target.value)}
                    placeholder="Tuliskan alasan penolakan..."
                    className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-rose-500 text-xs"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(false)}
                    className="bg-white/5 hover:bg-white/10 text-slate-300 px-4 py-2.5 rounded-xl text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-rose-600 hover:bg-rose-500 text-white font-semibold px-6 py-2.5 rounded-xl text-xs cursor-pointer shadow-lg shadow-rose-600/20 active:scale-95 flex items-center gap-1.5"
                  >
                    ✕ Tolak Pengajuan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
