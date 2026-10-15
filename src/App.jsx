import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Warga = lazy(() => import('./pages/Warga'));
const Iuran = lazy(() => import('./pages/Iuran'));
const Keuangan = lazy(() => import('./pages/Keuangan'));
const Surat = lazy(() => import('./pages/Surat'));
const Inventaris = lazy(() => import('./pages/Inventaris'));
const Pengumuman = lazy(() => import('./pages/Pengumuman'));
const Pengaturan = lazy(() => import('./pages/Pengaturan'));

function PageLoader() {
  return (
    <div className="min-h-screen bg-[#0B0E1A] flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 border-4 border-[#7C3AED]/20 border-t-[#7C3AED] rounded-full animate-spin"></div>
      <p className="text-slate-400 text-xs tracking-wider animate-pulse font-mono">Memuat Halaman RT 09...</p>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const rtUserId = localStorage.getItem('rt_user_id');
  if (!rtUserId) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/warga" element={<ProtectedRoute><Warga /></ProtectedRoute>} />
          <Route path="/iuran" element={<ProtectedRoute><Iuran /></ProtectedRoute>} />
          <Route path="/keuangan" element={<ProtectedRoute><Keuangan /></ProtectedRoute>} />
          <Route path="/surat" element={<ProtectedRoute><Surat /></ProtectedRoute>} />
          <Route path="/inventaris" element={<ProtectedRoute><Inventaris /></ProtectedRoute>} />
          <Route path="/pengumuman" element={<ProtectedRoute><Pengumuman /></ProtectedRoute>} />
          <Route path="/pengaturan" element={<ProtectedRoute><Pengaturan /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
