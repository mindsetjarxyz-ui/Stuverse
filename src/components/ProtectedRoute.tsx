import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAppStore } from '../store/useAppStore';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const { syncWithDatabase, lastClaimDate } = useAppStore();

  useEffect(() => {
    if (user && !loading) {
      // Initial sync on mount
      syncWithDatabase(user.id);

      // Check for day change every 10 seconds
      const interval = setInterval(() => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;
        
        if (today !== lastClaimDate) {
          syncWithDatabase(user.id);
        }
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [user, loading, syncWithDatabase, lastClaimDate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
