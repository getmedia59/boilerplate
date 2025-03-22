'use client';

import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';
import { Profile } from '@/types';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) throw error;
        
        if (isMounted) {
          setUser(user);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch user'));
          setLoading(false);
        }
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading, error };
}

export function useProfile() {
  const { user, loading: userLoading, error: userError } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const getProfile = async () => {
      if (userLoading) return;
      
      if (!user) {
        if (isMounted) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      try {
        // Fetch profile from database
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          // If profile doesn't exist, create a default one
          if (profileError.code === 'PGRST116') {
            const defaultProfile = {
              id: user.id,
              full_name: user.user_metadata?.full_name || '',
              avatar_url: user.user_metadata?.avatar_url || '',
              role: 'user',
              updated_at: new Date().toISOString(),
            };

            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert(defaultProfile)
              .select()
              .single();

            if (insertError) {
              throw insertError;
            }

            if (isMounted) {
              setProfile(newProfile as Profile);
            }
          } else {
            throw profileError;
          }
        } else if (isMounted) {
          setProfile(data as Profile);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load profile'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getProfile();

    return () => {
      isMounted = false;
    };
  }, [user, userLoading]);

  return { 
    user,
    profile, 
    loading: userLoading || loading, 
    error: error || userError,
    isAdmin: profile?.role === 'admin',
    // Add role checking helpers
    hasRole: (role: string) => profile?.role === role
  };
} 