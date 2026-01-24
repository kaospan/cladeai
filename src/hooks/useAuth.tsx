import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const nextSession = sessionData.session ?? null;
        const { data: userRes } = await supabase.auth.getUser();

        if (!mounted) return;
        setSession(nextSession);
        setUser(userRes.user ?? nextSession?.user ?? null);
        setAccessToken(nextSession?.access_token ?? null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    bootstrap();

    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession ?? null);
      setUser(nextSession?.user ?? null);
      setAccessToken(nextSession?.access_token ?? null);

      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('lastAuthTime');
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        localStorage.setItem('lastAuthTime', Date.now().toString());
      }
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName || email.split('@')[0],
        },
      },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.session) {
      setSession(data.session as Session);
      setUser(data.session.user);
      setAccessToken(data.session.access_token);
      localStorage.setItem('lastAuthTime', Date.now().toString());
    }
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setAccessToken(null);
    localStorage.removeItem('lastAuthTime');
  };

  const value = useMemo(
    () => ({ user, session, loading, accessToken, signUp, signIn, signOut }),
    [user, session, loading, accessToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
