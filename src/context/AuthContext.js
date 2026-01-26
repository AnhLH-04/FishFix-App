import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null); // 'customer' hoặc 'technician'
    const [loading, setLoading] = useState(true); // Loading state cho auto-login

    // Auto-login khi app khởi động
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const isAuth = await authService.isAuthenticated();
            if (isAuth) {
                // Có token, lấy thông tin user
                const userInfo = await authService.getCurrentUser();
                if (userInfo) {
                    const role = userInfo.roleId === 2 ? 'technician' : 'customer';
                    setUser({
                        id: userInfo.userId,
                        email: userInfo.email,
                        fullName: userInfo.fullName,
                        phone: userInfo.phone,
                        roleId: userInfo.roleId,
                    });
                    setUserRole(role);
                }
            }
        } catch (error) {
            console.log('Auto-login failed:', error);
            // Token hết hạn hoặc không hợp lệ, clear auth state
            await authService.logout();
        } finally {
            setLoading(false);
        }
    };

    const login = (userData, role) => {
        setUser(userData);
        setUserRole(role);
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
        setUserRole(null);
    };

    const value = {
        user,
        userRole,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
        isCustomer: userRole === 'customer',
        isTechnician: userRole === 'technician',
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
