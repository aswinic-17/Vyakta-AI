
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: () => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  authFetch: (
    input: RequestInfo | URL,
    init?: RequestInit
  ) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

const TOKEN_KEY = 'vyakta_auth_token';

// API URL:
// Leave empty when using a Netlify proxy.
// Otherwise set VITE_API_URL in your .env file.
const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

const apiUrl = (endpoint: string) => {
  return `${API_URL}/api${endpoint}`;
};

const getStoredToken = (): string | null => {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

const setStoredToken = (value: string | null) => {
  try {
    if (value) {
      sessionStorage.setItem(TOKEN_KEY, value);
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore storage errors
  }

  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Ignore
  }
};

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [token, setToken] = useState<string | null>(
    () => getStoredToken()
  );

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    const activeToken = token || getStoredToken();

    if (activeToken) {
      try {
        await fetch(apiUrl('/auth/logout'), {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${activeToken}`,
          },
        });
      } catch {
        // Ignore network errors during logout
      }
    }

    setToken(null);
    setUser(null);
    setStoredToken(null);
  }, [token]);

  const authFetch = useCallback(
    async (
      input: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> => {
      const headers = new Headers(init?.headers);
      const activeToken = token || getStoredToken();

      if (activeToken) {
        headers.set('Authorization', `Bearer ${activeToken}`);
      }

      const response = await fetch(input, {
        ...init,
        headers,
      });

      if (response.status === 401) {
        console.warn('Unauthorized. Logging out.');
        await logout();
      }

      return response;
    },
    [token, logout]
  );

  useEffect(() => {
    const verifyUserSession = async () => {
      const storedToken = getStoredToken();

      if (!storedToken) {
        setUser(null);
        setToken(null);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(apiUrl('/auth/me'), {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Session expired');
        }

        const data = await response.json();

        if (!data?.user) {
          throw new Error('Invalid user response');
        }

        setUser(data.user);
        setToken(storedToken);
      } catch (error) {
        console.error('Session verification failed:', error);
        setStoredToken(null);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyUserSession();
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(apiUrl('/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Invalid credentials',
        };
      }

      if (!data.token || !data.user) {
        return {
          success: false,
          error: 'Invalid response from authentication server',
        };
      }

      setToken(data.token);
      setUser(data.user);
      setStoredToken(data.token);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to connect to authentication server',
      };
    }
  };

  const loginAsDemo = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    return login('demo@vyaktaai.com', 'VyaktaDemo@2026');
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(apiUrl('/auth/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Registration failed',
        };
      }

      if (!data.token || !data.user) {
        return {
          success: false,
          error: 'Invalid response from authentication server',
        };
      }

      setToken(data.token);
      setUser(data.user);
      setStoredToken(data.token);

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to connect to authentication server',
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        loginAsDemo,
        register,
        logout,
        authFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
};
