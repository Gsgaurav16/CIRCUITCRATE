import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    FiGrid,
    FiBookOpen,
    FiTool,
    FiCpu,
    FiTrello,
    FiLogOut,
    FiPlus,
    FiSettings,
    FiBell,
    FiSearch,
    FiChevronDown,
    FiUserPlus
} from 'react-icons/fi';
import { supabase } from '../../lib/supabase';
import AdminLoginForm from './AdminLoginForm';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [showAddAdminModal, setShowAddAdminModal] = useState(false);
    const [newAdminData, setNewAdminData] = useState({
        email: '',
        fullName: '',
        password: ''
    });
    const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
    const [adminError, setAdminError] = useState('');

    useEffect(() => {
        let mounted = true;

        // Check if user is authenticated and is admin
        const checkAuth = async (session) => {
            if (!mounted) return;
            
            try {
                if (!session) {
                    setIsChecking(false);
                    return;
                }

                // Check if user is admin
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError || !user) {
                    console.error('Error getting user:', userError);
                    if (mounted) {
                        setIsChecking(false);
                    }
                    return;
                }

                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profileError) {
                    console.error('Error fetching profile:', profileError);
                    if (mounted) {
                        setIsChecking(false);
                        // If profile doesn't exist, create one
                        if (profileError.code === 'PGRST116') {
                            const { data: newProfile, error: createError } = await supabase
                                .from('profiles')
                                .insert([{
                                    id: user.id,
                                    email: user.email,
                                    full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                                    is_admin: false
                                }])
                                .select()
                                .single();
                            
                            if (createError || !newProfile) {
                                console.error('Error creating profile:', createError);
                                setIsChecking(false);
                                return;
                            }
                            
                            setIsChecking(false);
                            return;
                        } else {
                            setIsChecking(false);
                            return;
                        }
                    }
                    return;
                }

                if (!profile || !profile.is_admin) {
                    if (mounted) {
                        setIsChecking(false);
                    }
                    return;
                }

                if (mounted) {
                    setUserProfile(profile);
                    setIsAdmin(true);
                    setIsAuthenticated(true);
                    setIsChecking(false);
                }
            } catch (error) {
                console.error('Error checking auth:', error);
                if (mounted) {
                    setIsChecking(false);
                }
            }
        };

        // Initial check
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (mounted) {
                checkAuth(session);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;
            
            if (!session) {
                setIsChecking(false);
            } else {
                checkAuth(session);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [navigate]);

    if (isChecking) {
        return (
            <div className="flex h-screen w-screen bg-[#0a0a0a] text-white items-center justify-center">
                <div>Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated || !isAdmin) {
        return <AdminLoginForm />;
    }

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            window.location.reload(); // Reload to show login form
        } catch (error) {
            console.error('Error signing out:', error);
            window.location.reload();
        }
    };

    const handleSettings = () => {
        navigate('/admin/settings');
    };

    const handleNotifications = () => {
        navigate('/admin/notifications');
    };

    const handleAddAdmin = () => {
        setShowAddAdminModal(true);
    };

    const handleCloseAddAdminModal = () => {
        setShowAddAdminModal(false);
        setNewAdminData({ email: '', fullName: '', password: '' });
        setAdminError('');
        setIsCreatingAdmin(false);
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setAdminError('');
        
        // Validation
        if (!newAdminData.email || !newAdminData.fullName || !newAdminData.password) {
            setAdminError('Please fill in all fields');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newAdminData.email)) {
            setAdminError('Please enter a valid email address');
            return;
        }

        // Password validation
        if (newAdminData.password.length < 6) {
            setAdminError('Password must be at least 6 characters long');
            return;
        }

        setIsCreatingAdmin(true);

        try {
            // Check if user already exists
            const { data: existingUsers, error: checkError } = await supabase
                .from('profiles')
                .select('id, email, is_admin')
                .eq('email', newAdminData.email.toLowerCase().trim())
                .maybeSingle();

            if (checkError && checkError.code !== 'PGRST116') {
                throw checkError;
            }

            let userId;

            if (existingUsers) {
                // User already exists, check if they're already an admin
                if (existingUsers.is_admin) {
                    setAdminError('This user is already an admin');
                    setIsCreatingAdmin(false);
                    return;
                }
                // Update existing profile to admin
                userId = existingUsers.id;
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({
                        full_name: newAdminData.fullName.trim(),
                        is_admin: true,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', userId);

                if (updateError) throw updateError;
            } else {
                // Sign up the new user
                const { data: signupData, error: signUpError } = await supabase.auth.signUp({
                    email: newAdminData.email.toLowerCase().trim(),
                    password: newAdminData.password,
                    options: {
                        data: {
                            full_name: newAdminData.fullName.trim()
                        }
                    }
                });

                if (signUpError) {
                    // Handle specific errors
                    if (signUpError.message.includes('already registered')) {
                        setAdminError('An account with this email already exists. Please use a different email or contact support.');
                        setIsCreatingAdmin(false);
                        return;
                    }
                    throw signUpError;
                }

                if (!signupData.user) {
                    throw new Error('Failed to create user account');
                }

                userId = signupData.user.id;

                // Use upsert to handle case where profile might already exist (from trigger)
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: userId,
                        email: newAdminData.email.toLowerCase().trim(),
                        full_name: newAdminData.fullName.trim(),
                        is_admin: true,
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'id'
                    });

                if (profileError) {
                    // If insert fails due to duplicate, try update instead
                    if (profileError.code === '23505') {
                        const { error: updateError } = await supabase
                            .from('profiles')
                            .update({
                                email: newAdminData.email.toLowerCase().trim(),
                                full_name: newAdminData.fullName.trim(),
                                is_admin: true,
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', userId);

                        if (updateError) throw updateError;
                    } else {
                        throw profileError;
                    }
                }
            }
            
            // Success
            handleCloseAddAdminModal();
            alert(`Admin account ${existingUsers ? 'updated' : 'created'} successfully!\n\nEmail: ${newAdminData.email}\n${!existingUsers ? '\nNote: The user will need to verify their email before they can log in.' : ''}`);
        } catch (error) {
            console.error('Error creating admin account:', error);
            setAdminError(error.message || 'Failed to create admin account. Please try again.');
        } finally {
            setIsCreatingAdmin(false);
        }
    };

    const navItems = [
        { to: '/admin', icon: FiGrid, label: 'Dashboard', end: true },
        { to: '/admin/courses', icon: FiBookOpen, label: 'Courses' },
        { to: '/admin/workshops', icon: FiTool, label: 'Workshops' },
        { to: '/admin/electronics', icon: FiCpu, label: 'Electronics' },
        { to: '/admin/projects', icon: FiTrello, label: 'Projects' },
    ];

    const getPageTitle = () => {
        if (!location?.pathname) return 'Dashboard';
        const currentPaths = location.pathname.split('/').filter(Boolean);
        if (currentPaths.length <= 1) return 'Dashboard';
        const lastPath = currentPaths[currentPaths.length - 1];
        
        // Handle special cases
        const titleMap = {
            'settings': 'Settings',
            'notifications': 'Notifications'
        };
        
        return titleMap[lastPath] || lastPath.charAt(0).toUpperCase() + lastPath.slice(1);
    };

    return (
        <>
            {/* Add Admin Modal */}
            {showAddAdminModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={handleCloseAddAdminModal}>
                    <div className="bg-[#111] rounded-lg border border-[#222] p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">Add Admin Account</h2>
                            <button
                                onClick={handleCloseAddAdminModal}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleCreateAdmin} className="space-y-4">
                            {adminError && (
                                <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 text-sm">
                                    {adminError}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={newAdminData.email}
                                    onChange={(e) => {
                                        setNewAdminData(prev => ({ ...prev, email: e.target.value }));
                                        setAdminError('');
                                    }}
                                    required
                                    disabled={isCreatingAdmin}
                                    className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="admin@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={newAdminData.fullName}
                                    onChange={(e) => {
                                        setNewAdminData(prev => ({ ...prev, fullName: e.target.value }));
                                        setAdminError('');
                                    }}
                                    required
                                    disabled={isCreatingAdmin}
                                    className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Password
                                    <span className="text-gray-500 text-xs ml-1">(min. 6 characters)</span>
                                </label>
                                <input
                                    type="password"
                                    value={newAdminData.password}
                                    onChange={(e) => {
                                        setNewAdminData(prev => ({ ...prev, password: e.target.value }));
                                        setAdminError('');
                                    }}
                                    required
                                    disabled={isCreatingAdmin}
                                    minLength={6}
                                    className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="Temporary password"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={handleCloseAddAdminModal}
                                    disabled={isCreatingAdmin}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreatingAdmin}
                                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isCreatingAdmin ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Admin'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        <div className="flex h-screen w-screen bg-[#0a0a0a] text-white overflow-hidden font-sans">

            {/* 1. Primary Sidebar (Icons Only) */}
            <aside className="w-20 bg-[#111] border-r border-[#222] flex flex-col items-center py-6 z-20 shrink-0">
                <div className="mb-8">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-[0_0_15px_-3px_rgba(147,51,234,0.3)]">
                        CC
                    </div>
                </div>

                <button 
                    onClick={handleAddAdmin}
                    className="w-10 h-10 mb-8 rounded-lg bg-[#222] hover:bg-purple-600 hover:text-white transition-colors flex items-center justify-center text-gray-400"
                    title="Add Admin Account"
                >
                    <FiUserPlus size={24} />
                </button>

                <div className="flex-1 w-full flex flex-col items-center gap-4">
                    {/* REMOVED AVATAR AS REQUESTED */}
                </div>

                <div className="mt-auto flex flex-col gap-4">
                    <button
                        onClick={handleSignOut}
                        className="w-10 h-10 rounded-lg hover:bg-red-900/20 hover:text-red-400 text-gray-500 transition-colors flex items-center justify-center"
                        title="Sign Out"
                    >
                        <FiLogOut size={20} />
                    </button>
                </div>
            </aside>

            {/* 2. Secondary Sidebar (Navigation) */}
            <aside className="w-64 bg-[#0a0a0a] border-r border-[#222] flex flex-col z-10 shrink-0">
                <div className="h-20 flex items-center px-6 border-b border-[#222]">
                    <div>
                        <h2 className="text-lg font-bold text-white">Circuit Crate</h2>
                        <div className="flex bg-[#1a1a1a] rounded p-1 mt-2 inline-flex border border-[#333]">
                            <span className="bg-[#222] text-[10px] px-2 py-0.5 rounded text-white font-medium border border-[#333]">General</span>
                            <span className="text-[10px] px-2 py-0.5 rounded text-gray-500">Project</span>
                        </div>
                    </div>
                </div>

                <div className="p-4 flex-1 overflow-y-auto">
                    <p className="text-[10px] font-bold text-gray-500 mb-4 px-3 tracking-wider uppercase">Menu</p>
                    <nav className="space-y-1 mb-8">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group border border-transparent ${isActive
                                        ? 'bg-[#151515] text-white border-purple-500/50 shadow-[0_0_15px_-3px_rgba(147,51,234,0.1)]'
                                        : 'text-gray-400 hover:bg-[#151515] hover:text-white hover:border-[#333]'
                                    }`
                                }
                            >
                                <item.icon size={18} className={({ isActive }) => isActive ? 'text-purple-500' : 'text-gray-600 group-hover:text-gray-300'} />
                                <span className="font-medium text-sm">{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    <p className="text-[10px] font-bold text-gray-500 mb-4 px-3 tracking-wider uppercase">Tools</p>
                    <nav className="space-y-1">
                        <button
                            onClick={handleSettings}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:bg-[#151515] hover:text-white rounded-lg cursor-pointer transition-colors border border-transparent hover:border-[#333]"
                        >
                            <FiSettings size={18} className="text-gray-600 group-hover:text-gray-300" />
                            <span className="font-medium text-sm">Settings</span>
                        </button>
                        <button
                            onClick={handleNotifications}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:bg-[#151515] hover:text-white rounded-lg cursor-pointer transition-colors border border-transparent hover:border-[#333]"
                        >
                            <FiBell size={18} className="text-gray-600 group-hover:text-gray-300" />
                            <span className="font-medium text-sm">Notifications</span>
                        </button>
                    </nav>
                </div>

                <div className="p-4 border-t border-[#222]">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#151515] cursor-pointer transition-colors border border-transparent hover:border-[#333]">
                        <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xs text-gray-300">
                            {userProfile?.full_name ? userProfile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'AD'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{userProfile?.full_name || 'Admin User'}</p>
                            <p className="text-[10px] text-gray-500 truncate">{userProfile?.email || 'admin@circuitcrate.com'}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* 3. Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#000]">
                {/* Header */}
                <header className="h-20 border-b border-[#222] flex items-center justify-between px-8 bg-[#0a0a0a] shrink-0">
                    <h1 className="text-2xl font-bold text-white tracking-tight">{getPageTitle()}</h1>

                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-purple-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-[#111] border border-[#222] rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors w-64 placeholder:text-gray-700 hover:border-[#333]"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Dark Mode Toggle Switch */}
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    defaultChecked={true}
                                    onChange={(e) => {
                                        // Toggle dark mode logic can be added here
                                        document.documentElement.classList.toggle('dark', e.target.checked);
                                    }}
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                            <div className="flex items-center gap-2 text-gray-400 hover:text-white cursor-pointer transition-colors">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-gray-300">This Month</span>
                                <FiChevronDown size={14} />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Scroll Area */}
                <div className="flex-1 overflow-auto p-8 relative">
                    <div className="max-w-7xl mx-auto h-full">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
        </>
    );
};

export default AdminLayout;
