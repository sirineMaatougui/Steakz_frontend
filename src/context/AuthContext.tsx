import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, TOKEN_KEY } from '../lib/api';
import type { AuthResponse, User } from '../lib/types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, name: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<{ data: User }>('/auth/me')
      .then((res) => setUser(res.data.data))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  function persist(res: AuthResponse): User {
    localStorage.setItem(TOKEN_KEY, res.token);
    setUser(res.user);
    return res.user;
  }

  async function login(email: string, password: string): Promise<User> {
    const res = await api.post<{ data: AuthResponse }>('/auth/login', { email, password });
    return persist(res.data.data);
  }

  async function register(email: string, password: string, name: string): Promise<User> {
    const res = await api.post<{ data: AuthResponse }>('/auth/register', { email, password, name });
    return persist(res.data.data);
  }

  function logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
