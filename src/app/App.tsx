import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/app/context/AuthContext';
import { Login } from '@/app/components/Login';
import { Registration } from '@/app/components/Registration';
import { AdminPanel } from '@/app/components/AdminPanel';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';
import { NotificationProvider } from '@/app/components/NotificationProvider';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registration />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
