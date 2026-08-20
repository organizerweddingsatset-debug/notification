import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const PRESET_ACCOUNTS = {
  'admin_rt': {
    password: 'admin123',
    role: 'admin_rt',
    username: 'admin_rt',
    nama: 'Admin RT 09',
    blok: 'Pos RT',
    wa: '0812-9999-8888',
    id: 'demo-user-admin',
  }
};

export default function Login() {
  const [username, setUsername] = useState('danielG43');
  const [password, setPassword] = useState('danielG43');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fillDemo = (u, p) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanUsername = (username || '').trim();
    const cleanPassword = (password || '').trim();
    const lowerUser = cleanUsername.toLowerCase();

    // 1. Check Admin Account
    if (PRESET_ACCOUNTS[lowerUser] && PRESET_ACCOUNTS[lowerUser].password === cleanPassword) {
      const acc = PRESET_ACCOUNTS[lowerUser];
      localStorage.setItem('rt_user_id', acc.id);
      localStorage.setItem('rt_user_role', acc.role);
      localStorage.setItem('rt_username', acc.username);
      localStorage.setItem('rt_nama', acc.nama);
      localStorage.setItem('rt_blok', acc.blok);
      localStorage.setItem('rt_wa', acc.wa);
      navigate('/dashboard');
      return;
    }

    // 2. Check Registered Warga Profiles in LocalStorage using new credential rule: [namaDepan][cleanBlok]
    let allWarga = [];
    try {
      const saved = localStorage.getItem('rt_all_warga_profiles');
      if (saved) allWarga = JSON.parse(saved);
    } catch (err) { }

    const matchedWarga = allWarga.find(w => {
      const cred = getWargaCredentials(w.nama_lengkap, w.blok_rumah);
      const isUserMatch = lowerUser === cred.username.toLowerCase() || lowerUser === (w.nama_panggilan || '').toLowerCase() || lowerUser === (w.user_id || '').toLowerCase();
      const isPassMatch = cleanPassword === cred.password || cleanPassword === '123456';
      return isUserMatch && isPassMatch;
    });

    if (matchedWarga) {
      localStorage.setItem('rt_user_id', matchedWarga.id || matchedWarga.user_id || 'warga-' + Date.now());
      localStorage.setItem('rt_user_role', 'warga');
      localStorage.setItem('rt_username', cleanUsername);
      localStorage.setItem('rt_nama', matchedWarga.nama_lengkap || matchedWarga.nama_panggilan);
      localStorage.setItem('rt_blok', matchedWarga.blok_rumah || 'G-43');
      localStorage.setItem('rt_wa', matchedWarga.no_whatsapp || '-');
      navigate('/dashboard');
      return;
    }

    // 3. Fallback: Check if input username equals password according to formula (e.g. danielG43 / danielG43)
    // Matches pattern: [letters][G][numbers]
    const formulaMatch = cleanUsername.match(/^([a-zA-Z]+)(G|g)-?(\d+)$/i);
    if (formulaMatch && cleanUsername.toLowerCase() === cleanPassword.toLowerCase()) {
      const namePart = formulaMatch[1].charAt(0).toUpperCase() + formulaMatch[1].slice(1).toLowerCase();
      const blokPart = `G-${formulaMatch[3]}`;
      
      localStorage.setItem('rt_user_id', 'warga-' + cleanUsername.toLowerCase());
      localStorage.setItem('rt_user_role', 'warga');
      localStorage.setItem('rt_username', cleanUsername);
      localStorage.setItem('rt_nama', namePart);
      localStorage.setItem('rt_blok', blokPart);
      localStorage.setItem('rt_wa', '0812-3456-7890');
      navigate('/dashboard');
      return;
    }

    // 4. Try Supabase Authentication for Cloud Users
    try {
      const emailFormat = cleanUsername.includes('@') ? cleanUsername : `${cleanUsername}@rt9.com`;
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailFormat,
        password: cleanPassword
      });

      if (!authError && authData?.user) {
        let role = 'warga', uname = cleanUsername, nama = cleanUsername, blok = 'G-43', wa = '-';
        try {
          const { data: u } = await supabase.from('users').select('role, username').eq('id', authData.user.id).maybeSingle();
          if (u) { role = u.role || 'warga'; uname = u.username || cleanUsername; }
          const { data: p } = await supabase.from('warga_profiles').select('nama_lengkap, blok_rumah, no_whatsapp').eq('user_id', authData.user.id).maybeSingle();
          if (p) { nama = p.nama_lengkap || uname; blok = p.blok_rumah || 'G-43'; wa = p.no_whatsapp || '-'; }
        } catch (err) { }

        localStorage.setItem('rt_user_id', authData.user.id);
        localStorage.setItem('rt_user_role', role);
        localStorage.setItem('rt_username', uname);
        localStorage.setItem('rt_nama', nama);
        localStorage.setItem('rt_blok', blok);
        localStorage.setItem('rt_wa', wa);

        navigate('/dashboard');
        return;
      }
    } catch (err) { }

    setError('Username atau Password salah!\n\nFormat login warga: [namaDepan][Blok]\nContoh: danielG43 (Password: danielG43)');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0E1A] flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-[#1A1D2E] border border-white/10 rounded-[24px] p-7 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] rounded-xl flex items-center justify-center mx-auto font-bold text-white shadow-lg shadow-[#7C3AED]/25">
            RT
          </div>
          <h1 className="text-white font-bold text-[18px] mt-3">Portal RT 09 / RW 14</h1>
          <p className="text-[12px] text-slate-400 mt-1">De Naila Village Blok G • Sumputsarirejo, Driyorejo</p>
          
          <div className="mt-3 bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#C4B5FD] text-[11px] py-1.5 px-3 rounded-xl font-mono">
            Rule Login: [namaDepan][Blok] (Contoh: danielG43)
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <label className="text-slate-400 text-xs font-medium block mb-1">Username Login</label>
            <input
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Contoh: danielG43"
              className="w-full bg-[#23263A] border border-white/10 rounded-xl px-4 py-2.5 text-white text-[13px] font-mono outline-none focus:border-[#7C3AED]"
            />
          </div>

          <div>
            <label className="text-slate-400 text-xs font-medium block mb-1">Password</label>
            <input
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              type="password"
              placeholder="Password (sama dengan username)"
              className="w-full bg-[#23263A] border border-white/10 rounded-xl px-4 py-2.5 text-white text-[13px] font-mono outline-none focus:border-[#7C3AED]"
            />
          </div>

          {error && (
            <div className="bg-red-500/15 border border-red-500/20 text-red-400 text-[11px] p-3 rounded-xl leading-relaxed whitespace-pre-line">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-3 rounded-xl font-semibold text-[13px] transition active:scale-[0.99] cursor-pointer disabled:opacity-50 shadow-lg shadow-[#7C3AED]/25 mt-2"
          >
            {loading ? 'Memproses Masuk...' : 'Masuk ke Portal'}
          </button>
        </form>

        {/* Quick Fill Demo Accounts */}
        <div className="mt-5 pt-4 border-t border-white/5 space-y-2">
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider text-center">
            Pilihan Akun Uji Coba:
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => fillDemo('danielG43', 'danielG43')}
              className="bg-white/5 hover:bg-white/10 active:scale-95 transition border border-white/10 rounded-xl p-2.5 text-left cursor-pointer"
            >
              <div className="text-slate-400 flex items-center justify-between text-[10px]">
                <span>Warga (Blok G-43)</span>
                <span className="text-[9px] text-[#A78BFA] bg-[#7C3AED]/20 px-1 py-0.2 rounded">Isi</span>
              </div>
              <div className="text-white font-mono font-bold mt-1 text-[11px]">danielG43</div>
            </button>

            <button
              type="button"
              onClick={() => fillDemo('admin_rt', 'admin123')}
              className="bg-white/5 hover:bg-white/10 active:scale-95 transition border border-white/10 rounded-xl p-2.5 text-left cursor-pointer"
            >
              <div className="text-slate-400 flex items-center justify-between text-[10px]">
                <span>Pengurus Admin</span>
                <span className="text-[9px] text-emerald-400 bg-emerald-500/20 px-1 py-0.2 rounded">Isi</span>
              </div>
              <div className="text-white font-mono font-bold mt-1 text-[11px]">admin_rt</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
