import { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../supabaseClient';

// Master Data Default Inventaris RT 09 / RW 14
const INITIAL_INVENTARIS_LIST = [
  {
    id: 'inv-1',
    nama_barang: 'Tenda 4x6 Meter',
    kategori: 'Perlengkapan Acara',
    jumlah_total: 2,
    tersedia: 2,
    kondisi: 'Baik & Layak Pakai',
    icon: '⛺',
    lokasi: 'Gudang Pos Satpam Blok G',
    keterangan: 'Tenda besi kokoh + atap terpal anti bocor'
  },
  {
    id: 'inv-2',
    nama_barang: 'Kursi Plastik Napolly',
    kategori: 'Perlengkapan Acara',
    jumlah_total: 50,
    tersedia: 50,
    kondisi: 'Sangat Baik',
    icon: '🪑',
    lokasi: 'Gudang Pos Satpam Blok G',
    keterangan: 'Kursi plastik merah Napolly tebal'
  },
  {
    id: 'inv-3',
    nama_barang: 'Sound System Wireless + 2 Mic',
    kategori: 'Audio & Elektronik',
    jumlah_total: 1,
    tersedia: 1,
    kondisi: 'Baik & Baterai Awet',
    icon: '🔊',
    lokasi: 'Pos RT 09 Blok G',
    keterangan: 'Sound portable bluetooth + 2 mic wireless + charger'
  },
  {
    id: 'inv-4',
    nama_barang: 'Meja Lipat Serbaguna',
    kategori: 'Perlengkapan Acara',
    jumlah_total: 4,
    tersedia: 0,
    kondisi: 'Sedang Dipinjam',
    icon: '🪟',
    lokasi: 'Dipinjam Warga Blok G-03',
    keterangan: 'Meja lipat aluminium 120x60 cm'
  },
  {
    id: 'inv-5',
    nama_barang: 'Mesin Potong Rumput 2 Tak',
    kategori: 'Alat Kebersihan & Fasum',
    jumlah_total: 1,
    tersedia: 1,
    kondisi: 'Baik & Siap Pakai',
    icon: '🌱',
    lokasi: 'Pos Satpam Blok G',
    keterangan: 'Mesin potong rumput gendong + senar potong'
  },
  {
    id: 'inv-6',
    nama_barang: 'Genset Listrik Portable 2500W',
    kategori: 'Utilitas & Darurat',
    jumlah_total: 1,
    tersedia: 1,
    kondisi: 'Baik & Terawat',
    icon: '⚡',
    lokasi: 'Gudang Pos Satpam Blok G',
    keterangan: 'Genset bensin cadangan mati lampu fasum'
  },
  {
    id: 'inv-7',
    nama_barang: 'Terpal Biru Tebal 6x8 Meter',
    kategori: 'Perlengkapan Acara',
    jumlah_total: 3,
    tersedia: 3,
    kondisi: 'Baik',
    icon: '🎪',
    lokasi: 'Gudang Pos Satpam Blok G',
    keterangan: 'Terpal serbaguna untuk peneduh & alas'
  }
];

// Data Default Peminjaman Inventaris
const INITIAL_PEMINJAMAN_LIST = [
  {
    id: 'pjm-1',
    nama_peminjam: 'Bambang Irawan',
    blok_rumah: 'G-03',
    no_hp: '0812-8888-7777',
    barang_id: 'inv-4',
    barang_nama: 'Meja Lipat Serbaguna',
    icon: '🪟',
    jumlah_pinjam: 4,
    tanggal_pinjam: '2026-08-18',
    tanggal_kembali: '2026-08-22',
    keperluan: 'Syukuran khitanan putra di rumah Blok G-03',
    status: 'Disetujui', // 'Menunggu Approval' | 'Disetujui' | 'Ditolak' | 'Dikembalikan'
    alasan_reject: '',
    tanggal_approval: '2026-08-18',
    pj_approval: 'Ketua / Pengurus RT 09'
  },
  {
    id: 'pjm-2',
    nama_peminjam: 'Daniel Kristianto',
    blok_rumah: 'G-12',
    no_hp: '0812-3456-7890',
    barang_id: 'inv-1',
    barang_nama: 'Tenda 4x6 Meter',
    icon: '⛺',
    jumlah_pinjam: 1,
    tanggal_pinjam: '2026-08-25',
    tanggal_kembali: '2026-08-26',
    keperluan: 'Acara tasyakuran keluarga & peneduh halaman depan',
    status: 'Ditolak',
    alasan_reject: 'Barang sedang dalam masa perawatan / perbaikan teknis',
    tanggal_approval: '2026-08-20',
    pj_approval: 'Ketua / Pengurus RT 09'
  },
  {
    id: 'pjm-3',
    nama_peminjam: 'Siti Rahmawati',
    blok_rumah: 'G-05',
    no_hp: '0813-7777-6666',
    barang_id: 'inv-3',
    barang_nama: 'Sound System Wireless + 2 Mic',
    icon: '🔊',
    jumlah_pinjam: 1,
    tanggal_pinjam: '2026-08-10',
    tanggal_kembali: '2026-08-11',
    keperluan: 'Rapat arisan ibu-ibu dawis Blok G',
    status: 'Dikembalikan',
    alasan_reject: '',
    tanggal_approval: '2026-08-10',
    pj_approval: 'Bendahara RT 09'
  }
];

export default function Inventaris() {
  const rtNama = localStorage.getItem('rt_nama') || localStorage.getItem('rt_username') || 'Daniel Kristianto';
  const rtBlok = localStorage.getItem('rt_blok') || 'G-12';
  const rtRole = localStorage.getItem('rt_user_role') || 'warga';
  const isAdmin = ['superadmin', 'ketua_rt', 'sekretaris', 'bendahara', 'admin', 'admin_rt'].includes(rtRole);

  // States
  const [inventarisList, setInventarisList] = useState(() => {
    const isReset = localStorage.getItem('rt_is_operational_reset') === 'true';
    const saved = localStorage.getItem('rt_inventaris_list');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { }
    }
    if (isReset) return [];
    return INITIAL_INVENTARIS_LIST;
  });

  const [peminjamanList, setPeminjamanList] = useState(() => {
    const isReset = localStorage.getItem('rt_is_operational_reset') === 'true';
    const saved = localStorage.getItem('rt_peminjaman_list');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(p => ({
            ...p,
            pj_approval: (p.pj_approval || '').includes('Wahyu') ? 'Ketua / Pengurus RT 09' : p.pj_approval
          }));
        }
      } catch (e) { }
    }
    if (isReset) return [];
    return INITIAL_PEMINJAMAN_LIST;
  });

  const [activeTab, setActiveTab] = useState('katalog'); // 'katalog' | 'peminjaman'
  const [wargaTabFilter, setWargaTabFilter] = useState('semua'); // 'saya' | 'semua'
  const [adminStatusFilter, setAdminStatusFilter] = useState('semua'); // 'semua' | 'pending' | 'disetujui' | 'ditolak' | 'dikembalikan'
  const [toast, setToast] = useState(null);

  // Modal Master Barang (Add / Edit)
  const [showBarangModal, setShowBarangModal] = useState(false);
  const [barangModalMode, setBarangModalMode] = useState('add'); // 'add' | 'edit'
  const [formBarang, setFormBarang] = useState({
    id: '',
    nama_barang: '',
    kategori: 'Perlengkapan Acara',
    jumlah_total: 1,
    kondisi: 'Baik & Layak Pakai',
    icon: '📦',
    lokasi: 'Gudang Pos Satpam Blok G',
    keterangan: ''
  });

  // Modal Pinjam Barang (Warga / Admin)
  const [showPinjamModal, setShowPinjamModal] = useState(false);
  const [selectedBarangPinjam, setSelectedBarangPinjam] = useState(null);
  const [formPinjam, setFormPinjam] = useState({
    nama_peminjam: rtNama,
    blok_rumah: rtBlok,
    no_hp: '0812-3456-7890',
    jumlah_pinjam: 1,
    tanggal_pinjam: new Date().toISOString().split('T')[0],
    tanggal_kembali: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    keperluan: ''
  });

  // Modal Reject dengan Alasan
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRejectPjm, setSelectedRejectPjm] = useState(null);
  const [alasanReject, setAlasanReject] = useState('');

  // Realtime Cross-tab Sync
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'rt_peminjaman_list' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setPeminjamanList(parsed.map(p => ({
            ...p,
            pj_approval: (p.pj_approval || '').includes('Wahyu') ? 'Ketua / Pengurus RT 09' : p.pj_approval
          })));
        } catch (err) { }
      }
      if (e.key === 'rt_inventaris_list' && e.newValue) {
        try {
          setInventarisList(JSON.parse(e.newValue));
        } catch (err) { }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fetch Supabase on mount
  useEffect(() => {
    async function loadFromSupabase() {
      try {
        const isReset = localStorage.getItem('rt_is_operational_reset') === 'true';

        // 1. Load Master Inventaris
        const { data: invData, error: invErr } = await supabase.from('inventaris_rt').select('*');
        if (invData && !invErr) {
          if (invData.length === 0 && isReset) {
            setInventarisList([]);
            localStorage.setItem('rt_inventaris_list', '[]');
          } else if (invData.length > 0) {
            const mapped = invData.map(d => ({
              id: d.id,
              nama_barang: d.nama_barang,
              kategori: 'Inventaris RT',
              jumlah_total: Number(d.jumlah_total) || 1,
              tersedia: Number(d.tersedia) || 0,
              kondisi: d.kondisi || 'Baik',
              icon: d.icon || '📦',
              lokasi: 'Pos Satpam Blok G',
              keterangan: ''
            }));

            if (!isReset) {
              INITIAL_INVENTARIS_LIST.forEach(init => {
                if (!mapped.some(m => m.nama_barang === init.nama_barang)) {
                  mapped.push(init);
                }
              });
            }

            setInventarisList(mapped);
            localStorage.setItem('rt_inventaris_list', JSON.stringify(mapped));
          }
        }

        // 2. Load Peminjaman List
        const { data: pjmData, error: pjmErr } = await supabase.from('peminjaman_inventaris').select('*');
        if (pjmData && !pjmErr) {
          if (pjmData.length === 0 && isReset) {
            setPeminjamanList([]);
            localStorage.setItem('rt_peminjaman_list', '[]');
            return;
          }

          const mappedPjm = pjmData.map(p => ({
            id: p.id,
            nama_peminjam: p.nama_peminjam,
            blok_rumah: p.blok_rumah,
            no_hp: p.no_hp || '-',
            barang_id: p.barang_id || '-',
            barang_nama: p.barang_nama,
            icon: p.icon || '📦',
            jumlah_pinjam: Number(p.jumlah_pinjam) || 1,
            tanggal_pinjam: p.tanggal_pinjam,
            tanggal_kembali: p.tanggal_kembali,
            keperluan: p.keperluan,
            status: p.status || 'Menunggu Approval',
            alasan_reject: p.alasan_reject || '',
            tanggal_approval: p.tanggal_approval || '-',
            pj_approval: p.pj_approval || 'Ketua / Pengurus RT 09'
          }));

          setPeminjamanList(mappedPjm);
          localStorage.setItem('rt_peminjaman_list', JSON.stringify(mappedPjm));
        }
      } catch (err) {
        console.log('Supabase inventaris note:', err);
      }
    }
    loadFromSupabase();
  }, []);

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const persistInventaris = (newList) => {
    setInventarisList(newList);
    localStorage.setItem('rt_inventaris_list', JSON.stringify(newList));
  };

  const persistPeminjaman = (newList) => {
    setPeminjamanList(newList);
    localStorage.setItem('rt_peminjaman_list', JSON.stringify(newList));
  };

  // ==========================================
  // 1. SAVE MASTER BARANG (TAMBAH / EDIT)
  // ==========================================
  const handleSaveBarang = async (e) => {
    e.preventDefault();
    const total = Number(formBarang.jumlah_total);
    if (!total || total < 1) {
      alert('Jumlah total barang minimal 1!');
      return;
    }

    if (barangModalMode === 'add') {
      const newBarang = {
        id: 'inv-' + Date.now(),
        nama_barang: formBarang.nama_barang.trim(),
        kategori: formBarang.kategori,
        jumlah_total: total,
        tersedia: total,
        kondisi: formBarang.kondisi,
        icon: formBarang.icon,
        lokasi: formBarang.lokasi.trim() || 'Pos Satpam Blok G',
        keterangan: formBarang.keterangan.trim()
      };

      const updated = [newBarang, ...inventarisList];
      persistInventaris(updated);

      // Insert Supabase
      try {
        await supabase.from('inventaris_rt').insert({
          nama_barang: newBarang.nama_barang,
          jumlah_total: newBarang.jumlah_total,
          tersedia: newBarang.tersedia,
          kondisi: newBarang.kondisi,
          icon: newBarang.icon
        });
      } catch (e) { }

      showToastMsg(`Barang baru "${newBarang.nama_barang}" berhasil ditambahkan!`);
    } else {
      // Edit
      const updated = inventarisList.map(b => {
        if (b.id === formBarang.id) {
          const diff = total - b.jumlah_total;
          const newTersedia = Math.max(0, b.tersedia + diff);
          return {
            ...b,
            nama_barang: formBarang.nama_barang.trim(),
            kategori: formBarang.kategori,
            jumlah_total: total,
            tersedia: newTersedia,
            kondisi: formBarang.kondisi,
            icon: formBarang.icon,
            lokasi: formBarang.lokasi.trim(),
            keterangan: formBarang.keterangan.trim()
          };
        }
        return b;
      });
      persistInventaris(updated);
      showToastMsg(`Data barang "${formBarang.nama_barang}" berhasil diperbarui!`);
    }

    setShowBarangModal(false);
  };

  const openAddBarang = () => {
    setBarangModalMode('add');
    setFormBarang({
      id: '',
      nama_barang: '',
      kategori: 'Perlengkapan Acara',
      jumlah_total: 1,
      kondisi: 'Baik & Layak Pakai',
      icon: '📦',
      lokasi: 'Gudang Pos Satpam Blok G',
      keterangan: ''
    });
    setShowBarangModal(true);
  };

  const openEditBarang = (b) => {
    setBarangModalMode('edit');
    setFormBarang({
      id: b.id,
      nama_barang: b.nama_barang,
      kategori: b.kategori || 'Perlengkapan Acara',
      jumlah_total: b.jumlah_total,
      kondisi: b.kondisi || 'Baik',
      icon: b.icon || '📦',
      lokasi: b.lokasi || 'Pos Satpam Blok G',
      keterangan: b.keterangan || ''
    });
    setShowBarangModal(true);
  };

  const handleDeleteBarang = (id, nama) => {
    if (!confirm(`Hapus master inventaris "${nama}"?`)) return;
    const updated = inventarisList.filter(b => b.id !== id);
    persistInventaris(updated);
    showToastMsg(`Barang "${nama}" telah dihapus.`);
  };

  // ==========================================
  // 2. AJUKAN PEMINJAMAN
  // ==========================================
  const openPinjamBarang = (barang) => {
    setSelectedBarangPinjam(barang);
    setFormPinjam({
      nama_peminjam: rtNama,
      blok_rumah: rtBlok,
      no_hp: '0812-3456-7890',
      jumlah_pinjam: 1,
      tanggal_pinjam: new Date().toISOString().split('T')[0],
      tanggal_kembali: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      keperluan: ''
    });
    setShowPinjamModal(true);
  };

  const handleSubmitPinjam = (e) => {
    e.preventDefault();
    const qty = Number(formPinjam.jumlah_pinjam);
    if (!qty || qty < 1) {
      alert('Jumlah pinjam minimal 1!');
      return;
    }
    if (qty > selectedBarangPinjam.tersedia) {
      alert(`Stok tersedia hanya ${selectedBarangPinjam.tersedia} unit!`);
      return;
    }
    if (!formPinjam.keperluan.trim()) {
      alert('Mohon isi keperluan peminjaman!');
      return;
    }

    const newPjm = {
      id: 'pjm-' + Date.now(),
      nama_peminjam: formPinjam.nama_peminjam,
      blok_rumah: formPinjam.blok_rumah,
      no_hp: formPinjam.no_hp,
      barang_id: selectedBarangPinjam.id,
      barang_nama: selectedBarangPinjam.nama_barang,
      icon: selectedBarangPinjam.icon,
      jumlah_pinjam: qty,
      tanggal_pinjam: formPinjam.tanggal_pinjam,
      tanggal_kembali: formPinjam.tanggal_kembali,
      keperluan: formPinjam.keperluan.trim(),
      status: 'Menunggu Approval',
      alasan_reject: '',
      tanggal_approval: '-',
      pj_approval: '-'
    };

    const updatedPjm = [newPjm, ...peminjamanList];
    persistPeminjaman(updatedPjm);

    setShowPinjamModal(false);
    showToastMsg(`Pengajuan pinjam ${qty} unit ${selectedBarangPinjam.nama_barang} terkirim! Menunggu approval Ketua/Pengurus RT.`);
  };

  // ==========================================
  // 3. APPROVAL DENGAN ALASAN / REJECT
  // ==========================================
  const handleApprovePinjam = (pjm) => {
    // Check stock
    const targetBarang = inventarisList.find(b => b.id === pjm.barang_id || b.nama_barang === pjm.barang_nama);
    if (targetBarang && targetBarang.tersedia < pjm.jumlah_pinjam) {
      alert(`Gagal approve: Stok barang "${targetBarang.nama_barang}" saat ini tersisa ${targetBarang.tersedia} unit (dibutuhkan ${pjm.jumlah_pinjam} unit).`);
      return;
    }

    // 1. Kurangi stok barang
    if (targetBarang) {
      const updatedInv = inventarisList.map(b => {
        if (b.id === targetBarang.id) {
          return {
            ...b,
            tersedia: Math.max(0, b.tersedia - pjm.jumlah_pinjam)
          };
        }
        return b;
      });
      persistInventaris(updatedInv);
    }

    // 2. Update status peminjaman
    const updatedPjm = peminjamanList.map(p => {
      if (p.id === pjm.id) {
        return {
          ...p,
          status: 'Disetujui',
          tanggal_approval: new Date().toISOString().split('T')[0],
          pj_approval: 'Ketua / Pengurus RT 09'
        };
      }
      return p;
    });
    persistPeminjaman(updatedPjm);

    showToastMsg(`Peminjaman "${pjm.barang_nama}" oleh ${pjm.nama_peminjam} (Blok ${pjm.blok_rumah}) DISETUJUI! Stok barang telah diperbarui.`);
  };

  // Open Reject Modal
  const openRejectPinjam = (pjm) => {
    setSelectedRejectPjm(pjm);
    setAlasanReject('Barang sudah dijadwalkan untuk kegiatan kerja bakti warga RT 09');
    setShowRejectModal(true);
  };

  // Confirm Reject With Reason
  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (!alasanReject.trim()) {
      alert('Wajib mengisi alasan penolakan agar transparan kepada warga!');
      return;
    }

    const updatedPjm = peminjamanList.map(p => {
      if (p.id === selectedRejectPjm.id) {
        return {
          ...p,
          status: 'Ditolak',
          alasan_reject: alasanReject.trim(),
          tanggal_approval: new Date().toISOString().split('T')[0],
          pj_approval: 'Pengurus RT 09'
        };
      }
      return p;
    });
    persistPeminjaman(updatedPjm);

    setShowRejectModal(false);
    showToastMsg(`Peminjaman "${selectedRejectPjm.barang_nama}" oleh ${selectedRejectPjm.nama_peminjam} telah DITOLAK dengan alasan dicatat.`, 'info');
  };

  // Tandai Selesai / Dikembalikan
  const handleKembalikanBarang = (pjm) => {
    if (!confirm(`Tandai ${pjm.jumlah_pinjam} unit "${pjm.barang_nama}" telah dikembalikan oleh ${pjm.nama_peminjam}? Stok barang akan dikembalikan.`)) return;

    // 1. Tambah kembali stok
    const targetBarang = inventarisList.find(b => b.id === pjm.barang_id || b.nama_barang === pjm.barang_nama);
    if (targetBarang) {
      const updatedInv = inventarisList.map(b => {
        if (b.id === targetBarang.id) {
          return {
            ...b,
            tersedia: Math.min(b.jumlah_total, b.tersedia + pjm.jumlah_pinjam)
          };
        }
        return b;
      });
      persistInventaris(updatedInv);
    }

    // 2. Update status peminjaman
    const updatedPjm = peminjamanList.map(p => {
      if (p.id === pjm.id) {
        return {
          ...p,
          status: 'Dikembalikan'
        };
      }
      return p;
    });
    persistPeminjaman(updatedPjm);

    showToastMsg(`Barang "${pjm.barang_nama}" telah selesai dikembalikan ke gudang RT.`);
  };

  // Batalkan permohonan peminjaman (Warga)
  const handleCancelPinjam = (pjm) => {
    if (!confirm(`Batalkan pengajuan permohonan peminjaman "${pjm.barang_nama}"?`)) return;
    const updated = peminjamanList.filter(p => p.id !== pjm.id);
    persistPeminjaman(updated);
    showToastMsg(`Permohonan peminjaman "${pjm.barang_nama}" telah dibatalkan.`, 'info');
  };

  // Computed Filtered List
  const displayedPeminjaman = useMemo(() => {
    let list = peminjamanList;
    if (!isAdmin) {
      if (wargaTabFilter === 'saya') {
        list = list.filter(p => 
          (p.nama_peminjam || '').toLowerCase().includes(rtNama.toLowerCase()) || 
          (p.blok_rumah || '').toLowerCase() === rtBlok.toLowerCase()
        );
      }
    } else {
      if (adminStatusFilter === 'pending') list = list.filter(p => p.status === 'Menunggu Approval');
      if (adminStatusFilter === 'disetujui') list = list.filter(p => p.status === 'Disetujui');
      if (adminStatusFilter === 'ditolak') list = list.filter(p => p.status === 'Ditolak');
      if (adminStatusFilter === 'dikembalikan') list = list.filter(p => p.status === 'Dikembalikan');
    }
    return list;
  }, [peminjamanList, isAdmin, wargaTabFilter, adminStatusFilter, rtNama, rtBlok]);

  const pendingCount = peminjamanList.filter(p => p.status === 'Menunggu Approval').length;
  const myPendingCount = peminjamanList.filter(p => p.status === 'Menunggu Approval' && ((p.nama_peminjam || '').toLowerCase().includes(rtNama.toLowerCase()) || (p.blok_rumah || '').toLowerCase() === rtBlok.toLowerCase())).length;

  return (
    <Layout>
      <div className="space-y-6">

        {/* Header Bar */}
        <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/30 px-3 py-1 rounded-full font-medium">
                📦 Manajemen Inventaris & Sarana RT 09
              </span>
              <span className="text-[11px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                De Naila Village Blok G
              </span>
            </div>
            <h2 className="text-[20px] font-bold text-white mt-2">
              Inventaris Barang & Peminjaman Fasum RT 09
            </h2>
            <p className="text-[12px] text-slate-400 mt-1">
              Pengelolaan barang milik bersama (tenda, kursi, sound system, meja) dan alur persetujuan peminjaman warga
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {isAdmin && (
              <button
                onClick={openAddBarang}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-[13px] font-semibold transition shadow-lg shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <span>+</span> Tambah Master Barang
              </button>
            )}
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 gap-2 pb-1">
          <button
            onClick={() => setActiveTab('katalog')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'katalog' ? 'bg-[#7C3AED] text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span>📦</span> Katalog & Stok Barang RT ({inventarisList.length})
          </button>
          <button
            onClick={() => setActiveTab('peminjaman')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'peminjaman' ? 'bg-[#7C3AED] text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span>📋</span> Daftar Permohonan & Approval Peminjaman
            {pendingCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-2 py-0.2 rounded-full animate-bounce">
                {pendingCount} Pending
              </span>
            )}
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: KATALOG BARANG INVENTARIS RT                       */}
        {/* ========================================================= */}
        {activeTab === 'katalog' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventarisList.map((item) => {
              const isAvailable = item.tersedia > 0;
              return (
                <div
                  key={item.id}
                  className="bg-[#1A1D2E] border border-white/10 hover:border-white/20 rounded-[24px] p-5 flex flex-col justify-between transition shadow-lg"
                >
                  <div>
                    {/* Icon & Status */}
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
                        {item.icon || '📦'}
                      </div>
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium border ${
                        isAvailable
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/15 text-rose-400 border-rose-500/20'
                      }`}>
                        {isAvailable ? `● ${item.tersedia} Unit Tersedia` : '● Stok Sedang Habis'}
                      </span>
                    </div>

                    {/* Title & Info */}
                    <h3 className="text-white font-bold text-[15px] mt-3">
                      {item.nama_barang}
                    </h3>
                    <p className="text-[11px] text-[#A78BFA] font-medium mt-0.5">
                      {item.kategori || 'Inventaris RT'}
                    </p>

                    <div className="mt-3 bg-[#23263A] rounded-xl p-3 space-y-1.5 text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Stok</span>
                        <span className="font-semibold text-white">{item.jumlah_total} Unit</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Kondisi Barang</span>
                        <span className="text-emerald-400 font-medium">{item.kondisi}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Lokasi Simpan</span>
                        <span className="text-slate-200">{item.lokasi || 'Pos Satpam'}</span>
                      </div>
                    </div>

                    {item.keterangan && (
                      <p className="text-[11px] text-slate-400 mt-2 italic">
                        "{item.keterangan}"
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                    <button
                      disabled={!isAvailable}
                      onClick={() => openPinjamBarang(item)}
                      className={`w-full py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        isAvailable
                          ? 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-lg shadow-[#7C3AED]/20 active:scale-95'
                          : 'bg-white/5 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <span>📝</span> {isAvailable ? 'Ajukan Peminjaman' : 'Stok Sedang Habis'}
                    </button>

                    {isAdmin && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditBarang(item)}
                          className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBarang(item.id, item.nama_barang)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                          title="Hapus Master Barang"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: DAFTAR PEMINJAMAN & APPROVAL / REJECT              */}
        {/* ========================================================= */}
        {activeTab === 'peminjaman' && (
          <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] overflow-hidden shadow-xl space-y-0">
            
            {/* Table Header Controls */}
            <div className="p-5 bg-white/[0.02] border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-[15px] font-bold text-white flex items-center gap-2">
                  <span>📋</span>
                  {isAdmin ? 'Pusat Approval & Riwayat Peminjaman Inventaris' : `Daftar Peminjaman Inventaris Fasum RT 09`}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isAdmin ? 'Verifikasi permohonan warga, approve/reject transparan, dan kelola pengembalian stok' : 'Pantau status persetujuan barang pinjaman Anda dan jadwal penggunaan fasum'}
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                {!isAdmin ? (
                  <div className="bg-[#23263A] p-1 rounded-xl border border-white/10 flex items-center gap-1 text-xs">
                    <button
                      onClick={() => setWargaTabFilter('semua')}
                      className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                        wargaTabFilter === 'semua' ? 'bg-[#7C3AED] text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🌐 Semua Peminjaman ({peminjamanList.length})
                    </button>
                    <button
                      onClick={() => setWargaTabFilter('saya')}
                      className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                        wargaTabFilter === 'saya' ? 'bg-[#7C3AED] text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>👤 Permohonan Saya</span>
                      {myPendingCount > 0 && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="bg-[#23263A] p-1 rounded-xl border border-white/10 flex items-center gap-1 text-[11px] flex-wrap">
                    <button
                      onClick={() => setAdminStatusFilter('semua')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                        adminStatusFilter === 'semua' ? 'bg-[#7C3AED] text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Semua ({peminjamanList.length})
                    </button>
                    <button
                      onClick={() => setAdminStatusFilter('pending')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
                        adminStatusFilter === 'pending' ? 'bg-amber-600 text-white' : 'text-amber-400 hover:bg-white/5'
                      }`}
                    >
                      <span>⏳ Pending</span>
                      {pendingCount > 0 && <span className="bg-amber-400 text-black px-1 rounded-full text-[9px] font-bold">{pendingCount}</span>}
                    </button>
                    <button
                      onClick={() => setAdminStatusFilter('disetujui')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                        adminStatusFilter === 'disetujui' ? 'bg-emerald-600 text-white' : 'text-emerald-400 hover:bg-white/5'
                      }`}
                    >
                      ✓ Disetujui
                    </button>
                    <button
                      onClick={() => setAdminStatusFilter('ditolak')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                        adminStatusFilter === 'ditolak' ? 'bg-rose-600 text-white' : 'text-rose-400 hover:bg-white/5'
                      }`}
                    >
                      ✕ Ditolak
                    </button>
                    <button
                      onClick={() => setAdminStatusFilter('dikembalikan')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                        adminStatusFilter === 'dikembalikan' ? 'bg-blue-600 text-white' : 'text-blue-400 hover:bg-white/5'
                      }`}
                    >
                      🔄 Dikembalikan
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px] border-collapse">
                <thead className="text-[10px] text-slate-400 uppercase tracking-wider bg-black/20 border-b border-white/10 font-bold">
                  <tr>
                    <th className="py-3.5 px-4 w-[20%]">Barang Dipinjam</th>
                    <th className="py-3.5 px-4 w-[16%]">Peminjam</th>
                    <th className="py-3.5 px-4 w-[8%] text-center">Jumlah</th>
                    <th className="py-3.5 px-4 w-[16%]">Jadwal Pinjam</th>
                    <th className="py-3.5 px-4 w-[16%]">Keperluan</th>
                    <th className="py-3.5 px-4 w-[14%]">Status & Alasan</th>
                    <th className="py-3.5 px-4 w-[10%] text-right">{isAdmin ? 'Aksi Approval' : 'Tindakan'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {displayedPeminjaman.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400 text-xs">
                        <div className="text-2xl mb-1">📭</div>
                        Tidak ada riwayat peminjaman yang sesuai filter.
                      </td>
                    </tr>
                  ) : (
                    displayedPeminjaman.map((pjm) => {
                      const isPending = pjm.status === 'Menunggu Approval';
                      const isApproved = pjm.status === 'Disetujui';
                      const isRejected = pjm.status === 'Ditolak';
                      const isReturned = pjm.status === 'Dikembalikan';
                      const isMyOwn = (pjm.nama_peminjam || '').toLowerCase().includes(rtNama.toLowerCase()) || (pjm.blok_rumah || '').toLowerCase() === rtBlok.toLowerCase();

                      return (
                        <tr key={pjm.id} className="hover:bg-white/[0.02] transition">
                          {/* 1. Barang */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <span className="text-2xl">{pjm.icon || '📦'}</span>
                              <div>
                                <div className="font-bold text-white text-xs leading-snug">{pjm.barang_nama}</div>
                                <span className="text-[10px] text-slate-400 font-mono">ID: {pjm.barang_id || '-'}</span>
                              </div>
                            </div>
                          </td>

                          {/* 2. Peminjam */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-white text-xs">{pjm.nama_peminjam}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] bg-white/5 text-[#A78BFA] px-1.5 py-0.2 rounded border border-white/10 font-mono">
                                Blok {pjm.blok_rumah}
                              </span>
                              {isMyOwn && !isAdmin && (
                                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-semibold">
                                  Saya
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 3. Jumlah */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="font-mono font-bold text-emerald-400 text-xs bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                              {pjm.jumlah_pinjam} Unit
                            </span>
                          </td>

                          {/* 4. Jadwal */}
                          <td className="py-3.5 px-4 text-xs whitespace-nowrap text-slate-300">
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-500 text-[10px]">Pinjam:</span>
                              <span className="text-white font-mono font-medium">{pjm.tanggal_pinjam}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-slate-500 text-[10px]">Kembali:</span>
                              <span className="text-slate-300 font-mono">{pjm.tanggal_kembali}</span>
                            </div>
                          </td>

                          {/* 5. Keperluan */}
                          <td className="py-3.5 px-4 text-xs text-slate-300 leading-relaxed">
                            {pjm.keperluan}
                          </td>

                          {/* 6. Status & Alasan */}
                          <td className="py-3.5 px-4">
                            {isPending && (
                              <div className="space-y-1">
                                <span className="text-[11px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                                  Menunggu Approval
                                </span>
                                <p className="text-[10px] text-slate-500">Ditinjau Pengurus RT</p>
                              </div>
                            )}

                            {isApproved && (
                              <div className="space-y-1">
                                <span className="text-[11px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1.5">
                                  <span>✓</span> Disetujui
                                </span>
                                {pjm.pj_approval && (
                                  <p className="text-[10px] text-slate-400">Oleh: {pjm.pj_approval}</p>
                                )}
                              </div>
                            )}

                            {isRejected && (
                              <div className="space-y-1 max-w-xs">
                                <span className="text-[11px] bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1.5">
                                  <span>✕</span> Ditolak
                                </span>
                                {pjm.alasan_reject && (
                                  <div className="text-[10px] text-rose-300 bg-rose-500/10 p-1.5 rounded-lg border border-rose-500/20 leading-relaxed">
                                    <strong className="block text-[9px] uppercase text-rose-400">Alasan:</strong>
                                    "{pjm.alasan_reject}"
                                  </div>
                                )}
                              </div>
                            )}

                            {isReturned && (
                              <div className="space-y-1">
                                <span className="text-[11px] bg-blue-500/15 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1.5">
                                  <span>🔄</span> Selesai Dikembalikan
                                </span>
                              </div>
                            )}
                          </td>

                          {/* 7. Aksi Approval (Admin) / Tindakan (Warga) */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            {isAdmin ? (
                              <div className="flex items-center justify-end gap-1.5">
                                {isPending && (
                                  <>
                                    <button
                                      onClick={() => handleApprovePinjam(pjm)}
                                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shadow-sm active:scale-95"
                                    >
                                      ✓ Approve
                                    </button>
                                    <button
                                      onClick={() => openRejectPinjam(pjm)}
                                      className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shadow-sm active:scale-95"
                                    >
                                      ✕ Reject
                                    </button>
                                  </>
                                )}

                                {isApproved && (
                                  <button
                                    onClick={() => handleKembalikanBarang(pjm)}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer active:scale-95"
                                  >
                                    🔄 Kembalikan Stok
                                  </button>
                                )}

                                {(isRejected || isReturned) && (
                                  <span className="text-slate-500 text-xs font-mono">-</span>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center justify-end">
                                {isPending && isMyOwn ? (
                                  <button
                                    onClick={() => handleCancelPinjam(pjm)}
                                    className="bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer active:scale-95"
                                  >
                                    ✕ Batalkan
                                  </button>
                                ) : (
                                  <span className="text-slate-500 text-xs font-mono">-</span>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 1: FORM TAMBAH / EDIT MASTER INVENTARIS            */}
        {/* ========================================================= */}
        {showBarangModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowBarangModal(false)}></div>
            <div className="relative z-10 bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 max-w-lg w-full my-8 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    📦
                  </span>
                  <div>
                    <h3 className="font-bold text-white text-[16px]">
                      {barangModalMode === 'add' ? 'Tambah Master Inventaris Baru' : 'Edit Data Master Inventaris'}
                    </h3>
                    <p className="text-[11px] text-slate-400">Pengelolaan aset & sarana prasarana RT 09 / RW 14</p>
                  </div>
                </div>
                <button onClick={() => setShowBarangModal(false)} className="text-slate-400 hover:text-white text-lg cursor-pointer">✕</button>
              </div>

              <form onSubmit={handleSaveBarang} className="space-y-3.5 text-[13px]">
                <div>
                  <label className="text-slate-300 font-medium text-xs">Nama Barang Inventaris *</label>
                  <input
                    required
                    placeholder="Misal: Tenda Kerucut 4x4 / Sound System Portable"
                    value={formBarang.nama_barang}
                    onChange={(e) => setFormBarang({ ...formBarang, nama_barang: e.target.value })}
                    className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-xs">Ikon / Simbol Barang</label>
                    <select
                      value={formBarang.icon}
                      onChange={(e) => setFormBarang({ ...formBarang, icon: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="⛺">⛺ Tenda</option>
                      <option value="🪑">🪑 Kursi</option>
                      <option value="🔊">🔊 Sound System / Audio</option>
                      <option value="🪟">🪟 Meja</option>
                      <option value="🌱">🌱 Mesin Pemotong Rumput</option>
                      <option value="⚡">⚡ Genset Listrik</option>
                      <option value="🎪">🎪 Terpal / Peneduh</option>
                      <option value="💡">💡 Lampu Sorot</option>
                      <option value="🛠️">🛠️ Peralatan Tukang</option>
                      <option value="📦">📦 Barang Umum</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 text-xs">Kategori Barang</label>
                    <select
                      value={formBarang.kategori}
                      onChange={(e) => setFormBarang({ ...formBarang, kategori: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="Perlengkapan Acara">Perlengkapan Acara</option>
                      <option value="Audio & Elektronik">Audio & Elektronik</option>
                      <option value="Alat Kebersihan & Fasum">Alat Kebersihan & Fasum</option>
                      <option value="Utilitas & Darurat">Utilitas & Darurat</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-xs">Jumlah Total Unit *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formBarang.jumlah_total}
                      onChange={(e) => setFormBarang({ ...formBarang, jumlah_total: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono font-bold outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 text-xs">Kondisi Barang</label>
                    <select
                      value={formBarang.kondisi}
                      onChange={(e) => setFormBarang({ ...formBarang, kondisi: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                    >
                      <option value="Baik & Layak Pakai">Baik & Layak Pakai</option>
                      <option value="Sangat Baik / Baru">Sangat Baik / Baru</option>
                      <option value="Perlu Perawatan Ringan">Perlu Perawatan Ringan</option>
                      <option value="Rusak / Perbaikan">Rusak / Perbaikan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-xs">Lokasi Penyimpanan</label>
                  <input
                    placeholder="Misal: Gudang Pos Satpam Blok G / Rumah Ketua RT"
                    value={formBarang.lokasi}
                    onChange={(e) => setFormBarang({ ...formBarang, lokasi: e.target.value })}
                    className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-xs">Keterangan / Spesifikasi Barang (Opsional)</label>
                  <textarea
                    rows={2}
                    placeholder="Misal: Termasuk kabel roll 20 meter & mic wireless 2 pcs"
                    value={formBarang.keterangan}
                    onChange={(e) => setFormBarang({ ...formBarang, keterangan: e.target.value })}
                    className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowBarangModal(false)}
                    className="bg-white/5 hover:bg-white/10 text-slate-300 px-4 py-2.5 rounded-xl text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl text-xs cursor-pointer shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center gap-1.5"
                  >
                    💾 Simpan Master Barang
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 2: FORM AJUKAN PINJAM BARANG (WARGA / ADMIN)       */}
        {/* ========================================================= */}
        {showPinjamModal && selectedBarangPinjam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowPinjamModal(false)}></div>
            <div className="relative z-10 bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 max-w-lg w-full my-8 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-[#7C3AED]/20 text-[#A78BFA] flex items-center justify-center font-bold">
                    📝
                  </span>
                  <div>
                    <h3 className="font-bold text-white text-[16px]">Formulir Peminjaman Inventaris</h3>
                    <p className="text-[11px] text-slate-400">{selectedBarangPinjam.icon} {selectedBarangPinjam.nama_barang} (Tersedia: {selectedBarangPinjam.tersedia} Unit)</p>
                  </div>
                </div>
                <button onClick={() => setShowPinjamModal(false)} className="text-slate-400 hover:text-white text-lg cursor-pointer">✕</button>
              </div>

              <form onSubmit={handleSubmitPinjam} className="space-y-3.5 text-[13px]">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-xs">Nama Peminjam</label>
                    <input
                      required
                      value={formPinjam.nama_peminjam}
                      onChange={(e) => setFormPinjam({ ...formPinjam, nama_peminjam: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-[#7C3AED]"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs">Blok Rumah</label>
                    <input
                      required
                      value={formPinjam.blok_rumah}
                      onChange={(e) => setFormPinjam({ ...formPinjam, blok_rumah: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-[#7C3AED]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-xs">Jumlah Pinjam (Max: {selectedBarangPinjam.tersedia})</label>
                    <input
                      type="number"
                      min="1"
                      max={selectedBarangPinjam.tersedia}
                      required
                      value={formPinjam.jumlah_pinjam}
                      onChange={(e) => setFormPinjam({ ...formPinjam, jumlah_pinjam: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono font-bold outline-none focus:border-[#7C3AED]"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs">No. WhatsApp / HP</label>
                    <input
                      required
                      value={formPinjam.no_hp}
                      onChange={(e) => setFormPinjam({ ...formPinjam, no_hp: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-[#7C3AED]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-xs">Tanggal Mulai Pinjam</label>
                    <input
                      type="date"
                      required
                      value={formPinjam.tanggal_pinjam}
                      onChange={(e) => setFormPinjam({ ...formPinjam, tanggal_pinjam: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs outline-none focus:border-[#7C3AED]"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs">Rencana Tanggal Kembali</label>
                    <input
                      type="date"
                      required
                      value={formPinjam.tanggal_kembali}
                      onChange={(e) => setFormPinjam({ ...formPinjam, tanggal_kembali: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs outline-none focus:border-[#7C3AED]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-xs">Keperluan Peminjaman *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Misal: Acara syukuran aqiqah keluarga & pengajian di rumah Blok G"
                    value={formPinjam.keperluan}
                    onChange={(e) => setFormPinjam({ ...formPinjam, keperluan: e.target.value })}
                    className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-[#7C3AED]"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowPinjamModal(false)}
                    className="bg-white/5 hover:bg-white/10 text-slate-300 px-4 py-2.5 rounded-xl text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-6 py-2.5 rounded-xl text-xs cursor-pointer shadow-lg shadow-[#7C3AED]/20 active:scale-95 flex items-center gap-1.5"
                  >
                    🚀 Kirim Pengajuan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 3: REJECT PEMINJAMAN DENGAN ALASAN WAJIB            */}
        {/* ========================================================= */}
        {showRejectModal && selectedRejectPjm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowRejectModal(false)}></div>
            <div className="relative z-10 bg-[#1A1D2E] border border-rose-500/30 rounded-[24px] p-6 max-w-md w-full my-8 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                    ✕
                  </span>
                  <div>
                    <h3 className="font-bold text-white text-[16px]">Tolak Peminjaman Inventaris</h3>
                    <p className="text-[11px] text-slate-400">{selectedRejectPjm.barang_nama} ({selectedRejectPjm.nama_peminjam} - Blok {selectedRejectPjm.blok_rumah})</p>
                  </div>
                </div>
                <button onClick={() => setShowRejectModal(false)} className="text-slate-400 hover:text-white text-lg cursor-pointer">✕</button>
              </div>

              <form onSubmit={handleConfirmReject} className="space-y-3.5 text-[13px]">
                <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-xs text-rose-300">
                  ⚠️ Masukkan alasan penolakan secara jelas agar warga pemohon mengetahui alasan tidak disetujuinya permohonan ini.
                </div>

                <div>
                  <label className="text-slate-300 font-semibold text-xs">Pilih Template Alasan Cepat:</label>
                  <div className="space-y-1.5 mt-1.5">
                    {[
                      'Barang sudah dijadwalkan untuk kegiatan kerja bakti / acara warga RT 09',
                      'Barang sedang dalam masa perawatan / perbaikan teknis',
                      'Jumlah yang diminta melebihi kuota peminjaman yang tersedia',
                      'Jadwal peminjaman bertabrakan dengan agenda rapat pengurus RT'
                    ].map((tpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAlasanReject(tpl)}
                        className="text-left w-full text-[11px] bg-white/5 hover:bg-white/10 border border-white/10 p-2 rounded-lg text-slate-300 transition"
                      >
                        • {tpl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold text-xs">Alasan Penolakan Resmi *</label>
                  <textarea
                    required
                    rows={3}
                    value={alasanReject}
                    onChange={(e) => setAlasanReject(e.target.value)}
                    placeholder="Tuliskan alasan penolakan secara rinci di sini..."
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
                    ✕ Konfirmasi Tolak Peminjaman
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
