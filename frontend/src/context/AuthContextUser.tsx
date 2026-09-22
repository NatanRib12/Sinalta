import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
  nome: string;
  empresa: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('sinalta_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('sinalta_user');
      }
    }
  }, []);

  const login = (email: string, pass: string): boolean => {
    // Autenticação simples para homologação do cliente Laticínio Vale do Cedro
    if (email && pass) {
      const userData: User = {
        email,
        nome: 'Otávio',
        empresa: 'Laticínio Vale do Cedro',
      };
      setUser(userData);
      localStorage.setItem('sinalta_user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sinalta_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);