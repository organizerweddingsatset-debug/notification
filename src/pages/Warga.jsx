import { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../supabaseClient';

// Helper to generate credentials according to RT 09 rule:
// Nama: Daniel Fajarsyah, Blok: G-43 -> username: danielG43, password: danielG43
export function getWargaCredentials(nama, blok) {
  if (!nama) return { username: 'wargaG00', password: 'wargaG00' };
  const firstWord = nama.trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanBlok = (blok || 'G00').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const cred = `${firstWord}${cleanBlok}`;
  return { username: cred, password: cred };
}

// Data Default Master Warga RT 09 (De Naila Village)
const INITIAL_WARGA_LIST = [
  {
    id: 'demo-user-daniel',
    user_id: 'demo-user-daniel',
    nik: '3525121405920001',
    no_kk: '3525121405180004',
    nama_lengkap: 'Daniel Kristianto',
    nama_panggilan: 'Daniel',
    jenis_kelamin: 'Laki-laki',
    tempat_lahir: 'Surabaya',
    tanggal_lahir: '14 Mei 1992',
    agama: 'Islam',
    golongan_darah: 'O+',
    status_perkawinan: 'Kawin',
    pekerjaan: 'Software Engineer / IT Professional',
    kewarganegaraan: 'WNI',
    pendidikan: 'S1 Teknik Informatika',
    no_whatsapp: '0812-3456-7890',
    email: 'daniel@rt9.com',
    kontak_darurat: '0812-9876-5432 (Istri - Siti)',
    blok_rumah: 'G-12',
    nomor_rumah: '12',
    rt_rw: 'RT 09 / RW 14',
    perumahan: 'De Naila Village Blok G',
    kelurahan: 'Sumputsarirejo',
    kecamatan: 'Driyorejo',
    kota: 'Kab. Gresik, Jawa Timur',
    kode_pos: '61174',
    status_rumah: 'Milik Sendiri (Warga Tetap)',
    tahun_menetap: 'Maret 2022 (3 Tahun)',
    daya_listrik: '2200 VA',
    keluarga: [
      { id: 1, nama: 'Daniel Kristianto', hubungan: 'Kepala Keluarga', nik: '3525121405920001', jk: 'L', status: 'Bekerja' },
      { id: 2, nama: 'Siti Nurhaliza', hubungan: 'Istri', nik: '3525121808950002', jk: 'P', status: 'Ibu Rumah Tangga' },
      { id: 3, nama: 'Kenzo Al-Fatih', hubungan: 'Anak Kandung', nik: '3525122110210003', jk: 'L', status: 'Belum Sekolah' }
    ],
    kendaraan: [
      { id: 1, jenis: 'Mobil', merk: 'Toyota Avanza 1.5 G', plat: 'W 1234 XY', warna: 'Hitam Metalik' },
      { id: 2, jenis: 'Motor', merk: 'Honda Vario 160 CBS', plat: 'W 5678 AB', warna: 'Matte Blue' }
    ]
  },
  {
    id: 'demo-user-budi',
    user_id: 'demo-user-budi',
    nik: '3525121102880005',
    no_kk: '3525121102160002',
    nama_lengkap: 'Budi Santoso',
    nama_panggilan: 'Budi',
    jenis_kelamin: 'Laki-laki',
    tempat_lahir: 'Gresik',
    tanggal_lahir: '11 Februari 1988',
    agama: 'Islam',
    golongan_darah: 'B+',
    status_perkawinan: 'Kawin',
    pekerjaan: 'Wiraswasta / Kontraktor',
    kewarganegaraan: 'WNI',
    pendidikan: 'S1 Ekonomi',
    no_whatsapp: '0812-1111-2222',
    email: 'budi@rt9.com',
    kontak_darurat: '0812-1111-3333 (Istri - Rini)',
    blok_rumah: 'G-10',
    nomor_rumah: '10',
    rt_rw: 'RT 09 / RW 14',
    perumahan: 'De Naila Village Blok G',
    kelurahan: 'Sumputsarirejo',
    kecamatan: 'Driyorejo',
    kota: 'Kab. Gresik, Jawa Timur',
    kode_pos: '61174',
    status_rumah: 'Milik Sendiri (Warga Tetap)',
    tahun_menetap: 'Januari 2021 (4 Tahun)',
    daya_listrik: '3500 VA',
    keluarga: [
      { id: 101, nama: 'Budi Santoso', hubungan: 'Kepala Keluarga', nik: '3525121102880005', jk: 'L', status: 'Bekerja' },
      { id: 102, nama: 'Rini Anggraini', hubungan: 'Istri', nik: '3525121504900008', jk: 'P', status: 'Ibu Rumah Tangga' },
      { id: 103, nama: 'Nadia Putri', hubungan: 'Anak Kandung', nik: '3525122007150001', jk: 'P', status: 'Sekolah / Kuliah' },
      { id: 104, nama: 'Dimas Pratama', hubungan: 'Anak Kandung', nik: '3525122510190002', jk: 'L', status: 'Belum Sekolah' }
    ],
    kendaraan: [
      { id: 101, jenis: 'Mobil', merk: 'Mitsubishi Xpander Ultimate', plat: 'W 1099 BS', warna: 'Putih Mutiara' },
      { id: 102, jenis: 'Motor', merk: 'Yamaha NMAX 155 Connected', plat: 'W 4455 CD', warna: 'Maxi Grey' }
    ]
  },

  {
    id: 'demo-user-siti',
    user_id: 'demo-user-siti',
    nik: '3525122509890003',
    no_kk: '3525122509150009',
    nama_lengkap: 'Siti Rahmawati',
    nama_panggilan: 'Bu Siti',
    jenis_kelamin: 'Perempuan',
    tempat_lahir: 'Sidoarjo',
    tanggal_lahir: '25 September 1989',
    agama: 'Islam',
    golongan_darah: 'AB+',
    status_perkawinan: 'Kawin',
    pekerjaan: 'Tenaga Pengajar / Dosen',
    kewarganegaraan: 'WNI',
    pendidikan: 'S2 Pendidikan',
    no_whatsapp: '0813-7777-6666',
    email: 'siti.rahma@rt9.com',
    kontak_darurat: '0813-7777-5555 (Suami - Arif)',
    blok_rumah: 'G-05',
    nomor_rumah: '05',
    rt_rw: 'RT 09 / RW 14',
    perumahan: 'De Naila Village Blok G',
    kelurahan: 'Sumputsarirejo',
    kecamatan: 'Driyorejo',
    kota: 'Kab. Gresik, Jawa Timur',
    kode_pos: '61174',
    status_rumah: 'Kontrak / Sewa',
    tahun_menetap: 'Agustus 2023 (1.5 Tahun)',
    daya_listrik: '1300 VA',
    keluarga: [
      { id: 301, nama: 'Arif Hidayat', hubungan: 'Suami', nik: '3525121006870002', jk: 'L', status: 'Bekerja' },
      { id: 302, nama: 'Siti Rahmawati', hubungan: 'Kepala Keluarga', nik: '3525122509890003', jk: 'P', status: 'Bekerja' }
    ],
    kendaraan: [
      { id: 301, jenis: 'Motor', merk: 'Honda Scoopy Prestige', plat: 'W 5432 SR', warna: 'Prestige White' }
    ]
  },
  {
    id: 'demo-user-fauzi',
    user_id: 'demo-user-fauzi',
    nik: '3525121903930004',
    no_kk: '3525121903190006',
    nama_lengkap: 'Ahmad Fauzi',
    nama_panggilan: 'Fauzi',
    jenis_kelamin: 'Laki-laki',
    tempat_lahir: 'Lamongan',
    tanggal_lahir: '19 Maret 1993',
    agama: 'Islam',
    golongan_darah: 'O+',
    status_perkawinan: 'Kawin',
    pekerjaan: 'Dokter Umum / RS Petrokimia',
    kewarganegaraan: 'WNI',
    pendidikan: 'Profesi Dokter (dr.)',
    no_whatsapp: '0812-5555-4444',
    email: 'dr.fauzi@rt9.com',
    kontak_darurat: '0812-5555-3333 (Istri - Maya)',
    blok_rumah: 'G-08',
    nomor_rumah: '08',
    rt_rw: 'RT 09 / RW 14',
    perumahan: 'De Naila Village Blok G',
    kelurahan: 'Sumputsarirejo',
    kecamatan: 'Driyorejo',
    kota: 'Kab. Gresik, Jawa Timur',
    kode_pos: '61174',
    status_rumah: 'Milik Sendiri (Warga Tetap)',
    tahun_menetap: 'Juli 2022 (2.5 Tahun)',
    daya_listrik: '2200 VA',
    keluarga: [
      { id: 401, nama: 'Ahmad Fauzi', hubungan: 'Kepala Keluarga', nik: '3525121903930004', jk: 'L', status: 'Bekerja' },
      { id: 402, nama: 'Maya Kartika', hubungan: 'Istri', nik: '3525122204950001', jk: 'P', status: 'Bekerja' },
      { id: 403, nama: 'Alvaro Fauzan', hubungan: 'Anak Kandung', nik: '3525122811220008', jk: 'L', status: 'Belum Sekolah' }
    ],
    kendaraan: [
      { id: 401, jenis: 'Mobil', merk: 'Honda Brio RS Urbanite', plat: 'W 808 AF', warna: 'Carnival Yellow' },
      { id: 402, jenis: 'Motor', merk: 'Yamaha Fazzio Hybrid', plat: 'W 8822 FZ', warna: 'Cyan' }
    ]
  }
];

export default function Warga() {
  const rtNama = localStorage.getItem('rt_nama') || 'Daniel';
  const rtBlok = localStorage.getItem('rt_blok') || 'G-12';
  const rtRole = localStorage.getItem('rt_user_role') || 'warga';
  const rtUserId = localStorage.getItem('rt_user_id') || 'demo-user-daniel';
  const isAdmin = ['superadmin', 'ketua_rt', 'sekretaris', 'bendahara', 'admin', 'admin_rt'].includes(rtRole);

  // Tabs
  // Warga Tabs: 'pribadi' | 'keluarga' | 'kendaraan'
  // Admin Tabs: 'master_warga' | 'master_kendaraan' | 'master_keluarga'
  const [activeTab, setActiveTab] = useState(isAdmin ? 'master_warga' : 'pribadi');
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // { type: 'success'|'info'|'error', text: '' }
  const [isSyncing, setIsSyncing] = useState(false);

  // Search & Filter state for Admin
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('all');

  // Master Data List of All Warga
  const [wargaList, setWargaList] = useState(() => {
    const isReset = localStorage.getItem('rt_is_operational_reset') === 'true';
    const saved = localStorage.getItem('rt_all_warga_profiles');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { }
    }
    if (isReset) return [];
    return INITIAL_WARGA_LIST;
  });

  // Current active user's biodata
  const [biodata, setBiodata] = useState(() => {
    const isReset = localStorage.getItem('rt_is_operational_reset') === 'true';
    const found = wargaList.find(w => w.user_id === rtUserId || w.nama_lengkap?.toLowerCase().includes(rtNama.toLowerCase()) || w.nama_panggilan?.toLowerCase() === rtNama.toLowerCase());
    if (found) return found;

    const savedPersonal = localStorage.getItem('rt_biodata_' + rtNama.toLowerCase());
    if (savedPersonal) {
      try { return JSON.parse(savedPersonal); } catch (e) { }
    }
    if (isReset || wargaList.length === 0) {
      return {
        id: rtUserId,
        user_id: rtUserId,
        nama_lengkap: rtNama,
        nama_panggilan: rtNama,
        nik: '-',
        no_kk: '-',
        jenis_kelamin: 'Laki-laki',
        tempat_lahir: 'Gresik',
        tanggal_lahir: '-',
        agama: 'Islam',
        golongan_darah: 'O+',
        status_perkawinan: 'Kawin',
        pekerjaan: 'Warga',
        kewarganegaraan: 'WNI',
        pendidikan: 'S1',
        no_whatsapp: '0812-',
        email: `${rtNama.toLowerCase()}@rt9.com`,
        kontak_darurat: '-',
        blok_rumah: rtBlok,
        nomor_rumah: '01',
        rt_rw: 'RT 09 / RW 14',
        perumahan: 'De Naila Village Blok G',
        kelurahan: 'Sumputsarirejo',
        kecamatan: 'Driyorejo',
        kota: 'Kab. Gresik, Jawa Timur',
        kode_pos: '61174',
        status_rumah: 'Milik Sendiri (Warga Tetap)',
        tahun_menetap: '2024',
        daya_listrik: '2200 VA',
        keluarga: [],
        kendaraan: []
      };
    }
    return INITIAL_WARGA_LIST[0];
  });

  const [formData, setFormData] = useState(biodata);

  // Modals state
  const [keluargaModal, setKeluargaModal] = useState({ open: false, mode: 'add', data: null, targetWargaId: null });
  const [kendaraanModal, setKendaraanModal] = useState({ open: false, mode: 'add', data: null, targetWargaId: null });
  const [wargaModal, setWargaModal] = useState({ open: false, mode: 'add', data: null });
  const [selectedWargaDetail, setSelectedWargaDetail] = useState(null);
  const [detailModalTab, setDetailModalTab] = useState('biodata'); // 'biodata' | 'keluarga' | 'kendaraan'

  // Form states for modals
  const [keluargaForm, setKeluargaForm] = useState({
    nama: '',
    hubungan: 'Anak Kandung',
    nik: '',
    jk: 'L',
    status: 'Sekolah / Kuliah'
  });

  const [kendaraanForm, setKendaraanForm] = useState({
    wargaId: '',
    jenis: 'Motor',
    merk: '',
    plat: '',
    warna: ''
  });

  const [wargaForm, setWargaForm] = useState({
    nama_lengkap: '',
    nama_panggilan: '',
    nik: '',
    no_kk: '',
    jenis_kelamin: 'Laki-laki',
    tempat_lahir: 'Gresik',
    tanggal_lahir: '',
    agama: 'Islam',
    golongan_darah: 'O+',
    status_perkawinan: 'Kawin',
    pekerjaan: 'Karyawan Swasta',
    kewarganegaraan: 'WNI',
    pendidikan: 'S1',
    no_whatsapp: '',
    email: '',
    kontak_darurat: '',
    blok_rumah: 'G-15',
    nomor_rumah: '15',
    rt_rw: 'RT 09 / RW 14',
    perumahan: 'De Naila Village Blok G',
    kelurahan: 'Sumputsarirejo',
    kecamatan: 'Driyorejo',
    kota: 'Kab. Gresik, Jawa Timur',
    kode_pos: '61174',
    status_rumah: 'Milik Sendiri (Warga Tetap)',
    tahun_menetap: '2024 (1 Tahun)',
    daya_listrik: '2200 VA'
  });

  // Sync / Fetch from Supabase on mount
  useEffect(() => {
    async function loadAllFromSupabase() {
      try {
        const isReset = localStorage.getItem('rt_is_operational_reset') === 'true';
        const { data, error } = await supabase
          .from('warga_profiles')
          .select('*');

        if (data && !error) {
          if (data.length === 0 && isReset) {
            setWargaList([]);
            localStorage.setItem('rt_all_warga_profiles', '[]');
            return;
          }
          const mergedList = [...data];
          if (!isReset) {
            INITIAL_WARGA_LIST.forEach(initW => {
              if (!mergedList.some(m => m.user_id === initW.user_id || m.nik === initW.nik)) {
                mergedList.push(initW);
              }
            });
          }
          setWargaList(mergedList);
          localStorage.setItem('rt_all_warga_profiles', JSON.stringify(mergedList));

          // Set current user biodata
          const cur = mergedList.find(w => w.user_id === rtUserId || w.nama_lengkap?.toLowerCase().includes(rtNama.toLowerCase()) || w.nama_panggilan?.toLowerCase() === rtNama.toLowerCase());
          if (cur) {
            setBiodata(cur);
            setFormData(cur);
          }
        }
      } catch (err) {
        console.log('Supabase fetch note:', err);
      }
    }

    loadAllFromSupabase();
  }, [rtUserId, rtNama]);

  useEffect(() => {
    setFormData(biodata);
  }, [biodata]);

  // Toast Helper
  const showToast = (type, text) => {
    setSaveStatus({ type, text });
    setTimeout(() => setSaveStatus(null), 4500);
  };

  // Helper to persist Master Warga List across Supabase & LocalStorage
  const updateAndSyncMasterList = async (newList) => {
    setWargaList(newList);
    localStorage.setItem('rt_all_warga_profiles', JSON.stringify(newList));

    // Update current active biodata if changed
    const currentActive = newList.find(w => w.id === biodata.id || w.user_id === rtUserId || w.nik === biodata.nik);
    if (currentActive) {
      setBiodata(currentActive);
      setFormData(currentActive);
      localStorage.setItem('rt_biodata_' + rtNama.toLowerCase(), JSON.stringify(currentActive));
    }

    // Update selected modal if currently opened
    if (selectedWargaDetail) {
      const refreshedSelected = newList.find(w => w.id === selectedWargaDetail.id || w.user_id === selectedWargaDetail.user_id);
      if (refreshedSelected) setSelectedWargaDetail(refreshedSelected);
    }
  };

  // ==========================================
  // 1. WARGA ACTIONS (ADD, EDIT, DELETE)
  // ==========================================

  // Open Add Warga Modal
  const openAddWarga = () => {
    setWargaForm({
      nama_lengkap: '',
      nama_panggilan: '',
      nik: '',
      no_kk: '',
      jenis_kelamin: 'Laki-laki',
      tempat_lahir: 'Surabaya',
      tanggal_lahir: '01 Januari 1990',
      agama: 'Islam',
      golongan_darah: 'O+',
      status_perkawinan: 'Kawin',
      pekerjaan: 'Wiraswasta / Karyawan',
      kewarganegaraan: 'WNI',
      pendidikan: 'S1',
      no_whatsapp: '0812-',
      email: '',
      kontak_darurat: '',
      blok_rumah: 'G-16',
      nomor_rumah: '16',
      rt_rw: 'RT 09 / RW 14',
      perumahan: 'De Naila Village Blok G',
      kelurahan: 'Sumputsarirejo',
      kecamatan: 'Driyorejo',
      kota: 'Kab. Gresik, Jawa Timur',
      kode_pos: '61174',
      status_rumah: 'Milik Sendiri (Warga Tetap)',
      tahun_menetap: '2024 (Baru Pindah)',
      daya_listrik: '2200 VA'
    });
    setWargaModal({ open: true, mode: 'add', data: null });
  };

  // Open Edit Warga Modal (Admin)
  const openEditWarga = (w) => {
    setWargaForm({
      nama_lengkap: w.nama_lengkap || '',
      nama_panggilan: w.nama_panggilan || '',
      nik: w.nik || '',
      no_kk: w.no_kk || '',
      jenis_kelamin: w.jenis_kelamin || 'Laki-laki',
      tempat_lahir: w.tempat_lahir || 'Gresik',
      tanggal_lahir: w.tanggal_lahir || '',
      agama: w.agama || 'Islam',
      golongan_darah: w.golongan_darah || 'O+',
      status_perkawinan: w.status_perkawinan || 'Kawin',
      pekerjaan: w.pekerjaan || '',
      kewarganegaraan: w.kewarganegaraan || 'WNI',
      pendidikan: w.pendidikan || 'S1',
      no_whatsapp: w.no_whatsapp || '',
      email: w.email || '',
      kontak_darurat: w.kontak_darurat || '',
      blok_rumah: w.blok_rumah || 'G-12',
      nomor_rumah: w.nomor_rumah || '12',
      rt_rw: w.rt_rw || 'RT 09 / RW 14',
      perumahan: w.perumahan || 'De Naila Village Blok G',
      kelurahan: w.kelurahan || 'Sumputsarirejo',
      kecamatan: w.kecamatan || 'Driyorejo',
      kota: w.kota || 'Kab. Gresik, Jawa Timur',
      kode_pos: w.kode_pos || '61174',
      status_rumah: w.status_rumah || 'Milik Sendiri (Warga Tetap)',
      tahun_menetap: w.tahun_menetap || 'Maret 2022',
      daya_listrik: w.daya_listrik || '2200 VA'
    });
    setWargaModal({ open: true, mode: 'edit', data: w });
  };

  // Save Warga (Add or Edit)
  const handleSaveWargaSubmit = async (e) => {
    e.preventDefault();
    if (!wargaForm.nama_lengkap.trim() || !wargaForm.blok_rumah.trim()) {
      alert('Mohon lengkapi Nama Lengkap dan Blok Rumah!');
      return;
    }

    setIsSyncing(true);
    let updatedList = [...wargaList];
    let synced = false;

    if (wargaModal.mode === 'add') {
      const newUserId = 'warga-' + Date.now();
      const cred = getWargaCredentials(wargaForm.nama_lengkap, wargaForm.blok_rumah);
      const newWargaObj = {
        id: newUserId,
        user_id: newUserId,
        login_username: cred.username,
        login_password: cred.password,
        ...wargaForm,
        nama_lengkap: wargaForm.nama_lengkap.trim(),
        nama_panggilan: wargaForm.nama_panggilan.trim() || wargaForm.nama_lengkap.trim().split(' ')[0],
        keluarga: [
          {
            id: Date.now(),
            nama: wargaForm.nama_lengkap.trim(),
            hubungan: 'Kepala Keluarga',
            nik: wargaForm.nik || '-',
            jk: wargaForm.jenis_kelamin === 'Perempuan' ? 'P' : 'L',
            status: 'Bekerja'
          }
        ],
        kendaraan: [],
        created_at: new Date().toISOString()
      };

      updatedList.unshift(newWargaObj);

      try {
        const { error } = await supabase.from('warga_profiles').insert({
          user_id: newUserId,
          ...newWargaObj
        });
        if (!error) synced = true;

        // Auto create user auth record in Supabase users table
        await supabase.from('users').upsert({
          username: cred.username,
          role: 'warga',
          email: `${cred.username}@rt9.com`
        }, { onConflict: 'username' });
      } catch (err) {
        console.warn('Supabase insert warga note:', err);
      }

      showToast(synced ? 'success' : 'info', `Warga baru "${wargaForm.nama_lengkap}" (Blok ${wargaForm.blok_rumah}) berhasil ditambahkan!\nUsername & Password: ${cred.username}`);
    } else {
      // Edit existing warga
      const targetId = wargaModal.data.id || wargaModal.data.user_id;
      updatedList = updatedList.map(w => {
        if ((w.id && w.id === targetId) || (w.user_id && w.user_id === targetId)) {
          return {
            ...w,
            ...wargaForm,
            nama_lengkap: wargaForm.nama_lengkap.trim(),
            nama_panggilan: wargaForm.nama_panggilan.trim() || wargaForm.nama_lengkap.trim().split(' ')[0],
            updated_at: new Date().toISOString()
          };
        }
        return w;
      });

      try {
        const payload = {
          ...wargaForm,
          nama_lengkap: wargaForm.nama_lengkap.trim(),
          nama_panggilan: wargaForm.nama_panggilan.trim() || wargaForm.nama_lengkap.trim().split(' ')[0],
          updated_at: new Date().toISOString()
        };
        const { error } = await supabase
          .from('warga_profiles')
          .update(payload)
          .eq('user_id', targetId);
        if (!error) synced = true;
      } catch (err) {
        console.warn('Supabase update warga note:', err);
      }

      showToast(synced ? 'success' : 'info', `Data warga "${wargaForm.nama_lengkap}" berhasil diperbarui!`);
    }

    await updateAndSyncMasterList(updatedList);
    setIsSyncing(false);
    setWargaModal({ open: false, mode: 'add', data: null });
  };

  // Delete Warga (Admin)
  const handleDeleteWarga = async (w) => {
    const nama = w.nama_lengkap || w.nama;
    if (!confirm(`Hapus data warga "${nama}" (Blok ${w.blok_rumah || w.blok}) dari sistem RT 09? Tindakan ini tidak dapat dibatalkan.`)) return;

    setIsSyncing(true);
    const targetId = w.id || w.user_id;
    const updatedList = wargaList.filter(item => (item.id !== targetId && item.user_id !== targetId));

    let synced = false;
    try {
      const { error } = await supabase
        .from('warga_profiles')
        .delete()
        .eq('user_id', targetId);
      if (!error) synced = true;
    } catch (err) {
      console.warn('Supabase delete warga note:', err);
    }

    await updateAndSyncMasterList(updatedList);
    if (selectedWargaDetail && (selectedWargaDetail.id === targetId || selectedWargaDetail.user_id === targetId)) {
      setSelectedWargaDetail(null);
    }
    setIsSyncing(false);
    showToast(synced ? 'success' : 'info', `Data warga "${nama}" telah berhasil dihapus.`);
  };

  // Handle Save Biodata Form (Warga Self-Edit Mode)
  const handleSaveBiodataPribadi = async (e) => {
    e.preventDefault();
    setIsSyncing(true);

    const updated = {
      ...biodata,
      ...formData,
      nama_lengkap: formData.nama_lengkap || formData.namaLengkap,
      nama_panggilan: formData.nama_panggilan || formData.namaPanggilan,
      nik: formData.nik,
      no_kk: formData.no_kk || formData.noKk,
      no_whatsapp: formData.no_whatsapp || formData.noHp,
      blok_rumah: formData.blok_rumah || formData.blokRumah,
      status_rumah: formData.status_rumah || formData.statusRumah,
      tahun_menetap: formData.tahun_menetap || formData.tahunMenetap,
      updated_at: new Date().toISOString()
    };

    const targetId = updated.id || updated.user_id || rtUserId;
    const updatedList = wargaList.map(w => (w.id === targetId || w.user_id === targetId) ? updated : w);

    let synced = false;
    try {
      const { error } = await supabase
        .from('warga_profiles')
        .upsert({ user_id: targetId, ...updated }, { onConflict: 'user_id' });
      if (!error) synced = true;
    } catch (err) {
      console.warn('Supabase update note:', err);
    }

    await updateAndSyncMasterList(updatedList);
    setIsSyncing(false);
    setIsEditing(false);

    showToast(
      synced ? 'success' : 'info',
      synced
        ? 'Biodata berhasil disimpan & tersinkronisasi otomatis ke Database Supabase Cloud!'
        : 'Biodata berhasil disimpan di Penyimpanan Lokal (Offline Ready)!'
    );
  };

  // ==========================================
  // 2. KELUARGA ACTIONS (ADD, EDIT, DELETE)
  // ==========================================
  const openAddKeluarga = (targetWarga = null) => {
    const target = targetWarga || biodata;
    setKeluargaForm({
      nama: '',
      hubungan: 'Anak Kandung',
      nik: '',
      jk: 'L',
      status: 'Sekolah / Kuliah'
    });
    setKeluargaModal({ open: true, mode: 'add', data: null, targetWargaId: target.id || target.user_id });
  };

  const openEditKeluarga = (item, targetWarga = null) => {
    const target = targetWarga || biodata;
    setKeluargaForm({
      nama: item.nama || '',
      hubungan: item.hubungan || 'Anak Kandung',
      nik: item.nik || '',
      jk: item.jk || 'L',
      status: item.status || 'Bekerja'
    });
    setKeluargaModal({ open: true, mode: 'edit', data: item, targetWargaId: target.id || target.user_id });
  };

  const handleSaveKeluarga = async (e) => {
    e.preventDefault();
    if (!keluargaForm.nama.trim()) return;

    const targetId = keluargaModal.targetWargaId || biodata.id || biodata.user_id;
    const targetWarga = wargaList.find(w => w.id === targetId || w.user_id === targetId) || biodata;

    let updatedKeluarga = [...(targetWarga.keluarga || [])];
    if (keluargaModal.mode === 'add') {
      const newMember = {
        id: Date.now(),
        ...keluargaForm,
        nama: keluargaForm.nama.trim(),
        nik: keluargaForm.nik.trim() || '-'
      };
      updatedKeluarga.push(newMember);
    } else {
      updatedKeluarga = updatedKeluarga.map(k =>
        k.id === keluargaModal.data.id ? { ...k, ...keluargaForm, nama: keluargaForm.nama.trim() } : k
      );
    }

    const updatedWarga = { ...targetWarga, keluarga: updatedKeluarga };
    const updatedList = wargaList.map(w => (w.id === targetId || w.user_id === targetId) ? updatedWarga : w);

    let synced = false;
    try {
      const { error } = await supabase
        .from('warga_profiles')
        .update({ keluarga: updatedKeluarga, updated_at: new Date().toISOString() })
        .eq('user_id', targetId);
      if (!error) synced = true;
    } catch (err) {
      console.warn('Supabase keluarga sync note:', err);
    }

    await updateAndSyncMasterList(updatedList);
    setKeluargaModal({ open: false, mode: 'add', data: null, targetWargaId: null });

    showToast(
      synced ? 'success' : 'info',
      keluargaModal.mode === 'add'
        ? `Anggota keluarga "${keluargaForm.nama}" berhasil ditambahkan ke KK Blok ${targetWarga.blok_rumah}!`
        : `Data anggota keluarga "${keluargaForm.nama}" berhasil diperbarui!`
    );
  };

  const handleDeleteKeluarga = async (memberId, nama, targetWarga = null) => {
    if (!confirm(`Hapus data anggota keluarga "${nama}"?`)) return;

    const target = targetWarga || biodata;
    const targetId = target.id || target.user_id;
    const updatedKeluarga = (target.keluarga || []).filter(k => k.id !== memberId);
    const updatedWarga = { ...target, keluarga: updatedKeluarga };
    const updatedList = wargaList.map(w => (w.id === targetId || w.user_id === targetId) ? updatedWarga : w);

    let synced = false;
    try {
      const { error } = await supabase
        .from('warga_profiles')
        .update({ keluarga: updatedKeluarga, updated_at: new Date().toISOString() })
        .eq('user_id', targetId);
      if (!error) synced = true;
    } catch (err) {
      console.warn('Supabase keluarga delete sync note:', err);
    }

    await updateAndSyncMasterList(updatedList);
    showToast(synced ? 'success' : 'info', `Anggota keluarga "${nama}" telah dihapus.`);
  };

  // ==========================================
  // 3. KENDARAAN ACTIONS (ADD, EDIT, DELETE)
  // ==========================================
  const openAddKendaraan = (targetWarga = null) => {
    const target = targetWarga || biodata;
    setKendaraanForm({
      wargaId: target.id || target.user_id || '',
      jenis: 'Motor',
      merk: '',
      plat: '',
      warna: ''
    });
    setKendaraanModal({ open: true, mode: 'add', data: null, targetWargaId: target.id || target.user_id });
  };

  const openEditKendaraan = (vehicle, targetWarga = null) => {
    // Find target warga owner of vehicle
    const owner = targetWarga || (vehicle.wargaId ? wargaList.find(w => w.id === vehicle.wargaId || w.user_id === vehicle.wargaId) : null) || biodata;
    setKendaraanForm({
      wargaId: owner.id || owner.user_id || '',
      jenis: vehicle.jenis || 'Motor',
      merk: vehicle.merk || '',
      plat: vehicle.plat || '',
      warna: vehicle.warna || ''
    });
    setKendaraanModal({ open: true, mode: 'edit', data: vehicle, targetWargaId: owner.id || owner.user_id });
  };

  const handleSaveKendaraan = async (e) => {
    e.preventDefault();
    if (!kendaraanForm.merk.trim() || !kendaraanForm.plat.trim()) {
      alert('Mohon isi Merk dan Nomor Plat Kendaraan!');
      return;
    }

    const targetId = kendaraanForm.wargaId || kendaraanModal.targetWargaId || biodata.id || biodata.user_id;
    const targetWarga = wargaList.find(w => w.id === targetId || w.user_id === targetId) || biodata;

    let updatedKendaraan = [...(targetWarga.kendaraan || [])];
    if (kendaraanModal.mode === 'add') {
      const newVehicle = {
        id: Date.now(),
        jenis: kendaraanForm.jenis,
        merk: kendaraanForm.merk.trim(),
        plat: kendaraanForm.plat.trim().toUpperCase(),
        warna: kendaraanForm.warna.trim() || '-'
      };
      updatedKendaraan.push(newVehicle);
    } else {
      updatedKendaraan = updatedKendaraan.map(v =>
        v.id === kendaraanModal.data.id
          ? {
              ...v,
              jenis: kendaraanForm.jenis,
              merk: kendaraanForm.merk.trim(),
              plat: kendaraanForm.plat.trim().toUpperCase(),
              warna: kendaraanForm.warna.trim() || '-'
            }
          : v
      );
    }

    const updatedWarga = { ...targetWarga, kendaraan: updatedKendaraan };
    const updatedList = wargaList.map(w => (w.id === targetId || w.user_id === targetId) ? updatedWarga : w);

    let synced = false;
    try {
      const { error } = await supabase
        .from('warga_profiles')
        .update({ kendaraan: updatedKendaraan, updated_at: new Date().toISOString() })
        .eq('user_id', targetId);
      if (!error) synced = true;
    } catch (err) {
      console.warn('Supabase kendaraan sync note:', err);
    }

    await updateAndSyncMasterList(updatedList);
    setKendaraanModal({ open: false, mode: 'add', data: null, targetWargaId: null });

    showToast(
      synced ? 'success' : 'info',
      kendaraanModal.mode === 'add'
        ? `Kendaraan "${kendaraanForm.plat.toUpperCase()}" (${kendaraanForm.merk}) berhasil didaftarkan untuk Blok ${targetWarga.blok_rumah}!`
        : `Data kendaraan "${kendaraanForm.plat.toUpperCase()}" berhasil diperbarui!`
    );
  };

  const handleDeleteKendaraan = async (vehicleId, plat, targetWarga = null) => {
    if (!confirm(`Hapus data kendaraan dengan plat "${plat}"?`)) return;

    // Find owner if not provided
    let target = targetWarga;
    if (!target) {
      target = wargaList.find(w => (w.kendaraan || []).some(v => v.id === vehicleId)) || biodata;
    }

    const targetId = target.id || target.user_id;
    const updatedKendaraan = (target.kendaraan || []).filter(v => v.id !== vehicleId);
    const updatedWarga = { ...target, kendaraan: updatedKendaraan };
    const updatedList = wargaList.map(w => (w.id === targetId || w.user_id === targetId) ? updatedWarga : w);

    let synced = false;
    try {
      const { error } = await supabase
        .from('warga_profiles')
        .update({ kendaraan: updatedKendaraan, updated_at: new Date().toISOString() })
        .eq('user_id', targetId);
      if (!error) synced = true;
    } catch (err) {
      console.warn('Supabase kendaraan delete note:', err);
    }

    await updateAndSyncMasterList(updatedList);
    showToast(synced ? 'success' : 'info', `Kendaraan plat "${plat}" telah dihapus.`);
  };

  // ==========================================
  // COMPUTED LISTS & STATS
  // ==========================================

  // Filtered Warga List for Admin
  const filteredWargaList = useMemo(() => {
    return wargaList.filter(w => {
      const nama = (w.nama_lengkap || w.nama || '').toLowerCase();
      const panggilan = (w.nama_panggilan || w.panggilan || '').toLowerCase();
      const blok = (w.blok_rumah || w.blok || '').toLowerCase();
      const nik = (w.nik || '').toLowerCase();
      const hp = (w.no_whatsapp || w.hp || '').toLowerCase();
      const query = searchTerm.toLowerCase();

      const matchesSearch = !searchTerm || nama.includes(query) || panggilan.includes(query) || blok.includes(query) || nik.includes(query) || hp.includes(query);

      if (!matchesSearch) return false;

      if (filterStatus === 'tetap') return (w.status_rumah || '').includes('Tetap') || (w.status_rumah || '').includes('Sendiri');
      if (filterStatus === 'kontrak') return (w.status_rumah || '').includes('Kontrak') || (w.status_rumah || '').includes('Sewa');
      return true;
    });
  }, [wargaList, searchTerm, filterStatus]);

  // All Vehicles across RT 09
  const allVehiclesList = useMemo(() => {
    const list = [];
    wargaList.forEach(w => {
      (w.kendaraan || []).forEach(v => {
        list.push({
          ...v,
          ownerNama: w.nama_lengkap || w.nama,
          ownerBlok: w.blok_rumah || w.blok,
          ownerHp: w.no_whatsapp || w.hp,
          wargaId: w.id || w.user_id,
          wargaObj: w
        });
      });
    });

    return list.filter(v => {
      const matchSearch = !vehicleSearch ||
        v.plat.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
        v.merk.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
        v.ownerNama.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
        v.ownerBlok.toLowerCase().includes(vehicleSearch.toLowerCase());

      if (!matchSearch) return false;
      if (vehicleTypeFilter === 'mobil') return v.jenis === 'Mobil';
      if (vehicleTypeFilter === 'motor') return v.jenis === 'Motor';
      if (vehicleTypeFilter === 'sepeda') return v.jenis === 'Sepeda Listrik';
      return true;
    });
  }, [wargaList, vehicleSearch, vehicleTypeFilter]);

  // All Family Members across RT 09
  const allFamilyList = useMemo(() => {
    const list = [];
    wargaList.forEach(w => {
      (w.keluarga || []).forEach(k => {
        list.push({
          ...k,
          blokRumah: w.blok_rumah || w.blok,
          kepalaKeluarga: w.nama_lengkap || w.nama,
          wargaId: w.id || w.user_id
        });
      });
    });
    return list;
  }, [wargaList]);

  // Total Statistics
  const totalKK = wargaList.length;
  const totalJiwa = allFamilyList.length || (totalKK * 3);
  const totalKendaraan = allVehiclesList.length;
  const totalMobil = allVehiclesList.filter(v => v.jenis === 'Mobil').length;
  const totalMotor = allVehiclesList.filter(v => v.jenis === 'Motor').length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/30 px-3 py-1 rounded-full font-medium">
                {isAdmin ? '🛡️ Master Data Kependudukan RT 09' : '👤 Data Kependudukan Pribadi'}
              </span>
              <span className="text-[11px] bg-green-500/15 text-green-400 border border-green-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                Status: Sistem Aktif & Terhubung Supabase
              </span>
            </div>
            <h2 className="text-[20px] font-bold text-white mt-2">
              {isAdmin ? 'Pusat Manajemen Data Warga & Kendaraan RT 09' : `Biodata Resmi Warga - ${biodata.nama_lengkap || biodata.namaLengkap}`}
            </h2>
            <p className="text-[12px] text-slate-400 mt-1">
              {isAdmin
                ? `Kelola ${totalKK} KK terdaftar, ${totalJiwa} jiwa penduduk, dan ${totalKendaraan} kendaraan lingkungan RT 09 / RW 14 De Naila Village Blok G`
                : `Informasi kependudukan resmi & catatan keluarga Anda di RT 09 / RW 14, Blok ${biodata.blok_rumah || biodata.blokRumah}`}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {!isAdmin ? (
              <>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-4 py-2.5 rounded-xl text-[13px] font-medium transition cursor-pointer flex items-center gap-2 ${
                    isEditing
                      ? 'bg-slate-700 hover:bg-slate-600 text-white'
                      : 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-lg shadow-[#7C3AED]/25'
                  }`}
                >
                  {isEditing ? '✕ Batal Edit' : '✏️ Edit Biodata'}
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 px-4 py-2.5 rounded-xl text-[13px] font-medium transition cursor-pointer flex items-center gap-1.5"
                >
                  🖨️ Cetak / PDF
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={openAddWarga}
                  className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold shadow-lg shadow-[#7C3AED]/25 cursor-pointer flex items-center gap-2 transition active:scale-95"
                >
                  <span>+</span> Tambah Warga Baru
                </button>
                <button
                  onClick={() => openAddKendaraan(null)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 px-4 py-2.5 rounded-xl text-[13px] font-medium transition cursor-pointer flex items-center gap-1.5"
                >
                  🚗 + Daftarkan Kendaraan
                </button>
              </>
            )}
          </div>
        </div>

        {/* Notification Toast */}
        {saveStatus && (
          <div className={`border text-[13px] px-5 py-3.5 rounded-2xl flex items-center justify-between gap-3 animate-fade-in shadow-xl ${
            saveStatus.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-[#7C3AED]/15 border-[#7C3AED]/30 text-[#C4B5FD]'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-xl">{saveStatus.type === 'success' ? '⚡' : '✅'}</span>
              <p className="font-semibold">{saveStatus.text}</p>
            </div>
            <button onClick={() => setSaveStatus(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 1: WARGA MODE (PERSONAL BIODATA & ASSETS)           */}
        {/* ========================================================= */}
        {!isAdmin && (
          <div className="space-y-6">
            {/* Top Identity Card Banner */}
            <div className="bg-gradient-to-r from-[#1A1D2E] via-[#202438] to-[#1A1D2E] border border-white/10 rounded-[24px] p-6 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-96 h-96 bg-[#7C3AED]/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#4F46E5] flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-[#7C3AED]/30 border-2 border-white/20">
                      {(biodata.nama_lengkap || biodata.namaLengkap || 'D').charAt(0)}
                    </div>
                    <span className="absolute -bottom-1 -right-1 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-[#1A1D2E]">
                      ✓
                    </span>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[22px] font-bold text-white">{biodata.nama_lengkap || biodata.namaLengkap}</h3>
                      <span className="bg-[#7C3AED]/20 text-[#C4B5FD] text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-[#7C3AED]/30">
                        Kepala Keluarga
                      </span>
                    </div>
                    <p className="text-[13px] text-slate-300 mt-1 flex items-center gap-2">
                      <span>🏠 Blok {biodata.blok_rumah || biodata.blokRumah}</span>
                      <span className="text-slate-500">•</span>
                      <span>De Naila Village</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-emerald-400 font-medium">{biodata.status_rumah || biodata.statusRumah}</span>
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2.5">
                      <span className="text-[11px] bg-white/5 border border-white/10 text-slate-300 px-3 py-1 rounded-lg">
                        NIK: <strong className="text-white font-mono">{biodata.nik}</strong>
                      </span>
                      <span className="text-[11px] bg-white/5 border border-white/10 text-slate-300 px-3 py-1 rounded-lg">
                        No. KK: <strong className="text-white font-mono">{biodata.no_kk || biodata.noKk}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6">
                  <div className="bg-[#23263A]/80 border border-white/5 rounded-xl p-3">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">No. WhatsApp</p>
                    <p className="text-[13px] font-semibold text-white mt-0.5 font-mono">{biodata.no_whatsapp || biodata.noHp}</p>
                  </div>
                  <div className="bg-[#23263A]/80 border border-white/5 rounded-xl p-3">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Gol. Darah</p>
                    <p className="text-[13px] font-semibold text-white mt-0.5">{biodata.golongan_darah || biodata.golDarah || 'O+'}</p>
                  </div>
                  <div className="bg-[#23263A]/80 border border-white/5 rounded-xl p-3 col-span-2 sm:col-span-1">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Anggota Keluarga</p>
                    <p className="text-[13px] font-semibold text-[#A78BFA] mt-0.5">{(biodata.keluarga || []).length} Jiwa (1 KK)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs (Warga) */}
            <div className="flex border-b border-white/10 gap-2">
              <button
                onClick={() => setActiveTab('pribadi')}
                className={`pb-3 px-4 text-[13px] font-medium transition relative cursor-pointer ${
                  activeTab === 'pribadi'
                    ? 'text-[#A78BFA] font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#7C3AED]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                📋 Data Pokok & Domisili
              </button>
              <button
                onClick={() => setActiveTab('keluarga')}
                className={`pb-3 px-4 text-[13px] font-medium transition relative cursor-pointer ${
                  activeTab === 'keluarga'
                    ? 'text-[#A78BFA] font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#7C3AED]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                👨‍👩‍👧 Anggota Keluarga ({(biodata.keluarga || []).length})
              </button>
              <button
                onClick={() => setActiveTab('kendaraan')}
                className={`pb-3 px-4 text-[13px] font-medium transition relative cursor-pointer ${
                  activeTab === 'kendaraan'
                    ? 'text-[#A78BFA] font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#7C3AED]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🚗 Kendaraan ({(biodata.kendaraan || []).length})
              </button>
            </div>

            {/* TAB 1: DATA POKOK & DOMISILI */}
            {activeTab === 'pribadi' && (
              <>
                {isEditing ? (
                  /* FORM EDIT MODE */
                  <form onSubmit={handleSaveBiodataPribadi} className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 space-y-6">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div>
                        <h4 className="font-bold text-white text-[16px]">Formulir Edit Biodata Warga</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">Perbarui data identitas kependudukan dan domisili Anda</p>
                      </div>
                      <span className="text-[11px] bg-amber-500/15 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full">
                        Mode Pengeditan Aktif
                      </span>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[11px] text-slate-400">Nama Lengkap (KTP) *</label>
                        <input
                          type="text"
                          required
                          value={formData.nama_lengkap || formData.namaLengkap || ''}
                          onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value, namaLengkap: e.target.value })}
                          className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-[13px] outline-none focus:border-[#7C3AED]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400">NIK (Nomor Induk Kependudukan)</label>
                        <input
                          type="text"
                          value={formData.nik || ''}
                          onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                          className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-[13px] font-mono outline-none focus:border-[#7C3AED]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400">Nomor Kartu Keluarga (KK)</label>
                        <input
                          type="text"
                          value={formData.no_kk || formData.noKk || ''}
                          onChange={(e) => setFormData({ ...formData, no_kk: e.target.value, noKk: e.target.value })}
                          className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-[13px] font-mono outline-none focus:border-[#7C3AED]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400">Tempat Lahir</label>
                        <input
                          type="text"
                          value={formData.tempat_lahir || formData.tempatLahir || ''}
                          onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value, tempatLahir: e.target.value })}
                          className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-[13px] outline-none focus:border-[#7C3AED]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400">Tanggal Lahir</label>
                        <input
                          type="text"
                          value={formData.tanggal_lahir || formData.tanggalLahir || ''}
                          onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value, tanggalLahir: e.target.value })}
                          className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-[13px] outline-none focus:border-[#7C3AED]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400">Jenis Kelamin</label>
                        <select
                          value={formData.jenis_kelamin || formData.jenisKelamin || 'Laki-laki'}
                          onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value, jenisKelamin: e.target.value })}
                          className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-[13px] outline-none focus:border-[#7C3AED]"
                        >
                          <option value="Laki-laki">Laki-laki</option>
                          <option value="Perempuan">Perempuan</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400">Agama</label>
                        <input
                          type="text"
                          value={formData.agama || ''}
                          onChange={(e) => setFormData({ ...formData, agama: e.target.value })}
                          className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-[13px] outline-none focus:border-[#7C3AED]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400">Status Perkawinan</label>
                        <select
                          value={formData.status_perkawinan || formData.statusKawin || 'Kawin'}
                          onChange={(e) => setFormData({ ...formData, status_perkawinan: e.target.value, statusKawin: e.target.value })}
                          className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-[13px] outline-none focus:border-[#7C3AED]"
                        >
                          <option value="Kawin">Kawin</option>
                          <option value="Belum Kawin">Belum Kawin</option>
                          <option value="Cerai Hidup">Cerai Hidup</option>
                          <option value="Cerai Mati">Cerai Mati</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400">Golongan Darah</label>
                        <input
                          type="text"
                          value={formData.golongan_darah || formData.golDarah || 'O+'}
                          onChange={(e) => setFormData({ ...formData, golongan_darah: e.target.value, golDarah: e.target.value })}
                          className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-[13px] outline-none focus:border-[#7C3AED]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400">Pekerjaan</label>
                        <input
                          type="text"
                          value={formData.pekerjaan || ''}
                          onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
                          className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-[13px] outline-none focus:border-[#7C3AED]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400">No. WhatsApp / HP</label>
                        <input
                          type="text"
                          value={formData.no_whatsapp || formData.noHp || ''}
                          onChange={(e) => setFormData({ ...formData, no_whatsapp: e.target.value, noHp: e.target.value })}
                          className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-[13px] font-mono outline-none focus:border-[#7C3AED]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400">Kontak Darurat</label>
                        <input
                          type="text"
                          value={formData.kontak_darurat || formData.kontakDarurat || ''}
                          onChange={(e) => setFormData({ ...formData, kontak_darurat: e.target.value, kontakDarurat: e.target.value })}
                          className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-[13px] outline-none focus:border-[#7C3AED]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400">Blok Rumah</label>
                        <input
                          type="text"
                          value={formData.blok_rumah || formData.blokRumah || ''}
                          onChange={(e) => setFormData({ ...formData, blok_rumah: e.target.value, blokRumah: e.target.value })}
                          className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-[13px] outline-none focus:border-[#7C3AED]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400">Status Tempat Tinggal</label>
                        <select
                          value={formData.status_rumah || formData.statusRumah || 'Milik Sendiri (Warga Tetap)'}
                          onChange={(e) => setFormData({ ...formData, status_rumah: e.target.value, statusRumah: e.target.value })}
                          className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-[13px] outline-none focus:border-[#7C3AED]"
                        >
                          <option value="Milik Sendiri (Warga Tetap)">Milik Sendiri (Warga Tetap)</option>
                          <option value="Kontrak / Sewa">Kontrak / Sewa</option>
                          <option value="Menumpang / Famili Lain">Menumpang / Famili Lain</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400">Mulai Menetap</label>
                        <input
                          type="text"
                          value={formData.tahun_menetap || formData.tahunMenetap || ''}
                          onChange={(e) => setFormData({ ...formData, tahun_menetap: e.target.value, tahunMenetap: e.target.value })}
                          className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-[13px] outline-none focus:border-[#7C3AED]"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-5 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 text-[13px] transition cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={isSyncing}
                        className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-6 py-2.5 rounded-xl text-[13px] font-semibold transition shadow-lg shadow-[#7C3AED]/25 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                      >
                        {isSyncing ? '⏳ Menyimpan...' : '💾 Simpan Perubahan'}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* DISPLAY MODE */
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Data Kependudukan Card */}
                    <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-[#7C3AED]/20 text-[#A78BFA] flex items-center justify-center text-sm font-bold">
                            🪪
                          </span>
                          <h4 className="font-bold text-white text-[15px]">Identitas Kependudukan</h4>
                        </div>
                        <span className="text-[10px] bg-white/5 text-slate-400 px-2 py-0.5 rounded">Sesuai KTP / Dukcapil</span>
                      </div>

                      <div className="space-y-3 text-[13px]">
                        <div className="flex justify-between py-1.5 border-b border-white/5">
                          <span className="text-slate-400">Nomor Induk Kependudukan (NIK)</span>
                          <span className="font-mono font-semibold text-white">{biodata.nik}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-white/5">
                          <span className="text-slate-400">Nomor Kartu Keluarga (KK)</span>
                          <span className="font-mono font-semibold text-white">{biodata.no_kk || biodata.noKk}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-white/5">
                          <span className="text-slate-400">Nama Lengkap</span>
                          <span className="font-semibold text-white">{biodata.nama_lengkap || biodata.namaLengkap}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-white/5">
                          <span className="text-slate-400">Tempat, Tanggal Lahir</span>
                          <span className="text-white">{biodata.tempat_lahir || biodata.tempatLahir}, {biodata.tanggal_lahir || biodata.tanggalLahir}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-white/5">
                          <span className="text-slate-400">Jenis Kelamin</span>
                          <span className="text-white">{biodata.jenis_kelamin || biodata.jenisKelamin}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-white/5">
                          <span className="text-slate-400">Agama</span>
                          <span className="text-white">{biodata.agama}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-white/5">
                          <span className="text-slate-400">Status Perkawinan</span>
                          <span className="text-white">{biodata.status_perkawinan || biodata.statusKawin}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-white/5">
                          <span className="text-slate-400">Pekerjaan</span>
                          <span className="text-white font-medium">{biodata.pekerjaan}</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-slate-400">Kewarganegaraan / Pendidikan</span>
                          <span className="text-white">{biodata.kewarganegaraan} • {biodata.pendidikan}</span>
                        </div>
                      </div>
                    </div>

                    {/* Data Domisili & Rumah Card */}
                    <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-[#4F46E5]/20 text-[#818CF8] flex items-center justify-center text-sm font-bold">
                            🏡
                          </span>
                          <h4 className="font-bold text-white text-[15px]">Domisili & Tempat Tinggal</h4>
                        </div>
                        <span className="text-[10px] bg-green-500/15 text-green-400 px-2 py-0.5 rounded">Terdaftar di RT 09</span>
                      </div>

                      <div className="space-y-3 text-[13px]">
                        <div className="flex justify-between py-1.5 border-b border-white/5">
                          <span className="text-slate-400">Alamat Perumahan</span>
                          <span className="font-semibold text-white">De Naila Village Blok {biodata.blok_rumah || biodata.blokRumah}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-white/5">
                          <span className="text-slate-400">Rukun Tetangga / RW</span>
                          <span className="text-white">{biodata.rt_rw || biodata.rtRw}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-white/5">
                          <span className="text-slate-400">Kelurahan / Kecamatan</span>
                          <span className="text-white">{biodata.kelurahan} / {biodata.kecamatan}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-white/5">
                          <span className="text-slate-400">Kabupaten / Provinsi</span>
                          <span className="text-white">{biodata.kota}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-white/5">
                          <span className="text-slate-400">Status Kepemilikan Rumah</span>
                          <span className="text-emerald-400 font-medium">{biodata.status_rumah || biodata.statusRumah}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-white/5">
                          <span className="text-slate-400">Mulai Menetap</span>
                          <span className="text-white">{biodata.tahun_menetap || biodata.tahunMenetap}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-white/5">
                          <span className="text-slate-400">Kontak Darurat (Emergency)</span>
                          <span className="text-white font-medium">{biodata.kontak_darurat || biodata.kontakDarurat || '-'}</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-slate-400">Daya Listrik & Fasilitas</span>
                          <span className="text-white">{biodata.daya_listrik || biodata.dayaListrik || '2200 VA'} • Iuran Aktif</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* TAB 2: ANGGOTA KELUARGA (KK) */}
            {activeTab === 'keluarga' && (
              <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                  <div>
                    <h4 className="font-bold text-white text-[16px]">Daftar Anggota Keluarga (1 Kartu Keluarga)</h4>
                    <p className="text-[12px] text-slate-400 mt-0.5">
                      Nomor KK: <span className="font-mono text-white font-semibold">{biodata.no_kk || biodata.noKk}</span> • {(biodata.keluarga || []).length} Jiwa Terdaftar
                    </p>
                  </div>
                  <button
                    onClick={() => openAddKeluarga(biodata)}
                    className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[12px] font-semibold px-4 py-2 rounded-xl transition cursor-pointer shadow-lg shadow-[#7C3AED]/20 flex items-center gap-1.5 self-start sm:self-auto active:scale-95"
                  >
                    <span>+</span> Tambah Anggota Keluarga
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[13px]">
                    <thead className="text-[10px] text-slate-500 uppercase tracking-wider border-b border-white/5">
                      <tr>
                        <th className="py-3 px-4">No</th>
                        <th className="py-3 px-4">Nama Anggota Keluarga</th>
                        <th className="py-3 px-4">Hubungan Keluarga</th>
                        <th className="py-3 px-4">NIK</th>
                        <th className="py-3 px-4">Jenis Kelamin</th>
                        <th className="py-3 px-4">Status Aktivitas</th>
                        <th className="py-3 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {(biodata.keluarga || []).map((k, i) => (
                        <tr key={k.id || i} className="hover:bg-white/[0.02] transition">
                          <td className="py-3.5 px-4 text-slate-400 font-mono">{i + 1}</td>
                          <td className="py-3.5 px-4 font-semibold text-white">
                            <div className="flex items-center gap-2.5">
                              <span className="w-7 h-7 rounded-full bg-[#7C3AED]/20 text-[#A78BFA] flex items-center justify-center text-xs font-bold border border-[#7C3AED]/30">
                                {k.nama ? k.nama.charAt(0) : 'W'}
                              </span>
                              <span>{k.nama}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
                              k.hubungan === 'Kepala Keluarga'
                                ? 'bg-[#7C3AED]/20 text-[#C4B5FD] border border-[#7C3AED]/30'
                                : 'bg-white/5 text-slate-300'
                            }`}>
                              {k.hubungan}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-300">{k.nik || '-'}</td>
                          <td className="py-3.5 px-4 text-slate-300">{k.jk === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                          <td className="py-3.5 px-4 text-emerald-400 font-medium">{k.status}</td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditKeluarga(k, biodata)}
                                className="bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white px-2.5 py-1 rounded-lg text-xs transition cursor-pointer"
                                title="Edit Anggota"
                              >
                                ✏️ Edit
                              </button>
                              {k.hubungan !== 'Kepala Keluarga' && (
                                <button
                                  onClick={() => handleDeleteKeluarga(k.id, k.nama, biodata)}
                                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2.5 py-1 rounded-lg text-xs transition cursor-pointer"
                                  title="Hapus Anggota"
                                >
                                  🗑️ Hapus
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: KENDARAAN TERDAFTAR */}
            {activeTab === 'kendaraan' && (
              <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                  <div>
                    <h4 className="font-bold text-white text-[16px]">Kendaraan Warga Terdaftar di RT 09</h4>
                    <p className="text-[12px] text-slate-400 mt-0.5">
                      Izin akses gerbang dan parkir resmi lingkungan RT 09 ({(biodata.kendaraan || []).length} Terdaftar)
                    </p>
                  </div>
                  <button
                    onClick={() => openAddKendaraan(biodata)}
                    className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[12px] font-semibold px-4 py-2 rounded-xl transition cursor-pointer shadow-lg shadow-[#7C3AED]/20 flex items-center gap-1.5 self-start sm:self-auto active:scale-95"
                  >
                    <span>+</span> Daftarkan Kendaraan
                  </button>
                </div>

                {(!biodata.kendaraan || biodata.kendaraan.length === 0) ? (
                  <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
                    <p className="text-4xl">🚗</p>
                    <p className="text-white font-medium mt-2 text-sm">Belum ada kendaraan terdaftar</p>
                    <p className="text-xs text-slate-400 mt-1">Klik tombol di atas untuk mendaftarkan mobil, motor, atau sepeda listrik Anda</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {(biodata.kendaraan || []).map((v) => (
                      <div key={v.id} className="bg-[#23263A] border border-white/10 rounded-2xl p-4 flex flex-col justify-between gap-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl border border-white/5">
                              {v.jenis === 'Mobil' ? '🚗' : v.jenis === 'Sepeda Listrik' ? '🚲' : '🛵'}
                            </div>
                            <div>
                              <div className="font-bold text-white text-[14px]">{v.merk}</div>
                              <div className="text-[12px] text-slate-400">{v.warna} • {v.jenis}</div>
                              <div className="mt-1.5">
                                <span className="bg-black/50 text-amber-300 font-mono text-[12px] font-bold px-2.5 py-0.5 rounded border border-white/10">
                                  {v.plat}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] bg-green-500/15 text-green-400 border border-green-500/20 px-2.5 py-1 rounded-full">
                            ● Stiker Aktif
                          </span>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                          <button
                            onClick={() => openEditKendaraan(v, biodata)}
                            className="bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white px-3 py-1 rounded-lg text-xs transition cursor-pointer"
                          >
                            ✏️ Edit Kendaraan
                          </button>
                          <button
                            onClick={() => handleDeleteKendaraan(v.id, v.plat, biodata)}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1 rounded-lg text-xs transition cursor-pointer"
                          >
                            🗑️ Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: ADMIN MODE (MASTER DATA WARGA & KENDARAAN)       */}
        {/* ========================================================= */}
        {isAdmin && (
          <div className="space-y-6">
            {/* Admin Statistics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-5">
                <div className="text-[11px] text-slate-400">Total Kepala Keluarga</div>
                <div className="text-[24px] font-bold text-white mt-1">{totalKK} KK</div>
                <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> 100% Terverifikasi
                </div>
              </div>
              <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-5">
                <div className="text-[11px] text-slate-400">Total Jiwa Penduduk</div>
                <div className="text-[24px] font-bold text-white mt-1">{totalJiwa} Jiwa</div>
                <div className="text-[11px] text-slate-400 mt-1">Data 1 Kartu Keluarga</div>
              </div>
              <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-5">
                <div className="text-[11px] text-slate-400">Status Warga Tetap</div>
                <div className="text-[24px] font-bold text-[#A78BFA] mt-1">
                  {wargaList.filter(w => (w.status_rumah || '').includes('Tetap') || (w.status_rumah || '').includes('Sendiri')).length} Rumah
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {wargaList.filter(w => (w.status_rumah || '').includes('Kontrak') || (w.status_rumah || '').includes('Sewa')).length} Rumah Kontrak
                </div>
              </div>
              <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-5">
                <div className="text-[11px] text-slate-400">Total Kendaraan Lingkungan</div>
                <div className="text-[24px] font-bold text-amber-300 mt-1">{totalKendaraan} Unit</div>
                <div className="text-[11px] text-slate-400 mt-1">{totalMobil} Mobil • {totalMotor} Motor</div>
              </div>
            </div>

            {/* Admin Master Navigation Tabs */}
            <div className="flex border-b border-white/10 gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('master_warga')}
                className={`pb-3 px-4 text-[13px] font-medium transition whitespace-nowrap relative cursor-pointer ${
                  activeTab === 'master_warga'
                    ? 'text-[#A78BFA] font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#7C3AED]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                👥 Master Data Warga ({totalKK} KK)
              </button>
              <button
                onClick={() => setActiveTab('master_kendaraan')}
                className={`pb-3 px-4 text-[13px] font-medium transition whitespace-nowrap relative cursor-pointer ${
                  activeTab === 'master_kendaraan'
                    ? 'text-[#A78BFA] font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#7C3AED]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🚗 Master Data Kendaraan ({totalKendaraan} Unit)
              </button>
              <button
                onClick={() => setActiveTab('master_keluarga')}
                className={`pb-3 px-4 text-[13px] font-medium transition whitespace-nowrap relative cursor-pointer ${
                  activeTab === 'master_keluarga'
                    ? 'text-[#A78BFA] font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#7C3AED]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                👨‍👩‍👧 Rekap Seluruh Jiwa ({totalJiwa} Jiwa)
              </button>
            </div>

            {/* ADMIN TAB 1: MASTER DATA WARGA */}
            {activeTab === 'master_warga' && (
              <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] overflow-hidden space-y-0 shadow-xl">
                {/* Search & Action Bar */}
                <div className="p-4 bg-white/[0.02] border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white text-[14px]">Daftar Kependudukan Warga RT 09</h3>
                    <span className="text-[11px] bg-white/5 text-slate-400 px-2.5 py-0.5 rounded-full border border-white/10">
                      {filteredWargaList.length} KK Ditampilkan
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      placeholder="Cari nama, blok, NIK, HP..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2 text-[12px] text-white outline-none w-56 focus:border-[#7C3AED]"
                    />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="bg-[#23263A] border border-white/10 rounded-xl px-3 py-2 text-[12px] text-slate-300 outline-none"
                    >
                      <option value="all">Semua Status</option>
                      <option value="tetap">Warga Tetap</option>
                      <option value="kontrak">Warga Kontrak</option>
                    </select>
                    <button
                      onClick={openAddWarga}
                      className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[12px] font-semibold px-4 py-2 rounded-xl transition cursor-pointer shadow-lg shadow-[#7C3AED]/20"
                    >
                      + Tambah Warga
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[13px]">
                    <thead className="text-[10px] text-slate-500 uppercase tracking-wider border-b border-white/5">
                      <tr>
                        <th className="py-3.5 px-5">Nama Kepala Keluarga</th>
                        <th className="py-3.5 px-3">Blok</th>
                        <th className="py-3.5 px-3">NIK</th>
                        <th className="py-3.5 px-3">No. WhatsApp</th>
                        <th className="py-3.5 px-3">Status Tempat Tinggal</th>
                        <th className="py-3.5 px-3">Keluarga</th>
                        <th className="py-3.5 px-3">Kendaraan</th>
                        <th className="py-3.5 px-5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredWargaList.map((w, i) => {
                        const nama = w.nama_lengkap || w.nama;
                        const panggilan = w.nama_panggilan || w.panggilan || nama.split(' ')[0];
                        const blok = w.blok_rumah || w.blok;
                        const nik = w.nik || '-';
                        const hp = w.no_whatsapp || w.hp || '-';
                        const status = w.status_rumah || w.status || 'Warga Tetap';
                        const jmlKeluarga = (w.keluarga || []).length || w.jmlKeluarga || 1;
                        const jmlKendaraan = (w.kendaraan || []).length || (w.kendaraan ? (typeof w.kendaraan === 'number' ? w.kendaraan : 0) : 0);

                        return (
                          <tr key={w.id || w.user_id || i} className="hover:bg-white/[0.02] transition">
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7C3AED]/30 to-[#4F46E5]/30 text-[#C4B5FD] flex items-center justify-center font-bold text-xs border border-white/10">
                                  {nama.charAt(0)}
                                </span>
                                <div>
                                  <div className="font-semibold text-white">{nama}</div>
                                  <div className="text-[11px] text-slate-400">Panggilan: {panggilan}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-3">
                              <span className="bg-white/5 text-white font-mono px-2.5 py-1 rounded-lg border border-white/10 text-xs font-bold">
                                {blok}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 font-mono text-slate-300 text-xs">{nik}</td>
                            <td className="py-3.5 px-3 font-mono text-slate-400 text-xs">{hp}</td>
                            <td className="py-3.5 px-3">
                              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                                status.includes('Ketua')
                                  ? 'bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/30'
                                  : status.includes('Tetap') || status.includes('Sendiri')
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : 'bg-amber-500/15 text-amber-400'
                              }`}>
                                {status}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-slate-300 text-xs">{jmlKeluarga} Jiwa</td>
                            <td className="py-3.5 px-3">
                              <span className="bg-white/5 px-2 py-0.5 rounded text-amber-300 text-xs font-mono">
                                🚗 {jmlKendaraan}
                              </span>
                            </td>
                            <td className="py-3.5 px-5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedWargaDetail(w);
                                    setDetailModalTab('biodata');
                                  }}
                                  className="bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg text-xs transition cursor-pointer"
                                  title="Lihat Detail Biodata"
                                >
                                  👁️ Detail
                                </button>
                                <button
                                  onClick={() => openEditWarga(w)}
                                  className="bg-[#7C3AED]/20 hover:bg-[#7C3AED] text-[#A78BFA] hover:text-white px-2.5 py-1 rounded-lg text-xs transition cursor-pointer font-medium"
                                  title="Edit Data Warga"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={() => openAddKendaraan(w)}
                                  className="bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 px-2 py-1 rounded-lg text-xs transition cursor-pointer"
                                  title="Tambah Kendaraan untuk Warga ini"
                                >
                                  +🚗
                                </button>
                                <button
                                  onClick={() => handleDeleteWarga(w)}
                                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2 py-1 rounded-lg text-xs transition cursor-pointer"
                                  title="Hapus Warga"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ADMIN TAB 2: MASTER DATA KENDARAAN */}
            {activeTab === 'master_kendaraan' && (
              <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] overflow-hidden space-y-0 shadow-xl">
                {/* Search & Action Bar */}
                <div className="p-4 bg-white/[0.02] border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white text-[14px]">Master Data Kendaraan Terdaftar RT 09</h3>
                    <span className="text-[11px] bg-white/5 text-amber-300 px-2.5 py-0.5 rounded-full border border-white/10">
                      {allVehiclesList.length} Unit Terdata
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      placeholder="Cari plat, merk, pemilik, blok..."
                      value={vehicleSearch}
                      onChange={(e) => setVehicleSearch(e.target.value)}
                      className="bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2 text-[12px] text-white outline-none w-56 focus:border-[#7C3AED]"
                    />
                    <select
                      value={vehicleTypeFilter}
                      onChange={(e) => setVehicleTypeFilter(e.target.value)}
                      className="bg-[#23263A] border border-white/10 rounded-xl px-3 py-2 text-[12px] text-slate-300 outline-none"
                    >
                      <option value="all">Semua Jenis</option>
                      <option value="mobil">🚗 Mobil</option>
                      <option value="motor">🛵 Motor</option>
                      <option value="sepeda">🚲 Sepeda Listrik</option>
                    </select>
                    <button
                      onClick={() => openAddKendaraan(null)}
                      className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[12px] font-semibold px-4 py-2 rounded-xl transition cursor-pointer shadow-lg shadow-[#7C3AED]/20"
                    >
                      + Daftarkan Kendaraan
                    </button>
                  </div>
                </div>

                {allVehiclesList.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-3xl">🚗</p>
                    <p className="text-white text-sm font-medium mt-2">Tidak ada kendaraan ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci pencarian atau daftarkan kendaraan baru</p>
                  </div>
                ) : (
                  <div className="p-5 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allVehiclesList.map((v) => (
                      <div key={v.id} className="bg-[#23263A] border border-white/10 rounded-2xl p-4 flex flex-col justify-between gap-3 hover:border-white/20 transition">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl border border-white/5">
                              {v.jenis === 'Mobil' ? '🚗' : v.jenis === 'Sepeda Listrik' ? '🚲' : '🛵'}
                            </div>
                            <div>
                              <div className="font-bold text-white text-[14px]">{v.merk}</div>
                              <div className="text-[11px] text-slate-400">{v.warna} • {v.jenis}</div>
                              <div className="mt-1">
                                <span className="bg-black/60 text-amber-300 font-mono text-[12px] font-bold px-2 py-0.5 rounded border border-white/10">
                                  {v.plat}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">
                            Stiker Aktif
                          </span>
                        </div>

                        <div className="bg-[#1A1D2E] rounded-xl p-2.5 text-[12px] border border-white/5">
                          <div className="flex justify-between text-slate-400 text-[11px]">
                            <span>Pemilik:</span>
                            <span className="text-white font-semibold">{v.ownerNama}</span>
                          </div>
                          <div className="flex justify-between text-slate-400 text-[11px] mt-1">
                            <span>Blok Rumah:</span>
                            <span className="text-[#A78BFA] font-mono font-bold">Blok {v.ownerBlok}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                          <button
                            onClick={() => openEditKendaraan(v, v.wargaObj)}
                            className="bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white px-3 py-1 rounded-lg text-xs transition cursor-pointer"
                          >
                            ✏️ Edit Kendaraan
                          </button>
                          <button
                            onClick={() => handleDeleteKendaraan(v.id, v.plat, v.wargaObj)}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1 rounded-lg text-xs transition cursor-pointer"
                          >
                            🗑️ Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ADMIN TAB 3: REKAP ANGGOTA KELUARGA / JIWA */}
            {activeTab === 'master_keluarga' && (
              <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] overflow-hidden space-y-0 shadow-xl">
                <div className="p-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                  <h3 className="font-semibold text-white text-[14px]">Rekapitulasi Seluruh Anggota Keluarga ({allFamilyList.length} Jiwa)</h3>
                  <span className="text-[11px] bg-[#7C3AED]/20 text-[#A78BFA] px-3 py-1 rounded-full border border-[#7C3AED]/30">
                    RT 09 / RW 14 De Naila Village Blok G
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[13px]">
                    <thead className="text-[10px] text-slate-500 uppercase tracking-wider border-b border-white/5">
                      <tr>
                        <th className="py-3 px-5">No</th>
                        <th className="py-3 px-4">Nama Lengkap</th>
                        <th className="py-3 px-4">Hubungan</th>
                        <th className="py-3 px-4">Blok</th>
                        <th className="py-3 px-4">NIK</th>
                        <th className="py-3 px-4">L/P</th>
                        <th className="py-3 px-4">Status Aktivitas</th>
                        <th className="py-3 px-4">Kepala Keluarga</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {allFamilyList.map((m, i) => (
                        <tr key={i} className="hover:bg-white/[0.02] transition">
                          <td className="py-3 px-5 text-slate-400 font-mono text-xs">{i + 1}</td>
                          <td className="py-3 px-4 font-semibold text-white">{m.nama}</td>
                          <td className="py-3 px-4">
                            <span className={`text-[11px] px-2.5 py-0.5 rounded-full ${
                              m.hubungan === 'Kepala Keluarga'
                                ? 'bg-[#7C3AED]/20 text-[#C4B5FD] font-semibold'
                                : 'bg-white/5 text-slate-300'
                            }`}>
                              {m.hubungan}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-white text-xs">{m.blokRumah}</td>
                          <td className="py-3 px-4 font-mono text-slate-300 text-xs">{m.nik || '-'}</td>
                          <td className="py-3 px-4 text-slate-300 text-xs">{m.jk === 'L' ? 'L' : 'P'}</td>
                          <td className="py-3 px-4 text-emerald-400 text-xs">{m.status}</td>
                          <td className="py-3 px-4 text-slate-300 text-xs">{m.kepalaKeluarga}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 1: TAMBAH / EDIT WARGA (ADMIN)                      */}
        {/* ========================================================= */}
        {wargaModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setWargaModal({ open: false, mode: 'add', data: null })}
            ></div>
            <div className="relative z-10 bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 max-w-2xl w-full my-8 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="font-bold text-white text-[16px]">
                    {wargaModal.mode === 'add' ? '➕ Tambah Warga Baru RT 09' : `✏️ Edit Biodata Warga: ${wargaForm.nama_lengkap}`}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {wargaModal.mode === 'add' ? 'Masukkan data identitas kepala keluarga baru' : 'Ubah rincian kependudukan dan simpan'}
                  </p>
                </div>
                <button
                  onClick={() => setWargaModal({ open: false, mode: 'add', data: null })}
                  className="text-slate-400 hover:text-white text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveWargaSubmit} className="space-y-4 text-[13px]">
                {/* Live Account Credential Preview */}
                {wargaForm.nama_lengkap && (
                  <div className="bg-[#7C3AED]/15 border border-[#7C3AED]/30 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] text-[#C4B5FD] font-bold uppercase tracking-wider">
                        <span>🔑</span>
                        <span>Akun Login Otomatis Warga</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="font-mono text-white font-bold text-xs bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                          User: {getWargaCredentials(wargaForm.nama_lengkap, wargaForm.blok_rumah).username}
                        </span>
                        <span className="font-mono text-[#A78BFA] font-bold text-xs bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                          Pass: {getWargaCredentials(wargaForm.nama_lengkap, wargaForm.blok_rumah).password}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium w-fit">
                      ● Role: Warga
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-slate-400 text-xs">Nama Lengkap (KTP) *</label>
                    <input
                      required
                      placeholder="Misal: Budi Santoso"
                      value={wargaForm.nama_lengkap}
                      onChange={(e) => setWargaForm({ ...wargaForm, nama_lengkap: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-[#7C3AED]"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs">Nama Panggilan</label>
                    <input
                      placeholder="Misal: Pak Budi"
                      value={wargaForm.nama_panggilan}
                      onChange={(e) => setWargaForm({ ...wargaForm, nama_panggilan: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-[#7C3AED]"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 text-xs">Blok Rumah *</label>
                    <input
                      required
                      placeholder="Misal: G-15"
                      value={wargaForm.blok_rumah}
                      onChange={(e) => setWargaForm({ ...wargaForm, blok_rumah: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono font-bold outline-none focus:border-[#7C3AED]"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs">No. WhatsApp / HP *</label>
                    <input
                      required
                      placeholder="Misal: 0812-3456-7890"
                      value={wargaForm.no_whatsapp}
                      onChange={(e) => setWargaForm({ ...wargaForm, no_whatsapp: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono outline-none focus:border-[#7C3AED]"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 text-xs">NIK (Nomor Induk Kependudukan)</label>
                    <input
                      placeholder="16 Digit NIK"
                      value={wargaForm.nik}
                      onChange={(e) => setWargaForm({ ...wargaForm, nik: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono outline-none focus:border-[#7C3AED]"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs">Nomor Kartu Keluarga (KK)</label>
                    <input
                      placeholder="16 Digit Nomor KK"
                      value={wargaForm.no_kk}
                      onChange={(e) => setWargaForm({ ...wargaForm, no_kk: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono outline-none focus:border-[#7C3AED]"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 text-xs">Status Tempat Tinggal</label>
                    <select
                      value={wargaForm.status_rumah}
                      onChange={(e) => setWargaForm({ ...wargaForm, status_rumah: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-[#7C3AED]"
                    >
                      <option value="Milik Sendiri (Warga Tetap)">Milik Sendiri (Warga Tetap)</option>
                      <option value="Kontrak / Sewa">Kontrak / Sewa</option>
                      <option value="Menumpang / Famili Lain">Menumpang / Famili Lain</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs">Jenis Kelamin</label>
                    <select
                      value={wargaForm.jenis_kelamin}
                      onChange={(e) => setWargaForm({ ...wargaForm, jenis_kelamin: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-[#7C3AED]"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 text-xs">Pekerjaan</label>
                    <input
                      placeholder="Misal: Karyawan Swasta"
                      value={wargaForm.pekerjaan}
                      onChange={(e) => setWargaForm({ ...wargaForm, pekerjaan: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-[#7C3AED]"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs">Agama</label>
                    <input
                      value={wargaForm.agama}
                      onChange={(e) => setWargaForm({ ...wargaForm, agama: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-[#7C3AED]"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 text-xs">Tempat & Tanggal Lahir</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        placeholder="Tempat"
                        value={wargaForm.tempat_lahir}
                        onChange={(e) => setWargaForm({ ...wargaForm, tempat_lahir: e.target.value })}
                        className="mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#7C3AED]"
                      />
                      <input
                        placeholder="14 Mei 1992"
                        value={wargaForm.tanggal_lahir}
                        onChange={(e) => setWargaForm({ ...wargaForm, tanggal_lahir: e.target.value })}
                        className="mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#7C3AED]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs">Mulai Menetap / Tahun</label>
                    <input
                      placeholder="Misal: Januari 2023"
                      value={wargaForm.tahun_menetap}
                      onChange={(e) => setWargaForm({ ...wargaForm, tahun_menetap: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-[#7C3AED]"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setWargaModal({ open: false, mode: 'add', data: null })}
                    className="bg-white/5 hover:bg-white/10 text-slate-300 px-4 py-2.5 rounded-xl text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSyncing}
                    className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-6 py-2.5 rounded-xl text-xs cursor-pointer shadow-lg shadow-[#7C3AED]/25 flex items-center gap-2"
                  >
                    {isSyncing ? '⏳ Menyimpan...' : wargaModal.mode === 'add' ? '💾 Simpan Warga Baru' : '💾 Perbarui Data'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 2: TAMBAH / EDIT KENDARAAN                          */}
        {/* ========================================================= */}
        {kendaraanModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setKendaraanModal({ open: false, mode: 'add', data: null, targetWargaId: null })}
            ></div>
            <div className="relative z-10 bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="font-bold text-white text-[16px]">
                    {kendaraanModal.mode === 'add' ? '🚗 Daftarkan Kendaraan Baru' : '✏️ Edit Data Kendaraan'}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Daftarkan akses gerbang dan parkir resmi RT 09</p>
                </div>
                <button
                  onClick={() => setKendaraanModal({ open: false, mode: 'add', data: null, targetWargaId: null })}
                  className="text-slate-400 hover:text-white text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveKendaraan} className="space-y-3.5 text-[13px]">
                {/* Warga Owner Selector (If admin or not fixed) */}
                {isAdmin && (
                  <div>
                    <label className="text-slate-400 text-xs">Pemilik Kendaraan (Warga RT 09) *</label>
                    <select
                      value={kendaraanForm.wargaId}
                      onChange={(e) => setKendaraanForm({ ...kendaraanForm, wargaId: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#7C3AED]"
                    >
                      {wargaList.map(w => (
                        <option key={w.id || w.user_id} value={w.id || w.user_id}>
                          {w.nama_lengkap || w.nama} (Blok {w.blok_rumah || w.blok})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-xs">Jenis Kendaraan *</label>
                    <select
                      value={kendaraanForm.jenis}
                      onChange={(e) => setKendaraanForm({ ...kendaraanForm, jenis: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#7C3AED]"
                    >
                      <option value="Mobil">🚗 Mobil</option>
                      <option value="Motor">🛵 Motor</option>
                      <option value="Sepeda Listrik">🚲 Sepeda Listrik</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs">Warna Kendaraan</label>
                    <input
                      placeholder="Misal: Hitam Metalik"
                      value={kendaraanForm.warna}
                      onChange={(e) => setKendaraanForm({ ...kendaraanForm, warna: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#7C3AED]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-xs">Merk & Model Kendaraan *</label>
                  <input
                    required
                    placeholder="Misal: Toyota Avanza 1.5 G / Honda Vario 160"
                    value={kendaraanForm.merk}
                    onChange={(e) => setKendaraanForm({ ...kendaraanForm, merk: e.target.value })}
                    className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#7C3AED]"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-xs">Nomor Polisi / Plat Kendaraan *</label>
                  <input
                    required
                    placeholder="Misal: W 1234 XY"
                    value={kendaraanForm.plat}
                    onChange={(e) => setKendaraanForm({ ...kendaraanForm, plat: e.target.value })}
                    className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono uppercase font-bold outline-none focus:border-[#7C3AED]"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setKendaraanModal({ open: false, mode: 'add', data: null, targetWargaId: null })}
                    className="bg-white/5 hover:bg-white/10 text-slate-300 px-4 py-2.5 rounded-xl text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-5 py-2.5 rounded-xl text-xs cursor-pointer shadow-lg shadow-[#7C3AED]/25 active:scale-95"
                  >
                    {kendaraanModal.mode === 'add' ? '💾 Daftarkan Kendaraan' : '💾 Perbarui Kendaraan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 3: TAMBAH / EDIT ANGGOTA KELUARGA                   */}
        {/* ========================================================= */}
        {keluargaModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setKeluargaModal({ open: false, mode: 'add', data: null, targetWargaId: null })}
            ></div>
            <div className="relative z-10 bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-bold text-white text-[16px]">
                  {keluargaModal.mode === 'add' ? '➕ Tambah Anggota Keluarga' : '✏️ Edit Anggota Keluarga'}
                </h3>
                <button
                  onClick={() => setKeluargaModal({ open: false, mode: 'add', data: null, targetWargaId: null })}
                  className="text-slate-400 hover:text-white text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveKeluarga} className="space-y-3.5 text-[13px]">
                <div>
                  <label className="text-slate-400 text-xs">Nama Lengkap *</label>
                  <input
                    required
                    placeholder="Nama anggota keluarga"
                    value={keluargaForm.nama}
                    onChange={(e) => setKeluargaForm({ ...keluargaForm, nama: e.target.value })}
                    className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#7C3AED]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-xs">Hubungan Keluarga *</label>
                    <select
                      value={keluargaForm.hubungan}
                      onChange={(e) => setKeluargaForm({ ...keluargaForm, hubungan: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#7C3AED]"
                    >
                      <option value="Istri">Istri</option>
                      <option value="Suami">Suami</option>
                      <option value="Anak Kandung">Anak Kandung</option>
                      <option value="Orang Tua">Orang Tua</option>
                      <option value="Mertua">Mertua</option>
                      <option value="Famili Lain">Famili Lain</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs">Jenis Kelamin *</label>
                    <select
                      value={keluargaForm.jk}
                      onChange={(e) => setKeluargaForm({ ...keluargaForm, jk: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#7C3AED]"
                    >
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-xs">NIK (Nomor Induk Kependudukan)</label>
                  <input
                    placeholder="16 Digit NIK"
                    value={keluargaForm.nik}
                    onChange={(e) => setKeluargaForm({ ...keluargaForm, nik: e.target.value })}
                    className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono outline-none focus:border-[#7C3AED]"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-xs">Status Aktivitas / Pekerjaan</label>
                  <select
                    value={keluargaForm.status}
                    onChange={(e) => setKeluargaForm({ ...keluargaForm, status: e.target.value })}
                    className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#7C3AED]"
                  >
                    <option value="Bekerja">Bekerja</option>
                    <option value="Ibu Rumah Tangga">Ibu Rumah Tangga</option>
                    <option value="Sekolah / Kuliah">Sekolah / Kuliah</option>
                    <option value="Belum Sekolah">Belum Sekolah</option>
                    <option value="Pensiunan">Pensiunan</option>
                  </select>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setKeluargaModal({ open: false, mode: 'add', data: null, targetWargaId: null })}
                    className="bg-white/5 hover:bg-white/10 text-slate-300 px-4 py-2.5 rounded-xl text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-5 py-2.5 rounded-xl text-xs cursor-pointer shadow-lg shadow-[#7C3AED]/25 active:scale-95"
                  >
                    {keluargaModal.mode === 'add' ? '💾 Simpan Anggota' : '💾 Perbarui Anggota'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 4: DETAIL LENGKAP WARGA (ADMIN)                     */}
        {/* ========================================================= */}
        {selectedWargaDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedWargaDetail(null)}></div>
            <div className="relative z-10 bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 max-w-xl w-full my-8 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="font-bold text-white text-[16px]">
                    Biodata Lengkap: {selectedWargaDetail.nama_lengkap || selectedWargaDetail.nama}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    De Naila Village Blok {selectedWargaDetail.blok_rumah || selectedWargaDetail.blok} • RT 09 / RW 14
                  </p>
                </div>
                <button onClick={() => setSelectedWargaDetail(null)} className="text-slate-400 hover:text-white text-lg cursor-pointer">✕</button>
              </div>

              {/* Subtabs in Detail Modal */}
              <div className="flex border-b border-white/10 gap-2">
                <button
                  onClick={() => setDetailModalTab('biodata')}
                  className={`pb-2 px-3 text-xs font-medium ${
                    detailModalTab === 'biodata' ? 'text-[#A78BFA] border-b-2 border-[#7C3AED] font-bold' : 'text-slate-400'
                  }`}
                >
                  📋 Identitas Pokok
                </button>
                <button
                  onClick={() => setDetailModalTab('keluarga')}
                  className={`pb-2 px-3 text-xs font-medium ${
                    detailModalTab === 'keluarga' ? 'text-[#A78BFA] border-b-2 border-[#7C3AED] font-bold' : 'text-slate-400'
                  }`}
                >
                  👨‍👩‍👧 Anggota Keluarga ({(selectedWargaDetail.keluarga || []).length})
                </button>
                <button
                  onClick={() => setDetailModalTab('kendaraan')}
                  className={`pb-2 px-3 text-xs font-medium ${
                    detailModalTab === 'kendaraan' ? 'text-[#A78BFA] border-b-2 border-[#7C3AED] font-bold' : 'text-slate-400'
                  }`}
                >
                  🚗 Kendaraan ({(selectedWargaDetail.kendaraan || []).length})
                </button>
              </div>

              {detailModalTab === 'biodata' && (
                <div className="space-y-2.5 text-[13px]">
                  {/* Account Login Credentials Card */}
                  <div className="bg-[#7C3AED]/15 border border-[#7C3AED]/30 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-[#C4B5FD] font-bold uppercase tracking-wider block">
                        🔑 Akun Login Aplikasi Portal RT 09:
                      </span>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="font-mono text-white font-bold text-xs bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                          User: {getWargaCredentials(selectedWargaDetail.nama_lengkap || selectedWargaDetail.nama, selectedWargaDetail.blok_rumah || selectedWargaDetail.blok).username}
                        </span>
                        <span className="font-mono text-[#A78BFA] font-bold text-xs bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                          Pass: {getWargaCredentials(selectedWargaDetail.nama_lengkap || selectedWargaDetail.nama, selectedWargaDetail.blok_rumah || selectedWargaDetail.blok).password}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const c = getWargaCredentials(selectedWargaDetail.nama_lengkap || selectedWargaDetail.nama, selectedWargaDetail.blok_rumah || selectedWargaDetail.blok);
                        navigator.clipboard.writeText(`Akun Portal RT 09:\nUsername: ${c.username}\nPassword: ${c.password}\nLink: http://localhost:5173/login`);
                        alert(`Akun login disalin ke clipboard:\nUsername: ${c.username}\nPassword: ${c.password}`);
                      }}
                      className="bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs px-3 py-1.5 rounded-xl cursor-pointer transition flex items-center gap-1"
                    >
                      📋 Salin Akun
                    </button>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Blok Rumah</span>
                    <span className="text-white font-semibold font-mono">Blok {selectedWargaDetail.blok_rumah || selectedWargaDetail.blok}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Nomor NIK</span>
                    <span className="font-mono text-white">{selectedWargaDetail.nik || '-'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Nomor Kartu Keluarga (KK)</span>
                    <span className="font-mono text-white">{selectedWargaDetail.no_kk || selectedWargaDetail.noKk || '-'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">No. WhatsApp</span>
                    <span className="font-mono text-white">{selectedWargaDetail.no_whatsapp || selectedWargaDetail.hp || '-'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Status Rumah</span>
                    <span className="text-emerald-400 font-medium">{selectedWargaDetail.status_rumah || selectedWargaDetail.status || 'Warga Tetap'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Pekerjaan</span>
                    <span className="text-white">{selectedWargaDetail.pekerjaan || '-'}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Mulai Menetap</span>
                    <span className="text-white">{selectedWargaDetail.tahun_menetap || selectedWargaDetail.tahunMenetap || '-'}</span>
                  </div>
                </div>
              )}

              {detailModalTab === 'keluarga' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">{(selectedWargaDetail.keluarga || []).length} Jiwa Terdaftar</span>
                    <button
                      onClick={() => openAddKeluarga(selectedWargaDetail)}
                      className="text-xs bg-[#7C3AED] text-white px-2.5 py-1 rounded-lg"
                    >
                      + Tambah Anggota
                    </button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {(selectedWargaDetail.keluarga || []).map((k, idx) => (
                      <div key={idx} className="bg-[#23263A] p-2.5 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-white">{k.nama}</div>
                          <div className="text-slate-400 text-[11px]">{k.hubungan} • {k.jk === 'L' ? 'L' : 'P'} • {k.status}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditKeluarga(k, selectedWargaDetail)}
                            className="bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-slate-300"
                          >
                            ✏️
                          </button>
                          {k.hubungan !== 'Kepala Keluarga' && (
                            <button
                              onClick={() => handleDeleteKeluarga(k.id, k.nama, selectedWargaDetail)}
                              className="bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded text-red-400"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {detailModalTab === 'kendaraan' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">{(selectedWargaDetail.kendaraan || []).length} Kendaraan Terdaftar</span>
                    <button
                      onClick={() => openAddKendaraan(selectedWargaDetail)}
                      className="text-xs bg-[#7C3AED] text-white px-2.5 py-1 rounded-lg"
                    >
                      + Tambah Kendaraan
                    </button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {(selectedWargaDetail.kendaraan || []).map((v, idx) => (
                      <div key={idx} className="bg-[#23263A] p-2.5 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span>{v.jenis === 'Mobil' ? '🚗' : '🛵'}</span>
                          <div>
                            <div className="font-semibold text-white">{v.merk}</div>
                            <div className="text-amber-300 font-mono font-bold text-[11px]">{v.plat} • {v.warna}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditKendaraan(v, selectedWargaDetail)}
                            className="bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-slate-300"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteKendaraan(v.id, v.plat, selectedWargaDetail)}
                            className="bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded text-red-400"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 flex justify-between gap-2 border-t border-white/10">
                <button
                  onClick={() => {
                    const w = selectedWargaDetail;
                    setSelectedWargaDetail(null);
                    openEditWarga(w);
                  }}
                  className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  ✏️ Edit Biodata Warga Ini
                </button>
                <button
                  onClick={() => setSelectedWargaDetail(null)}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs cursor-pointer"
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
