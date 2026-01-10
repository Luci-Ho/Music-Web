import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userLevel, setUserLevel] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock: Get current user from localStorage or API
        // In real app, this would be from actual authentication
        const mockCurrentUser = {
            id: '1',
            username: 'Luci',
            email: 'ho@example.com',
            level: 'l2' // l1=Admin, l2=Moderator, l3=User - Start as Moderator to test
        };
        
        setCurrentUser(mockCurrentUser);
        setUserLevel(mockCurrentUser.level);
        setLoading(false);
    }, []);

    // Permission helpers
    const isAdmin = () => userLevel === 'l1';
    const isModerator = () => userLevel === 'l2';
    const isUser = () => userLevel === 'l3';
    
    // Check if user can edit songs (Admin or Moderator)
    const canEditSongs = () => isAdmin() || isModerator();
    
    // Check if user can delete songs (Admin only)
    const canDeleteSongs = () => isAdmin();
    
    // Check if user can add songs (Admin only)
    const canAddSongs = () => isAdmin();
    
    // Check if user can manage users (Admin only)
    const canManageUsers = () => isAdmin();

    const value = {
        currentUser,
        userLevel,
        loading,
        isAdmin,
        isModerator,
        isUser,
        canEditSongs,
        canDeleteSongs,
        canAddSongs,
        canManageUsers,
        setCurrentUser,
        setUserLevel
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};