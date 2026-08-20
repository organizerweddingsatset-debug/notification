-- ================================================================
-- SKEMA BERSIH DATABASE SUPABASE PORTAL RT 09 / RW 14
-- PERUMAHAN DE NAILA VILLAGE BLOK G
-- Desa Sumputsarirejo, Kecamatan Driyorejo, Kab. Gresik
-- Email Resmi: denailavillageRT09@gmail.com
-- ================================================================
-- Jalankan skrip ini langsung di SQL Editor Dashboard Supabase Anda:
-- https://supabase.com/dashboard/project/_/sql
-- ================================================================

-- 1. TABEL USERS (Otentikasi & Role)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  username TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'warga', -- 'warga', 'admin_rt', 'ketua_rt', 'sekretaris', 'bendahara'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABEL WARGA_PROFILES (Biodata Lengkap Kependudukan)
CREATE TABLE IF NOT EXISTS public.warga_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE,
  nik VARCHAR(20),
  no_kk VARCHAR(20),
  nama_lengkap VARCHAR(150) NOT NULL,
  nama_panggilan VARCHAR(50),
  jenis_kelamin VARCHAR(20) DEFAULT 'Laki-laki',
  tempat_lahir VARCHAR(100),
  tanggal_lahir VARCHAR(50),
  agama VARCHAR(30) DEFAULT 'Islam',
  golongan_darah VARCHAR(10) DEFAULT 'O+',
  status_perkawinan VARCHAR(30) DEFAULT 'Kawin',
  pekerjaan VARCHAR(100),
  kewarganegaraan VARCHAR(30) DEFAULT 'WNI',
  pendidikan VARCHAR(50),
  no_whatsapp VARCHAR(30),
  email VARCHAR(100),
  kontak_darurat VARCHAR(150),
  blok_rumah VARCHAR(20) DEFAULT 'Blok G',
  nomor_rumah VARCHAR(10) DEFAULT '-',
  rt_rw VARCHAR(30) DEFAULT 'RT 09 / RW 14',
  perumahan VARCHAR(100) DEFAULT 'De Naila Village Blok G',
  kelurahan VARCHAR(100) DEFAULT 'Sumputsarirejo',
  kecamatan VARCHAR(100) DEFAULT 'Driyorejo',
  kota VARCHAR(100) DEFAULT 'Kab. Gresik, Jawa Timur',
  kode_pos VARCHAR(10) DEFAULT '61174',
  status_rumah VARCHAR(50) DEFAULT 'Milik Sendiri (Warga Tetap)',
  tahun_menetap VARCHAR(50) DEFAULT '2022',
  daya_listrik VARCHAR(30) DEFAULT '2200 VA',
  keluarga JSONB DEFAULT '[]'::jsonb,
  kendaraan JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABEL IURAN & TAGIHAN
