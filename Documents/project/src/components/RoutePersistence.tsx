import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Persists the last visited route and restores it after reload if authenticated.
 * Place this component at the top level (e.g., in App.tsx or MainContent).
 */
const RoutePersistence: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Store every route change
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('lastRoute', location.pathname + location.search);
    }
  }, [location, isAuthenticated]);

  // On mount, restore last route if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const lastRoute = localStorage.getItem('lastRoute');
      if (
        lastRoute &&
        lastRoute !== location.pathname + location.search &&
        lastRoute !== '/login'
      ) {
        navigate(lastRoute, { replace: true });
      }
    }
    // Only run on mount
    // eslint-disable-next-line
  }, [isAuthenticated]);

  return null;
};

export default RoutePersistence;
