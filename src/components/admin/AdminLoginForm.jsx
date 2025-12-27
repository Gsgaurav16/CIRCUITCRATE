import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

const AdminLoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) throw signInError;

            // Check if user is admin
            if (data.user) {
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', data.user.id)
                    .single();

                if (profileError) throw profileError;

                if (!profile || !profile.is_admin) {
                    await supabase.auth.signOut();
                    setError('Access denied. Admin privileges required.');
                    setLoading(false);
                    return;
                }

                // Reload the page to re-run auth checks
                window.location.reload();
            }
        } catch (err) {
            setError(err.message || 'Failed to sign in');
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-screen bg-[#0a0a0a] items-center justify-center">
            <div className="w-full max-w-md p-8 bg-[#111] rounded-lg border border-[#222] shadow-2xl">
                <div className="mb-8 text-center">
                    <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-[0_0_15px_-3px_rgba(147,51,234,0.3)]">
                        CC
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
                    <p className="text-gray-400 text-sm">Sign in to access the admin dashboard</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 placeholder-gray-600"
                            placeholder="admin@example.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 placeholder-gray-600"
                            placeholder="Enter your password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <a href="/" className="text-sm text-gray-400 hover:text-purple-400 transition-colors">
                        ← Back to Home
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginForm;

