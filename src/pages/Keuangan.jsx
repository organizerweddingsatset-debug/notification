import { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import Layout from '../components/Layout';
import { supabase } from '../supabaseClient';

// Data Awal Kas RT 09
const INITIAL_KAS_LIST = [
  {
    id: 'kas-1',
    tanggal: '2026-08-01',
    kategori: 'Pemasukan',
    jenis_transaksi: 'Iuran Wajib Bulanan',
    nama_warga: 'Daniel Kristianto',
    blok_rumah: 'G-12',
    periode: 'Agustus 2026',
    keterangan: 'Iuran Kebersihan & Kas Sosial Blok G-12 (Daniel)',
    nominal: 80000,
    metode: 'QRIS',
    pj: 'Bendahara RT',
    bukti_nota: 'QRIS-RT9-20260801-01'
  },
  {
    id: 'kas-2',
    tanggal: '2026-08-02',
    kategori: 'Pemasukan',
    jenis_transaksi: 'Iuran Wajib Bulanan',
    nama_warga: 'Budi Santoso',
    blok_rumah: 'G-10',
    periode: 'Agustus 2026',
    keterangan: 'Iuran Kebersihan & Keamanan Blok G-10 (Budi)',
    nominal: 125000,
    metode: 'Transfer',
    pj: 'Bendahara RT',
    bukti_nota: 'TRF-BCA-88912'
  },
  {
    id: 'kas-3',
    tanggal: '2026-08-05',
    kategori: 'Pengeluaran',
    jenis_transaksi: 'Biaya Kebersihan & Sampah',
    nama_warga: 'Petugas Kebersihan DLH',
    blok_rumah: '-',
    periode: 'Agustus 2026',
    keterangan: 'Pembayaran truk pengangkut sampah mingguan periode 1-5 Agt',
    nominal: 500000,
    metode: 'Tunai',
    pj: 'Seksi Kebersihan',
    bukti_nota: 'NOTA-SMPH-081'
  },
  {
    id: 'kas-4',
    tanggal: '2026-08-08',
    kategori: 'Pemasukan',
    jenis_transaksi: 'Iuran Insidentil',
    nama_warga: 'Kas Partisipasi Fasum',
    blok_rumah: 'Blok G',
    periode: 'Agustus 2026',
    keterangan: 'Iuran partisipasi perbaikan gapura barat Blok G',
    nominal: 250000,
    metode: 'Transfer',
    pj: 'Bendahara RT',
    bukti_nota: 'TRF-MDR-44211'
  },
  {
    id: 'kas-5',
    tanggal: '2026-08-10',
    kategori: 'Pemasukan',
    jenis_transaksi: 'Iuran Sukarela',
    nama_warga: 'Hamba Allah / Donatur Sukarela',
    blok_rumah: '-',
    periode: 'Agustus 2026',
    keterangan: 'Infaq sukarela warga untuk kas sosial & santunan anak yatim',
    nominal: 350000,
    metode: 'QRIS',
    pj: 'Bendahara RT',
    bukti_nota: 'QRIS-RT9-20260810-09'
  },
  {
    id: 'kas-6',
    tanggal: '2026-08-12',
    kategori: 'Pengeluaran',
    jenis_transaksi: 'Gaji Petugas Satpam',
    nama_warga: 'Pak Slamet & Pak Joko (Satpam)',
    blok_rumah: '-',
    periode: 'Agustus 2026',
    keterangan: 'Gaji termin 1 untuk 2 petugas keamanan pos satpam Blok G',
    nominal: 1200000,
    metode: 'Transfer',
    pj: 'Bendahara RT',
    bukti_nota: 'KWIT-SAT-08A'
  },
  {
    id: 'kas-7',
    tanggal: '2026-08-15',
    kategori: 'Pengeluaran',
    jenis_transaksi: 'Listrik & Utilitas Pos',
    nama_warga: 'PLN Persero',
    blok_rumah: '-',
    periode: 'Agustus 2026',
    keterangan: 'Beli token listrik pos satpam & pompa air taman RT 09',
    nominal: 250000,
    metode: 'QRIS',
    pj: 'Bendahara RT',
    bukti_nota: 'PLN-TKN-883921'
  },
  {
    id: 'kas-8',
    tanggal: '2026-08-18',
    kategori: 'Pemasukan',
    jenis_transaksi: 'Iuran Wajib Bulanan',
    nama_warga: 'Ahmad Fauzi',
    blok_rumah: 'G-08',
    periode: 'Agustus 2026',
    keterangan: 'Iuran bulanan Agustus Blok G-08 (dr. Fauzi)',
    nominal: 125000,
    metode: 'QRIS',
    pj: 'Bendahara RT',
    bukti_nota: 'QRIS-RT9-20260818-04'
  }
];

const DAFTAR_WARGA_DEFAULT = [
  { id: '1', nama: 'Daniel Kristianto', blok: 'G-12' },
  { id: '2', nama: 'Budi Santoso', blok: 'G-10' },
  { id: '3', nama: 'Warga Donatur', blok: 'Blok G' },
  { id: '4', nama: 'Siti Rahmawati', blok: 'G-05' },
  { id: '5', nama: 'Ahmad Fauzi', blok: 'G-08' },
  { id: '6', nama: 'Hendra Wijaya', blok: 'G-15' },
  { id: '7', nama: 'Rudi Hermawan', blok: 'G-16' },
  { id: '8', nama: 'Bambang Irawan', blok: 'G-03' },
];

export default function Keuangan() {
  const [kasList, setKasList] = useState(() => {
    const isReset = localStorage.getItem('rt_is_operational_reset') === 'true';
    const saved = localStorage.getItem('rt_kas_keuangan_list');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { }
    }
    if (isReset) return [];
    return INITIAL_KAS_LIST;
  });

  // Warga list for dropdown
  const [wargaList, setWargaList] = useState(() => {
    const isReset = localStorage.getItem('rt_is_operational_reset') === 'true';
    const saved = localStorage.getItem('rt_all_warga_profiles');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(w => ({
            id: w.id || w.user_id,
            nama: w.nama_lengkap || w.nama,
            blok: w.blok_rumah || w.blok || 'G-12'
          }));
        }
      } catch (e) { }
    }
    if (isReset) return [];
    return DAFTAR_WARGA_DEFAULT;
  });

  // Modals & UI States
  const [activeTab, setActiveTab] = useState('semua'); // 'semua' | 'pemasukan' | 'pengeluaran'
  const [filterBulan, setFilterBulan] = useState('2026-08'); // Default current active month
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Modal LPJ Preview
  const [showLpjModal, setShowLpjModal] = useState(false);
  const [lpjTitle, setLpjTitle] = useState('LAPORAN PERTANGGUNGJAWABAN (LPJ) KAS RT 09');
  const [lpjAgenda, setLpjAgenda] = useState('Rapat Pleno Warga & Musyawarah Bulanan RT 09 / RW 14 De Naila Village Blok G');

  // Modal Kas Masuk
  const [showModalMasuk, setShowModalMasuk] = useState(false);
  const [formMasuk, setFormMasuk] = useState({
    jenis_iuran: 'Iuran Wajib Bulanan',
    warga_selected: 'Daniel Kristianto|G-12',
    periode_bulan: 'Agustus 2026',
    tanggal: new Date().toISOString().split('T')[0],
    nominal: '',
    metode: 'QRIS',
    keterangan: '',
    pj: 'Bendahara RT',
    bukti_nota: ''
  });

  // Modal Kas Keluar
  const [showModalKeluar, setShowModalKeluar] = useState(false);
  const [formKeluar, setFormKeluar] = useState({
    kategori_pengeluaran: 'Gaji Petugas Satpam',
    tanggal: new Date().toISOString().split('T')[0],
    nominal: '',
    metode: 'Transfer',
    keterangan: '',
    penerima: '',
    pj: 'Bendahara RT',
    bukti_nota: ''
  });

  // Fetch live from Supabase on mount
  useEffect(() => {
    async function loadFromSupabase() {
      try {
        const isReset = localStorage.getItem('rt_is_operational_reset') === 'true';
        const { data, error } = await supabase
          .from('kas_keuangan')
          .select('*')
          .order('tanggal', { ascending: false });

        if (data && !error) {
          if (data.length === 0 && isReset) {
            setKasList([]);
            localStorage.setItem('rt_kas_keuangan_list', '[]');
            return;
          }

          let mapped = data.map(item => ({
            id: item.id || 'kas-' + Math.random(),
            tanggal: item.tanggal,
            kategori: item.kategori,
            jenis_transaksi: item.kategori === 'Pemasukan' ? 'Iuran Wajib Bulanan' : 'Operasional RT',
            nama_warga: item.nama_warga || '-',
            blok_rumah: item.blok_rumah || '-',
            periode: item.periode || 'Agustus 2026',
            keterangan: item.keterangan,
            nominal: Number(item.nominal) || 0,
            metode: item.metode_bayar || 'Transfer',
            pj: item.pj || 'Bendahara RT',
            bukti_nota: item.bukti_nota || '-'
          }));

          if (!isReset) {
            INITIAL_KAS_LIST.forEach(initK => {
              if (!mapped.some(m => m.id === initK.id || m.keterangan === initK.keterangan)) {
                mapped.push(initK);
              }
            });
          }

          setKasList(mapped);
          localStorage.setItem('rt_kas_keuangan_list', JSON.stringify(mapped));
        }
      } catch (err) {
        console.log('Supabase kas fetch note:', err);
      }
    }

    loadFromSupabase();
  }, []);

  const showToast = (type, text) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4500);
  };

  const persistKas = async (newList) => {
    setKasList(newList);
    localStorage.setItem('rt_kas_keuangan_list', JSON.stringify(newList));
  };

  const fmt = n => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  // ==========================================
  // 1. SUBMIT KAS MASUK
  // ==========================================
  const handleSaveKasMasuk = async (e) => {
    e.preventDefault();
    const nominalNum = Number(formMasuk.nominal);
    if (!nominalNum || nominalNum <= 0) {
      alert('Masukkan nominal uang yang valid!');
      return;
    }

    let namaWarga = 'Hamba Allah / Donatur Sukarela';
    let blokRumah = '-';

    if (formMasuk.jenis_iuran !== 'Iuran Sukarela') {
      const [nama, blok] = (formMasuk.warga_selected || '').split('|');
      namaWarga = nama || 'Warga RT 09';
      blokRumah = blok || 'G-12';
    }

    let defaultKet = formMasuk.keterangan.trim();
    if (!defaultKet) {
      if (formMasuk.jenis_iuran === 'Iuran Wajib Bulanan') {
        defaultKet = `Iuran wajib periode ${formMasuk.periode_bulan} dari ${namaWarga} (Blok ${blokRumah})`;
      } else if (formMasuk.jenis_iuran === 'Iuran Insidentil') {
        defaultKet = `Iuran kegiatan insidentil dari ${namaWarga} (Blok ${blokRumah})`;
      } else {
        defaultKet = `Donasi / Infaq sukarela kas RT 09`;
      }
    }

    const newKasItem = {
      id: 'kas-' + Date.now(),
      tanggal: formMasuk.tanggal,
      kategori: 'Pemasukan',
      jenis_transaksi: formMasuk.jenis_iuran,
      nama_warga: namaWarga,
      blok_rumah: blokRumah,
      periode: formMasuk.periode_bulan,
      keterangan: defaultKet,
      nominal: nominalNum,
      metode: formMasuk.metode,
      pj: formMasuk.pj,
      bukti_nota: formMasuk.bukti_nota.trim() || `KM-${Date.now().toString().slice(-6)}`
    };

    const updatedList = [newKasItem, ...kasList];
    await persistKas(updatedList);

    // Sync to Supabase
    let synced = false;
    try {
      const { error } = await supabase.from('kas_keuangan').insert({
        tanggal: newKasItem.tanggal,
        kategori: 'Pemasukan',
        keterangan: `${newKasItem.jenis_transaksi}: ${newKasItem.keterangan}`,
        nominal: newKasItem.nominal,
        pj: newKasItem.pj,
        bukti_nota: newKasItem.bukti_nota
      });
      if (!error) synced = true;
    } catch (err) {
      console.warn('Supabase insert note:', err);
    }

    setShowModalMasuk(false);
    setFormMasuk({
      jenis_iuran: 'Iuran Wajib Bulanan',
      warga_selected: wargaList[0] ? `${wargaList[0].nama}|${wargaList[0].blok}` : 'Daniel Kristianto|G-12',
      periode_bulan: 'Agustus 2026',
      tanggal: new Date().toISOString().split('T')[0],
      nominal: '',
      metode: 'QRIS',
      keterangan: '',
      pj: 'Bendahara RT',
      bukti_nota: ''
    });

    showToast(synced ? 'success' : 'info', `Pemasukan kas Rp ${nominalNum.toLocaleString('id-ID')} (${newKasItem.jenis_transaksi}) berhasil dicatat!`);
  };

  // ==========================================
  // 2. SUBMIT KAS KELUAR
  // ==========================================
  const handleSaveKasKeluar = async (e) => {
    e.preventDefault();
    const nominalNum = Number(formKeluar.nominal);
    if (!nominalNum || nominalNum <= 0) {
      alert('Masukkan nominal pengeluaran yang valid!');
      return;
    }

    const newKasItem = {
      id: 'kas-' + Date.now(),
      tanggal: formKeluar.tanggal,
      kategori: 'Pengeluaran',
      jenis_transaksi: formKeluar.kategori_pengeluaran,
      nama_warga: formKeluar.penerima.trim() || 'Vendor / Petugas',
      blok_rumah: '-',
      periode: 'Agustus 2026',
      keterangan: formKeluar.keterangan.trim() || formKeluar.kategori_pengeluaran,
      nominal: nominalNum,
      metode: formKeluar.metode,
      pj: formKeluar.pj,
      bukti_nota: formKeluar.bukti_nota.trim() || `KK-${Date.now().toString().slice(-6)}`
    };

    const updatedList = [newKasItem, ...kasList];
    await persistKas(updatedList);

    // Sync to Supabase
    let synced = false;
    try {
      const { error } = await supabase.from('kas_keuangan').insert({
        tanggal: newKasItem.tanggal,
        kategori: 'Pengeluaran',
        keterangan: `${newKasItem.jenis_transaksi}: ${newKasItem.keterangan}`,
        nominal: newKasItem.nominal,
        pj: newKasItem.pj,
        bukti_nota: newKasItem.bukti_nota
      });
      if (!error) synced = true;
    } catch (err) {
      console.warn('Supabase insert note:', err);
    }

    setShowModalKeluar(false);
    setFormKeluar({
      kategori_pengeluaran: 'Gaji Petugas Satpam',
      tanggal: new Date().toISOString().split('T')[0],
      nominal: '',
      metode: 'Transfer',
      keterangan: '',
      penerima: '',
      pj: 'Bendahara RT',
      bukti_nota: ''
    });

    showToast(synced ? 'success' : 'info', `Pengeluaran kas Rp ${nominalNum.toLocaleString('id-ID')} (${newKasItem.jenis_transaksi}) berhasil dibukukan!`);
  };

  // Delete Transaction
  const handleDeleteKas = async (id, ket) => {
    if (!confirm(`Hapus catatan transaksi: "${ket}"?`)) return;
    const updatedList = kasList.filter(k => k.id !== id);
    await persistKas(updatedList);
    showToast('info', 'Catatan transaksi telah dihapus.');
  };

  // ==========================================
  // 3. EXPORT EXCEL (.XLSX ASLI - PROPER BACKUP)
  // ==========================================
  const handleExportXLSX = () => {
    try {
      const wb = XLSX.utils.book_new();

      // 1. Sheet 1: BUKU KAS UMUM
      const kasDataForExcel = [
        ['RUKUN TETANGGA 09 / RUKUN WARGA 14 DE NAILA VILLAGE BLOK G'],
        ['SUMPUTSARIREJO, DRIYOREJO, KABUPATEN GRESIK - JAWA TIMUR'],
        ['EMAIL: denailavillageRT09@gmail.com'],
        [],
        ['LAPORAN PERTANGGUNGJAWABAN (LPJ) KEUANGAN KAS RT 09'],
        [`Periode Laporan: ${filterBulan === 'all' ? 'Semua Periode Transaksi' : filterBulan}`, `Tanggal Export: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}`, 'Status: Terverifikasi Bendahara RT 09 / RW 14'],
        [],
        ['=== RINGKASAN REKAPITULASI KAS RT 09 ==='],
        ['Total Pemasukan Periode', filteredPemasukan],
        ['Total Pengeluaran Periode', filteredPengeluaran],
        ['Surplus / Defisit Bersih Periode', surplusPeriode],
        ['Total Saldo Kas RT Saat Ini', saldoKasRT],
        [],
        ['=== BUKU KAS UMUM & RINCIAN TRANSAKSI ==='],
        [
          'No',
          'Tanggal',
          'Kategori Arus Kas',
          'Jenis Iuran / Pos Belanja',
          'Warga / Pembayar / Penerima',
          'Blok Rumah',
          'Periode Tagihan',
          'Uraian Keterangan Transaksi',
          'Metode Pembayaran',
          'Penanggung Jawab (PJ)',
          'Nomor Bukti / Nota',
          'Penerimaan / Masuk (Rp)',
          'Pengeluaran / Keluar (Rp)',
          'Saldo Berjalan (Rp)'
        ]
      ];

      let runningBalance = 0;
      const sortedTransactions = [...filteredKasList].sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

      sortedTransactions.forEach((item, index) => {
        const isMasuk = item.kategori === 'Pemasukan';
        const masuk = isMasuk ? item.nominal : 0;
        const keluar = !isMasuk ? item.nominal : 0;
        runningBalance += (masuk - keluar);

        kasDataForExcel.push([
          index + 1,
          item.tanggal,
          item.kategori,
          item.jenis_transaksi || item.kategori,
          item.nama_warga || '-',
          item.blok_rumah || '-',
          item.periode || '-',
          item.keterangan || '-',
          item.metode || 'Transfer',
          item.pj || 'Bendahara RT',
          item.bukti_nota || '-',
          masuk,
          keluar,
          runningBalance
        ]);
      });

      const wsBukuKas = XLSX.utils.aoa_to_sheet(kasDataForExcel);

      // Lebar kolom rapi
      wsBukuKas['!cols'] = [
        { wch: 6 },  // No
        { wch: 13 }, // Tanggal
        { wch: 15 }, // Kategori
        { wch: 28 }, // Jenis
        { wch: 28 }, // Warga
        { wch: 12 }, // Blok
        { wch: 16 }, // Periode
        { wch: 45 }, // Keterangan
        { wch: 14 }, // Metode
        { wch: 20 }, // PJ
        { wch: 20 }, // Nota
        { wch: 18 }, // Masuk
        { wch: 18 }, // Keluar
        { wch: 20 }  // Saldo
      ];

      XLSX.utils.book_append_sheet(wb, wsBukuKas, 'Buku Kas Umum');

      // 2. Sheet 2: REKAPITULASI POS ANGGARAN
      const posDataForExcel = [
        ['RUKUN TETANGGA 09 / RW 14 DE NAILA VILLAGE BLOK G'],
        ['SUMPUTSARIREJO, DRIYOREJO • EMAIL: denailavillageRT09@gmail.com'],
        ['REKAPITULASI POS ANGGARAN & REALISASI KAS RT'],
        [`Periode: ${filterBulan === 'all' ? 'Semua Periode' : filterBulan}`],
        [],
        ['1. POS PENERIMAAN / PEMASUKAN', 'NOMINAL REALISASI (IDR)'],
        ['Iuran Wajib Bulanan (Kebersihan, Keamanan, Kas)', kasList.filter(k => k.kategori === 'Pemasukan' && k.jenis_transaksi === 'Iuran Wajib Bulanan').reduce((a, b) => a + b.nominal, 0)],
        ['Iuran Insidentil (Acara Khusus / 17an / Gapura)', kasList.filter(k => k.kategori === 'Pemasukan' && k.jenis_transaksi === 'Iuran Insidentil').reduce((a, b) => a + b.nominal, 0)],
        ['Iuran Sukarela / Donasi Hamba Allah', kasList.filter(k => k.kategori === 'Pemasukan' && k.jenis_transaksi === 'Iuran Sukarela').reduce((a, b) => a + b.nominal, 0)],
        ['TOTAL REALISASI PENERIMAAN', filteredPemasukan],
        [],
        ['2. POS BELANJA / PENGELUARAN', 'NOMINAL REALISASI (IDR)'],
        ['Gaji Petugas Satpam & Keamanan Lingkungan', kasList.filter(k => k.kategori === 'Pengeluaran' && (k.jenis_transaksi || '').includes('Satpam')).reduce((a, b) => a + b.nominal, 0)],
        ['Biaya Angkut Sampah & Petugas Kebersihan', kasList.filter(k => k.kategori === 'Pengeluaran' && (k.jenis_transaksi || '').includes('Kebersihan')).reduce((a, b) => a + b.nominal, 0)],
        ['Token Listrik Pos Satpam & Pompa Air Taman', kasList.filter(k => k.kategori === 'Pengeluaran' && (k.jenis_transaksi || '').includes('Listrik')).reduce((a, b) => a + b.nominal, 0)],
        ['Pemeliharaan Sarana & Prasarana', kasList.filter(k => k.kategori === 'Pengeluaran' && (k.jenis_transaksi || '').includes('Pemeliharaan')).reduce((a, b) => a + b.nominal, 0)],
        ['Konsumsi & Acara Guyub Warga', kasList.filter(k => k.kategori === 'Pengeluaran' && (k.jenis_transaksi || '').includes('Konsumsi')).reduce((a, b) => a + b.nominal, 0)],
        ['Pembelian Alat Kebersihan & ATK RT', kasList.filter(k => k.kategori === 'Pengeluaran' && (k.jenis_transaksi || '').includes('ATK')).reduce((a, b) => a + b.nominal, 0)],
        ['TOTAL REALISASI BELANJA', filteredPengeluaran],
        [],
        ['SURPLUS / DEFISIT BERSIH KAS', surplusPeriode]
      ];

      const wsPos = XLSX.utils.aoa_to_sheet(posDataForExcel);
      wsPos['!cols'] = [{ wch: 50 }, { wch: 25 }];
      XLSX.utils.book_append_sheet(wb, wsPos, 'Rekap Pos Anggaran');

      // Export file
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `LPJ_Kas_RT09_RW14_De_Naila_${filterBulan === 'all' ? 'Semua' : filterBulan}_${dateStr}.xlsx`;
      XLSX.writeFile(wb, filename);

      showToast('success', `File Excel resmi (${filename}) berhasil diekspor sebagai backup data!`);
    } catch (err) {
      console.error('Export Excel Error:', err);
      showToast('info', 'Terjadi kendala saat generate Excel.');
    }
  };

  // ==========================================
  // COMPUTED STATS & FILTERING
  // ==========================================
  const filteredKasList = useMemo(() => {
    return kasList.filter(k => {
      // Tab filter
      if (activeTab === 'pemasukan' && k.kategori !== 'Pemasukan') return false;
      if (activeTab === 'pengeluaran' && k.kategori !== 'Pengeluaran') return false;

      // Month filter
      if (filterBulan !== 'all' && !k.tanggal.startsWith(filterBulan)) return false;

      // Search query
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const ket = (k.keterangan || '').toLowerCase();
        const nama = (k.nama_warga || '').toLowerCase();
        const blok = (k.blok_rumah || '').toLowerCase();
        const jenis = (k.jenis_transaksi || '').toLowerCase();
        const nota = (k.bukti_nota || '').toLowerCase();
        return ket.includes(query) || nama.includes(query) || blok.includes(query) || jenis.includes(query) || nota.includes(query);
      }

      return true;
    });
  }, [kasList, activeTab, filterBulan, searchTerm]);

  // Overall Financial Calculations
  const totalPemasukan = kasList.filter(k => k.kategori === 'Pemasukan').reduce((acc, c) => acc + c.nominal, 0);
  const totalPengeluaran = kasList.filter(k => k.kategori === 'Pengeluaran').reduce((acc, c) => acc + c.nominal, 0);
  const saldoKasRT = totalPemasukan - totalPengeluaran;

  // Filtered Periode Calculations
  const filteredPemasukan = filteredKasList.filter(k => k.kategori === 'Pemasukan').reduce((acc, c) => acc + c.nominal, 0);
  const filteredPengeluaran = filteredKasList.filter(k => k.kategori === 'Pengeluaran').reduce((acc, c) => acc + c.nominal, 0);
  const surplusPeriode = filteredPemasukan - filteredPengeluaran;

  // Periode label
  const periodeLabel = filterBulan === 'all' ? 'Semua Periode' : (filterBulan === '2026-08' ? 'Agustus 2026' : filterBulan === '2026-07' ? 'Juli 2026' : filterBulan);

  return (
    <Layout>
      <div className="space-y-6">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page {
              size: A4 portrait;
              margin: 12mm 15mm;
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
        {/* PRINTABLE OFFICIAL LPJ (KOP RESMI RT 09 / RW 14)         */}
        {/* ========================================================= */}
        <div className="hidden print:block bg-white text-black p-0 m-0 font-serif leading-relaxed w-full">
          {/* Official Kop Surat Resmi Sesuai Format User */}
          <div className="flex items-center justify-between border-b-4 border-double border-black pb-4 mb-6">
            <div className="w-16 h-16 rounded-xl bg-black text-white flex items-center justify-center font-bold text-xl font-sans">
              RT09
            </div>
            <div className="text-center flex-1 px-4">
              <h1 className="text-base font-black uppercase tracking-wider">
                PENGURUS RUKUN TETANGGA 09 / RUKUN WARGA 14
              </h1>
              <h2 className="text-lg font-black uppercase tracking-wide">
                DE NAILA VILLAGE BLOK G
              </h2>
              <p className="text-xs text-gray-800 font-semibold mt-0.5">
                Desa Sumputsarirejo, Kecamatan Driyorejo, Kabupaten Gresik
              </p>
              <p className="text-[11px] text-gray-700 font-mono">
                Email: denailavillageRT09@gmail.com
              </p>
            </div>
            <div className="w-16 h-16 flex items-center justify-center text-3xl">
              🇮🇩
            </div>
          </div>

          {/* Title & Document Number */}
          <div className="text-center mb-6">
            <h2 className="text-base font-bold uppercase underline tracking-wide">
              {lpjTitle}
            </h2>
            <p className="text-xs text-gray-800 font-semibold mt-1">
              Nomor: LPJ/KEU/RT09-RW14/{filterBulan.replace('-', '/')}/2026
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              Agenda: {lpjAgenda} • Periode: <strong>{periodeLabel}</strong>
            </p>
          </div>

          {/* Executive Summary Box */}
          <div className="border border-black p-4 mb-6 bg-gray-50 rounded-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-2 border-b border-black pb-1">
              I. Ringkasan Eksekutif Kas & Keuangan RT 09 / RW 14
            </h3>
            <div className="grid grid-cols-4 gap-3 text-center text-xs">
              <div className="p-2 border border-gray-300 bg-white">
                <span className="text-[10px] text-gray-600 block">Total Pemasukan</span>
                <span className="font-bold text-sm block mt-0.5 text-black">{fmt(filteredPemasukan)}</span>
              </div>
              <div className="p-2 border border-gray-300 bg-white">
                <span className="text-[10px] text-gray-600 block">Total Pengeluaran</span>
                <span className="font-bold text-sm block mt-0.5 text-black">{fmt(filteredPengeluaran)}</span>
              </div>
              <div className="p-2 border border-gray-300 bg-white">
                <span className="text-[10px] text-gray-600 block">Surplus Bersih Periode</span>
                <span className="font-bold text-sm block mt-0.5 text-black">{fmt(surplusPeriode)}</span>
              </div>
              <div className="p-2 border border-black bg-gray-100">
                <span className="text-[10px] text-gray-800 font-bold block">Total Saldo Kas RT</span>
                <span className="font-black text-sm block mt-0.5 text-black">{fmt(saldoKasRT)}</span>
              </div>
            </div>
          </div>

          {/* Rincian Transaksi Table */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-2">
              II. Rincian Buku Kas Masuk & Kas Keluar
            </h3>
            <table className="w-full text-[11px] border-collapse border border-black">
              <thead>
                <tr className="bg-gray-100 border-b border-black text-center font-bold">
                  <th className="border border-black p-1.5 w-8">No</th>
                  <th className="border border-black p-1.5 w-20">Tanggal</th>
                  <th className="border border-black p-1.5">Pos / Jenis Transaksi</th>
                  <th className="border border-black p-1.5">Warga / Penerima</th>
                  <th className="border border-black p-1.5">Keterangan</th>
                  <th className="border border-black p-1.5 w-24 text-right">Penerimaan (Rp)</th>
                  <th className="border border-black p-1.5 w-24 text-right">Pengeluaran (Rp)</th>
                  <th className="border border-black p-1.5 w-24 text-right">Saldo Kas (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  let runBal = 0;
                  const sorted = [...filteredKasList].sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
                  return sorted.map((item, idx) => {
                    const isMasuk = item.kategori === 'Pemasukan';
                    const masuk = isMasuk ? item.nominal : 0;
                    const keluar = !isMasuk ? item.nominal : 0;
                    runBal += (masuk - keluar);

                    return (
                      <tr key={idx} className="border-b border-gray-300">
                        <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                        <td className="border border-black p-1.5 text-center font-mono">{item.tanggal}</td>
                        <td className="border border-black p-1.5">{item.jenis_transaksi || item.kategori}</td>
                        <td className="border border-black p-1.5">
                          {item.nama_warga} {item.blok_rumah && item.blok_rumah !== '-' ? `(Blok ${item.blok_rumah})` : ''}
                        </td>
                        <td className="border border-black p-1.5">{item.keterangan}</td>
                        <td className="border border-black p-1.5 text-right font-mono font-semibold">
                          {isMasuk ? fmt(item.nominal) : '-'}
                        </td>
                        <td className="border border-black p-1.5 text-right font-mono font-semibold">
                          {!isMasuk ? fmt(item.nominal) : '-'}
                        </td>
                        <td className="border border-black p-1.5 text-right font-mono font-bold">
                          {fmt(runBal)}
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-bold border-t-2 border-black">
                  <td colSpan="5" className="border border-black p-2 text-right uppercase">Total Periode:</td>
                  <td className="border border-black p-2 text-right font-mono">{fmt(filteredPemasukan)}</td>
                  <td className="border border-black p-2 text-right font-mono">{fmt(filteredPengeluaran)}</td>
                  <td className="border border-black p-2 text-right font-mono text-black">{fmt(saldoKasRT)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Official 3-Column Signatures */}
          <div className="grid grid-cols-3 gap-6 mt-12 text-xs text-center border-t border-black pt-6">
            <div>
              <p>Menyetujui & Mengesahkan,</p>
              <p className="font-bold">Ketua RT 09 / RW 14</p>
              <div className="h-20 flex items-center justify-center text-gray-300 text-[10px] italic">
                (Tanda Tangan & Stempel RT)
              </div>
              <p className="font-bold underline">( KETUA RT 09 )</p>
              <p className="text-[10px] text-gray-600">RT 09 / RW 14 De Naila</p>
            </div>

            <div>
              <p>Driyorejo, {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
              <p className="font-bold">Bendahara RT 09 / RW 14</p>
              <div className="h-20 flex items-center justify-center text-gray-300 text-[10px] italic">
                (Tanda Tangan Bendahara)
              </div>
              <p className="font-bold underline">TIM BENDAHARA RT 09</p>
              <p className="text-[10px] text-gray-600">De Naila Village Blok G</p>
            </div>

            <div>
              <p>Notulen Rapat / Perwakilan Warga,</p>
              <p className="font-bold">Sekretariat Warga</p>
              <div className="h-20 flex items-center justify-center text-gray-300 text-[10px] italic">
                (Tanda Tangan Perwakilan)
              </div>
              <p className="font-bold underline">DANIEL KRISTIANTO</p>
              <p className="text-[10px] text-gray-600">Blok G-12 / Warga</p>
            </div>
          </div>

          <div className="text-[9px] text-gray-500 text-center mt-10 border-t border-gray-200 pt-2">
            Dokumen sah hasil Rapat Pleno Warga RT 09 / RW 14 De Naila Village Blok G, Sumputsarirejo, Driyorejo • Email: denailavillageRT09@gmail.com
          </div>
        </div>

        {/* ========================================================= */}
        {/* SCREEN VIEW (UI DASHBOARD ADMIN)                         */}
        {/* ========================================================= */}
        <div className="print:hidden space-y-6">
          {/* Header Bar */}
          <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/30 px-3 py-1 rounded-full font-medium">
                  💰 RT 09 / RW 14 De Naila Village Blok G
                </span>
                <span className="text-[11px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Sumputsarirejo, Driyorejo
                </span>
              </div>
              <h2 className="text-[20px] font-bold text-white mt-2">
                Manajemen Keuangan Kas & LPJ Rapat Warga RT 09
              </h2>
              <p className="text-[12px] text-slate-400 mt-1">
                RT 09 / RW 14 De Naila Village Blok G, Sumputsarirejo, Driyorejo • Email: denailavillageRT09@gmail.com
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => setShowModalMasuk(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-[13px] font-semibold transition shadow-lg shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <span>📥</span> + Catat Kas Masuk
              </button>
              <button
                onClick={() => setShowModalKeluar(true)}
                className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2.5 rounded-xl text-[13px] font-semibold transition shadow-lg shadow-rose-600/20 cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <span>📤</span> - Catat Kas Keluar
              </button>
              <button
                onClick={() => setShowLpjModal(true)}
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 py-2.5 rounded-xl text-[13px] font-semibold transition shadow-lg shadow-[#7C3AED]/25 cursor-pointer flex items-center gap-1.5 active:scale-95"
                title="Preview & Cetak LPJ Rapat Warga"
              >
                📄 Cetak LPJ Rapat Warga
              </button>
              <button
                onClick={handleExportXLSX}
                className="bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                title="Export Laporan Lengkap ke File Excel (.xlsx) sebagai Backup"
              >
                📊 Export Excel (.xlsx)
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className={`border text-[13px] px-5 py-3.5 rounded-2xl flex items-center justify-between gap-3 animate-fade-in shadow-xl ${
              toastMessage.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-[#7C3AED]/15 border-[#7C3AED]/30 text-[#C4B5FD]'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{toastMessage.type === 'success' ? '⚡' : '✅'}</span>
                <p className="font-semibold">{toastMessage.text}</p>
              </div>
              <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white text-xs cursor-pointer">✕</button>
            </div>
          )}

          {/* Top Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-5 relative overflow-hidden">
              <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Total Saldo Kas RT</div>
              <div className="text-[24px] font-black text-emerald-400 font-mono mt-1 tracking-tight">
                {fmt(saldoKasRT)}
              </div>
              <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Saldo Kas Aktif & Sehat
              </div>
            </div>

            <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-5">
              <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Total Pemasukan</div>
              <div className="text-[22px] font-bold text-white font-mono mt-1">
                {fmt(totalPemasukan)}
              </div>
              <div className="text-[11px] text-emerald-400 mt-1">
                +{fmt(kasList.filter(k => k.kategori === 'Pemasukan' && k.tanggal.startsWith(filterBulan === 'all' ? '2026' : filterBulan)).reduce((a, b) => a + b.nominal, 0))} Periode Ini
              </div>
            </div>

            <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-5">
              <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Total Pengeluaran</div>
              <div className="text-[22px] font-bold text-rose-400 font-mono mt-1">
                {fmt(totalPengeluaran)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Satpam, Kebersihan, & Listrik
              </div>
            </div>

            <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-5">
              <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Surplus Bersih Periode</div>
              <div className={`text-[22px] font-bold font-mono mt-1 ${surplusPeriode >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {fmt(surplusPeriode)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {filteredKasList.length} Transaksi Terpilih
              </div>
            </div>
          </div>

          {/* Main Table Container */}
          <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] overflow-hidden shadow-xl">
            {/* Action & Filter Bar */}
            <div className="p-4 bg-white/[0.02] border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Tabs */}
              <div className="flex border-b sm:border-b-0 border-white/10 gap-1 pb-2 sm:pb-0">
                <button
                  onClick={() => setActiveTab('semua')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'semua' ? 'bg-[#7C3AED] text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  📋 Semua Transaksi ({kasList.length})
                </button>
                <button
                  onClick={() => setActiveTab('pemasukan')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'pemasukan' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  📥 Pemasukan ({kasList.filter(k => k.kategori === 'Pemasukan').length})
                </button>
                <button
                  onClick={() => setActiveTab('pengeluaran')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'pengeluaran' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  📤 Pengeluaran ({kasList.filter(k => k.kategori === 'Pengeluaran').length})
                </button>
              </div>

              {/* Filter Periode & Search */}
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  placeholder="Cari transaksi, nama, blok, nota..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-1.5 text-[12px] text-white outline-none w-52 focus:border-[#7C3AED]"
                />
                <select
                  value={filterBulan}
                  onChange={(e) => setFilterBulan(e.target.value)}
                  className="bg-[#23263A] border border-white/10 rounded-xl px-3 py-1.5 text-[12px] text-slate-300 outline-none cursor-pointer"
                >
                  <option value="2026-08">📅 Agustus 2026</option>
                  <option value="2026-07">Juli 2026</option>
                  <option value="2026-06">Juni 2026</option>
                  <option value="all">Semua Periode</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="text-[10px] text-slate-500 uppercase tracking-wider border-b border-white/5">
                  <tr>
                    <th className="py-3 px-4">No</th>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Jenis Transaksi</th>
                    <th className="py-3 px-4">Warga / Penerima</th>
                    <th className="py-3 px-4">Keterangan</th>
                    <th className="py-3 px-4">Metode & PJ</th>
                    <th className="py-3 px-4 text-right">Nominal Arus Kas</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredKasList.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-10 text-center text-slate-400 text-xs">
                        Tidak ada data transaksi kas yang sesuai filter.
                      </td>
                    </tr>
                  ) : (
                    filteredKasList.map((k, i) => {
                      const isMasuk = k.kategori === 'Pemasukan';
                      return (
                        <tr key={k.id || i} className="hover:bg-white/[0.02] transition">
                          <td className="py-3.5 px-4 text-slate-400 font-mono text-xs">{i + 1}</td>
                          <td className="py-3.5 px-4 font-mono text-xs text-white whitespace-nowrap">
                            {k.tanggal}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium inline-block whitespace-nowrap ${
                              isMasuk
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                            }`}>
                              {isMasuk ? '📥 ' : '📤 '} {k.jenis_transaksi || k.kategori}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-white text-xs">{k.nama_warga}</div>
                            {k.blok_rumah && k.blok_rumah !== '-' && (
                              <span className="text-[10px] bg-white/5 text-[#A78BFA] font-mono px-1.5 py-0.5 rounded border border-white/10">
                                Blok {k.blok_rumah}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="text-slate-300 text-xs font-medium">{k.keterangan}</div>
                            {k.bukti_nota && (
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Nota: {k.bukti_nota}</div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                            <div className="text-slate-300">{k.metode}</div>
                            <div className="text-[10px] text-slate-500">PJ: {k.pj}</div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold whitespace-nowrap">
                            <span className={isMasuk ? 'text-emerald-400' : 'text-rose-400'}>
                              {isMasuk ? '+' : '-'}{fmt(k.nominal)}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteKas(k.id, k.keterangan)}
                              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2 py-1 rounded-lg text-xs transition cursor-pointer"
                              title="Hapus Transaksi"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MODAL: PREVIEW & CETAK LPJ RAPAT WARGA                    */}
        {/* ========================================================= */}
        {showLpjModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto print:hidden">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowLpjModal(false)}></div>
            <div className="relative z-10 bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 max-w-4xl w-full my-8 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-[#7C3AED]/20 text-[#A78BFA] flex items-center justify-center font-bold">
                    📄
                  </span>
                  <div>
                    <h3 className="font-bold text-white text-[16px]">Preview LPJ Rapat Warga RT 09 / RW 14</h3>
                    <p className="text-[11px] text-slate-400">Kop Resmi: De Naila Village Blok G, Sumputsarirejo, Driyorejo</p>
                  </div>
                </div>
                <button onClick={() => setShowLpjModal(false)} className="text-slate-400 hover:text-white text-lg cursor-pointer">✕</button>
              </div>

              {/* Setting LPJ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#23263A] p-3.5 rounded-xl text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Judul Dokumen LPJ:</label>
                  <input
                    value={lpjTitle}
                    onChange={(e) => setLpjTitle(e.target.value)}
                    className="w-full bg-[#1A1D2E] border border-white/10 rounded-lg px-3 py-1.5 text-white outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Agenda / Nama Pertemuan Warga:</label>
                  <input
                    value={lpjAgenda}
                    onChange={(e) => setLpjAgenda(e.target.value)}
                    className="w-full bg-[#1A1D2E] border border-white/10 rounded-lg px-3 py-1.5 text-white outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              {/* Document Preview Paper */}
              <div className="bg-white text-black p-6 rounded-xl border border-gray-300 font-serif max-h-[50vh] overflow-y-auto text-xs shadow-inner">
                <div className="text-center border-b-2 border-double border-black pb-3 mb-4">
                  <h4 className="font-black text-sm uppercase">PENGURUS RUKUN TETANGGA 09 / RUKUN WARGA 14</h4>
                  <h5 className="font-bold text-xs uppercase">DE NAILA VILLAGE BLOK G</h5>
                  <p className="text-[10px] text-gray-700">Sumputsarirejo, Driyorejo • Email: denailavillageRT09@gmail.com</p>
                  <h5 className="font-bold text-xs uppercase underline mt-2">{lpjTitle}</h5>
                  <p className="text-[10px] text-gray-700">Agenda: {lpjAgenda} • Periode: {periodeLabel}</p>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                  <div className="border border-gray-300 p-2 bg-gray-50">
                    <span className="text-[9px] text-gray-600 block">Total Pemasukan</span>
                    <span className="font-bold text-xs">{fmt(filteredPemasukan)}</span>
                  </div>
                  <div className="border border-gray-300 p-2 bg-gray-50">
                    <span className="text-[9px] text-gray-600 block">Total Pengeluaran</span>
                    <span className="font-bold text-xs">{fmt(filteredPengeluaran)}</span>
                  </div>
                  <div className="border border-gray-300 p-2 bg-gray-50">
                    <span className="text-[9px] text-gray-600 block">Surplus Periode</span>
                    <span className="font-bold text-xs">{fmt(surplusPeriode)}</span>
                  </div>
                  <div className="border border-black p-2 bg-gray-100">
                    <span className="text-[9px] text-gray-800 font-bold block">Saldo Kas RT</span>
                    <span className="font-black text-xs">{fmt(saldoKasRT)}</span>
                  </div>
                </div>

                <table className="w-full text-[10px] border-collapse border border-black mb-4">
                  <thead>
                    <tr className="bg-gray-100 font-bold border-b border-black">
                      <th className="border border-black p-1">No</th>
                      <th className="border border-black p-1">Tgl</th>
                      <th className="border border-black p-1">Pos Transaksi</th>
                      <th className="border border-black p-1">Warga / Penerima</th>
                      <th className="border border-black p-1">Keterangan</th>
                      <th className="border border-black p-1 text-right">Masuk (Rp)</th>
                      <th className="border border-black p-1 text-right">Keluar (Rp)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredKasList.slice(0, 10).map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-200">
                        <td className="border border-black p-1 text-center">{idx + 1}</td>
                        <td className="border border-black p-1 text-center font-mono">{item.tanggal}</td>
                        <td className="border border-black p-1">{item.jenis_transaksi || item.kategori}</td>
                        <td className="border border-black p-1">{item.nama_warga}</td>
                        <td className="border border-black p-1">{item.keterangan}</td>
                        <td className="border border-black p-1 text-right font-mono">{item.kategori === 'Pemasukan' ? fmt(item.nominal) : '-'}</td>
                        <td className="border border-black p-1 text-right font-mono">{item.kategori === 'Pengeluaran' ? fmt(item.nominal) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredKasList.length > 10 && (
                  <p className="text-[9px] text-gray-500 italic text-center mb-3">
                    ... dan {filteredKasList.length - 10} transaksi lainnya (seluruhnya akan tercetak lengkap pada hasil PDF).
                  </p>
                )}

                <div className="grid grid-cols-3 gap-4 text-center text-[10px] pt-3 border-t border-black">
                  <div>
                    <p>Ketua RT 09 / RW 14,</p>
                    <div className="h-10"></div>
                    <p className="font-bold underline">( KETUA RT 09 )</p>
                  </div>
                  <div>
                    <p>Bendahara RT 09,</p>
                    <div className="h-10"></div>
                    <p className="font-bold underline">TIM BENDAHARA RT</p>
                  </div>
                  <div>
                    <p>Sekretariat Warga,</p>
                    <div className="h-10"></div>
                    <p className="font-bold underline">DANIEL KRISTIANTO</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowLpjModal(false)}
                  className="bg-white/5 hover:bg-white/10 text-slate-300 px-4 py-2.5 rounded-xl text-xs cursor-pointer"
                >
                  Tutup Preview
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={handleExportXLSX}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    📊 Unduh File Excel (.xlsx)
                  </button>
                  <button
                    onClick={() => {
                      setShowLpjModal(false);
                      setTimeout(() => window.print(), 300);
                    }}
                    className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition shadow-lg shadow-[#7C3AED]/25 cursor-pointer flex items-center gap-1.5"
                  >
                    🖨️ Cetak / Simpan PDF Sekarang
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 1: FORM INPUT KAS MASUK (PEMASUKAN)                 */}
        {/* ========================================================= */}
        {showModalMasuk && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto print:hidden">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModalMasuk(false)}></div>
            <div className="relative z-10 bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 max-w-lg w-full my-8 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    📥
                  </span>
                  <div>
                    <h3 className="font-bold text-white text-[16px]">Formulir Catat Kas Masuk</h3>
                    <p className="text-[11px] text-slate-400">Penerimaan iuran warga, sumbangan, & donasi kas RT</p>
                  </div>
                </div>
                <button onClick={() => setShowModalMasuk(false)} className="text-slate-400 hover:text-white text-lg cursor-pointer">✕</button>
              </div>

              <form onSubmit={handleSaveKasMasuk} className="space-y-3.5 text-[13px]">
                {/* 1. Jenis Iuran / Pemasukan Dropdown */}
                <div>
                  <label className="text-slate-300 font-medium text-xs">Jenis Iuran / Pemasukan *</label>
                  <select
                    value={formMasuk.jenis_iuran}
                    onChange={(e) => setFormMasuk({ ...formMasuk, jenis_iuran: e.target.value })}
                    className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-medium outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Iuran Wajib Bulanan">🏢 Iuran Wajib Bulanan (Kebersihan, Keamanan, Kas Sosial)</option>
                    <option value="Iuran Insidentil">🎉 Iuran Insidentil / Acara Khusus (17 Agustus, Gapura, Renovasi)</option>
                    <option value="Iuran Sukarela">💖 Iuran Sukarela / Donasi Hamba Allah</option>
                  </select>
                </div>

                {/* 2. Rules Tautkan Warga / Periode */}
                {formMasuk.jenis_iuran !== 'Iuran Sukarela' ? (
                  <div className="bg-[#23263A]/70 border border-emerald-500/20 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-emerald-400 font-semibold">Tautkan ke Data Warga & Periode</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">Wajib Tertaut</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-400 text-xs">Pilih Warga Pembayar *</label>
                        <select
                          value={formMasuk.warga_selected}
                          onChange={(e) => setFormMasuk({ ...formMasuk, warga_selected: e.target.value })}
                          className="w-full mt-1 bg-[#1A1D2E] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-emerald-500 cursor-pointer"
                        >
                          {wargaList.map((w, idx) => (
                            <option key={idx} value={`${w.nama}|${w.blok}`}>
                              {w.nama} (Blok {w.blok})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-400 text-xs">Periode Iuran Aktif *</label>
                        <select
                          value={formMasuk.periode_bulan}
                          onChange={(e) => setFormMasuk({ ...formMasuk, periode_bulan: e.target.value })}
                          className="w-full mt-1 bg-[#1A1D2E] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-emerald-500 cursor-pointer"
                        >
                          <option value="Agustus 2026">Agustus 2026</option>
                          <option value="September 2026">September 2026</option>
                          <option value="Oktober 2026">Oktober 2026</option>
                          <option value="Juli 2026">Juli 2026</option>
                          <option value="Juni 2026">Juni 2026</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#23263A]/40 border border-purple-500/20 rounded-xl p-3 text-xs">
                    <span className="text-[#C4B5FD] font-semibold">ℹ️ Iuran Sukarela / Donasi Terbuka</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Nama warga dilewati secara otomatis (tercatat sebagai <strong>Hamba Allah / Donatur Sukarela</strong>). Silakan isi keterangan donasi di bawah.
                    </p>
                  </div>
                )}

                {/* 3. Nominal & Tanggal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-xs">Nominal Penerimaan (Rp) *</label>
                    <input
                      type="number"
                      required
                      placeholder="Misal: 100000"
                      value={formMasuk.nominal}
                      onChange={(e) => setFormMasuk({ ...formMasuk, nominal: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold text-base outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 text-xs">Tanggal Transaksi *</label>
                    <input
                      type="date"
                      required
                      value={formMasuk.tanggal}
                      onChange={(e) => setFormMasuk({ ...formMasuk, tanggal: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* 4. Metode & Penanggung Jawab */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-xs">Metode Pembayaran</label>
                    <select
                      value={formMasuk.metode}
                      onChange={(e) => setFormMasuk({ ...formMasuk, metode: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-emerald-500"
                    >
                      <option value="QRIS">QRIS</option>
                      <option value="Transfer">Transfer Bank</option>
                      <option value="Tunai">Tunai / Cash</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 text-xs">Penanggung Jawab (PJ)</label>
                    <input
                      value={formMasuk.pj}
                      onChange={(e) => setFormMasuk({ ...formMasuk, pj: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* 5. Keterangan Rinci */}
                <div>
                  <label className="text-slate-400 text-xs">
                    {formMasuk.jenis_iuran === 'Iuran Sukarela' ? 'Keterangan Donasi / Infaq *' : 'Catatan Tambahan (Opsional)'}
                  </label>
                  <input
                    placeholder={
                      formMasuk.jenis_iuran === 'Iuran Sukarela'
                        ? 'Misal: Donasi hamba Allah untuk santunan anak yatim'
                        : 'Misal: Iuran kebersihan & keamanan bulan Agustus'
                    }
                    value={formMasuk.keterangan}
                    onChange={(e) => setFormMasuk({ ...formMasuk, keterangan: e.target.value })}
                    className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowModalMasuk(false)}
                    className="bg-white/5 hover:bg-white/10 text-slate-300 px-4 py-2.5 rounded-xl text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl text-xs cursor-pointer shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center gap-1.5"
                  >
                    💾 Simpan Kas Masuk
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 2: FORM INPUT KAS KELUAR (PENGELUARAN)              */}
        {/* ========================================================= */}
        {showModalKeluar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto print:hidden">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModalKeluar(false)}></div>
            <div className="relative z-10 bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 max-w-lg w-full my-8 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                    📤
                  </span>
                  <div>
                    <h3 className="font-bold text-white text-[16px]">Formulir Catat Kas Keluar</h3>
                    <p className="text-[11px] text-slate-400">Pembayaran operasional satpam, sampah, listrik, & sarana</p>
                  </div>
                </div>
                <button onClick={() => setShowModalKeluar(false)} className="text-slate-400 hover:text-white text-lg cursor-pointer">✕</button>
              </div>

              <form onSubmit={handleSaveKasKeluar} className="space-y-3.5 text-[13px]">
                {/* 1. Kategori Pengeluaran */}
                <div>
                  <label className="text-slate-300 font-medium text-xs">Kategori Pengeluaran *</label>
                  <select
                    value={formKeluar.kategori_pengeluaran}
                    onChange={(e) => setFormKeluar({ ...formKeluar, kategori_pengeluaran: e.target.value })}
                    className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-medium outline-none focus:border-rose-500 cursor-pointer"
                  >
                    <option value="Gaji Petugas Satpam">👮 Gaji Petugas Keamanan / Satpam</option>
                    <option value="Biaya Kebersihan & Sampah">🧹 Biaya Angkut Sampah & Petugas Kebersihan</option>
                    <option value="Listrik & Utilitas Pos">⚡ Token Listrik Pos Satpam & Pompa Air Taman</option>
                    <option value="Pemeliharaan & Perbaikan">🛠️ Pemeliharaan & Perbaikan Sarana Prasarana</option>
                    <option value="Konsumsi & Kegiatan Warga">☕ Konsumsi Rapat & Acara Guyub Warga</option>
                    <option value="ATK & Perlengkapan RT">📦 Pembelian Perlengkapan / ATK RT</option>
                    <option value="Lain-lain">📋 Operasional Lain-lain</option>
                  </select>
                </div>

                {/* 2. Nominal & Tanggal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-xs">Nominal Pengeluaran (Rp) *</label>
                    <input
                      type="number"
                      required
                      placeholder="Misal: 500000"
                      value={formKeluar.nominal}
                      onChange={(e) => setFormKeluar({ ...formKeluar, nominal: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold text-base outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 text-xs">Tanggal Pengeluaran *</label>
                    <input
                      type="date"
                      required
                      value={formKeluar.tanggal}
                      onChange={(e) => setFormKeluar({ ...formKeluar, tanggal: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                {/* 3. Keterangan Rinci Pengeluaran */}
                <div>
                  <label className="text-slate-400 text-xs">Keterangan Rinci Pembayaran *</label>
                  <input
                    required
                    placeholder="Misal: Beli token listrik pos 200rb dan pompa air 50rb"
                    value={formKeluar.keterangan}
                    onChange={(e) => setFormKeluar({ ...formKeluar, keterangan: e.target.value })}
                    className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-rose-500"
                  />
                </div>

                {/* 4. Penerima & Metode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-xs">Penerima Dana / Vendor / Petugas</label>
                    <input
                      placeholder="Misal: Pak Slamet (Petugas Sampah)"
                      value={formKeluar.penerima}
                      onChange={(e) => setFormKeluar({ ...formKeluar, penerima: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 text-xs">Metode Pembayaran</label>
                    <select
                      value={formKeluar.metode}
                      onChange={(e) => setFormKeluar({ ...formKeluar, metode: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-rose-500"
                    >
                      <option value="Tunai">Tunai / Cash</option>
                      <option value="Transfer">Transfer Bank</option>
                      <option value="QRIS">QRIS</option>
                    </select>
                  </div>
                </div>

                {/* 5. Bukti Nota & PJ */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-xs">Nomor Bukti / Nota (Opsional)</label>
                    <input
                      placeholder="Misal: NOTA-PLN-089"
                      value={formKeluar.bukti_nota}
                      onChange={(e) => setFormKeluar({ ...formKeluar, bukti_nota: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 text-xs">Penanggung Jawab (PJ)</label>
                    <input
                      value={formKeluar.pj}
                      onChange={(e) => setFormKeluar({ ...formKeluar, pj: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowModalKeluar(false)}
                    className="bg-white/5 hover:bg-white/10 text-slate-300 px-4 py-2.5 rounded-xl text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-rose-600 hover:bg-rose-500 text-white font-semibold px-6 py-2.5 rounded-xl text-xs cursor-pointer shadow-lg shadow-rose-600/20 active:scale-95 flex items-center gap-1.5"
                  >
                    💾 Simpan Kas Keluar
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
