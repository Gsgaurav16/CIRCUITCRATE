import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FiMail, FiUsers, FiBookOpen, FiClock, FiCheck, FiX, FiBell } from 'react-icons/fi';

const AdminNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, contact, workshop, course

    useEffect(() => {
        fetchNotifications();
    }, [filter]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const allNotifications = [];

            // Fetch contact submissions
            if (filter === 'all' || filter === 'contact') {
                const { data: contacts, error: contactError } = await supabase
                    .from('contact_submissions')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!contactError && contacts) {
                    contacts.forEach(contact => {
                        allNotifications.push({
                            id: contact.id,
                            type: 'contact',
                            title: `New Contact Form Submission`,
                            message: `${contact.first_name} ${contact.last_name} - ${contact.subject}`,
                            details: {
                                name: `${contact.first_name} ${contact.last_name}`,
                                email: contact.email,
                                subject: contact.subject,
                                message: contact.message
                            },
                            read: contact.read || false,
                            createdAt: contact.created_at
                        });
                    });
                }
            }

            // Fetch workshop registrations
            if (filter === 'all' || filter === 'workshop') {
                // Fetch registrations first
                const { data: registrations, error: regError } = await supabase
                    .from('workshop_registrations')
                    .select('*')
                    .order('registered_at', { ascending: false });

                if (!regError && registrations && registrations.length > 0) {
                    // Fetch related data separately
                    const workshopIds = [...new Set(registrations.map(r => r.workshop_id))];
                    const userIds = [...new Set(registrations.map(r => r.user_id))];

                    const { data: workshops } = await supabase
                        .from('workshops')
                        .select('id, title')
                        .in('id', workshopIds);

                    const { data: profiles } = await supabase
                        .from('profiles')
                        .select('id, full_name, email')
                        .in('id', userIds);

                    registrations.forEach(reg => {
                        const workshop = workshops?.find(w => w.id === reg.workshop_id);
                        const profile = profiles?.find(p => p.id === reg.user_id);
                        allNotifications.push({
                            id: reg.id,
                            type: 'workshop',
                            title: `New Workshop Registration`,
                            message: `${profile?.full_name || profile?.email || 'User'} registered for ${workshop?.title || 'Workshop'}`,
                            details: {
                                userName: profile?.full_name || profile?.email || 'Unknown',
                                workshopTitle: workshop?.title || 'Unknown Workshop',
                                registeredAt: reg.registered_at
                            },
                            read: false,
                            createdAt: reg.registered_at
                        });
                    });
                } else if (regError) {
                    console.error('Error fetching workshop registrations:', regError);
                }
            }

            // Fetch course enrollments
            if (filter === 'all' || filter === 'course') {
                // Fetch enrollments first
                const { data: enrollments, error: enrollError } = await supabase
                    .from('course_enrollments')
                    .select('*')
                    .order('enrolled_at', { ascending: false });

                if (!enrollError && enrollments && enrollments.length > 0) {
                    // Fetch related data separately
                    const courseIds = [...new Set(enrollments.map(e => e.course_id))];
                    const userIds = [...new Set(enrollments.map(e => e.user_id))];

                    const { data: courses } = await supabase
                        .from('courses')
                        .select('id, title')
                        .in('id', courseIds);

                    const { data: profiles } = await supabase
                        .from('profiles')
                        .select('id, full_name, email')
                        .in('id', userIds);

                    enrollments.forEach(enrollment => {
                        const course = courses?.find(c => c.id === enrollment.course_id);
                        const profile = profiles?.find(p => p.id === enrollment.user_id);
                        allNotifications.push({
                            id: enrollment.id,
                            type: 'course',
                            title: `New Course Enrollment`,
                            message: `${profile?.full_name || profile?.email || 'User'} enrolled in ${course?.title || 'Course'}`,
                            details: {
                                userName: profile?.full_name || profile?.email || 'Unknown',
                                courseTitle: course?.title || 'Unknown Course',
                                progress: enrollment.progress || 0,
                                enrolledAt: enrollment.enrolled_at
                            },
                            read: false,
                            createdAt: enrollment.enrolled_at
                        });
                    });
                } else if (enrollError) {
                    console.error('Error fetching course enrollments:', enrollError);
                }
            }

            // Sort by date (newest first)
            allNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setNotifications(allNotifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notification) => {
        if (notification.type === 'contact') {
            const { error } = await supabase
                .from('contact_submissions')
                .update({ read: true })
                .eq('id', notification.id);
            
            if (!error) {
                setNotifications(prev => 
                    prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
                );
            }
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'contact':
                return <FiMail className="text-blue-400" size={20} />;
            case 'workshop':
                return <FiUsers className="text-purple-400" size={20} />;
            case 'course':
                return <FiBookOpen className="text-green-400" size={20} />;
            default:
                return <FiClock className="text-gray-400" size={20} />;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="p-8">
                <div className="text-white">Loading notifications...</div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Notifications</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            filter === 'all' 
                                ? 'bg-purple-600 text-white' 
                                : 'bg-[#111] text-gray-400 hover:text-white'
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('contact')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            filter === 'contact' 
                                ? 'bg-purple-600 text-white' 
                                : 'bg-[#111] text-gray-400 hover:text-white'
                        }`}
                    >
                        Contact
                    </button>
                    <button
                        onClick={() => setFilter('workshop')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            filter === 'workshop' 
                                ? 'bg-purple-600 text-white' 
                                : 'bg-[#111] text-gray-400 hover:text-white'
                        }`}
                    >
                        Workshops
                    </button>
                    <button
                        onClick={() => setFilter('course')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            filter === 'course' 
                                ? 'bg-purple-600 text-white' 
                                : 'bg-[#111] text-gray-400 hover:text-white'
                        }`}
                    >
                        Courses
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <FiBell size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No notifications found</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`bg-[#111] rounded-lg p-6 border ${
                                notification.read 
                                    ? 'border-[#222] opacity-60' 
                                    : 'border-purple-500/30'
                            }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="mt-1">
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-white font-semibold mb-1">
                                                {notification.title}
                                            </h3>
                                            <p className="text-gray-400 text-sm mb-2">
                                                {notification.message}
                                            </p>
                                            {notification.type === 'contact' && notification.details && (
                                                <div className="mt-3 p-3 bg-black rounded border border-[#222] text-sm">
                                                    <p className="text-gray-300"><strong>From:</strong> {notification.details.name}</p>
                                                    <p className="text-gray-300"><strong>Email:</strong> {notification.details.email}</p>
                                                    <p className="text-gray-300"><strong>Subject:</strong> {notification.details.subject}</p>
                                                    <p className="text-gray-300 mt-2"><strong>Message:</strong></p>
                                                    <p className="text-gray-400 mt-1">{notification.details.message}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">
                                                {formatDate(notification.createdAt)}
                                            </span>
                                            {!notification.read && notification.type === 'contact' && (
                                                <button
                                                    onClick={() => markAsRead(notification)}
                                                    className="p-2 hover:bg-[#222] rounded transition-colors"
                                                    title="Mark as read"
                                                >
                                                    <FiCheck className="text-green-400" size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminNotifications;

