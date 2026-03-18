import React, { createContext, useState, useEffect, useContext } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

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

  useEffect(() => {
    let unsubscribeUser: () => void = () => {};

    const unsubscribeAuth = auth().onAuthStateChanged(async (u) => {
      setUser(u);
      setIsLoading(false);

      if (u) {
        setIsLoadingUserData(true);
        // Setup Live Listener for User Document
        unsubscribeUser = firestore()
          .collection('users')
          .doc(u.uid)
          .onSnapshot(
            (doc) => {
              if (doc.exists()) {
                setUserData(doc.data());
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
