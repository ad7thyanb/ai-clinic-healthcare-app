import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface RouteMatch {
  path: string;
  params: Record<string, string>;
}

interface RouterContextType {
  currentPath: string;
  navigate: (path: string) => void;
  matchRoute: (pattern: string) => Record<string, string> | null;
}

const RouterContext = createContext<RouterContextType | null>(null);

export const RouterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Normalize initial path: support both pathname and hash
  const getInitialPath = (): string => {
    if (typeof window === 'undefined') return '/';
    const hash = window.location.hash.replace(/^#/, '');
    if (hash && hash.startsWith('/')) {
      return hash;
    }
    const pathname = window.location.pathname || '/';
    return pathname === '' ? '/' : pathname;
  };

  const [currentPath, setCurrentPath] = useState<string>(getInitialPath);

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash && hash.startsWith('/')) {
        setCurrentPath(hash);
      } else {
        setCurrentPath(window.location.pathname || '/');
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigate = (to: string) => {
    if (to === currentPath) return;
    try {
      window.history.pushState(null, '', to);
    } catch {
      window.location.hash = to;
    }
    setCurrentPath(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Simple pattern matching for e.g. /doctors/:id
  const matchRoute = (pattern: string): Record<string, string> | null => {
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = currentPath.split('?')[0].split('/').filter(Boolean);

    if (patternParts.length !== pathParts.length) return null;

    const params: Record<string, string> = {};
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        const paramName = patternParts[i].slice(1);
        params[paramName] = decodeURIComponent(pathParts[i]);
      } else if (patternParts[i].toLowerCase() !== pathParts[i].toLowerCase()) {
        return null;
      }
    }
    return params;
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate, matchRoute }}>
      {children}
    </RouterContext.Provider>
  );
};

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}
