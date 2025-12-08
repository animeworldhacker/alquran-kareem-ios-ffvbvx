
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../app/integrations/supabase/client';
import { bookmarkService } from '../services/bookmarkService';
import { settingsService } from '../services/settingsService';
import { readingProgressService } from '../services/readingProgressService';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const initializeAuth = async () => {
      try {
        console.log('🔐 Initializing auth...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
        } else {
          console.log('✅ Session retrieved:', session ? 'Logged in' : 'Not logged in');
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);

          // Sync local data to Supabase when user is logged in
          if (session?.user) {
            console.log('🔄 Syncing local data...');
            syncLocalData().catch(err => {
              console.error('❌ Error syncing local data:', err);
            });
          }
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔐 Auth state changed:', _event);
      
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);

        // Sync local data when user signs in
        if (_event === 'SIGNED_IN' && session?.user) {
          console.log('🔄 User signed in, syncing data...');
          syncLocalData().catch(err => {
            console.error('❌ Error syncing local data:', err);
          });
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const syncLocalData = async () => {
    try {
      console.log('🔄 Starting local data sync...');
      await Promise.all([
        bookmarkService.syncLocalToSupabase().catch(err => {
          console.error('❌ Error syncing bookmarks:', err);
        }),
        settingsService.syncLocalToSupabase().catch(err => {
          console.error('❌ Error syncing settings:', err);
        }),
        readingProgressService.syncLocalToSupabase().catch(err => {
          console.error('❌ Error syncing reading progress:', err);
        }),
      ]);
      console.log('✅ Local data synced successfully');
    } catch (error) {
      console.error('❌ Error syncing local data:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting sign in...');
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        return { error };
      }

      console.log('✅ Sign in successful');
      return { error: null };
    } catch (error) {
      console.error('❌ Sign in exception:', error);
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      console.log('🔐 Attempting sign up...');
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed',
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        console.error('❌ Sign up error:', error);
        return { error };
      }

      console.log('✅ Sign up successful');
      return { error: null };
    } catch (error) {
      console.error('❌ Sign up exception:', error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      console.log('🔐 Signing out...');
      await supabase.auth.signOut();
      console.log('✅ Sign out successful');
    } catch (error) {
      console.error('❌ Sign out error:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('🔐 Requesting password reset...');
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://natively.dev/reset-password',
      });

      if (error) {
        console.error('❌ Reset password error:', error);
        return { error };
      }

      console.log('✅ Password reset email sent');
      return { error: null };
    } catch (error) {
      console.error('❌ Reset password exception:', error);
      return { error: error as Error };
    }
  };

  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
