import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext.jsx';
import ProtectedRoute from './auth/ProtectedRoute.jsx';
import AppLayout from './components/AppLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import CriticalPage from './pages/CriticalPage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';

const roles = {
  dashboard: ['Administrador', 'Gerente'],
  critical: ['Administrador', 'Gerente', 'Estoquista'],
  products: ['Administrador', 'Gerente', 'Estoquista', 'Vendedor', 'Funcionário'],
};

function LoginRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <main className="route-loading" aria-label="Validando sessão"><span /></main>;
  if (user) return <Navigate to={user.nivel === 'Vendedor' || user.nivel === 'Estoquista' || user.nivel === 'Funcionário' ? '/produtos' : '/dashboard'} replace />;
  return <LoginPage />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route element={<ProtectedRoute allowedRoles={['Administrador', 'Gerente', 'Estoquista', 'Vendedor', 'Funcionário']} />}>
        <Route element={<AppLayout />}>
          <Route element={<ProtectedRoute allowedRoles={roles.dashboard} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={roles.critical} />}>
            <Route path="/critico" element={<CriticalPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={roles.products} />}>
            <Route path="/produtos" element={<ProductsPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}