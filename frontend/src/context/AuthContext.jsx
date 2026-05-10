import { createContext, useContext, useState, useEffect } from 'react';

/**
 * AuthContext — global auth state using React Context API.
 *
 * Why Context API instead of Redux?
 * For a small app like this, Context API is enough.
 * Redux would be overkill and harder to learn for a junior developer.
 *
 * The token and user object are persisted in localStorage so the user
 * stays logged in after a page refresh.
 */

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true); // true until we check localStorage

  // On first load, restore session from localStorage (if any)
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser  = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Listen for 401 signals from the axios interceptor and clear auth state
  // so ProtectedRoute redirects naturally without a hard page reload
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook — components call useAuth() instead of useContext(AuthContext) directly
export const useAuth = () => useContext(AuthContext);
