/**
 * Standard utility formatters for Portal RT 09
 */

// Indonesian Rupiah Formatter
export const formatRupiah = (nominal) => {
  const num = Number(nominal) || 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(num);
};

// Short format (e.g. Rp 1.5 jt, Rp 80 rb)
export const formatRupiahShort = (nominal) => {
  const n = Number(nominal) || 0;
  if (Math.abs(n) >= 1000000) {
    return `Rp ${(n / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
  }
  if (Math.abs(n) >= 1000) {
    return `Rp ${(n / 1000).toLocaleString('id-ID', { maximumFractionDigits: 0 })} rb`;
  }
  return formatRupiah(n);
};

// Terbilang Nominal Bahasa Indonesia
export const getTerbilang = (nominal) => {
  const bilangan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
  let val = Math.floor(Math.abs(Number(nominal) || 0));
  if (val < 12) {
    return bilangan[val];
  } else if (val < 20) {
    return getTerbilang(val - 10) + ' Belas';
  } else if (val < 100) {
    return getTerbilang(Math.floor(val / 10)) + ' Puluh ' + getTerbilang(val % 10);
  } else if (val < 200) {
    return 'Seratus ' + getTerbilang(val - 100);
  } else if (val < 1000) {
    return getTerbilang(Math.floor(val / 100)) + ' Ratus ' + getTerbilang(val % 100);
  } else if (val < 2000) {
    return 'Seribu ' + getTerbilang(val - 1000);
  } else if (val < 1000000) {
    return getTerbilang(Math.floor(val / 1000)) + ' Ribu ' + getTerbilang(val % 1000);
  } else if (val < 1000000000) {
    return getTerbilang(Math.floor(val / 1000000)) + ' Juta ' + getTerbilang(val % 1000000);
  } else if (val < 1000000000000) {
    return getTerbilang(Math.floor(val / 1000000000)) + ' Milyar ' + getTerbilang(val % 1000000000);
  }
  return '';
};

// Clean and derive standardized citizen credential
export const getWargaCredentials = (nama, blok) => {
  if (!nama) return { username: 'wargaG00', password: 'wargaG00' };
  const firstWord = nama.trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanBlok = (blok || 'G00').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const cred = `${firstWord}${cleanBlok}`;
  return { username: cred, password: cred };
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
