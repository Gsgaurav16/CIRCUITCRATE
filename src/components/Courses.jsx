import React, { useState, useEffect } from 'react';
import { getCourses } from '../lib/supabase';
import { BookOpen, Clock, X, CheckCircle, GraduationCap } from 'lucide-react';
import './Courses.css';

const Courses = () => {
    const [filter, setFilter] = useState('All');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const categories = ['All', 'Beginner', 'Intermediate', 'Advanced'];

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const data = await getCourses();
            // Transform data to match component structure
            const transformedCourses = data.map(course => ({
                id: course.id,
                title: course.title,
                desc: course.description || '',
                category: course.category,
                lessons: course.lessons || 0,
                color: course.color || '#6366f1',
                image: course.image_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
                outcomes: course.outcomes || [],
                syllabus: course.syllabus || []
            }));
            setCourses(transformedCourses);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCourses = filter === 'All'
        ? courses
        : courses.filter(c => c.category === filter);

    return (
        <section id="courses" className="courses-section">
            <div className="container mx-auto px-4">
                <div className="courses-header">
                    <h2 className="courses-title">Explore Our <span className="text-gradient">Curriculum</span></h2>
                    <p className="courses-subtitle">
                        A comprehensive learning path from basic electronics to advanced robotics.
                    </p>
                </div>

                <div className="course-filters">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`filter-chip ${filter === cat ? 'active' : ''}`}
                            onClick={() => setFilter(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="courses-grid">
                    {loading ? (
                        <div className="text-white text-center py-12">Loading courses...</div>
                    ) : filteredCourses.length === 0 ? (
                        <div className="text-white text-center py-12">No courses found.</div>
                    ) : (
                        filteredCourses.map((course) => (
                        <div
                            key={course.id}
                            className="course-card"
                            style={{ '--accent-color': course.color }}
                        >
                            <div className="course-image-wrapper">
                                <img src={course.image} alt={course.title} loading="lazy" />
                                <span className="level-badge">{course.category}</span>
                            </div>

                            <div className="course-content">
                                <h3 className="course-title">{course.title}</h3>
                                <p className="course-desc">{course.desc}</p>

                                <div className="course-meta">
                                    <div className="meta-item">
                                        <BookOpen size={14} />
                                        {course.lessons} Lessons
                                    </div>
                                    <div className="meta-item">
                                        <Clock size={14} />
                                        Self-paced
                                    </div>
                                </div>

                                <button
                                    className="course-btn"
                                    onClick={() => setSelectedCourse(course)}
                                >
                                    Start Learning
                                </button>
                            </div>
                        </div>
                        ))
                    )}
                </div>
            </div>

            {/* Course Details Modal */}
            {selectedCourse && (
                <div className="modal-overlay" onClick={() => setSelectedCourse(null)}>
                    <div className="course-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-sidebar">
                            <img src={selectedCourse.image} alt={selectedCourse.title} className="modal-image" />
                            <div className="sidebar-content">
                                <h4 className="text-white font-bold mb-4">Course Outcomes</h4>
                                <ul className="space-y-2">
                                    {selectedCourse.outcomes?.map((outcome, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-400">
                                            <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                                            {outcome}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="modal-main">
                            <button className="modal-close-btn" onClick={() => setSelectedCourse(null)}>
                                <X size={24} />
                            </button>

                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                    {selectedCourse.category}
                                </span>
                                <span className="text-sm text-gray-400 flex items-center gap-1">
                                    <BookOpen size={14} /> {selectedCourse.lessons} Lessons
                                </span>
                            </div>

                            <h3 className="text-3xl font-bold text-white mb-4">{selectedCourse.title}</h3>
                            <p className="text-gray-300 mb-8 leading-relaxed">
                                {selectedCourse.desc} This course is designed to take you from the basics to building real functional prototypes.
                            </p>

                            <div className="syllabus-section">
                                <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <GraduationCap size={20} className="text-purple-400" /> Syllabus
                                </h4>
                                <ul className="syllabus-list">
                                    {selectedCourse.syllabus?.map((topic, idx) => (
                                        <li key={idx}>
                                            <span className="syllabus-number">{String(idx + 1).padStart(2, '0')}</span>
                                            {topic}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button className="enroll-btn">
                                Start Course Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Courses;
