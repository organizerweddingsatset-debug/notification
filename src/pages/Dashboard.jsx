import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function Dashboard() {
  const rtNama = localStorage.getItem('rt_nama') || localStorage.getItem('rt_username') || 'Daniel';
  const rtBlok = localStorage.getItem('rt_blok') || 'G-12';
  const rtRole = localStorage.getItem('rt_user_role') || 'warga';
  const isWarga = rtRole === 'warga';
  const isReset = localStorage.getItem('rt_is_operational_reset') === 'true';

  // QRIS Modal State
  const [showQris, setShowQris] = useState(false);
  const [qrisData, setQrisData] = useState(null);

  // Dynamic Datasets State
  const [allWarga, setAllWarga] = useState(() => {
    const saved = localStorage.getItem('rt_all_warga_profiles');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { }
    }
    return isReset ? [] : [];
  });

  const [allKas, setAllKas] = useState(() => {
    const saved = localStorage.getItem('rt_kas_keuangan_list');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { }
    }
    return isReset ? [] : [];
  });

  const [allTagihan, setAllTagihan] = useState(() => {
    const saved = localStorage.getItem('rt_tagihan_iuran_list');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { }
    }
    return isReset ? [] : [];
  });

  const [allSurat, setAllSurat] = useState(() => {
    const saved = localStorage.getItem('rt_surat_list');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { }
    }
    return isReset ? [] : [];
  });

  const [allInventaris, setAllInventaris] = useState(() => {
    const saved = localStorage.getItem('rt_inventaris_list');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { }
    }
    return isReset ? [] : [];
  });

  const [allPengumuman, setAllPengumuman] = useState(() => {
    const saved = localStorage.getItem('rt_pengumuman_list');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { }
    }
    return isReset ? [] : [];
  });

  // Realtime Cross-tab Sync
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'rt_all_warga_profiles' && e.newValue) {
        try { setAllWarga(JSON.parse(e.newValue)); } catch (err) { }
      }
      if (e.key === 'rt_kas_keuangan_list' && e.newValue) {
        try { setAllKas(JSON.parse(e.newValue)); } catch (err) { }
      }
      if (e.key === 'rt_tagihan_iuran_list' && e.newValue) {
        try { setAllTagihan(JSON.parse(e.newValue)); } catch (err) { }
      }
      if (e.key === 'rt_surat_list' && e.newValue) {
        try { setAllSurat(JSON.parse(e.newValue)); } catch (err) { }
      }
      if (e.key === 'rt_inventaris_list' && e.newValue) {
        try { setAllInventaris(JSON.parse(e.newValue)); } catch (err) { }
      }
      if (e.key === 'rt_pengumuman_list' && e.newValue) {
        try { setAllPengumuman(JSON.parse(e.newValue)); } catch (err) { }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const fmt = n => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
  const fmtShort = n => {
    if (Math.abs(n) >= 1000000) return `Rp ${(n / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
    if (Math.abs(n) >= 1000) return `Rp ${(n / 1000).toLocaleString('id-ID', { maximumFractionDigits: 0 })} rb`;
    return fmt(n);
  };

  // Admin Metrics
  const adminTotalKK = allWarga.length;
  const adminTotalJiwa = allWarga.reduce((acc, w) => acc + 1 + ((w.keluarga && Array.isArray(w.keluarga)) ? w.keluarga.length : 0), 0);

  const totalPemasukanKas = allKas.filter(k => k.kategori === 'Pemasukan').reduce((acc, k) => acc + Number(k.nominal || 0), 0);
  const totalPengeluaranKas = allKas.filter(k => k.kategori === 'Pengeluaran').reduce((acc, k) => acc + Number(k.nominal || 0), 0);
  const saldoKasRT = totalPemasukanKas - totalPengeluaranKas;

  const pemasukanBulanIni = allKas.filter(k => k.kategori === 'Pemasukan' && (k.tanggal || '').startsWith('2026-08')).reduce((acc, k) => acc + Number(k.nominal || 0), 0);
  const pengeluaranBulanIni = allKas.filter(k => k.kategori === 'Pengeluaran' && (k.tanggal || '').startsWith('2026-08')).reduce((acc, k) => acc + Number(k.nominal || 0), 0);

  const adminTunggakanItems = allTagihan.filter(t => t.status !== 'Lunas');
  const adminTotalTunggakan = adminTunggakanItems.reduce((acc, t) => acc + Number(t.nominal || 0), 0);
  const adminRumahTertunggak = new Set(adminTunggakanItems.map(t => t.blok || t.nama)).size;

  const adminPendingSuratCount = allSurat.filter(s => s.status === 'Menunggu Approval').length;

  // Warga Personal Metrics
  const myTagihanList = useMemo(() => {
    return allTagihan.filter(d => 
      (d.nama || '').toLowerCase().includes(rtNama.toLowerCase()) || 
      (d.blok || '').toLowerCase() === rtBlok.toLowerCase()
    );
  }, [allTagihan, rtNama, rtBlok]);

  const myBelumLunas = myTagihanList.filter(d => d.status !== 'Lunas');
  const myLunas = myTagihanList.filter(d => d.status === 'Lunas');
  const myTotalTunggakan = myBelumLunas.reduce((acc, curr) => acc + curr.nominal, 0);

  const myLatestSurat = useMemo(() => {
    return allSurat.find(s => 
      (s.nama || '').toLowerCase().includes(rtNama.toLowerCase()) || 
      (s.alamat || '').toLowerCase().includes(rtBlok.toLowerCase())
    );
  }, [allSurat, rtNama, rtBlok]);

  const latestPengumuman = useMemo(() => {
    return allPengumuman.filter(p => p.status === 'Disetujui').slice(0, 2);
  }, [allPengumuman]);

  const openQrisSemua = () => {
    const payload = `RT09|${rtBlok}|${rtNama}|Total_Tunggakan|${myTotalTunggakan}|${Date.now()}`;
    setQrisData({
      tagihan: `Semua Tagihan Tertunggak (${myBelumLunas.length} Tagihan)`,
      nominal: myTotalTunggakan,
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(payload)}`
    });
    setShowQris(true);
  };

  const openQrisItem = (item) => {
    const payload = `RT09|${rtBlok}|${rtNama}|${item.tagihan}|${item.nominal}|${Date.now()}`;
    setQrisData({
      tagihan: item.tagihan,
      nominal: item.nominal,
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(payload)}`
    });
    setShowQris(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Header Banner */}
        <div className="bg-gradient-to-r from-[#1A1D2E] via-[#22273F] to-[#1A1D2E] border border-white/10 rounded-[24px] p-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-[#7C3AED]/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/30 px-3 py-1 rounded-full font-medium">
                  {isWarga ? '🏠 Portal Warga RT 09' : '🛡️ Panel Administrator RT 09'}
                </span>
                <span className="text-[11px] bg-green-500/15 text-green-400 border border-green-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  De Naila Village Blok G • Sumputsarirejo, Driyorejo
                </span>
              </div>
              <h2 className="text-[22px] font-bold text-white mt-2.5">
                Selamat Datang, {rtNama} 👋
              </h2>
              <p className="text-[12px] text-slate-300 mt-1">
                {isWarga
                  ? `Informasi transparansi kas, tagihan iuran, pengumuman warga, inventaris & surat pengantar Blok ${rtBlok}`
                  : `Dashboard monitoring kependudukan, keuangan kas, dan administrasi RT 09 / RW 14`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isWarga ? (
                <Link
                  to="/warga"
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 px-4 py-2.5 rounded-xl text-[13px] font-medium transition flex items-center gap-2"
                >
                  👤 Biodata Saya (Blok {rtBlok})
                </Link>
              ) : (
                <Link
                  to="/warga"
                  className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 py-2.5 rounded-xl text-[13px] font-medium transition shadow-lg shadow-[#7C3AED]/25"
                >
                  👥 Master Data Warga
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* VIEW WARGA: 5 RINGKASAN CARD UTAMA                       */}
        {/* ========================================================= */}
        {isWarga && (
          <div className="space-y-6">
            {/* ROW 1: KAS RT TRANSPARANSI & RINGKASAN IURAN */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* CARD 1: RINGKASAN TRANSPARANSI KAS RT */}
              <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 flex flex-col justify-between space-y-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

                <div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-base font-bold border border-emerald-500/30">
                        💰
                      </span>
                      <div>
                        <h3 className="font-bold text-white text-[15px]">Transparansi Kas RT 09</h3>
                        <p className="text-[11px] text-slate-400">Laporan realtime & terbuka untuk warga</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
                      ● Kas Sehat
                    </span>
                  </div>

                  {/* Saldo Utama */}
                  <div className="mt-4 bg-[#23263A]/80 border border-white/5 rounded-2xl p-4">
                    <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Saldo Kas RT Tersedia</div>
                    <div className="text-[26px] font-black mt-1 font-mono tracking-tight text-emerald-400">
                      {fmt(saldoKasRT)}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                      <span>Diperbarui oleh Bendahara RT</span>
                      <span>•</span>
                      <span className="text-slate-300 font-medium">Periode Agustus 2026</span>
                    </div>
                  </div>

                  {/* Rincian Pemasukan & Pengeluaran Bulan Ini */}
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="bg-[#23263A]/50 border border-white/5 rounded-xl p-3">
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <span className="text-emerald-400 font-bold">↓</span> Pemasukan Bulan Ini
                      </div>
                      <div className="text-[15px] font-bold text-emerald-400 mt-1 font-mono">
                        +{fmt(pemasukanBulanIni)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Iuran & Donasi Terdata</div>
                    </div>
                    <div className="bg-[#23263A]/50 border border-white/5 rounded-xl p-3">
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <span className="text-rose-400 font-bold">↑</span> Pengeluaran Bulan Ini
                      </div>
                      <div className="text-[15px] font-bold text-rose-400 mt-1 font-mono">
                        -{fmt(pengeluaranBulanIni)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Operasional Lingkungan</div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[12px]">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    🛡️ Terbuka & Akuntabel
                  </span>
                  <Link
                    to="/iuran"
                    className="text-[#A78BFA] hover:text-white font-medium flex items-center gap-1 hover:underline transition"
                  >
                    Detail Iuran Lingkungan ➔
                  </Link>
                </div>
              </div>

              {/* CARD 2: RINGKASAN IURAN SAYA */}
              <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 flex flex-col justify-between space-y-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#7C3AED]/5 rounded-full blur-2xl pointer-events-none"></div>

                <div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-xl bg-[#7C3AED]/20 text-[#A78BFA] flex items-center justify-center text-base font-bold border border-[#7C3AED]/30">
                        💳
                      </span>
                      <div>
                        <h3 className="font-bold text-white text-[15px]">Ringkasan Iuran Saya</h3>
                        <p className="text-[11px] text-slate-400">{rtNama} • Blok {rtBlok}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold border ${
                      myBelumLunas.length > 0
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/20'
                        : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20'
                    }`}>
                      {myBelumLunas.length > 0 ? `● ${myBelumLunas.length} Tagihan Menunggu` : '● Semua Lunas'}
                    </span>
                  </div>

                  {/* Status Box & Quick Numbers */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-[#23263A] border border-white/10 rounded-2xl p-4 text-center">
                      <div className="text-[11px] text-slate-400">Total Tagihan Tertunggak</div>
                      <div className="text-[20px] font-black text-rose-400 font-mono mt-1">
                        {fmt(myTotalTunggakan)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {myBelumLunas.length} Jenis Iuran Belum Lunas
                      </div>
                    </div>

                    <div className="bg-[#23263A] border border-white/10 rounded-2xl p-4 text-center">
                      <div className="text-[11px] text-slate-400">Iuran Terbayar Lunas</div>
                      <div className="text-[20px] font-black text-emerald-400 font-mono mt-1">
                        {myLunas.length} Tagihan
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Periode Agustus 2026
                      </div>
                    </div>
                  </div>

                  {/* Quick Preview of Pending Items */}
                  {myBelumLunas.length > 0 && (
                    <div className="mt-3 bg-[#23263A]/40 border border-white/5 rounded-xl p-3 space-y-2">
                      <div className="text-[11px] text-slate-400 font-medium">Iuran yang Belum Lunas:</div>
                      <div className="space-y-1.5">
                        {myBelumLunas.map(item => (
                          <div key={item.id} className="flex items-center justify-between text-xs py-0.5">
                            <span className="text-white">• {item.tagihan}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-slate-300 font-semibold">{fmt(item.nominal)}</span>
                              <button
                                onClick={() => openQrisItem(item)}
                                className="bg-[#7C3AED]/20 hover:bg-[#7C3AED] text-[#C4B5FD] hover:text-white px-2 py-0.5 rounded text-[10px] transition cursor-pointer"
                              >
                                Bayar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  {myTotalTunggakan > 0 ? (
                    <button
                      onClick={openQrisSemua}
                      className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[12px] font-semibold px-4 py-2 rounded-xl transition shadow-lg shadow-[#7C3AED]/20 flex items-center gap-1.5 cursor-pointer"
                    >
                      ⚡ Bayar Cepat via QRIS
                    </button>
                  ) : (
                    <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                      ✓ Pembayaran Bulan Ini Lengkap
                    </span>
                  )}
                  <Link
                    to="/iuran"
                    className="text-[#A78BFA] hover:text-white text-[12px] font-medium flex items-center gap-1 hover:underline transition"
                  >
                    Buka Menu Iuran & Riwayat ➔
                  </Link>
                </div>
              </div>
            </div>

            {/* ROW 2: PENGUMUMAN, INVENTARIS, DAN SURAT */}
            <div className="grid md:grid-cols-3 gap-6">

              {/* CARD 3: RINGKASAN PENGUMUMAN */}
              <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-base font-bold border border-amber-500/30">
                        📢
                      </span>
                      <h3 className="font-bold text-white text-[15px]">Pengumuman RT</h3>
                    </div>
                    <span className="text-[10px] bg-white/5 text-slate-400 px-2 py-0.5 rounded">Terkini</span>
                  </div>

                  <div className="space-y-3 mt-3.5">
                    {latestPengumuman.length > 0 ? (
                      latestPengumuman.map(item => (
                        <div key={item.id} className="bg-[#23263A] border border-white/5 rounded-xl p-3 hover:border-white/20 transition">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/30 px-2 py-0.5 rounded-full font-medium">
                              {item.kategori || 'Info RT'}
                            </span>
                            <span className="text-[10px] text-slate-400">{item.tanggal || 'Terkini'}</span>
                          </div>
                          <h4 className="text-white text-[13px] font-semibold mt-2">{item.judul}</h4>
                          <div 
                            className="text-[11px] text-slate-400 mt-1 line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: (item.konten || '').replace(/<[^>]+>/g, ' ').slice(0, 120) + '...' }}
                          />
                        </div>
                      ))
                    ) : (
                      <div className="bg-[#23263A]/40 border border-white/5 rounded-xl p-4 text-center text-slate-400 text-xs">
                        Belum ada pengumuman yang diterbitkan.
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5">
                  <Link
                    to="/pengumuman"
                    className="w-full bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white py-2 rounded-xl text-xs font-medium transition flex items-center justify-center gap-1.5"
                  >
                    Buka Semua Pengumuman ➔
                  </Link>
                </div>
              </div>

              {/* CARD 4: RINGKASAN INVENTARIS */}
              <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-base font-bold border border-blue-500/30">
                        📦
                      </span>
                      <h3 className="font-bold text-white text-[15px]">Inventaris RT 09</h3>
                    </div>
                    <span className="text-[10px] bg-green-500/15 text-green-400 px-2 py-0.5 rounded">Siap Pinjam</span>
                  </div>

                  {allInventaris.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2.5 mt-3.5">
                      {allInventaris.slice(0, 4).map(item => (
                        <div key={item.id} className="bg-[#23263A] border border-white/5 rounded-xl p-3 text-center">
                          <span className="text-2xl">{item.icon || '📦'}</span>
                          <div className="text-white text-[12px] font-semibold mt-1 truncate">{item.nama_barang}</div>
                          <div className="text-[10px] text-emerald-400 font-medium mt-0.5">
                            {item.tersedia !== undefined ? `${item.tersedia} Unit Tersedia` : `${item.jumlah_total || 1} Unit`}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#23263A]/40 border border-white/5 rounded-xl p-4 text-center text-slate-400 text-xs mt-3.5">
                      Belum ada data barang inventaris.
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-white/5">
                  <Link
                    to="/inventaris"
                    className="w-full bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white py-2 rounded-xl text-xs font-medium transition flex items-center justify-center gap-1.5"
                  >
                    Ajukan Peminjaman Barang ➔
                  </Link>
                </div>
              </div>

              {/* CARD 5: RINGKASAN SURAT PENGANTAR */}
              <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-base font-bold border border-purple-500/30">
                        📄
                      </span>
                      <h3 className="font-bold text-white text-[15px]">Layanan Surat RT</h3>
                    </div>
                    <span className="text-[10px] bg-white/5 text-slate-400 px-2 py-0.5 rounded">Online</span>
                  </div>

                  <div className="space-y-3 mt-3.5">
                    {/* Status Pengajuan Terakhir */}
                    {myLatestSurat ? (
                      <div className="bg-[#23263A] border border-white/5 rounded-xl p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">Pengajuan Terakhir</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                            myLatestSurat.status === 'Disetujui'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/15 text-amber-400 border-amber-500/20'
                          }`}>
                            {myLatestSurat.status}
                          </span>
                        </div>
                        <div className="text-white text-[13px] font-semibold mt-1.5">
                          {myLatestSurat.template_type === 'ktp_pindah' ? 'Surat Pengantar KTP / Domisili' : (myLatestSurat.template_type || 'Surat Pengantar')}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {myLatestSurat.keperluan || 'Keperluan Warga'}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#23263A]/40 border border-white/5 rounded-xl p-3 text-center text-slate-400 text-xs">
                        Belum ada permohonan surat pengantar diajukan.
                      </div>
                    )}

                    {/* Quick Surat Types */}
                    <div className="bg-[#23263A]/50 border border-white/5 rounded-xl p-3">
                      <div className="text-[11px] text-slate-400 font-medium mb-1.5">Layanan yang Tersedia:</div>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[11px] bg-white/5 text-slate-300 px-2 py-0.5 rounded">Domisili</span>
                        <span className="text-[11px] bg-white/5 text-slate-300 px-2 py-0.5 rounded">SKCK</span>
                        <span className="text-[11px] bg-white/5 text-slate-300 px-2 py-0.5 rounded">Tidak Mampu</span>
                        <span className="text-[11px] bg-white/5 text-slate-300 px-2 py-0.5 rounded">Izin Acara</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5">
                  <Link
                    to="/surat"
                    className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-lg shadow-[#7C3AED]/20"
                  >
                    + Ajukan Surat Pengantar ➔
                  </Link>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW ADMIN: DASHBOARD SUMMARY UTAMA                       */}
        {/* ========================================================= */}
        {!isWarga && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-5">
                <div className="text-[11px] text-slate-400">Total Warga Terdata</div>
                <div className="text-[24px] font-bold text-white mt-1">{adminTotalKK} KK</div>
                <div className="text-[11px] text-emerald-400 mt-1">{adminTotalJiwa} Jiwa Penduduk</div>
              </div>
              <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-5">
                <div className="text-[11px] text-slate-400">Total Saldo Kas RT</div>
                <div className="text-[24px] font-bold text-emerald-400 font-mono mt-1">{fmtShort(saldoKasRT)}</div>
                <div className="text-[11px] text-slate-400 mt-1">+{fmtShort(pemasukanBulanIni)} masuk bln ini</div>
              </div>
              <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-5">
                <div className="text-[11px] text-slate-400">Tunggakan Iuran Warga</div>
                <div className="text-[24px] font-bold text-rose-400 font-mono mt-1">{fmtShort(adminTotalTunggakan)}</div>
                <div className="text-[11px] text-slate-400 mt-1">{adminRumahTertunggak} Rumah Belum Lunas</div>
              </div>
              <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-5">
                <div className="text-[11px] text-slate-400">Surat Menunggu Approval</div>
                <div className="text-[24px] font-bold text-[#A78BFA] mt-1">{adminPendingSuratCount} Surat</div>
                <div className="text-[11px] text-amber-400 mt-1">
                  {adminPendingSuratCount > 0 ? 'Perlu Tanda Tangan RT' : 'Semua Terverifikasi'}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 space-y-3">
                <h3 className="font-bold text-white text-sm">Pintasan Cepat Admin</h3>
                <div className="space-y-2">
                  <Link to="/warga" className="block bg-[#23263A] hover:bg-white/10 p-3 rounded-xl text-xs text-white transition">
                    👥 Kelola Data Kependudukan & Kendaraan ➔
                  </Link>
                  <Link to="/iuran" className="block bg-[#23263A] hover:bg-white/10 p-3 rounded-xl text-xs text-white transition">
                    💳 Buat & Tagih Iuran Warga ➔
                  </Link>
                  <Link to="/surat" className="block bg-[#23263A] hover:bg-white/10 p-3 rounded-xl text-xs text-white transition">
                    📄 Approval Surat Pengantar Warga ➔
                  </Link>
                  <Link to="/pengumuman" className="block bg-[#23263A] hover:bg-white/10 p-3 rounded-xl text-xs text-white transition">
                    📢 Terbitkan Pengumuman Resmi RT ➔
                  </Link>
                </div>
              </div>

              <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 md:col-span-2 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-white text-sm">Aktivitas Terkini RT 09</h3>
                  <span className="text-[11px] text-slate-400">Realtime</span>
                </div>
                
                {allWarga.length === 0 && allKas.length === 0 && allSurat.length === 0 && allTagihan.length === 0 ? (
                  <div className="bg-[#23263A]/50 border border-white/5 rounded-2xl p-6 text-center space-y-2">
                    <span className="text-3xl">✨</span>
                    <h4 className="text-white font-semibold text-sm">Sistem Siap Digunakan (Bersih 0 Data)</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Seluruh data operasional telah berhasil dibersihkan pasca reset. Anda dapat mulai menambahkan data warga asli di menu Data Warga atau menerbitkan tagihan iuran.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 text-xs text-slate-300">
                    {allWarga.slice(0, 2).map((w, idx) => (
                      <div key={idx} className="bg-[#23263A]/70 p-3 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-white font-semibold">{w.nama_lengkap} (Blok {w.blok_rumah})</span> terdaftar sebagai warga aktif.
                        </div>
                        <span className="text-[10px] text-slate-500">Terdata</span>
                      </div>
                    ))}
                    {allKas.slice(0, 2).map((k, idx) => (
                      <div key={idx} className="bg-[#23263A]/70 p-3 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-white font-semibold">{k.nama_warga} ({k.blok_rumah})</span> {k.keterangan} {fmt(k.nominal)}.
                        </div>
                        <span className="text-[10px] text-slate-500">{k.tanggal}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL QRIS PEMBAYARAN CEPAT                               */}
      {/* ========================================================= */}
      {showQris && qrisData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowQris(false)}></div>
          <div className="relative z-10 bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 w-full max-w-[380px] text-center shadow-2xl space-y-4">
            <div>
              <h3 className="font-bold text-white text-[16px]">Pembayaran QRIS RT 09</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{qrisData.tagihan}</p>
            </div>

            <div className="bg-white rounded-2xl p-3 mx-auto w-fit shadow-lg">
              <img src={qrisData.qrUrl} alt="QRIS RT 09" className="w-[240px] h-[240px] rounded-xl" />
            </div>

            <div className="bg-[#23263A] border border-white/10 rounded-xl p-3 text-left text-[12px] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Nama Warga:</span>
                <span className="text-white font-semibold">{rtNama} (Blok {rtBlok})</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-white/10">
                <span className="text-slate-300 font-medium">Total Nominal:</span>
                <span className="font-bold text-emerald-400 font-mono text-[14px]">{fmt(qrisData.nominal)}</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-500">Scan menggunakan GoPay, OVO, Dana, BCA, Mandiri, atau Livin</p>

            <button
              onClick={() => setShowQris(false)}
              className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] py-2.5 rounded-xl text-white text-[13px] font-semibold transition cursor-pointer"
            >
              Tutup Pembayaran
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
