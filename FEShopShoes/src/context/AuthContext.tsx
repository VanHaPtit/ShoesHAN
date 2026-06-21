import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
    user: User | null;
    login: (userData: any) => void;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    const login = (userData: any) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        navigate('/');
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/signin');
    };

    const updateUser = (userData: Partial<User>) => {
        const currentUser = user || {};
        const newUserData = { ...currentUser, ...userData } as User;
        localStorage.setItem('user', JSON.stringify(newUserData));
        setUser(newUserData);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
