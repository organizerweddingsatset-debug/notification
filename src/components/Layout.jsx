import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ nama: 'Warga', blok: 'G-12', user: 'warga', role: 'warga' });

  useEffect(() => {
    const rtNama = localStorage.getItem('rt_nama') || localStorage.getItem('rt_username') || 'Daniel';
    const rtBlok = localStorage.getItem('rt_blok') || 'G-12';
    const rtUser = localStorage.getItem('rt_username') || 'daniel';
    const rtRole = localStorage.getItem('rt_user_role') || 'warga';
    const finalNama = rtNama && rtNama !== '-' ? rtNama : rtUser;
    const finalBlok = rtBlok && rtBlok !== '-' ? rtBlok : 'G-12';
    
    let nama = finalNama;
    let blok = finalBlok === 'G-01' ? 'Pos RT' : finalBlok;
    
    if (rtRole === 'admin_rt') {
      nama = 'Admin RT 09';
      blok = 'Pos RT';
    } else if (rtUser.toLowerCase() === 'daniel') {
      nama = 'Daniel';
    }

    setProfile({ nama, blok, user: rtUser, role: rtRole });

    // Cek session
    const rtUserId = localStorage.getItem('rt_user_id');
    if(!rtUserId){
      navigate('/');
    }
  }, [location.pathname]);

  const isAdmin = ['superadmin','ketua_rt','sekretaris','bendahara','admin','admin_rt'].includes(profile.role);

  const menu = [
    { path: '/dashboard', label: '📊 Dashboard', id: 'dashboard', adminOnly: false },
    { path: '/warga', label: profile.role === 'warga' ? '👤 Biodata Pribadi' : '👥 Data Warga', id: 'warga', adminOnly: false },
    { path: '/iuran', label: '💳 Iuran & Tagihan', id: 'iuran', adminOnly: false },
    { path: '/keuangan', label: '💰 Keuangan', id: 'keuangan', adminOnly: true },
    { path: '/surat', label: '📄 Surat', id: 'surat', adminOnly: false },
    { path: '/inventaris', label: '📦 Inventaris', id: 'inventaris', adminOnly: false },
    { path: '/pengumuman', label: '📢 Pengumuman', id: 'pengumuman', adminOnly: false },
    { path: '/pengaturan', label: '⚙️ Pengaturan', id: 'pengaturan', adminOnly: true },
  ];

  const logout = async () => {
    try { await supabase.auth.signOut(); } catch (e) { }
    localStorage.removeItem('rt_user_id');
    localStorage.removeItem('rt_user_role');
    localStorage.removeItem('rt_username');
    localStorage.removeItem('rt_nama');
    localStorage.removeItem('rt_blok');
    localStorage.removeItem('rt_wa');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0B0E1A] text-[#E2E8F0] print:min-h-0 print:bg-white print:text-black print:m-0 print:p-0">
      {/* Header - Sembunyikan Saat Print */}
      <header className="sticky top-0 z-40 bg-[#0B0E1A]/90 backdrop-blur border-b border-white/10 print:hidden">
        <div className="max-w-[1600px] mx-auto px-4 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex items-center justify-center font-bold text-white">RT</div>
            <div>
              <h1 className="font-bold text-white text-[14px]">Halo, {profile.nama} 👋</h1>
              <p className="text-[11px] text-slate-400">{profile.blok} • {profile.nama} • RT 09 / RW 14 De Naila Village Blok G</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-white/5 border border-white/10 px-3 py-1 rounded-full">{profile.role}</span>
            <button onClick={logout} className="text-[12px] bg-white/5 border border-white/10 px-4 py-2 rounded-full cursor-pointer">Logout</button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto p-4 grid grid-cols-12 gap-5 print:block print:p-0 print:m-0 print:w-full print:max-w-none">
        {/* Sidebar - Sembunyikan Saat Print */}
        <aside className="col-span-12 lg:col-span-2 print:hidden">
          <div className="bg-[#1A1D2E] border border-white/10 rounded-[24px] p-3 sticky top-[84px]">
            <p className="text-[10px] text-slate-500 font-semibold tracking-widest px-3 mb-3">MENU {profile.role === 'warga' ? 'WARGA' : 'ADMIN'}</p>
            <nav className="space-y-1">
              {menu.filter(m => !m.adminOnly || isAdmin).map(m => {
                const active = location.pathname === m.path;
                return (
                  <Link key={m.id} to={m.path} className={`block px-3 py-2.5 rounded-xl text-[13px] transition ${active ? 'bg-[#7C3AED] text-white' : 'hover:bg-white/5 text-slate-400'}`}>
                    {m.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-5 pt-4 border-t border-white/5">
              <div className="bg-gradient-to-br from-[#7C3AED]/20 to-[#1E1B4B] border border-[#7C3AED]/20 rounded-xl p-3">
                <div className="text-[10px] text-slate-400">Login sebagai</div>
                <div className="text-[13px] font-bold text-white mt-1">{profile.nama}</div>
                <div className="text-[11px] text-slate-400">{profile.blok} • {profile.user} • {profile.role}</div>
                <div className="text-[10px] text-green-400 mt-2">● Personal Active</div>
              </div>
            </div>
          </div>
        </aside>
        
        {/* Main Content Area */}
        <main className="col-span-12 lg:col-span-10 print:col-span-12 print:block print:w-full print:p-0 print:m-0">
          {children}
        </main>
      </div>
    </div>
  );
}
