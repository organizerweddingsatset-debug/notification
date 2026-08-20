import { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import {
  sendWaMessage,
  openDirectWhatsApp,
  createTagihanMessage,
  createKwitansiMessage
} from '../services/whatsappService';

// Fungsi Terbilang Bahasa Indonesia
function getTerbilang(nominal) {
  const bilangan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
  nominal = Math.floor(Math.abs(nominal));
  if (nominal < 12) {
    return bilangan[nominal];
  } else if (nominal < 20) {
    return getTerbilang(nominal - 10) + ' Belas';
  } else if (nominal < 100) {
    return getTerbilang(Math.floor(nominal / 10)) + ' Puluh ' + getTerbilang(nominal % 10);
  } else if (nominal < 200) {
    return 'Seratus ' + getTerbilang(nominal - 100);
  } else if (nominal < 1000) {
    return getTerbilang(Math.floor(nominal / 100)) + ' Ratus ' + getTerbilang(nominal % 100);
  } else if (nominal < 2000) {
    return 'Seribu ' + getTerbilang(nominal - 1000);
  } else if (nominal < 1000000) {
    return getTerbilang(Math.floor(nominal / 1000)) + ' Ribu ' + getTerbilang(nominal % 1000);
  } else if (nominal < 1000000000) {
    return getTerbilang(Math.floor(nominal / 1000000)) + ' Juta ' + getTerbilang(nominal % 1000000);
  } else if (nominal < 1000000000000) {
    return getTerbilang(Math.floor(nominal / 1000000000)) + ' Milyar ' + getTerbilang(nominal % 1000000000);
  }
  return '';
}

const INITIAL_TAGIHAN_LIST = [
  { id: 'tag-1', nama: 'Daniel Kristianto', blok: 'G-12', tagihan: 'Iuran Kebersihan & Sampah', bulan: 'Agustus 2026', bulanNama: 'Agustus', tahun: '2026', nominal: 50000, status: 'Lunas', no_kwitansi: 'KW/RT09-RW14/2026/08/012', tgl_bayar: '14 Agustus 2026', tgl_bayar_short: '14 Agt 2026', metode: 'QRIS', nik: '3525121405920001' },
  { id: 'tag-2', nama: 'Daniel Kristianto', blok: 'G-12', tagihan: 'Iuran Keamanan & Satpam', bulan: 'Agustus 2026', bulanNama: 'Agustus', tahun: '2026', nominal: 75000, status: 'Belum Lunas', no_kwitansi: '-', tgl_bayar: '-', tgl_bayar_short: '-', metode: '-', nik: '3525121405920001' },
  { id: 'tag-3', nama: 'Daniel Kristianto', blok: 'G-12', tagihan: 'Kas Sosial RT 09', bulan: 'Agustus 2026', bulanNama: 'Agustus', tahun: '2026', nominal: 30000, status: 'Lunas', no_kwitansi: 'KW/RT09-RW14/2026/08/009', tgl_bayar: '10 Agustus 2026', tgl_bayar_short: '10 Agt 2026', metode: 'Transfer', nik: '3525121405920001' },
  { id: 'tag-4', nama: 'Daniel Kristianto', blok: 'G-12', tagihan: 'Iuran Listrik Pos & Taman', bulan: 'Agustus 2026', bulanNama: 'Agustus', tahun: '2026', nominal: 25000, status: 'Belum Lunas', no_kwitansi: '-', tgl_bayar: '-', tgl_bayar_short: '-', metode: '-', nik: '3525121405920001' },
  { id: 'tag-5', nama: 'Budi Santoso', blok: 'G-10', tagihan: 'Iuran Kebersihan & Keamanan', bulan: 'Agustus 2026', bulanNama: 'Agustus', tahun: '2026', nominal: 125000, status: 'Lunas', no_kwitansi: 'KW/RT09-RW14/2026/08/022', tgl_bayar: '12 Agustus 2026', tgl_bayar_short: '12 Agt 2026', metode: 'QRIS', nik: '3525121102880005' },
  { id: 'tag-6', nama: 'Siti Rahmawati', blok: 'G-05', tagihan: 'Kas Sosial RT 09', bulan: 'Agustus 2026', bulanNama: 'Agustus', tahun: '2026', nominal: 30000, status: 'Belum Lunas', no_kwitansi: '-', tgl_bayar: '-', tgl_bayar_short: '-', metode: '-', nik: '3525122509890003' },
  { id: 'tag-7', nama: 'Ahmad Fauzi', blok: 'G-08', tagihan: 'Iuran Keamanan & Kebersihan', bulan: 'Agustus 2026', bulanNama: 'Agustus', tahun: '2026', nominal: 125000, status: 'Lunas', no_kwitansi: 'KW/RT09-RW14/2026/08/001', tgl_bayar: '05 Agustus 2026', tgl_bayar_short: '05 Agt 2026', metode: 'Transfer', nik: '3525121903930004' }
];

export default function Iuran() {
  const rtNama = localStorage.getItem('rt_nama') || localStorage.getItem('rt_username') || 'Daniel Kristianto';
  const rtBlok = localStorage.getItem('rt_blok') || 'G-12';
  const rtRole = localStorage.getItem('rt_user_role') || 'warga';
  const isAdmin = ['superadmin', 'ketua_rt', 'sekretaris', 'bendahara', 'admin', 'admin_rt'].includes(rtRole);

  const [tagihanList, setTagihanList] = useState(() => {
    const isReset = localStorage.getItem('rt_is_operational_reset') === 'true';
    const saved = localStorage.getItem('rt_tagihan_iuran_list');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { }
    }
    if (isReset) return [];
    return INITIAL_TAGIHAN_LIST;
  });

  const [filterStatus, setFilterStatus] = useState('semua'); // 'semua' | 'belum_lunas' | 'lunas'
  const [showQris, setShowQris] = useState(false);
  const [qrisData, setQrisData] = useState(null);
  const [showKwitansi, setShowKwitansi] = useState(false);
  const [selectedKwitansi, setSelectedKwitansi] = useState(null);
  const [toast, setToast] = useState(null);

  // Realtime Cross-tab Sync
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'rt_tagihan_iuran_list' && e.newValue) {
        try {
          setTagihanList(JSON.parse(e.newValue));
        } catch (err) { }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const persistTagihan = (newList) => {
    setTagihanList(newList);
    localStorage.setItem('rt_tagihan_iuran_list', JSON.stringify(newList));
  };

  // Helper cari nomor WhatsApp warga
  const getWargaPhone = (nama, blok) => {
    try {
      const saved = localStorage.getItem('rt_all_warga_profiles');
      if (saved) {
        const parsed = JSON.parse(saved);
        const found = parsed.find(w => 
          (w.nama_lengkap && nama && w.nama_lengkap.toLowerCase() === nama.toLowerCase()) ||
          (w.blok_rumah && blok && w.blok_rumah.toLowerCase() === blok.toLowerCase())
        );
        if (found && (found.no_whatsapp || found.noHp)) return found.no_whatsapp || found.noHp;
      }
    } catch (e) {}
    return '0812-3456-7890';
  };

  const handleSendWaTagihan = async (item) => {
    const phone = getWargaPhone(item.nama, item.blok);
    const msg = createTagihanMessage({
      nama: item.nama,
      blok: item.blok,
      periode: item.bulan,
      nominal: item.nominal,
      rincian: [{ nama: item.tagihan, nominal: item.nominal }]
    });

    showToastMsg(`Mengirim tagihan WhatsApp ke ${item.nama}...`);
    const res = await sendWaMessage(phone, msg);
    if (res && res.success) {
      showToastMsg(`✅ Tagihan berhasil dikirim ke WA ${item.nama} (${phone})!`);
    } else {
      showToastMsg(`Gateway Bot offline. Membuka WhatsApp Web untuk ${item.nama}...`);
      openDirectWhatsApp(phone, msg);
    }
  };

  const handleSendWaKwitansi = async (item) => {
    const phone = getWargaPhone(item.nama, item.blok);
    const msg = createKwitansiMessage({
      noKwitansi: item.no_kwitansi,
      nama: item.nama,
      blok: item.blok,
      nominal: item.nominal,
      tanggal: item.tgl_bayar,
      periode: `${item.bulanNama || 'Agustus'} ${item.tahun || '2026'}`,
      metode: item.metode || 'QRIS'
    });

    showToastMsg(`Mengirim kwitansi lunas ke WhatsApp ${item.nama}...`);
    const res = await sendWaMessage(phone, msg);
    if (res && res.success) {
      showToastMsg(`✅ Kwitansi lunas berhasil dikirim ke WA ${item.nama} (${phone})!`);
    } else {
      showToastMsg(`Gateway Bot offline. Membuka WhatsApp Web kwitansi ${item.nama}...`);
      openDirectWhatsApp(phone, msg);
    }
  };

  // Konfirmasi Pelunasan (Admin / Warga)
  const handleMarkLunas = (item, metode = 'QRIS') => {
    const kwitansiNo = `KW/RT09-RW14/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(Math.floor(100 + Math.random() * 900))}`;
    const tglNow = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const tglShort = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

    const updated = tagihanList.map(t => {
      if (t.id === item.id) {
        return {
          ...t,
          status: 'Lunas',
          no_kwitansi: kwitansiNo,
          tgl_bayar: tglNow,
          tgl_bayar_short: tglShort,
          metode: metode
        };
      }
      return t;
    });

    persistTagihan(updated);
    showToastMsg(`Tagihan "${item.tagihan}" berhasil ditandai LUNAS. No Kwitansi: ${kwitansiNo}`);
    setShowQris(false);
  };

  // Computed data for UI
  const rawWargaData = useMemo(() => {
    const isReset = localStorage.getItem('rt_is_operational_reset') === 'true';
    let list = tagihanList.filter(d => 
      (d.nama || '').toLowerCase().includes(rtNama.toLowerCase()) || 
      (d.blok || '').toLowerCase() === rtBlok.toLowerCase() ||
      (rtNama.toLowerCase().includes('daniel') && (d.nama || '').toLowerCase().includes('daniel'))
    );
    if (list.length === 0 && !isAdmin && !isReset) {
      list = [
        { id: `tag-${rtBlok}-1`, nama: rtNama, blok: rtBlok, tagihan: 'Iuran Kebersihan & Sampah', bulan: 'Agustus 2026', bulanNama: 'Agustus', tahun: '2026', nominal: 50000, status: 'Belum Lunas', no_kwitansi: '-', tgl_bayar: '-', tgl_bayar_short: '-', metode: '-' },
        { id: `tag-${rtBlok}-2`, nama: rtNama, blok: rtBlok, tagihan: 'Iuran Keamanan & Satpam', bulan: 'Agustus 2026', bulanNama: 'Agustus', tahun: '2026', nominal: 75000, status: 'Belum Lunas', no_kwitansi: '-', tgl_bayar: '-', tgl_bayar_short: '-', metode: '-' },
        { id: `tag-${rtBlok}-3`, nama: rtNama, blok: rtBlok, tagihan: 'Kas Sosial RT 09', bulan: 'Agustus 2026', bulanNama: 'Agustus', tahun: '2026', nominal: 30000, status: 'Belum Lunas', no_kwitansi: '-', tgl_bayar: '-', tgl_bayar_short: '-', metode: '-' },
        { id: `tag-${rtBlok}-4`, nama: rtNama, blok: rtBlok, tagihan: 'Iuran Listrik Pos & Taman', bulan: 'Agustus 2026', bulanNama: 'Agustus', tahun: '2026', nominal: 25000, status: 'Belum Lunas', no_kwitansi: '-', tgl_bayar: '-', tgl_bayar_short: '-', metode: '-' }
      ];
    }
    return list;
  }, [tagihanList, rtNama, rtBlok, isAdmin]);

  const summaryData = isAdmin ? tagihanList : rawWargaData;

  const data = useMemo(() => {
    let list = isAdmin ? tagihanList : rawWargaData;
    if (filterStatus === 'belum_lunas') list = list.filter(d => d.status !== 'Lunas');
    if (filterStatus === 'lunas') list = list.filter(d => d.status === 'Lunas');
    return list;
  }, [tagihanList, rawWargaData, isAdmin, filterStatus]);
  const fmt = n => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  const openQris = (item) => {
    const payload = `RT09RW14|${rtBlok}|${rtNama}|${item.tagihan}|${item.bulan}|${item.nominal}|${Date.now()}`;
    setQrisData({ ...item, qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(payload)}` });
    setShowQris(true);
  };

  const handleOpenKwitansi = (item) => {
    setSelectedKwitansi(item);
    setShowKwitansi(true);
  };

  return (
    <Layout>
      <div className="space-y-5">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page {
              size: A5 landscape;
              margin: 5mm;
            }
            body, html {
              background: white !important;
              color: black !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            header, aside, nav, .print\\:hidden {
              display: none !important;
            }
            main {
              padding: 0 !important;
              margin: 0 !important;
              width: 100% !important;
              display: block !important;
            }
          }
        `}} />

        {/* ========================================================= */}
        {/* PRINTABLE OFFICIAL KWITANSI IURAN (EXACT HTML TEMPLATE)  */}
        {/* ========================================================= */}
        {selectedKwitansi && (
          <div className="hidden print:block bg-white text-black p-0 m-0 font-sans text-[9pt] leading-normal w-full">
            <div className="border-2 border-black p-4 max-w-[720px] mx-auto relative bg-white">
              {/* Header */}
              <div className="border-b-2 border-black pb-2 mb-3 flex justify-between items-center">
                <div>
                  <h2 className="text-[13pt] font-black tracking-wide uppercase m-0">KWITANSI IURAN WARGA</h2>
                  <p className="text-[9pt] font-bold m-0 mt-0.5">RT 09 / RW 14 - De Naila Village Blok G</p>
                  <p className="text-[8pt] text-gray-700 m-0">Perum De Naila Village Blok G, Kec. Driyorejo</p>
                </div>
                <div className="text-right">
                  <div className="border-4 border-green-600 text-green-600 font-black text-[18pt] px-4 py-1 rotate-[-12deg] tracking-widest inline-block uppercase">
                    LUNAS
                  </div>
                </div>
              </div>

              {/* Rows */}
              <div className="space-y-2 text-[9pt]">
                <div className="flex">
                  <div className="w-44 font-bold">No. Kwitansi</div>
                  <div className="flex-1 border-b border-dotted border-black font-mono font-bold">: {selectedKwitansi.no_kwitansi || 'KW/RT09-RW14/2026/08/012'}</div>
                </div>
                <div className="flex">
                  <div className="w-44 font-bold">Telah Terima Dari</div>
                  <div className="flex-1 border-b border-dotted border-black font-bold uppercase">: {selectedKwitansi.nama || rtNama} (Blok {selectedKwitansi.blok || rtBlok})</div>
                </div>
                <div className="flex">
                  <div className="w-44 font-bold">NIK</div>
                  <div className="flex-1 border-b border-dotted border-black font-mono">: {selectedKwitansi.nik || '3525121405920001'}</div>
                </div>
                <div className="flex">
                  <div className="w-44 font-bold">Untuk Pembayaran</div>
                  <div className="flex-1 border-b border-dotted border-black font-medium">: {selectedKwitansi.tagihan} - Bulan {selectedKwitansi.bulanNama || 'Agustus'} {selectedKwitansi.tahun || '2026'}</div>
                </div>
                <div className="flex">
                  <div className="w-44 font-bold">Tanggal Bayar</div>
                  <div className="flex-1 border-b border-dotted border-black">: {selectedKwitansi.tgl_bayar || '14 Agustus 2026'}</div>
                </div>
                <div className="flex">
                  <div className="w-44 font-bold">Metode</div>
                  <div className="flex-1 border-b border-dotted border-black">: {selectedKwitansi.metode || 'QRIS / Transfer'}</div>
                </div>
              </div>

              {/* Total Box */}
              <div className="bg-gray-100 border border-black p-2.5 mt-4 flex justify-between font-bold text-[12pt]">
                <span>JUMLAH BAYAR</span>
                <span className="font-mono">{fmt(selectedKwitansi.nominal)}</span>
              </div>

              {/* Terbilang */}
              <div className="flex mt-2.5 text-[9pt]">
                <div className="w-44 font-bold">Terbilang</div>
                <div className="flex-1 border-b border-dotted border-black italic font-semibold">: {getTerbilang(selectedKwitansi.nominal).trim()} Rupiah</div>
              </div>

              {/* Footer */}
              <div className="mt-6 flex justify-between text-[9pt]">
                <div className="text-[8pt] text-gray-600">
                  <p className="font-bold text-black mb-0.5">Catatan:</p>
                  <p>- Simpan sebagai bukti pembayaran sah</p>
                  <p>- Iuran digunakan untuk kebersihan & keamanan Blok G</p>
                  <p>- Info: Bendahara RT09/14 (Email: rt09rw14.denaila@gmail.com)</p>
                </div>
                <div className="text-center w-48">
                  <p className="text-[8pt]">DNV Blok-G, {selectedKwitansi.tgl_bayar_short || '14 Agt 2026'}</p>
                  <p className="font-bold text-[9pt]">Bendahara RT 09/14</p>
                  <div className="h-14"></div>
                  <p className="font-bold"><b>( TIM BENDAHARA )</b></p>
                </div>
              </div>

              {/* Auto Stamp Note */}
              <div className="mt-4 border-t border-dashed border-black pt-1.5 text-center text-[7pt] text-gray-600">
                Dicetak otomatis oleh SIRW RT09/RW14 De Naila Village - {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SCREEN VIEW (UI LIST & MANAGEMENT)                       */}
        {/* ========================================================= */}
        <div className="print:hidden space-y-5">
          <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] bg-[#7C3AED]/15 text-[#A78BFA] border border-[#7C3AED]/20 px-3 py-1 rounded-full font-medium">
                  RT 09 / RW 14 De Naila Village Blok G
                </span>
                <span className="text-[11px] bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full text-slate-300">
                  Sumputsarirejo, Driyorejo
                </span>
              </div>
              <h2 className="font-bold text-white text-[18px] mt-2">
                {isAdmin ? 'Iuran & Tagihan - Seluruh Warga RT 09' : `Tagihan & Iuran Saya - ${rtNama}`}
              </h2>
              <p className="text-[12px] text-slate-400 mt-1">
                {isAdmin ? 'Monitoring pembayaran iuran warga De Naila Village Blok G' : `Hanya menampilkan transaksi atas nama ${rtNama} • Blok ${rtBlok}`}
              </p>
              {!isAdmin && (
                <div className="mt-3 flex gap-2">
                  <span className="text-[11px] bg-[#7C3AED]/15 text-[#A78BFA] border border-[#7C3AED]/20 px-3 py-1 rounded-full">
                    Nama: {rtNama}
                  </span>
                  <span className="text-[11px] bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                    Blok: {rtBlok}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Toast Notification */}
          {toast && (
            <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-3 rounded-2xl text-xs flex items-center gap-2 shadow-lg animate-fade-in">
              <span>✓</span>
              <span>{toast}</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-4 text-center">
              <div className="text-[11px] text-slate-400">Belum Lunas</div>
              <div className="text-[18px] font-bold text-red-400 mt-1">
                {summaryData.filter(d => d.status !== 'Lunas').length}
              </div>
            </div>
            <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-4 text-center">
              <div className="text-[11px] text-slate-400">Total Tunggakan</div>
              <div className="text-[16px] font-bold text-white mt-1">
                {fmt(summaryData.filter(d => d.status !== 'Lunas').reduce((a, b) => a + b.nominal, 0))}
              </div>
            </div>
            <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-4 text-center">
              <div className="text-[11px] text-slate-400">Terbayar Lunas</div>
              <div className="text-[18px] font-bold text-green-400 mt-1">
                {summaryData.filter(d => d.status === 'Lunas').length}
              </div>
            </div>
          </div>

          <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] overflow-hidden shadow-xl">
            <div className="p-4 bg-white/[0.02] border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-[13px] font-bold text-white flex items-center gap-2">
                  <span>💳</span>
                  {isAdmin ? 'Pusat Tagihan & Kas Masuk Iuran Warga' : `Daftar Iuran & Tagihan - ${rtNama} (${rtBlok})`}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isAdmin ? 'Verifikasi status pembayaran warga dan terbitkan kwitansi resmi tanda terima' : 'Pilih tagihan yang ingin dibayar secara instan via QRIS atau cek riwayat lunas'}
                </p>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 bg-[#23263A] p-1 rounded-xl border border-white/10 text-xs">
                <button
                  onClick={() => setFilterStatus('semua')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                    filterStatus === 'semua' ? 'bg-[#7C3AED] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Semua ({summaryData.length})
                </button>
                <button
                  onClick={() => setFilterStatus('belum_lunas')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
                    filterStatus === 'belum_lunas' ? 'bg-rose-600 text-white' : 'text-rose-400 hover:bg-white/5'
                  }`}
                >
                  <span>Belum Lunas</span>
                  <span className="text-[10px] bg-black/30 px-1.5 py-0.2 rounded-full font-mono">{summaryData.filter(d => d.status !== 'Lunas').length}</span>
                </button>
                <button
                  onClick={() => setFilterStatus('lunas')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
                    filterStatus === 'lunas' ? 'bg-emerald-600 text-white' : 'text-emerald-400 hover:bg-white/5'
                  }`}
                >
                  <span>Lunas</span>
                  <span className="text-[10px] bg-black/30 px-1.5 py-0.2 rounded-full font-mono">{summaryData.filter(d => d.status === 'Lunas').length}</span>
                </button>
              </div>
            </div>

            <table className="w-full text-sm border-collapse">
              <thead className="text-[10px] text-slate-400 uppercase tracking-wider bg-black/20 border-b border-white/10 font-bold">
                <tr>
                  <th className="text-left px-5 py-3.5 w-[32%]">TAGIHAN</th>
                  <th className="text-left px-3 py-3.5 w-[18%]">BULAN</th>
                  <th className="text-left px-3 py-3.5 w-[18%]">NOMINAL</th>
                  <th className="text-left px-3 py-3.5 w-[16%]">STATUS</th>
                  <th className="text-right px-5 py-3.5 w-[16%]">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400 text-xs">
                      <div className="text-2xl mb-1">📭</div>
                      Tidak ada tagihan yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  data.map((r, i) => (
                    <tr key={r.id || i} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                      <td className="px-5 py-3.5 text-white text-[13px]">
                        {isAdmin ? (
                          <>
                            <div className="font-semibold text-white text-xs">{r.nama}</div>
                            <div className="text-[11px] text-slate-400">{r.tagihan} <span className="text-[#A78BFA] font-mono">(Blok {r.blok})</span></div>
                          </>
                        ) : (
                          <div className="font-medium text-white text-xs">{r.tagihan}</div>
                        )}
                      </td>
                      <td className="px-3 py-3.5 text-slate-300 text-xs font-mono">{r.bulan}</td>
                      <td className="px-3 py-3.5 text-white text-xs font-mono font-bold">{fmt(r.nominal)}</td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        {r.status === 'Lunas' ? (
                          <span className="text-[11px] bg-emerald-500/15 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30 font-medium inline-flex items-center gap-1">
                            <span>●</span> Lunas ({r.metode || 'QRIS'})
                          </span>
                        ) : (
                          <span className="text-[11px] bg-rose-500/15 text-rose-300 px-2.5 py-1 rounded-full border border-rose-500/30 font-medium inline-flex items-center gap-1">
                            <span>●</span> Belum Lunas
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {r.status === 'Lunas' ? (
                            <>
                              <button
                                onClick={() => handleOpenKwitansi(r)}
                                className="text-[11px] bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-slate-200 transition cursor-pointer flex items-center gap-1 active:scale-95"
                              >
                                📄 Kwitansi
                              </button>
                              {isAdmin && (
                                <button
                                  onClick={() => handleSendWaKwitansi(r)}
                                  title="Kirim Kwitansi Lunas ke WhatsApp Warga"
                                  className="text-[11px] bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 active:scale-95"
                                >
                                  📲 WA
                                </button>
                              )}
                            </>
                          ) : (
                            <>
                              {isAdmin && (
                                <>
                                  <button
                                    onClick={() => handleSendWaTagihan(r)}
                                    title="Kirim Tagihan ke WhatsApp Warga"
                                    className="text-[11px] bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 active:scale-95"
                                  >
                                    📲 WA
                                  </button>
                                  <button
                                    onClick={() => handleMarkLunas(r, 'Tunai / Pengurus')}
                                    className="text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer shadow-sm active:scale-95"
                                  >
                                    ✓ Set Lunas
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => openQris(r)}
                                className="text-[11px] bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer shadow-sm shadow-[#7C3AED]/20 active:scale-95"
                              >
                                ⚡ Bayar QRIS
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal QRIS */}
        {showQris && qrisData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowQris(false)}></div>
            <div className="relative z-10 bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 w-full max-w-[380px] text-center shadow-2xl space-y-3">
              <h3 className="font-bold text-white text-[15px]">Bayar {qrisData.tagihan}</h3>
              <p className="text-[11px] text-slate-400">RT 09 / RW 14 Blok {qrisData.blok || rtBlok} • {qrisData.nama || rtNama}</p>
              <div className="bg-white rounded-2xl p-3 mx-auto w-fit shadow-lg">
                <img src={qrisData.qrUrl} alt="QRIS" className="w-[220px] h-[220px] rounded-xl" />
              </div>
              <div className="bg-[#23263A] border border-white/10 rounded-xl p-3 text-left text-xs space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Warga Pembayar</span>
                  <span className="text-white font-medium">{qrisData.nama || rtNama}</span>
                </div>
                <div className="flex justify-between text-[12px] pt-1.5 border-t border-white/10">
                  <span className="text-slate-300">Total Nominal</span>
                  <span className="font-bold text-emerald-400 font-mono text-sm">{fmt(qrisData.nominal)}</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500">
                Scan via BCA, Mandiri, BRI, GoPay, OVO, ShopeePay, DANA
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleMarkLunas(qrisData, 'QRIS')}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl text-xs font-semibold transition cursor-pointer shadow-lg shadow-emerald-600/20 active:scale-95"
                >
                  ✓ Konfirmasi Lunas
                </button>
                <button
                  onClick={() => setShowQris(false)}
                  className="bg-white/10 hover:bg-white/20 text-slate-300 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Kwitansi Preview */}
        {showKwitansi && selectedKwitansi && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowKwitansi(false)}></div>
            <div className="relative z-10 bg-white text-black rounded-[24px] p-6 w-full max-w-[500px] shadow-2xl font-sans text-xs">
              <div className="border-2 border-black p-4 rounded-xl bg-white">
                <div className="border-b-2 border-black pb-2 mb-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-black uppercase m-0">KWITANSI IURAN WARGA</h3>
                    <p className="text-[10px] font-bold m-0">RT 09 / RW 14 - De Naila Village Blok G</p>
                    <p className="text-[9px] text-gray-600 m-0">Perum De Naila Village Blok G, Kec. Driyorejo</p>
                  </div>
                  <div className="border-2 border-green-600 text-green-600 font-bold text-xs px-2.5 py-0.5 rotate-[-10deg]">
                    LUNAS
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex">
                    <span className="w-32 font-semibold">No. Kwitansi</span>
                    <span className="flex-1 font-mono font-bold">: {selectedKwitansi.no_kwitansi || 'KW/RT09-RW14/2026/08/012'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 font-semibold">Telah Terima Dari</span>
                    <span className="flex-1 font-bold uppercase">: {selectedKwitansi.nama || rtNama} (Blok {selectedKwitansi.blok || rtBlok})</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 font-semibold">NIK</span>
                    <span className="flex-1 font-mono">: {selectedKwitansi.nik || '3525121405920001'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 font-semibold">Untuk Pembayaran</span>
                    <span className="flex-1">: {selectedKwitansi.tagihan} - Bulan {selectedKwitansi.bulanNama || 'Agustus'} {selectedKwitansi.tahun || '2026'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 font-semibold">Tanggal Bayar</span>
                    <span className="flex-1">: {selectedKwitansi.tgl_bayar || '14 Agustus 2026'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 font-semibold">Metode</span>
                    <span className="flex-1">: {selectedKwitansi.metode || 'QRIS / Transfer'}</span>
                  </div>
                </div>

                <div className="bg-gray-100 border border-black p-2 mt-3 flex justify-between font-bold text-xs">
                  <span>JUMLAH BAYAR</span>
                  <span className="font-mono text-sm text-emerald-800">{fmt(selectedKwitansi.nominal)}</span>
                </div>

                <div className="flex mt-2 text-[10px]">
                  <span className="w-32 font-semibold">Terbilang</span>
                  <span className="flex-1 italic">: {getTerbilang(selectedKwitansi.nominal).trim()} Rupiah</span>
                </div>

                <div className="mt-4 flex justify-between text-[9px]">
                  <div className="text-gray-500">
                    <p className="font-semibold text-black">Catatan:</p>
                    <p>- Simpan sebagai bukti sah</p>
                    <p>- Info: Bendahara RT09/14</p>
                  </div>
                  <div className="text-center w-36">
                    <p>DNV Blok-G, {selectedKwitansi.tgl_bayar_short || '14 Agt 2026'}</p>
                    <p className="font-bold">Bendahara RT 09/14</p>
                    <div className="h-8"></div>
                    <p className="font-bold">( TIM BENDAHARA )</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setTimeout(() => window.print(), 200);
                  }}
                  className="flex-1 bg-black hover:bg-gray-800 text-white py-2.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5"
                >
                  🖨️ Cetak Kwitansi
                </button>
                <button
                  onClick={() => handleSendWaKwitansi(selectedKwitansi)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95"
                >
                  📲 Kirim WA Warga
                </button>
                <button
                  onClick={() => setShowKwitansi(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
