import React, { useState, useEffect } from 'react';
import { FiSave, FiUser, FiMail, FiLock, FiBell, FiCheckCircle, FiXCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import { supabase } from '../../lib/supabase';

const AdminSettings = () => {
    const [profile, setProfile] = useState({
        full_name: '',
        email: '',
        email_notifications: true,
        contact_notifications: true,
        workshop_notifications: true,
        course_notifications: true,
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError) throw userError;
            if (!user) {
                setMessage({ type: 'error', text: 'User not logged in.' });
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('full_name, email, email_notifications, contact_notifications, workshop_notifications, course_notifications')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            setProfile({
                full_name: data.full_name || '',
                email: data.email || user.email,
                email_notifications: data.email_notifications ?? true,
                contact_notifications: data.contact_notifications ?? true,
                workshop_notifications: data.workshop_notifications ?? true,
                course_notifications: data.course_notifications ?? true,
            });
        } catch (error) {
            console.error('Error fetching profile:', error.message);
            setMessage({ type: 'error', text: 'Failed to load settings: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        // Validation
        if (!profile.full_name || profile.full_name.trim().length === 0) {
            setMessage({ type: 'error', text: 'Full name is required.' });
            setSaving(false);
            return;
        }

        if (!profile.email || profile.email.trim().length === 0) {
            setMessage({ type: 'error', text: 'Email address is required.' });
            setSaving(false);
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(profile.email.trim())) {
            setMessage({ type: 'error', text: 'Please enter a valid email address.' });
            setSaving(false);
            return;
        }

        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            if (!user) throw new Error('User not logged in. Please refresh the page.');

            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: profile.full_name.trim(),
                    email: profile.email.trim().toLowerCase(),
                    email_notifications: profile.email_notifications ?? true,
                    contact_notifications: profile.contact_notifications ?? true,
                    workshop_notifications: profile.workshop_notifications ?? true,
                    course_notifications: profile.course_notifications ?? true,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) {
                if (error.code === '23505') {
                    throw new Error('An account with this email already exists.');
                }
                throw error;
            }

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            
            // Clear message after 3 seconds
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: 'Failed to update profile: ' + (error.message || 'An unexpected error occurred. Please try again.') });
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordSaving(true);
        setMessage({ type: '', text: '' });

        // Validate passwords
        if (!passwordData.newPassword || passwordData.newPassword.trim().length === 0) {
            setMessage({ type: 'error', text: 'New password is required.' });
            setPasswordSaving(false);
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
            setPasswordSaving(false);
            return;
        }

        if (passwordData.newPassword.length > 72) {
            setMessage({ type: 'error', text: 'Password is too long. Maximum 72 characters allowed.' });
            setPasswordSaving(false);
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match. Please try again.' });
            setPasswordSaving(false);
            return;
        }

        try {
            // Verify user is still authenticated
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                throw new Error('Session expired. Please refresh the page and try again.');
            }

            // Update password using Supabase auth
            const { error: updateError } = await supabase.auth.updateUser({
                password: passwordData.newPassword
            });

            if (updateError) {
                if (updateError.message.includes('same as')) {
                    throw new Error('New password must be different from your current password.');
                }
                throw updateError;
            }

            setMessage({ type: 'success', text: 'Password updated successfully!' });
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            
            // Clear message after 3 seconds
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error updating password:', error);
            setMessage({ type: 'error', text: 'Failed to update password: ' + (error.message || 'An unexpected error occurred. Please try again.') });
        } finally {
            setPasswordSaving(false);
        }
    };

    if (loading) {
        return <div className="text-white text-center py-8">Loading settings...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-[#0a0a0a] rounded-lg">
            <h2 className="text-3xl font-bold text-white mb-8">Admin Settings</h2>

            {message.text && (
                <div className={`p-3 mb-4 rounded-md flex items-center gap-2 ${
                    message.type === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                }`}>
                    {message.type === 'success' ? <FiCheckCircle /> : <FiXCircle />}
                    {message.text}
                </div>
            )}

            <div className="space-y-8">
                {/* Profile Settings */}
                <div>
                    <h3 className="text-xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
                        <FiUser /> Profile Information
                    </h3>
                    <form onSubmit={handleProfileSubmit} className="bg-[#111] rounded-lg p-6 border border-[#222]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="full_name" className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    id="full_name"
                                    name="full_name"
                                    value={profile.full_name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={profile.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    <><FiSave /> Save Profile</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Change Password */}
                <div>
                    <h3 className="text-xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
                        <FiLock /> Change Password
                    </h3>
                    <form onSubmit={handlePasswordSubmit} className="bg-[#111] rounded-lg p-6 border border-[#222]">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-400 mb-1">Current Password</label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        id="currentPassword"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 pr-10"
                                        placeholder="Enter current password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                    >
                                        {showCurrentPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-400 mb-1">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        id="newPassword"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 pr-10"
                                        placeholder="Enter new password (min 6 characters)"
                                        minLength={6}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                    >
                                        {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400 mb-1">Confirm New Password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 pr-10"
                                        placeholder="Confirm new password"
                                        minLength={6}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                    >
                                        {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={passwordSaving}
                            >
                                {passwordSaving ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Updating...
                                    </>
                                ) : (
                                    <><FiLock /> Update Password</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Notification Preferences */}
                <div>
                    <h3 className="text-xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
                        <FiBell /> Notification Preferences
                    </h3>
                    <div className="bg-[#111] rounded-lg p-6 border border-[#222]">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between bg-black p-4 rounded-lg border border-[#222]">
                                <label htmlFor="email_notifications" className="text-gray-300 cursor-pointer">Receive Email Notifications</label>
                                <input
                                    type="checkbox"
                                    id="email_notifications"
                                    name="email_notifications"
                                    checked={profile.email_notifications}
                                    onChange={handleInputChange}
                                    className="h-5 w-5 text-purple-600 rounded border-gray-600 focus:ring-purple-500"
                                />
                            </div>
                            <div className="flex items-center justify-between bg-black p-4 rounded-lg border border-[#222]">
                                <label htmlFor="contact_notifications" className="text-gray-300 cursor-pointer">Notify on New Contact Form Submissions</label>
                                <input
                                    type="checkbox"
                                    id="contact_notifications"
                                    name="contact_notifications"
                                    checked={profile.contact_notifications}
                                    onChange={handleInputChange}
                                    className="h-5 w-5 text-purple-600 rounded border-gray-600 focus:ring-purple-500"
                                />
                            </div>
                            <div className="flex items-center justify-between bg-black p-4 rounded-lg border border-[#222]">
                                <label htmlFor="workshop_notifications" className="text-gray-300 cursor-pointer">Notify on New Workshop Registrations</label>
                                <input
                                    type="checkbox"
                                    id="workshop_notifications"
                                    name="workshop_notifications"
                                    checked={profile.workshop_notifications}
                                    onChange={handleInputChange}
                                    className="h-5 w-5 text-purple-600 rounded border-gray-600 focus:ring-purple-500"
                                />
                            </div>
                            <div className="flex items-center justify-between bg-black p-4 rounded-lg border border-[#222]">
                                <label htmlFor="course_notifications" className="text-gray-300 cursor-pointer">Notify on New Course Enrollments</label>
                                <input
                                    type="checkbox"
                                    id="course_notifications"
                                    name="course_notifications"
                                    checked={profile.course_notifications}
                                    onChange={handleInputChange}
                                    className="h-5 w-5 text-purple-600 rounded border-gray-600 focus:ring-purple-500"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleProfileSubmit(e);
                                }}
                                className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    <><FiSave /> Save Notification Preferences</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;

