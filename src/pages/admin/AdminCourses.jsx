import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import DataTable from '../../components/admin/ui/DataTable';
import AdminModal from '../../components/admin/ui/AdminModal';
import { FiPlus } from 'react-icons/fi';

const AdminCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCourse, setCurrentCourse] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Beginner',
        lessons: '',
        level: 1,
        image_url: ''
    });

    useEffect(() => {
        fetchCourses();
        
        // Listen for quick add event
        const handleOpenModal = (e) => {
            if (e.detail === 'courses') {
                setIsModalOpen(true);
            }
        };
        window.addEventListener('openAddModal', handleOpenModal);
        
        return () => {
            window.removeEventListener('openAddModal', handleOpenModal);
        };
    }, []);

    const fetchCourses = async () => {
        try {
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .order('id', { ascending: true });

            if (error) throw error;
            setCourses(data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Convert form data to match database schema
            // Ensure we don't include 'id' - let the database auto-generate it
            const courseData = {
                title: formData.title.trim(),
                description: formData.description?.trim() || null,
                category: formData.category,
                level: parseInt(formData.level, 10),
                lessons: parseInt(formData.lessons, 10) || 0,
                image_url: formData.image_url?.trim() || null
            };
            
            // Remove any undefined values
            Object.keys(courseData).forEach(key => {
                if (courseData[key] === undefined) {
                    delete courseData[key];
                }
            });

            if (currentCourse) {
                const { error } = await supabase
                    .from('courses')
                    .update(courseData)
                    .eq('id', currentCourse.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('courses')
                    .insert([courseData]);
                if (error) throw error;
            }
            fetchCourses();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving course:', error);
            alert(`Error saving course: ${error.message}`);
        }
    };

    const handleDelete = async (course) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;

        try {
            const { error } = await supabase
                .from('courses')
                .delete()
                .eq('id', course.id);

            if (error) throw error;
            fetchCourses();
        } catch (error) {
            console.error('Error deleting course:', error);
            alert('Error deleting course');
        }
    };

    const handleEdit = (course) => {
        setCurrentCourse(course);
        setFormData({
            title: course.title,
            description: course.description || '',
            category: course.category,
            lessons: course.lessons?.toString() || '',
            level: course.level?.toString() || '1',
            image_url: course.image_url || ''
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentCourse(null);
        setFormData({
            title: '',
            description: '',
            category: 'Beginner',
            lessons: '',
            level: '1',
            image_url: ''
        });
    };

    const columns = [
        { header: 'Title', accessor: 'title' },
        { header: 'Category', accessor: 'category' },
        { 
            header: 'Level', 
            accessor: 'level',
            render: (item) => `Level ${item.level}`
        },
        { header: 'Lessons', accessor: 'lessons' },
    ];

    if (loading) return <div className="text-white">Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Manage Courses</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                    <FiPlus size={20} />
                    <span>Add Course</span>
                </button>
            </div>

            <DataTable
                columns={columns}
                data={courses}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <AdminModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={currentCourse ? 'Edit Course' : 'Add New Course'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                            rows="3"
                            className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Level (1-3)</label>
                            <select
                                name="level"
                                value={formData.level}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                            >
                                <option value="1">Level 1</option>
                                <option value="2">Level 2</option>
                                <option value="3">Level 3</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Lessons</label>
                            <input
                                type="number"
                                name="lessons"
                                value={formData.lessons}
                                onChange={handleInputChange}
                                placeholder="Number of lessons"
                                required
                                min="0"
                                className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Image URL</label>
                            <input
                                type="text"
                                name="image_url"
                                value={formData.image_url}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                        >
                            {currentCourse ? 'Update Course' : 'Create Course'}
                        </button>
                    </div>
                </form>
            </AdminModal>
        </div>
    );
};

export default AdminCourses;
