
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Warga from './pages/Warga';
import Iuran from './pages/Iuran';
import Keuangan from './pages/Keuangan';
import Surat from './pages/Surat';
import Inventaris from './pages/Inventaris';
import Pengumuman from './pages/Pengumuman';
import Pengaturan from './pages/Pengaturan';

function ProtectedRoute({ children }){
  const rtUserId = localStorage.getItem('rt_user_id');
  if(!rtUserId){
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App(){
  return (
    <BrowserRouter>
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
      </Routes>
    </BrowserRouter>
  );
}
