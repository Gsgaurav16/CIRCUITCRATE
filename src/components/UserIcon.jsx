import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { getCurrentUser, signOut, supabase } from '../lib/supabase';

const UserIcon = () => {
    const [user, setUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in
        const checkUser = async () => {
            try {
                const currentUser = await getCurrentUser();
                setUser(currentUser);
            } catch (error) {
                setUser(null);
            }
        };

        checkUser();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleSignOut = async () => {
        try {
            await signOut();
            setUser(null);
            setShowDropdown(false);
            navigate('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    // If user is not logged in, show login link
    if (!user) {
        return (
            <Link
                to="/auth"
                className="sm-user-icon flex items-center gap-2 px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-colors pointer-events-auto"
                aria-label="Login"
            >
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">Login</span>
            </Link>
        );
    }

    // Get user's name or email
    const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
    const userInitials = userName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="relative sm-user-icon pointer-events-auto">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
                aria-label="User menu"
                aria-expanded={showDropdown}
            >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                    {userInitials}
                </div>
                <span className="text-white text-sm font-medium hidden md:block max-w-[120px] truncate">
                    {userName}
                </span>
            </button>

            {showDropdown && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-700">
                            <p className="text-sm font-medium text-white truncate">{userName}</p>
                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-800 transition-colors flex items-center gap-2"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default UserIcon;

