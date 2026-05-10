import { createContext, useState, useContext, useEffect } from 'react';
import { 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../firebase';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const token = await firebaseUser.getIdToken();
                    const config = {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    };
                    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, config);
                    
                    setUser({
                        ...response.data,
                        token,
                        uid: firebaseUser.uid
                    });
                } catch (error) {
                    console.error('Error syncing user with backend:', error);
                    setUser({
                        username: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                        email: firebaseUser.email,
                        uid: firebaseUser.uid,
                        token: await firebaseUser.getIdToken()
                    });
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        
        // Sync with backend immediately to create user record if new
        const token = await result.user.getIdToken();
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
        try {
            await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, config);
        } catch (error) {
            console.error('Initial sync error:', error);
        }
        
        return result.user;
    };

    const logout = async () => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, loginWithGoogle }}>
            {children}
        </AuthContext.Provider>
    );
};
