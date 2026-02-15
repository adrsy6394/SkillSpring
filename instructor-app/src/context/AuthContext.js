import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { supabase as createSupabaseClient } from '../lib/supabaseClient';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createSupabaseClient, []);

  const fetchRoleFromDB = async (userId, mounted) => {
    try {
      console.log('[Instructor Auth] Fetching role from DB for:', userId);
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (!mounted) return;

      if (error) {
        console.error('[Instructor Auth] DB Role Error:', error.message);
      } else if (data) {
        console.log('[Instructor Auth] DB Role Found:', data.role);
        setRole(data.role);
      }
    } catch (error) {
      console.error('[Instructor Auth] fetchRole Exception:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Safety timeout to prevent permanent hang
    const safetyTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('[Instructor Auth] Safety timeout reached. Forcing loading to false.');
        setLoading(false);
      }
    }, 8000);

    const handleAuthChange = async (event, session) => {
      if (!mounted) return;
      console.log('[Instructor Auth] Event:', event);

      try {
        if (session?.user) {
          setUser(session.user);
          
          // Fast Path
          const metadataRole = session.user.user_metadata?.role;
          if (metadataRole) {
            setRole(metadataRole);
            setLoading(false);
          }

          if (metadataRole) {
            fetchRoleFromDB(session.user.id, mounted);
          } else {
            await fetchRoleFromDB(session.user.id, mounted);
          }
        } else {
          setUser(null);
          setRole(null);
        }
      } catch (err) {
        console.error('[Instructor Auth] HandleAuthChange Error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && mounted) {
          await handleAuthChange('INITIAL_SESSION', session);
        } else if (!session && mounted) {
          setLoading(false);
        }
      } catch (err) {
        console.error('[Instructor Auth] Session Init Error:', err);
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
    if (typeof window !== 'undefined') {
        window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