CREATE TABLE IF NOT EXISTS public.tagihan_iuran (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blok_rumah VARCHAR(20) NOT NULL,
  nama_warga VARCHAR(100) NOT NULL,
  nik VARCHAR(30),
  jenis_tagihan VARCHAR(100) NOT NULL,
  periode VARCHAR(50) NOT NULL,
  nominal NUMERIC(12,2) NOT NULL,
  status VARCHAR(30) DEFAULT 'Belum Lunas', -- 'Lunas', 'Belum Lunas'
  tanggal_bayar TIMESTAMPTZ,
  metode_bayar VARCHAR(50), -- 'QRIS', 'Transfer', 'Tunai'
  no_kwitansi VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. TABEL KEUANGAN KAS RT
CREATE TABLE IF NOT EXISTS public.kas_keuangan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal DATE DEFAULT CURRENT_DATE,
  kategori VARCHAR(30) NOT NULL, -- 'Pemasukan', 'Pengeluaran'
  jenis_transaksi VARCHAR(100) DEFAULT 'Iuran Wajib Bulanan',
  nama_warga VARCHAR(150),
  blok_rumah VARCHAR(20),
  periode VARCHAR(50),
  keterangan TEXT NOT NULL,
  nominal NUMERIC(12,2) NOT NULL,
  metode_bayar VARCHAR(50) DEFAULT 'QRIS',
  bukti_nota TEXT,
  pj VARCHAR(100) DEFAULT 'Bendahara RT',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. TABEL SURAT PENGANTAR (5 Template Standar)
CREATE TABLE IF NOT EXISTS public.surat_pengantar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type VARCHAR(50) DEFAULT 'ktp_pindah', -- 'ktp_pindah', 'skck', 'kk', 'sktm', 'keramaian'
  blok_rumah VARCHAR(20) NOT NULL,
  nama_pemohon VARCHAR(150) NOT NULL,
  nik VARCHAR(30),
  no_kk VARCHAR(30),
  tempat_tgl_lahir VARCHAR(150),
  jenis_kelamin VARCHAR(20) DEFAULT 'Laki-laki',
  agama VARCHAR(30) DEFAULT 'Islam',
  pekerjaan VARCHAR(100),
  alamat TEXT,
  status_tinggal VARCHAR(50) DEFAULT 'Tetap',
  no_hp VARCHAR(30),
  jenis_surat VARCHAR(150) NOT NULL,
  keperluan TEXT NOT NULL,
  nama_acara VARCHAR(150),
  hari_tgl_acara VARCHAR(100),
  waktu_acara VARCHAR(50),
  lokasi_acara TEXT,
  estimasi_undangan VARCHAR(50),
  status VARCHAR(30) DEFAULT 'Menunggu Approval', -- 'Disetujui', 'Ditolak', 'Menunggu Approval'
  nomor_surat VARCHAR(100),
  tanggal_approval VARCHAR(50),
  pj_penandatangan VARCHAR(100) DEFAULT 'Ketua RT 09',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. TABEL INVENTARIS RT
CREATE TABLE IF NOT EXISTS public.inventaris_rt (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_barang VARCHAR(150) NOT NULL,
  kategori VARCHAR(100) DEFAULT 'Perlengkapan Acara',
  jumlah_total INT DEFAULT 1,
  tersedia INT DEFAULT 1,
  kondisi VARCHAR(50) DEFAULT 'Baik & Layak Pakai',
  icon VARCHAR(20) DEFAULT '📦',
  lokasi VARCHAR(150) DEFAULT 'Gudang Pos Satpam Blok G',
  keterangan TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. TABEL PEMINJAMAN INVENTARIS (Approval & Reject dengan Alasan)
CREATE TABLE IF NOT EXISTS public.peminjaman_inventaris (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_peminjam VARCHAR(150) NOT NULL,
  blok_rumah VARCHAR(20) NOT NULL,
  no_hp VARCHAR(30),
  barang_id TEXT,
  barang_nama VARCHAR(150) NOT NULL,
  icon VARCHAR(20) DEFAULT '📦',
  jumlah_pinjam INT DEFAULT 1,
  tanggal_pinjam DATE NOT NULL,
  tanggal_kembali DATE NOT NULL,
  keperluan TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'Menunggu Approval', -- 'Menunggu Approval', 'Disetujui', 'Ditolak', 'Dikembalikan'
  alasan_reject TEXT,
  tanggal_approval VARCHAR(50),
  pj_approval VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. TABEL PENGUMUMAN RT
CREATE TABLE IF NOT EXISTS public.pengumuman (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judul VARCHAR(200) NOT NULL,
  kategori VARCHAR(50) DEFAULT 'Umum',
  konten TEXT NOT NULL,
  penulis VARCHAR(100) DEFAULT 'Pengurus RT 09 / RW 14',
  pin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES (Buka izin baca & tulis publik/anon)
-- ================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warga_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tagihan_iuran ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kas_keuangan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surat_pengantar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventaris_rt ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peminjaman_inventaris ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengumuman ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read users" ON public.users;
DROP POLICY IF EXISTS "Allow public all warga_profiles" ON public.warga_profiles;
DROP POLICY IF EXISTS "Allow public all tagihan_iuran" ON public.tagihan_iuran;
DROP POLICY IF EXISTS "Allow public all kas_keuangan" ON public.kas_keuangan;
DROP POLICY IF EXISTS "Allow public all surat_pengantar" ON public.surat_pengantar;
DROP POLICY IF EXISTS "Allow public all inventaris_rt" ON public.inventaris_rt;
DROP POLICY IF EXISTS "Allow public all peminjaman_inventaris" ON public.peminjaman_inventaris;
DROP POLICY IF EXISTS "Allow public all pengumuman" ON public.pengumuman;

CREATE POLICY "Allow public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public all warga_profiles" ON public.warga_profiles FOR ALL USING (true);
CREATE POLICY "Allow public all tagihan_iuran" ON public.tagihan_iuran FOR ALL USING (true);
CREATE POLICY "Allow public all kas_keuangan" ON public.kas_keuangan FOR ALL USING (true);
CREATE POLICY "Allow public all surat_pengantar" ON public.surat_pengantar FOR ALL USING (true);
CREATE POLICY "Allow public all inventaris_rt" ON public.inventaris_rt FOR ALL USING (true);
CREATE POLICY "Allow public all peminjaman_inventaris" ON public.peminjaman_inventaris FOR ALL USING (true);
CREATE POLICY "Allow public all pengumuman" ON public.pengumuman FOR ALL USING (true);

-- ================================================================
-- AKUN UTAMA ADMINISTRATOR RT 09 (Satu-satunya Akun Awal Sistem)
-- ================================================================
INSERT INTO public.users (email, username, role)
VALUES ('admin@rt9.com', 'admin_rt', 'admin_rt')
ON CONFLICT (username) DO NOTHING;

INSERT INTO public.warga_profiles (
  user_id, nik, no_kk, nama_lengkap, nama_panggilan, jenis_kelamin, tempat_lahir, tanggal_lahir,
  agama, golongan_darah, status_perkawinan, pekerjaan, kewarganegaraan, pendidikan,
  no_whatsapp, email, kontak_darurat, blok_rumah, nomor_rumah, rt_rw, perumahan,
  kelurahan, kecamatan, kota, kode_pos, status_rumah, tahun_menetap, daya_listrik,
  keluarga, kendaraan
) VALUES (
  'admin_rt',
  '3525120101750001',
  '3525120101000001',
  'Admin Pengurus RT 09',
  'Admin RT',
  'Laki-laki',
  'Gresik',
  '01 Januari 1980',
  'Islam',
  'O+',
  'Kawin',
  'Pengurus RT 09 / RW 14',
  'WNI',
  'Sarjana',
  '0812-9999-8888',
  'denailavillageRT09@gmail.com',
  'Pos Satpam Blok G',
  'Pos RT',
  'Pos',
  'RT 09 / RW 14',
  'De Naila Village Blok G',
  'Sumputsarirejo',
  'Driyorejo',
  'Kab. Gresik, Jawa Timur',
  '61174',
  'Milik Sendiri (Kantor / Pos RT)',
  '2022',
  '2200 VA',
  '[]'::jsonb,
  '[]'::jsonb
)
ON CONFLICT (user_id) DO UPDATE SET
  nama_lengkap = EXCLUDED.nama_lengkap,
  rt_rw = EXCLUDED.rt_rw,
  perumahan = EXCLUDED.perumahan,
  kelurahan = EXCLUDED.kelurahan,
  kecamatan = EXCLUDED.kecamatan,
  updated_at = now();

-- 8. TABEL WHATSAPP BOT SESSIONS (Penyimpanan Sesi Persistent Baileys)
CREATE TABLE IF NOT EXISTS public.whatsapp_sessions (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

