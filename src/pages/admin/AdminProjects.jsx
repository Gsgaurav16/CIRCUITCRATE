import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import DataTable from '../../components/admin/ui/DataTable';
import AdminModal from '../../components/admin/ui/AdminModal';
import { FiPlus } from 'react-icons/fi';

const AdminProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProject, setCurrentProject] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        image_url: '',
        difficulty: 'Beginner',
        time: '',
        tools: '' // Will split by comma and convert to array
    });

    useEffect(() => {
        fetchProjects();
        
        // Listen for quick add event
        const handleOpenModal = (e) => {
            if (e.detail === 'projects') {
                setIsModalOpen(true);
            }
        };
        window.addEventListener('openAddModal', handleOpenModal);
        
        return () => {
            window.removeEventListener('openAddModal', handleOpenModal);
        };
    }, []);

    const fetchProjects = async () => {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProjects(data);
        } catch (error) {
            console.error('Error fetching projects:', error);
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
            const projectData = {
                title: formData.title.trim(),
                description: formData.description?.trim() || null,
                category: formData.category,
                difficulty: formData.difficulty,
                time: formData.time.trim(),
                image_url: formData.image_url?.trim() || null,
                tools: formData.tools ? formData.tools.split(',').map(tool => tool.trim()).filter(tool => tool) : []
            };

            if (currentProject) {
                const { error } = await supabase
                    .from('projects')
                    .update(projectData)
                    .eq('id', currentProject.id);
                if (error) throw error;
            } else {
                // Generate ID from title for new projects
                const id = formData.title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                const { error } = await supabase
                    .from('projects')
                    .insert([{ ...projectData, id }]);
                if (error) throw error;
            }
            fetchProjects();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving project:', error);
            alert(`Error saving project: ${error.message}`);
        }
    };

    const handleDelete = async (project) => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;
        try {
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', project.id);
            if (error) throw error;
            fetchProjects();
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    };

    const handleEdit = (project) => {
        setCurrentProject(project);
        setFormData({
            title: project.title || '',
            description: project.description || '',
            category: project.category || '',
            image_url: project.image_url || '',
            difficulty: project.difficulty || 'Beginner',
            time: project.time || '',
            tools: Array.isArray(project.tools) ? project.tools.join(', ') : project.tools || ''
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentProject(null);
        setFormData({
            title: '',
            description: '',
            category: '',
            image_url: '',
            difficulty: 'Beginner',
            time: '',
            tools: ''
        });
    };

    const columns = [
        { header: 'Title', accessor: 'title' },
        { header: 'Category', accessor: 'category' },
        { header: 'Difficulty', accessor: 'difficulty' },
    ];

    if (loading) return <div className="text-white">Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Manage Projects</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                    <FiPlus size={20} />
                    <span>Add Project</span>
                </button>
            </div>

            <DataTable
                columns={columns}
                data={projects}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <AdminModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={currentProject ? 'Edit Project' : 'Add New Project'}
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
                                <option value="">Select Category</option>
                                <option value="Start from Basics">Start from Basics</option>
                                <option value="Improve Through Projects">Improve Through Projects</option>
                                <option value="Write Simple Code">Write Simple Code</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Difficulty</label>
                            <select
                                name="difficulty"
                                value={formData.difficulty}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Time</label>
                        <input
                            type="text"
                            name="time"
                            value={formData.time}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g., 15 mins, 1 hour, 30 minutes"
                            className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Image URL</label>
                            <input
                                type="text"
                                name="image_url"
                                value={formData.image_url}
                                onChange={handleInputChange}
                                placeholder="https://example.com/image.jpg"
                                className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Tools (comma separated)</label>
                            <input
                                type="text"
                                name="tools"
                                value={formData.tools}
                                onChange={handleInputChange}
                                placeholder="Arduino, Sensors, LED"
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
                            {currentProject ? 'Update Project' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </AdminModal>
        </div>
    );
};

export default AdminProjects;
