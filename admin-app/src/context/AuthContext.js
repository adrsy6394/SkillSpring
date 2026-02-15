'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { createClient } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const supabase = useMemo(() => createClient(), []);

  const fetchRoleFromDB = async (userId, mounted) => {
    try {
      console.log('[AuthContext] Deep verifying role from DB for:', userId);
      
      // Add a 5-second timeout to the DB request
      const rolePromise = supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
        
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Role fetch timeout (15s)')), 15000)
      );

      const { data, error } = await Promise.race([rolePromise, timeoutPromise]);
      
      if (!mounted) return;

      if (error) {
        console.error('[AuthContext] DB Role Fetch Error:', error.message);
      } else if (!data) {
        console.warn('[AuthContext] User record not found in public.users table. Waiting for trigger/creation...');
        // Optional: Retry logic could go here
      } else if (data) {
        console.log('[AuthContext] DB Role Found:', data.role);
        setRole(data.role);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`role_${userId}`, data.role);
        }
      }
    } catch (error) {
      if (mounted) console.error('[AuthContext] fetchRoleFromDB Exception:', error.message);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Safety timeout: If everything hangs, clear the loading screen after 8 seconds
    const safetyTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('[AuthContext] Safety timeout reached. Forcing loading to false.');
        setLoading(false);
      }
    }, 8000);

    const handleAuthChange = async (event, session) => {
      if (!mounted) return;
      console.log('[AuthContext] Event:', event, 'User:', session?.user?.email);

      try {
        if (session?.user) {
          setUser(session.user);
          
          // FAST PATH: Get role from metadata or cache
          const metadataRole = session.user.user_metadata?.role;
          console.log('[AuthContext] Session Metadata Role:', metadataRole);
          const cachedRole = typeof window !== 'undefined' ? localStorage.getItem(`role_${session.user.id}`) : null;
          
          const initialRole = metadataRole || cachedRole;
          if (initialRole) {
            console.log('[AuthContext] Fast Path Role identified:', initialRole);
            setRole(initialRole);
            setLoading(false); // RELEASE SCREEN IMMEDIATELY IF WE HAVE A ROLE
          }

          // Fetch from DB regardless to ensure synchronization
          // If we already have a role, we don't await this to avoid blocking the UI
          if (initialRole) {
            fetchRoleFromDB(session.user.id, mounted);
          } else {
            await fetchRoleFromDB(session.user.id, mounted);
          }
        } else {
          setUser(null);
          setRole(null);
        }
      } catch (err) {
        console.error('[AuthContext] Auth Change Handler Error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // 1. Setup Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // 2. Initial Session Check (in case event hasn't fired yet)
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && mounted) {
          await handleAuthChange('INITIAL_SESSION', session);
        } else if (!session && mounted) {
          setLoading(false);
        }
      } catch (err) {
        console.error('[AuthContext] Init Session Error:', err);
        if (mounted) setLoading(false);
      }
    };

    initSession();

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, role, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
