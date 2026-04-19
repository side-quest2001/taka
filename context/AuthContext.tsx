import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import { AuthState, User } from '../types';

type AuthAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
    | { type: 'LOGOUT' }
    | { type: 'UPDATE_PROFILE'; payload: any };

const initialState: AuthState = {
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                isLoading: false,
            };
        case 'LOGOUT':
            return { ...initialState, isLoading: false };
        case 'UPDATE_PROFILE':
            return { ...state, user: { ...state.user, ...action.payload } as User };
        default:
            return state;
    }
};

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, role: string, profileData?: any) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (profile: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await api.getStoredToken();
            if (!token) {
                dispatch({ type: 'LOGOUT' });
                return;
            }

            const data = await api.getMe();
            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { user: { id: data.userId, email: '', role: data.role as User['role'] }, token },
            });
        } catch (error) {
            dispatch({ type: 'LOGOUT' });
        }
    };

    const login = async (email: string, password: string) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const data = await api.login(email, password);
            const user: User = { id: data.userId, email, role: data.role as User['role'] };
            dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: data.token } });
        } catch (error) {
            dispatch({ type: 'SET_LOADING', payload: false });
            throw error;
        }
    };

    const register = async (email: string, password: string, role: string, profileData?: any) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const data = await api.register(email, password, role, profileData);
            const user: User = { id: data.userId, email, role: role as User['role'] };
            dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: data.token } });
        } catch (error) {
            dispatch({ type: 'SET_LOADING', payload: false });
            throw error;
        }
    };

    const logout = async () => {
        await api.logout();
        dispatch({ type: 'LOGOUT' });
    };

    const updateProfile = (profile: any) => {
        dispatch({ type: 'UPDATE_PROFILE', payload: profile });
    };

    return (
        <AuthContext.Provider value={{ ...state, login, register, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
