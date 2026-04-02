import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';

interface AuthContextType {
  user: User | null;
  userData: any | null;
  isLoading: boolean;
  isLoadingUserData: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  isLoading: true,
  isLoadingUserData: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);

  useEffect(() => {
    // 1. Check active session initially
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setIsLoading(false);
        setIsLoadingUserData(false);
      }
    });

    // 2. Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        setUserData(null);
        setIsLoadingUserData(false);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 3. Fetch custom user data from our new V2 'users' table
  useEffect(() => {
    let isMounted = true;
    
    const fetchUserData = async () => {
      if (!user) return;
      
      setIsLoadingUserData(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) {
         console.warn("User data fetch error:", error);
      } else if (isMounted && data) {
         setUserData(data);
      }
      if (isMounted) setIsLoadingUserData(false);
    };

    fetchUserData();

    return () => { isMounted = false; }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, userData, isLoading, isLoadingUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
