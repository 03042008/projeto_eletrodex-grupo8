import { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../api/client.js';

const AuthContext = createContext(null);
const TOKEN_KEY = 'eletrodex-token';
const USER_KEY = 'eletrodex-user';

function saveSession(token, user) {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  sessionStorage.removeItem('eletrodex-authenticated');
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return undefined;
    }

    let active = true;
    apiRequest('/funcionarios/sessao', { token })
      .then(({ usuario }) => {
        if (!active) return;
        setUser(usuario);
        sessionStorage.setItem(USER_KEY, JSON.stringify(usuario));
      })
      .catch(() => {
        if (!active) return;
        clearSession();
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  async function login(email, senha) {
    const result = await apiRequest('/funcionarios/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });
    saveSession(result.token, result.usuario);
    setToken(result.token);
    setUser(result.usuario);
    return result.usuario;
  }

  async function register(formData) {
    return apiRequest('/funcionarios/cadastro', {
      method: 'POST',
      body: JSON.stringify({
        nome: formData.nome,
        email: formData.email,
        cpf: formData.cpf,
        senha: formData.senha,
      }),
    });
  }

  async function logout() {
    const currentToken = token;
    clearSession();
    setToken(null);
    setUser(null);
    if (!currentToken) return;

    try {
      await apiRequest('/funcionarios/logout', {
        method: 'POST',
        token: currentToken,
      });
    } catch {
      // A sessão local já foi removida; tokens do servidor expiram em até 8 horas.
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return context;
}