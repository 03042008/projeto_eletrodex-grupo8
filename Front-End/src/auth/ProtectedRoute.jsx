import { Navigate, Outlet, useLocation, useOutletContext } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

export function homeForRole(role) {
  return ['Administrador', 'Gerente'].includes(role) ? '/dashboard' : '/produtos';
}

export default function ProtectedRoute({ allowedRoles }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const outletContext = useOutletContext();

  if (isLoading) {
    return <main className="route-loading" aria-label="Validando sessão"><span /></main>;
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!allowedRoles.includes(user.nivel)) {
    return <Navigate to={homeForRole(user.nivel)} replace state={{ denied: true }} />;
  }

  return <Outlet context={outletContext} />;
}