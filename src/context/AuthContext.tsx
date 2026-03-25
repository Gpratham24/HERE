import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Alert } from 'react-native';

interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
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
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  
  // 🔑 Unique identifier for THIS application mount cycle.
  const [currentSessionId] = useState(() => Math.random().toString(36).substring(2, 9));
  const isSessionRegistered = useRef(false);

  useEffect(() => {
    let unsubscribeUser: () => void = () => {};

    const unsubscribeAuth = auth().onAuthStateChanged(async (u) => {
      if (typeof unsubscribeUser === 'function') {
         try { unsubscribeUser(); } catch (e) {}
      }
      setUser(u);
      setIsLoading(false);

      if (u) {
        setIsLoadingUserData(true);

        // 📝 Register current device session
        firestore().collection('users').doc(u.uid).update({
           currentSessionId: currentSessionId
        })
        .then(() => {
          isSessionRegistered.current = true;
        })
        .catch(() => {
          isSessionRegistered.current = true;
        });
        // Setup Live Listener for User Document
        unsubscribeUser = firestore()
          .collection('users')
          .doc(u.uid)
          .onSnapshot(
            (doc) => {
              if (doc.exists()) {
                const data = doc.data();
                setUserData(data);

                // 🚨 Single Session Authentication Gate
                if (isSessionRegistered.current && data?.currentSessionId && data.currentSessionId !== currentSessionId) {
                   Alert.alert("Session Ended", "You have been logged out because another device logged into this account.");
                   auth().signOut().catch(() => {});
                }
              } else {
                setUserData(null);
              }
              setIsLoadingUserData(false);
            },
            (err) => {
              console.log('Error listening to user data (Check Firebase Rules):', err.message);
              setIsLoadingUserData(false);
            }
          );
      } else {
        setUserData(null);
        setIsLoadingUserData(false);
        isSessionRegistered.current = false;
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeUser();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, isLoading, isLoadingUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
