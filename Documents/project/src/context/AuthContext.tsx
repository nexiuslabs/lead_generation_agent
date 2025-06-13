import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Validate token format (should be a string containing two dots for JWT structure)
      if (typeof token !== 'string' || token.split('.').length !== 3) {
        console.error('Invalid token format');
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        // Additional validation: check if token is expired
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp < currentTime) {
          throw new Error('Token expired');
        }
        setUser(decoded);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
      }
    }
  }, []);

  const login = (token: string) => {
    if (typeof token !== 'string' || token.split('.').length !== 3) {
      console.error('Invalid token format provided to login');
      return;
    }
    
    try {
      const decoded = jwtDecode(token);
      localStorage.setItem('token', token);
      setUser(decoded);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to decode token during login:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');

    localStorage.removeItem('email');

    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;