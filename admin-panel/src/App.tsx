import { Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { RequireAdmin } from './components/RequireAdmin';
import { AuthProvider } from './hooks/useAdminAuth';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={<RequireAdmin><DashboardPage /></RequireAdmin>} />
      </Routes>
    </AuthProvider>
  );
}
