// src/hooks/useAuth.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Auth hook — now uses api.js so no hardcoded IPs.
// Also stores gym info from login response.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [gym, setGym] = useState(null);      // ← store gym separately
    const [token, setToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Restore session on page refresh
    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');
        const storedGym = localStorage.getItem('gym');

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                if (storedGym) setGym(JSON.parse(storedGym));
                setIsAuthenticated(true);
            } catch {
                localStorage.clear();
            }
        }
        setLoading(false);
    }, []);

    const login = useCallback(async (username, password) => {
        try {
            const data = await authAPI.login(username, password);

            // Store tokens
            if (data.access) {
                localStorage.setItem('authToken', data.access);
                setToken(data.access);
            }
            if (data.refresh) {
                localStorage.setItem('refreshToken', data.refresh);
            }

            // Store user
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
                setUser(data.user);
            }

            // Store gym — backend sends this if user belongs to a gym
            if (data.gym) {
                localStorage.setItem('gym', JSON.stringify(data.gym));
                setGym(data.gym);
            }

            setIsAuthenticated(true);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message || 'Login failed' };
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            const refresh = localStorage.getItem('refreshToken');
            if (refresh) await authAPI.logout(refresh);
        } catch {
            // Even if API call fails, clear local state
        }
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('gym');
        setToken(null);
        setUser(null);
        setGym(null);
        setIsAuthenticated(false);
    }, []);

    return (
        <AuthContext.Provider value={{ user, gym, token, isAuthenticated, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};