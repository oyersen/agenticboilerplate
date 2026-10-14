import React, { createContext, useContext, useEffect, useRef, useState, useMemo, ReactNode } from 'react';
import { keycloak } from './keycloak';
import { setAuthToken } from '../api/client';

export interface UserProfile {
  id?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  initialized: boolean;
  authenticated: boolean;
  token?: string;
  user: UserProfile | null;
  roles: string[];
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);

  const refreshIntervalRef = useRef<ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    keycloak
      .init({
        onLoad: 'login-required',
        checkLoginIframe: false,
        pkceMethod: 'S256',
      })
      .then(async (auth) => {
        setAuthenticated(auth);
        if (auth) {
          setAuthToken(keycloak.token);
          const realmRoles = keycloak.realmAccess?.roles || [];
          setRoles(realmRoles);

          try {
            const profile = await keycloak.loadUserProfile();
            setUser({
              id: profile.id,
              username: profile.username,
              email: profile.email,
              firstName: profile.firstName,
              lastName: profile.lastName,
            });
          } catch {
            // Profile load fallback
          }

          // Token auto-refresh interval (every 30 seconds)
          refreshIntervalRef.current = setInterval(() => {
            keycloak
              .updateToken(70)
              .then((refreshed) => {
                if (refreshed) {
                  setAuthToken(keycloak.token);
                }
              })
              .catch(() => {
                keycloak.login();
              });
          }, 30000);
        }
        setInitialized(true);
      })
      .catch(() => {
        setInitialized(true);
      });

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  const hasRole = (role: string): boolean => roles.includes(role);

  const hasAnyRole = (requiredRoles: string[]): boolean => {
    if (requiredRoles.length === 0) return true;
    return requiredRoles.some((r) => roles.includes(r));
  };

  const login = () => keycloak.login();
  const logout = () => {
    setAuthToken(undefined);
    keycloak.logout({ redirectUri: window.location.origin });
  };

  const contextValue = useMemo(
    () => ({
      initialized,
      authenticated,
      token: keycloak.token,
      user,
      roles,
      hasRole,
      hasAnyRole,
      login,
      logout,
    }),
    [initialized, authenticated, user, roles],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
