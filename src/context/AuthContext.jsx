import { createContext, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const userInfo = localStorage.getItem('userInfo');
            return userInfo ? JSON.parse(userInfo) : null;
        } catch {
            return null;
        }
    });

    const login = async (email, password) => {
        try {
            const { data } = await axios.post(`${API_BASE_URL}/api/users/login`, { email, password });
            if (data.isAdmin) {
                return {
                    success: false,
                    isAdminAttempt: true,
                    message: 'Admin account detected. Administrators must log in via the Admin Portal.'
                };
            }
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true, user: data };
        } catch (error) {
            console.error(error);
            const message = error.response?.data?.message || 'Invalid email or password.';
            return { success: false, message };
        }
    };

    const adminLogin = async (email, password) => {
        try {
            const { data } = await axios.post(`${API_BASE_URL}/api/users/login`, { email, password });
            if (!data.isAdmin) {
                return {
                    success: false,
                    message: 'Access Denied: This is a customer account. Only administrators can log in here.'
                };
            }
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true, user: data };
        } catch (error) {
            console.error(error);
            const message = error.response?.data?.message || 'Invalid email or password.';
            return { success: false, message };
        }
    };

    const register = async (name, email, password) => {
        try {
            await axios.post(`${API_BASE_URL}/api/users/register`, { name, email, password });
            // Registration successful - do NOT auto-login, redirect to login page
            return { success: true };
        } catch (error) {
            console.error(error);
            const message = error.response?.data?.message || 'Registration failed. Please try again.';
            return { success: false, message };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
    };

    return (
        <AuthContext.Provider value={{ user, login, adminLogin, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

