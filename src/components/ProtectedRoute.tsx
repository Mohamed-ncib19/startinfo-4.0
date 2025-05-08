import { useAuth } from '@/contexts/auth-context';
import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  console.log(user);
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}