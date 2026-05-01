import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../utils/api';

interface AuthContextType {
  user: any | null; // Generic user object
  userData: any | null;
  isLoading: boolean;
  isLoadingUserData: boolean;
  circles: any[];
  activeCircle: any | null;
  fetchCircles: () => Promise<void>;
  setActiveCircle: (circleId: string) => void;
  login: (token: string, user?: any) => Promise<void>;
  logout: () => Promise<void>;
  fetchUserData: () => Promise<void>;
}

const ALL_CIRCLES_ID = 'all';

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  isLoading: true,
  isLoadingUserData: true,
  circles: [],
  activeCircle: null,
  fetchCircles: async () => {},
  setActiveCircle: () => {},
  login: async () => {},
  logout: async () => {},
  fetchUserData: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [circles, setCircles] = useState<any[]>([]);
  const [activeCircleId, setActiveCircleId] = useState<string | null>(ALL_CIRCLES_ID);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);

  const fetchCircles = async () => {
    try {
      const data = await api.get('/circles');
      if (data && !data.error) {
        const circleList = Array.isArray(data) ? data : data.circles || [];
        setCircles(circleList);
      }
    } catch (err) {
      console.error('Error fetching circles:', err);
    }
  };

  const activeCircle = activeCircleId === ALL_CIRCLES_ID 
    ? { id: ALL_CIRCLES_ID, name: 'All Circles', avatar_url: null }
    : circles.find(c => c.id === activeCircleId) || circles[0] || null;

  const setActiveCircle = (id: string) => {
    setActiveCircleId(id);
  };

  const fetchUserData = async () => {
    setIsLoadingUserData(true);
    try {
      const data = await api.get('/user/profile');
      if (data && !data.error) {
        const userWithMetadata = data.user_metadata ? { ...data, ...data.user_metadata } : data;
        setUserData(userWithMetadata);
        setUser(userWithMetadata);
        await fetchCircles(); // Fetch circles after profile
      } else {
        await logout();
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setIsLoadingUserData(false);
    }
  };

  const login = async (token: string, userData?: any) => {
    await AsyncStorage.setItem('access_token', token);
    const mappedUser = userData?.user_metadata ? { ...userData, ...userData.user_metadata } : userData;
    setUser(mappedUser || { token }); 
    if (mappedUser) {
      setUserData(mappedUser);
    }
    await fetchUserData();
  };

  const logout = async () => {
    await AsyncStorage.removeItem('access_token');
    setUser(null);
    setUserData(null);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        setUser({ token });
        await fetchUserData();
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData, 
      circles, 
      activeCircle,
      isLoading, 
      isLoadingUserData, 
      fetchCircles, 
      setActiveCircle,
      login, 
      logout,
      fetchUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
