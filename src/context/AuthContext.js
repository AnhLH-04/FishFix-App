import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null); // 'customer' hoặc 'technician'

    const login = (userData, role) => {
        setUser(userData);
        setUserRole(role);
    };

    const logout = () => {
        setUser(null);
        setUserRole(null);
    };

    const value = {
        user,
        userRole,
        login,
        logout,
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
