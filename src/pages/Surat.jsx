import { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../supabaseClient';
import {
  sendWaMessage,
  openDirectWhatsApp,
  createSuratApprovalMessage
} from '../services/whatsappService';

// 5 Template Surat Pengantar Resmi RT 09 / RW 14
const TEMPLATE_SURAT_TYPES = [
  {
    id: 'ktp_pindah',
    title: 'Template #1 - Permohonan KTP Baru / Pindah',
    shortTitle: 'KTP Baru / Pindah',
    codePrefix: '470',
    icon: '🪪'
  },
  {
    id: 'skck',
    title: 'Template #2 - Pengantar SKCK',
    shortTitle: 'Pengantar SKCK',
    codePrefix: '330',
    icon: '👮'
  },
  {
    id: 'kk',
    title: 'Template #3 - Pengurusan Kartu Keluarga (KK)',
    shortTitle: 'Pengurusan KK',
    codePrefix: '474',
    icon: '👨‍👩‍👧'
  },
  {
    id: 'sktm',
    title: 'Template #4 - Surat Keterangan Tidak Mampu (SKTM)',
    shortTitle: 'Surat SKTM',
    codePrefix: '401',
    icon: '🤝'
  },
  {
    id: 'keramaian',
    title: 'Template #5 - Izin Acara / Kegiatan / Keramaian',
    shortTitle: 'Izin Keramaian / Acara',
    codePrefix: '300',
    icon: '🎪'
  }
];

const INITIAL_SURAT_LIST = [
  {
    id: 'srt-1',
    template_type: 'ktp_pindah',
    nomor_surat: '470/012/RT9-RW14/VIII/2026',
    nama: 'Daniel Kristianto',
    nik: '3525121405920001',
    no_kk: '3525121405180004',
    tempat_tgl_lahir: 'Surabaya, 14 Mei 1992',
    jenis_kelamin: 'Laki-laki',
    agama: 'Islam',
    pekerjaan: 'Software Engineer',
    alamat: 'De Naila Village Blok G-12 RT 09 RW 14',
    status_tinggal: 'Tetap',
    keperluan: 'Pengurusan KTP Baru / Surat Pindah Domisili ke alamat Perum De Naila Village Blok G-12',
    tanggal_surat: '20 Agustus 2026',
    status: 'Disetujui'
  },
  {
    id: 'srt-2',
    template_type: 'skck',
    nomor_surat: '330/015/RT9-RW14/VIII/2026',
    nama: 'Budi Santoso',
    nik: '3525121102880005',
    no_kk: '3525121102160002',
    tempat_tgl_lahir: 'Gresik, 11 Februari 1988',
    jenis_kelamin: 'Laki-laki',
    agama: 'Islam',
    pekerjaan: 'Wiraswasta / Kontraktor',
    alamat: 'De Naila Village Blok G-10 RT 09 RW 14',
    status_tinggal: 'Tetap',
    keperluan: 'Melamar Pekerjaan & Persyaratan Kelayakan Tender Proyek',
    tanggal_surat: '18 Agustus 2026',
    status: 'Disetujui'
  },
  {
    id: 'srt-3',
    template_type: 'kk',
    nomor_surat: '474/021/RT9-RW14/VIII/2026',
    nama: 'Siti Rahmawati',
    nik: '3525122509890003',
    no_kk: '3525122509150009',
    tempat_tgl_lahir: 'Sidoarjo, 25 September 1989',
    jenis_kelamin: 'Perempuan',
    agama: 'Islam',
    pekerjaan: 'Dosen / Pengajar',
    alamat: 'De Naila Village Blok G-05 RT 09 RW 14',
    status_tinggal: 'Tetap',
    keperluan: 'Penambahan Anggota Keluarga Baru / Pembaruan Data KK',
    tanggal_surat: '20 Agustus 2026',
    status: 'Disetujui'
  },
  {
    id: 'srt-4',
    template_type: 'keramaian',
    nomor_surat: '300/008/RT9-RW14/VIII/2026',
    nama: 'Ahmad Fauzi',
    nik: '3525121903930004',
    no_kk: '3525121903190006',
    tempat_tgl_lahir: 'Lamongan, 19 Maret 1993',
    jenis_kelamin: 'Laki-laki',
    agama: 'Islam',
    pekerjaan: 'Dokter Umum',
    alamat: 'De Naila Village Blok G-08 RT 09 RW 14',
    no_hp: '0812-5555-4444',
    nama_acara: 'Syukuran Aqiqah & Pengajian Keluarga',
    hari_tgl_acara: 'Minggu, 30 Agustus 2026',
    waktu_acara: '09.00 s/d 14.00 WIB',
    lokasi_acara: 'Halaman Rumah Blok G-08',
    estimasi_undangan: '50 Orang Warga & Keluarga',
    keperluan: 'Penyelenggaraan acara syukuran aqiqah di lingkungan warga RT 09 Blok G',
    tanggal_surat: '20 Agustus 2026',
    status: 'Disetujui'
  }
];

export default function Surat() {
  const rtNama = localStorage.getItem('rt_nama') || localStorage.getItem('rt_username') || 'Daniel Kristianto';
  const rtBlok = localStorage.getItem('rt_blok') || 'G-12';
  const rtRole = localStorage.getItem('rt_user_role') || 'warga';
  const isAdmin = ['superadmin', 'ketua_rt', 'sekretaris', 'bendahara', 'admin', 'admin_rt'].includes(rtRole);

  const [suratList, setSuratList] = useState(() => {
    const isReset = localStorage.getItem('rt_is_operational_reset') === 'true';
    const saved = localStorage.getItem('rt_surat_list');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { }
    }
    if (isReset) return [];
    return INITIAL_SURAT_LIST;
  });

  const [suratTabFilter, setSuratTabFilter] = useState('saya'); // 'saya' | 'semua'
  const [adminStatusFilter, setAdminStatusFilter] = useState('semua'); // 'semua' | 'pending' | 'disetujui'
  const [showModal, setShowModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('ktp_pindah');
  const [printSuratData, setPrintSuratData] = useState(null);

  // Realtime Cross-tab Sync
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'rt_surat_list' && e.newValue) {
        try {
          setSuratList(JSON.parse(e.newValue));
        } catch (err) { }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    template_type: 'ktp_pindah',
    nama: rtNama,
    nik: '3525121405920001',
    no_kk: '3525121405180004',
    tempat_tgl_lahir: 'Surabaya, 14 Mei 1992',
    jenis_kelamin: 'Laki-laki',
    agama: 'Islam',
    pekerjaan: 'Karyawan Swasta / IT',
    alamat: `De Naila Village Blok ${rtBlok} RT 09 RW 14`,
    status_tinggal: 'Tetap',
    no_hp: '0812-3456-7890',
    keperluan: '',
    // Acara fields
    nama_acara: '',
    hari_tgl_acara: '',
    waktu_acara: '09.00 s/d 13.00 WIB',
    lokasi_acara: `Halaman Rumah Blok ${rtBlok}`,
    estimasi_undangan: '50 Orang'
  });

  const persistSuratList = (merged) => {
    setSuratList(merged);
    localStorage.setItem('rt_surat_list', JSON.stringify(merged));
  };

  // Computed Filtered Surat List
  const displayedSuratList = useMemo(() => {
    let list = suratList;
    if (!isAdmin) {
      list = list.filter(s =>
        (s.nama || '').toLowerCase().includes(rtNama.toLowerCase()) ||
        (s.alamat || '').toLowerCase().includes(rtBlok.toLowerCase()) ||
        (s.nik || '') === formData.nik
      );
    } else {
      if (adminStatusFilter === 'pending') list = list.filter(s => s.status === 'Menunggu Approval');
      if (adminStatusFilter === 'disetujui') list = list.filter(s => s.status === 'Disetujui');
    }
    return list;
  }, [suratList, isAdmin, adminStatusFilter, rtNama, rtBlok, formData.nik]);

  const pendingSuratCount = suratList.filter(s => s.status === 'Menunggu Approval').length;
  const myPendingSuratCount = suratList.filter(s => s.status === 'Menunggu Approval' && ((s.nama || '').toLowerCase().includes(rtNama.toLowerCase()) || (s.alamat || '').toLowerCase().includes(rtBlok.toLowerCase()))).length;

  // Sync Supabase on mount
  useEffect(() => {
    async function loadFromSupabase() {
      try {
        const isReset = localStorage.getItem('rt_is_operational_reset') === 'true';
        const { data, error } = await supabase.from('surat_pengantar').select('*');
        if (data && !error) {
          if (data.length === 0 && isReset) {
            setSuratList([]);
            localStorage.setItem('rt_surat_list', '[]');
            return;
          }

          const mapped = data.map(d => ({
            id: d.id,
            template_type: d.template_type || 'ktp_pindah',
            nomor_surat: d.nomor_surat || '-',
            nama: d.nama_pemohon,
            nik: d.nik,
            no_kk: d.no_kk,
            tempat_tgl_lahir: d.tempat_tgl_lahir,
            jenis_kelamin: d.jenis_kelamin,
            agama: d.agama || 'Islam',
            pekerjaan: d.pekerjaan,
            alamat: d.alamat,
            status_tinggal: d.status_tinggal || 'Tetap',
            no_hp: d.no_hp,
            keperluan: d.keperluan,
            nama_acara: d.nama_acara,
            hari_tgl_acara: d.hari_tgl_acara,
            waktu_acara: d.waktu_acara,
            lokasi_acara: d.lokasi_acara,
            estimasi_undangan: d.estimasi_undangan,
            tanggal_surat: d.created_at ? new Date(d.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '20 Agustus 2026',
            status: d.status || 'Menunggu Approval'
          }));

          const merged = [...mapped];
          if (!isReset) {
            INITIAL_SURAT_LIST.forEach(init => {
              if (!merged.some(m => m.id === init.id || (m.nama === init.nama && m.template_type === init.template_type))) {
                merged.push(init);
              }
            });
          }

          // Check if local storage has any approved state
          const savedLocal = localStorage.getItem('rt_surat_list');
          if (savedLocal) {
            try {
              const parsedLocal = JSON.parse(savedLocal);
              if (Array.isArray(parsedLocal)) {
                merged.forEach((item, index) => {
                  const localMatch = parsedLocal.find(l => l.id === item.id || (l.nama === item.nama && l.template_type === item.template_type));
                  if (localMatch && localMatch.status === 'Disetujui') {
                    merged[index].status = 'Disetujui';
                    merged[index].nomor_surat = localMatch.nomor_surat;
                  }
                });
              }
            } catch (e) { }
          }

          persistSuratList(merged);
        }
      } catch (err) {
        console.log('Supabase surat note:', err);
      }
    }
    loadFromSupabase();
  }, []);

  const openFormWithTemplate = (templateKey) => {
    setSelectedTemplate(templateKey);
    setFormData(prev => ({
      ...prev,
      template_type: templateKey,
      keperluan: templateKey === 'ktp_pindah'
        ? `Pengurusan KTP Baru / Pindah Domisili ke Blok ${rtBlok}`
        : templateKey === 'skck'
        ? 'Melamar Pekerjaan / Persyaratan CPNS / Pendidikan'
        : templateKey === 'kk'
        ? 'Penerbitan Kartu Keluarga (KK) Baru / Perubahan Data'
        : templateKey === 'sktm'
        ? 'Keringanan Biaya Berobat / Beasiswa Pendidikan'
        : 'Penyelenggaraan Syukuran / Acara Warga'
    }));
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tpl = TEMPLATE_SURAT_TYPES.find(t => t.id === formData.template_type) || TEMPLATE_SURAT_TYPES[0];
    const randomSeq = String(Math.floor(Math.random() * 89 + 10)).padStart(3, '0');

    const newRecord = {
      id: 'srt-' + Date.now(),
      template_type: formData.template_type,
      nomor_surat: isAdmin ? `${tpl.codePrefix}/${randomSeq}/RT9-RW14/VIII/2026` : '-',
      nama: formData.nama,
      nik: formData.nik,
      no_kk: formData.no_kk,
      tempat_tgl_lahir: formData.tempat_tgl_lahir,
      jenis_kelamin: formData.jenis_kelamin,
      agama: formData.agama,
      pekerjaan: formData.pekerjaan,
      alamat: formData.alamat,
      status_tinggal: formData.status_tinggal,
      no_hp: formData.no_hp,
      keperluan: formData.keperluan,
      nama_acara: formData.nama_acara,
      hari_tgl_acara: formData.hari_tgl_acara,
      waktu_acara: formData.waktu_acara,
      lokasi_acara: formData.lokasi_acara,
      estimasi_undangan: formData.estimasi_undangan,
      tanggal_surat: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      status: isAdmin ? 'Disetujui' : 'Menunggu Approval'
    };

    const updated = [newRecord, ...suratList];
    persistSuratList(updated);
    setShowModal(false);

    // Sync to Supabase
    try {
      await supabase.from('surat_pengantar').insert({
        template_type: newRecord.template_type,
        blok_rumah: rtBlok,
        nama_pemohon: newRecord.nama,
        nik: newRecord.nik,
        no_kk: newRecord.no_kk,
        tempat_tgl_lahir: newRecord.tempat_tgl_lahir,
        jenis_kelamin: newRecord.jenis_kelamin,
        agama: newRecord.agama,
        pekerjaan: newRecord.pekerjaan,
        alamat: newRecord.alamat,
        status_tinggal: newRecord.status_tinggal,
        no_hp: newRecord.no_hp,
        jenis_surat: tpl.shortTitle,
        keperluan: newRecord.keperluan,
        nama_acara: newRecord.nama_acara,
        hari_tgl_acara: newRecord.hari_tgl_acara,
        waktu_acara: newRecord.waktu_acara,
        lokasi_acara: newRecord.lokasi_acara,
        estimasi_undangan: newRecord.estimasi_undangan,
        status: newRecord.status,
        nomor_surat: newRecord.nomor_surat !== '-' ? newRecord.nomor_surat : null
      });
    } catch (e) {
      console.log('Supabase surat insert note:', e);
    }

    alert(isAdmin ? 'Surat pengantar berhasil diterbitkan!' : 'Permohonan surat pengantar berhasil diajukan!');
  };

  const handleSendWaSurat = async (s) => {
    let phone = s.no_hp;
    if (!phone) {
      try {
        const saved = localStorage.getItem('rt_all_warga_profiles');
        if (saved) {
          const parsed = JSON.parse(saved);
          const found = parsed.find(w => w.nama_lengkap && s.nama && w.nama_lengkap.toLowerCase() === s.nama.toLowerCase());
          if (found) phone = found.no_whatsapp || found.noHp;
        }
      } catch (e) {}
    }
    if (!phone) phone = '0812-3456-7890';

    const tpl = TEMPLATE_SURAT_TYPES.find(t => t.id === s.template_type) || TEMPLATE_SURAT_TYPES[0];
    const msg = createSuratApprovalMessage({
      nama: s.nama,
      jenisSurat: tpl.shortTitle,
      noSurat: s.nomor_surat,
      status: s.status
    });

    const res = await sendWaMessage(phone, msg);
    if (res && res.success) {
      alert(`✅ Notifikasi status surat berhasil dikirim ke WhatsApp ${s.nama} (${phone})!`);
    } else {
      openDirectWhatsApp(phone, msg);
    }
  };

  const handleApprove = async (id) => {
    const randomSeq = String(Math.floor(Math.random() * 89 + 10)).padStart(3, '0');
    let approvedItem = null;

    const updated = suratList.map(s => {
      if (s.id === id) {
        const tpl = TEMPLATE_SURAT_TYPES.find(t => t.id === s.template_type) || TEMPLATE_SURAT_TYPES[0];
        approvedItem = {
          ...s,
          status: 'Disetujui',
          nomor_surat: `${tpl.codePrefix}/${randomSeq}/RT9-RW14/VIII/2026`
        };
        return approvedItem;
      }
      return s;
    });

    persistSuratList(updated);

    // Sync to Supabase
    try {
      if (approvedItem) {
        await supabase
          .from('surat_pengantar')
          .update({
            status: 'Disetujui',
            nomor_surat: approvedItem.nomor_surat
          })
          .eq('id', id);

        // Auto send WA notification
        handleSendWaSurat(approvedItem);
      }
    } catch (e) {
      console.log('Supabase approve sync note:', e);
    }
  };

  const handlePrint = (surat) => {
    setPrintSuratData(surat);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page {
              size: A4 portrait;
              margin: 15mm 20mm;
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
        {/* PRINTABLE AREA (EXACT ACCORDING TO PDF TEMPLATES 1 - 5)   */}
        {/* ========================================================= */}
        {printSuratData && (
          <div className="hidden print:block bg-white text-black p-0 m-0 font-serif leading-relaxed text-[11pt] w-full">
            {/* Header / Kop Resmi */}
            <div className="text-center mb-6">
              <h1 className="font-bold text-[14pt] uppercase tracking-wider">
                RUKUN TETANGGA 09 / RUKUN WARGA 14
              </h1>
              <h2 className="font-bold text-[15pt] uppercase">
                DE NAILA VILLAGE BLOK G
              </h2>
              <p className="text-[10pt] text-gray-800 mt-1">
                Perum De Naila Village Blok G, RT 09 / RW 14, Kec. Driyorejo
              </p>
              <p className="text-[9pt] text-gray-700">
                Contact: 0812-9999-8888 | Email: rt09rw14.denaila@gmail.com
              </p>
              <div className="border-b-4 border-black mt-3"></div>
            </div>

            {/* Judul & Nomor Surat */}
            <div className="text-center mb-6">
              <h3 className="font-bold text-[13pt] uppercase underline">
                {printSuratData.template_type === 'ktp_pindah' && 'SURAT PENGANTAR KTP BARU / PINDAH'}
                {printSuratData.template_type === 'skck' && 'SURAT PENGANTAR SKCK'}
                {printSuratData.template_type === 'kk' && 'SURAT PENGANTAR KARTU KELUARGA (KK)'}
                {printSuratData.template_type === 'sktm' && 'SURAT KETERANGAN TIDAK MAMPU (SKTM)'}
                {printSuratData.template_type === 'keramaian' && 'SURAT PENGANTAR IZIN KERAMAIAN / KEGIATAN'}
              </h3>
              <p className="font-bold text-[11pt] mt-1 font-mono">
                NOMOR: {printSuratData.nomor_surat !== '-' ? printSuratData.nomor_surat : `470/___/RT9-RW14/VIII/2026`}
              </p>
            </div>

            <p className="mb-4 text-[11pt]">
              Yang bertanda tangan di bawah ini, Ketua RT 09 / RW 14 De Naila Village Blok G menerangkan dengan sebenarnya bahwa:
            </p>

            {/* ================= TEMPLATE 1: KTP BARU / PINDAH ================= */}
            {printSuratData.template_type === 'ktp_pindah' && (
              <>
                <table className="w-full text-[11pt] mb-4">
                  <tbody>
                    <tr><td className="w-48 py-1">NIK</td><td>: {printSuratData.nik}</td></tr>
                    <tr><td className="py-1">Nama Lengkap</td><td>: {printSuratData.nama}</td></tr>
                    <tr><td className="py-1">Tempat / Tgl Lahir</td><td>: {printSuratData.tempat_tgl_lahir}</td></tr>
                    <tr><td className="py-1">Jenis Kelamin</td><td>: {printSuratData.jenis_kelamin}</td></tr>
                    <tr><td className="py-1">Alamat</td><td>: {printSuratData.alamat}</td></tr>
                    <tr><td className="py-1">Status Tinggal</td><td>: {printSuratData.status_tinggal}</td></tr>
                    <tr><td className="py-1">No. Kartu Keluarga</td><td>: {printSuratData.no_kk}</td></tr>
                  </tbody>
                </table>
                <p className="mb-3 text-[11pt]">
                  Adalah benar warga kami yang berdomisili di wilayah RT 09 / RW 14 De Naila Village Blok G.
                </p>
                <p className="mb-4 text-[11pt]">
                  Adapun surat pengantar ini dibuat untuk keperluan: <strong>Pengurusan KTP Baru / Surat Pindah Domisili ke alamat {printSuratData.keperluan || printSuratData.alamat}</strong>.
                </p>
              </>
            )}

            {/* ================= TEMPLATE 2: SKCK ================= */}
            {printSuratData.template_type === 'skck' && (
              <>
                <table className="w-full text-[11pt] mb-4">
                  <tbody>
                    <tr><td className="w-48 py-1">NIK</td><td>: {printSuratData.nik}</td></tr>
                    <tr><td className="py-1">Nama Lengkap</td><td>: {printSuratData.nama}</td></tr>
                    <tr><td className="py-1">Tempat / Tgl Lahir</td><td>: {printSuratData.tempat_tgl_lahir}</td></tr>
                    <tr><td className="py-1">Jenis Kelamin</td><td>: {printSuratData.jenis_kelamin}</td></tr>
                    <tr><td className="py-1">Agama</td><td>: {printSuratData.agama || 'Islam'}</td></tr>
                    <tr><td className="py-1">Pekerjaan</td><td>: {printSuratData.pekerjaan}</td></tr>
                    <tr><td className="py-1">Alamat</td><td>: {printSuratData.alamat}</td></tr>
                    <tr><td className="py-1">No. Kartu Keluarga</td><td>: {printSuratData.no_kk}</td></tr>
                  </tbody>
                </table>
                <p className="mb-3 text-[11pt]">
                  Adalah benar warga kami yang berdomisili di wilayah RT 09 / RW 14 De Naila Village Blok G. Berdasarkan catatan dan sepengetahuan kami, yang bersangkutan berkelakuan baik, belum pernah tersangkut perkara kepolisian/pidana, serta bertempat tinggal baik di lingkungan kami.
                </p>
                <p className="mb-4 text-[11pt]">
                  Adapun surat pengantar ini dibuat untuk keperluan: <strong>Permohonan Penerbitan SKCK (Surat Keterangan Catatan Kepolisian) guna {printSuratData.keperluan || 'Melamar Pekerjaan / Persyaratan CPNS / Melanjutkan Pendidikan'}</strong>.
                </p>
              </>
            )}

            {/* ================= TEMPLATE 3: KARTU KELUARGA (KK) ================= */}
            {printSuratData.template_type === 'kk' && (
              <>
                <table className="w-full text-[11pt] mb-4">
                  <tbody>
                    <tr><td className="w-48 py-1">NIK Kepala Keluarga</td><td>: {printSuratData.nik}</td></tr>
                    <tr><td className="py-1">Nama Kepala Keluarga</td><td>: {printSuratData.nama}</td></tr>
                    <tr><td className="py-1">Tempat / Tgl Lahir</td><td>: {printSuratData.tempat_tgl_lahir}</td></tr>
                    <tr><td className="py-1">Jenis Kelamin</td><td>: {printSuratData.jenis_kelamin}</td></tr>
                    <tr><td className="py-1">Alamat</td><td>: {printSuratData.alamat}</td></tr>
                    <tr><td className="py-1">No. KK (Lama)</td><td>: {printSuratData.no_kk || '-'}</td></tr>
                  </tbody>
                </table>
                <p className="mb-3 text-[11pt]">
                  Adalah benar warga kami yang berdomisili di wilayah RT 09 / RW 14 De Naila Village Blok G.
                </p>
                <p className="mb-4 text-[11pt]">
                  Adapun surat keterangan ini dibuat sebagai pengantar untuk keperluan: <strong>{printSuratData.keperluan || 'Pembuatan KK Baru / Pecah KK / Penambahan Anggota Keluarga / Perubahan Data KK'}</strong>.
                </p>
              </>
            )}

            {/* ================= TEMPLATE 4: SKTM ================= */}
            {printSuratData.template_type === 'sktm' && (
              <>
                <table className="w-full text-[11pt] mb-4">
                  <tbody>
                    <tr><td className="w-48 py-1">NIK</td><td>: {printSuratData.nik}</td></tr>
                    <tr><td className="py-1">Nama Lengkap</td><td>: {printSuratData.nama}</td></tr>
                    <tr><td className="py-1">Tempat / Tgl Lahir</td><td>: {printSuratData.tempat_tgl_lahir}</td></tr>
                    <tr><td className="py-1">Jenis Kelamin</td><td>: {printSuratData.jenis_kelamin}</td></tr>
                    <tr><td className="py-1">Pekerjaan</td><td>: {printSuratData.pekerjaan}</td></tr>
                    <tr><td className="py-1">Alamat</td><td>: {printSuratData.alamat}</td></tr>
                    <tr><td className="py-1">No. Kartu Keluarga</td><td>: {printSuratData.no_kk}</td></tr>
                  </tbody>
                </table>
                <p className="mb-3 text-[11pt]">
                  Adalah benar warga kami yang berdomisili di wilayah RT 09 / RW 14 De Naila Village Blok G. Berdasarkan pengamatan dan catatan kami, keluarga yang bersangkutan benar-benar tergolong dalam keluarga <strong>Pra-Sejahtera / Ekonomi Tidak Mampu</strong>.
                </p>
                <p className="mb-4 text-[11pt]">
                  Adapun surat keterangan ini dibuat untuk keperluan persyaratan: <strong>{printSuratData.keperluan || 'Keringanan Biaya Berobat / Permohonan Beasiswa Pendidikan / Bantuan Sosial'}</strong>.
                </p>
              </>
            )}

            {/* ================= TEMPLATE 5: IZIN KERAMAIAN ================= */}
            {printSuratData.template_type === 'keramaian' && (
              <>
                <table className="w-full text-[11pt] mb-3">
                  <tbody>
                    <tr><td className="w-48 py-1">NIK Penanggung Jawab</td><td>: {printSuratData.nik}</td></tr>
                    <tr><td className="py-1">Nama Penanggung Jawab</td><td>: {printSuratData.nama}</td></tr>
                    <tr><td className="py-1">Alamat</td><td>: {printSuratData.alamat}</td></tr>
                    <tr><td className="py-1">No. Telepon / HP</td><td>: {printSuratData.no_hp || '0812-3456-7890'}</td></tr>
                  </tbody>
                </table>
                <p className="mb-2 text-[11pt]">
                  Bermaksud akan menyelenggarakan kegiatan / acara keramaian dengan rincian sebagai berikut:
                </p>
                <table className="w-full text-[11pt] mb-3 ml-4">
                  <tbody>
                    <tr><td className="w-44 py-1">Bentuk / Nama Acara</td><td>: {printSuratData.nama_acara || printSuratData.keperluan}</td></tr>
                    <tr><td className="py-1">Hari / Tanggal</td><td>: {printSuratData.hari_tgl_acara || 'Sesuai Jadwal Pelaksanaan'}</td></tr>
                    <tr><td className="py-1">Waktu Pelaksanaan</td><td>: {printSuratData.waktu_acara || '09.00 s/d Selesai'}</td></tr>
                    <tr><td className="py-1">Lokasi / Tempat</td><td>: {printSuratData.lokasi_acara || printSuratData.alamat}</td></tr>
                    <tr><td className="py-1">Estimasi Undangan</td><td>: {printSuratData.estimasi_undangan || '50 Orang'}</td></tr>
                  </tbody>
                </table>
                <p className="mb-4 text-[11pt]">
                  Sehubungan dengan hal tersebut, kami selaku Pengurus RT 09 / RW 14 <strong>tidak keberatan dan memberikan rekomendasi/izin pengantar</strong> agar yang bersangkutan dapat memproses Izin Keramaian ke tingkat Desa/Kelurahan dan Kepolisian setempat.
                </p>
              </>
            )}

            <p className="mb-8 text-[11pt]">
              Demikian surat keterangan ini kami buat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.
            </p>

            {/* Signature */}
            <div className="flex justify-end text-center mt-12 text-[11pt]">
              <div className="w-72">
                <p>De Naila Village, {printSuratData.tanggal_surat || '20 Agustus 2026'}</p>
                <p className="font-bold mt-1">Ketua RT 09 / RW 14</p>
                <div className="h-24"></div>
                <p className="font-bold underline">( KETUA RT 09 )</p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SCREEN VIEW (UI MANAGEMENT PERSURATAN)                    */}
        {/* ========================================================= */}
        <div className="print:hidden space-y-6">
          {/* Header */}
          <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/30 px-3 py-1 rounded-full font-medium">
                  📄 5 Template Standar Persuratan RT 09
                </span>
                <span className="text-[11px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  RT 09 / RW 14 De Naila Village Blok G
                </span>
              </div>
              <h2 className="text-[20px] font-bold text-white mt-2">
                Layanan Persuratan & Pengantar Online RT 09
              </h2>
              <p className="text-[12px] text-slate-400 mt-1">
                Kop resmi: RT 09 / RW 14 De Naila Village Blok G, Kec. Driyorejo • Email: rt09rw14.denaila@gmail.com
              </p>
            </div>

            <button
              onClick={() => openFormWithTemplate('ktp_pindah')}
              className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold transition shadow-lg shadow-[#7C3AED]/25 cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <span>+</span> Ajukan Surat Baru
            </button>
          </div>

          {/* 5 Template Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {TEMPLATE_SURAT_TYPES.map(t => (
              <div
                key={t.id}
                onClick={() => openFormWithTemplate(t.id)}
                className="bg-[#1A1D2E] hover:bg-[#23263A] border border-white/10 hover:border-[#7C3AED]/50 rounded-[20px] p-4 text-center cursor-pointer transition active:scale-95 flex flex-col justify-between"
              >
                <div>
                  <div className="text-2xl">{t.icon}</div>
                  <div className="text-[12px] font-bold text-white mt-2">{t.shortTitle}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">Kode: {t.codePrefix}/...</div>
                </div>
                <button className="mt-3 text-[11px] bg-[#7C3AED]/20 text-[#A78BFA] px-3 py-1 rounded-full font-medium w-full">
                  Buat Surat ➔
                </button>
              </div>
            ))}
          </div>

          {/* List Surat */}
          <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] overflow-hidden shadow-xl">
            <div className="p-4 bg-white/[0.02] border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
                  <span>📄</span>
                  {isAdmin ? 'Pusat Approval & Daftar Seluruh Surat Warga' : `Riwayat Permohonan Surat Pengantar - ${rtNama}`}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isAdmin ? 'Verifikasi permohonan dinas, terbitkan nomor surat resmi, dan cetak langsung' : 'Pantau nomor surat resmi dan status verifikasi tanda tangan Ketua RT 09'}
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                {!isAdmin ? (
                  <div className="bg-[#23263A] px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Arsip Pemohon:</span>
                    <span className="bg-[#7C3AED] text-white px-2.5 py-0.5 rounded-lg font-semibold flex items-center gap-1.5 shadow-sm">
                      <span>👤 {rtNama}</span>
                      <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-mono">
                        {suratList.filter(s => (s.nama || '').toLowerCase().includes(rtNama.toLowerCase()) || (s.alamat || '').toLowerCase().includes(rtBlok.toLowerCase()) || (s.nik || '') === formData.nik).length} Surat
                      </span>
                    </span>
                    {myPendingSuratCount > 0 && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                        {myPendingSuratCount} Menunggu
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="bg-[#23263A] p-1 rounded-xl border border-white/10 flex items-center gap-1 text-[11px]">
                    <button
                      onClick={() => setAdminStatusFilter('semua')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                        adminStatusFilter === 'semua' ? 'bg-[#7C3AED] text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Semua ({suratList.length})
                    </button>
                    <button
                      onClick={() => setAdminStatusFilter('pending')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
                        adminStatusFilter === 'pending' ? 'bg-amber-600 text-white' : 'text-amber-400 hover:bg-white/5'
                      }`}
                    >
                      <span>⏳ Menunggu ({pendingSuratCount})</span>
                    </button>
                    <button
                      onClick={() => setAdminStatusFilter('disetujui')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                        adminStatusFilter === 'disetujui' ? 'bg-emerald-600 text-white' : 'text-emerald-400 hover:bg-white/5'
                      }`}
                    >
                      ✓ Disetujui
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px] border-collapse">
                <thead className="text-[10px] text-slate-400 uppercase tracking-wider bg-black/20 border-b border-white/10 font-bold">
                  <tr>
                    <th className="py-3.5 px-4 w-[22%]">No. Surat</th>
                    <th className="py-3.5 px-4 w-[16%]">Template Surat</th>
                    <th className="py-3.5 px-4 w-[18%]">Pemohon</th>
                    <th className="py-3.5 px-4 w-[20%]">Keperluan / Keterangan</th>
                    <th className="py-3.5 px-4 w-[10%]">Tanggal</th>
                    <th className="py-3.5 px-4 w-[14%]">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {displayedSuratList.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400 text-xs">
                        <div className="text-2xl mb-1">📭</div>
                        Tidak ada pengajuan surat yang sesuai filter.
                      </td>
                    </tr>
                  ) : (
                    displayedSuratList.map((s, idx) => {
                      const tpl = TEMPLATE_SURAT_TYPES.find(t => t.id === s.template_type) || TEMPLATE_SURAT_TYPES[0];
                      const isMyOwn = (s.nama || '').toLowerCase().includes(rtNama.toLowerCase()) || (s.alamat || '').toLowerCase().includes(rtBlok.toLowerCase());
                      return (
                        <tr key={s.id || idx} className="hover:bg-white/[0.02] transition">
                          <td className="py-3.5 px-4 font-mono text-xs text-slate-300">
                            {s.nomor_surat !== '-' ? (
                              <span className="font-bold text-white bg-white/5 px-2 py-0.5 rounded border border-white/10">{s.nomor_surat}</span>
                            ) : (
                              <span className="text-amber-400/80 italic text-[11px]">Menunggu No. Registrasi</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-[11px] bg-[#7C3AED]/15 text-[#A78BFA] border border-[#7C3AED]/20 px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
                              <span>{tpl.icon}</span>
                              <span>{tpl.shortTitle}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-white text-xs">{s.nama}</div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-mono">NIK: {s.nik}</span>
                              {isMyOwn && !isAdmin && (
                                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-semibold">Saya</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs text-xs text-slate-300 leading-relaxed">
                            {s.keperluan || s.nama_acara}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">
                            {s.tanggal_surat}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {s.status === 'Disetujui' ? (
                              <span className="text-[11px] bg-emerald-500/15 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30 font-medium inline-flex items-center gap-1">
                                <span>✓</span> Disetujui
                              </span>
                            ) : (
                              <span className="text-[11px] bg-amber-500/15 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/30 font-medium inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                                Menunggu Approval
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {isAdmin && (
                                <button
                                  onClick={() => handleSendWaSurat(s)}
                                  title="Kirim Notifikasi Status ke WhatsApp Warga"
                                  className="bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1 active:scale-95 transition"
                                >
                                  📲 WA
                                </button>
                              )}
                              {isAdmin && s.status !== 'Disetujui' && (
                                <button
                                  onClick={() => handleApprove(s.id)}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-sm active:scale-95 transition"
                                >
                                  ✓ Approve
                                </button>
                              )}
                              <button
                                onClick={() => handlePrint(s)}
                                className="bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1 active:scale-95 transition"
                                title="Cetak Surat Pengantar Resmi"
                              >
                                🖨️ Cetak Surat
                              </button>
                            </div>
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

        {/* Modal Form Pengajuan */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
            <div className="relative z-10 bg-[#1A1D2E] border border-white/10 rounded-[24px] p-6 max-w-xl w-full my-8 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-[#7C3AED]/20 text-[#A78BFA] flex items-center justify-center font-bold">
                    📝
                  </span>
                  <div>
                    <h3 className="font-bold text-white text-[16px]">Formulir Surat Pengantar RT 09</h3>
                    <p className="text-[11px] text-slate-400">Pilih dari 5 Template Resmi RT 09 / RW 14 De Naila Village</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white text-lg cursor-pointer">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5 text-[13px]">
                <div>
                  <label className="text-slate-300 text-xs font-medium">Pilih Template Surat *</label>
                  <select
                    value={formData.template_type}
                    onChange={(e) => {
                      const newTpl = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        template_type: newTpl,
                        keperluan: newTpl === 'ktp_pindah'
                          ? `Pengurusan KTP Baru / Pindah Domisili ke Blok ${rtBlok}`
                          : newTpl === 'skck'
                          ? 'Melamar Pekerjaan / Persyaratan CPNS / Pendidikan'
                          : newTpl === 'kk'
                          ? 'Penerbitan Kartu Keluarga (KK) Baru / Perubahan Data'
                          : newTpl === 'sktm'
                          ? 'Keringanan Biaya Berobat / Beasiswa Pendidikan'
                          : 'Penyelenggaraan Syukuran / Acara Warga'
                      }));
                    }}
                    className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#7C3AED] cursor-pointer font-medium"
                  >
                    {TEMPLATE_SURAT_TYPES.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-xs">Nama Pemohon / Kepala Keluarga</label>
                    <input
                      required
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-[#7C3AED]"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs">NIK Warga</label>
                    <input
                      required
                      value={formData.nik}
                      onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono outline-none focus:border-[#7C3AED]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-xs">No. Kartu Keluarga (KK)</label>
                    <input
                      value={formData.no_kk}
                      onChange={(e) => setFormData({ ...formData, no_kk: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono outline-none focus:border-[#7C3AED]"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs">Tempat, Tanggal Lahir</label>
                    <input
                      value={formData.tempat_tgl_lahir}
                      onChange={(e) => setFormData({ ...formData, tempat_tgl_lahir: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-[#7C3AED]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-xs">Jenis Kelamin</label>
                    <select
                      value={formData.jenis_kelamin}
                      onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#7C3AED]"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs">Pekerjaan</label>
                    <input
                      value={formData.pekerjaan}
                      onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-[#7C3AED]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-xs">Alamat Domisili</label>
                  <input
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-[#7C3AED]"
                  />
                </div>

                {/* Specific Fields for Izin Acara */}
                {formData.template_type === 'keramaian' ? (
                  <div className="bg-[#23263A] p-3.5 rounded-xl border border-white/10 space-y-3 text-xs">
                    <span className="font-semibold text-[#A78BFA]">Detail Acara & Keramaian:</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-slate-400 block mb-1">Bentuk / Nama Acara</label>
                        <input
                          placeholder="Misal: Syukuran Aqiqah / Pernikahan"
                          value={formData.nama_acara}
                          onChange={(e) => setFormData({ ...formData, nama_acara: e.target.value })}
                          className="w-full bg-[#1A1D2E] border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Hari & Tanggal Acara</label>
                        <input
                          placeholder="Misal: Minggu, 30 Agustus 2026"
                          value={formData.hari_tgl_acara}
                          onChange={(e) => setFormData({ ...formData, hari_tgl_acara: e.target.value })}
                          className="w-full bg-[#1A1D2E] border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-slate-400 block mb-1">Waktu Pelaksanaan</label>
                        <input
                          value={formData.waktu_acara}
                          onChange={(e) => setFormData({ ...formData, waktu_acara: e.target.value })}
                          className="w-full bg-[#1A1D2E] border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Estimasi Jumlah Undangan</label>
                        <input
                          value={formData.estimasi_undangan}
                          onChange={(e) => setFormData({ ...formData, estimasi_undangan: e.target.value })}
                          className="w-full bg-[#1A1D2E] border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-slate-400 text-xs">Tujuan & Rincian Keperluan *</label>
                    <textarea
                      required
                      rows={2}
                      value={formData.keperluan}
                      onChange={(e) => setFormData({ ...formData, keperluan: e.target.value })}
                      className="w-full mt-1 bg-[#23263A] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-[#7C3AED]"
                    />
                  </div>
                )}

                <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-white/5 hover:bg-white/10 text-slate-300 px-4 py-2.5 rounded-xl text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-6 py-2.5 rounded-xl text-xs cursor-pointer shadow-lg shadow-[#7C3AED]/20 active:scale-95"
                  >
                    💾 Simpan & Terbitkan Surat
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
