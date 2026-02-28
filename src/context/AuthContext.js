import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';
import locationService from '../services/locationService';
import { setUnauthorizedCallback } from '../services/apiClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children, navigation }) => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null); // 'customer' hoặc 'technician'
    const [loading, setLoading] = useState(true); // Loading state cho auto-login
    const [userLocation, setUserLocation] = useState(null); // Vị trí của user

    // Auto-login khi app khởi động
    useEffect(() => {
        checkAuth();
        
        // Set callback để handle 401 errors
        setUnauthorizedCallback(() => {
            console.log('🚫 Session expired - logging out');
            handleSessionExpired();
        });
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
                    
                    // Lấy vị trí của user
                    fetchUserLocation();
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

    const fetchUserLocation = async () => {
        try {
            const location = await locationService.getCurrentLocationWithAddress();
            if (location) {
                setUserLocation(location);
                console.log('📍 User location:', location);
            }
        } catch (error) {
            console.log('Failed to get location:', error.message);
            // Location không bắt buộc, để null để user có thể nhập thủ công
            setUserLocation(null);
        }
    };

    const login = (userData, role) => {
        setUser(userData);
        setUserRole(role);
        // Lấy location sau khi login
        fetchUserLocation();
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
        setUserRole(null);
        setUserLocation(null);
    };

    const handleSessionExpired = async () => {
        // Clear auth state
        await authService.logout();
        setUser(null);
        setUserRole(null);
        setUserLocation(null)
    };

    const value = {
        user,
        userRole,
        userLocation,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
        isCustomer: userRole === 'customer',
        isTechnician: userRole === 'technician',
        refreshLocation: fetchUserLocation,
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
