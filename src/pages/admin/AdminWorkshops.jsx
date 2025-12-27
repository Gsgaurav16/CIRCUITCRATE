import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import DataTable from '../../components/admin/ui/DataTable';
import AdminModal from '../../components/admin/ui/AdminModal';
import { FiPlus } from 'react-icons/fi';

const AdminWorkshops = () => {
    const [workshops, setWorkshops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentWorkshop, setCurrentWorkshop] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        category: '',
        image_url: ''
    });

    useEffect(() => {
        fetchWorkshops();
        
        // Listen for quick add event
        const handleOpenModal = (e) => {
            if (e.detail === 'workshops') {
                setIsModalOpen(true);
            }
        };
        window.addEventListener('openAddModal', handleOpenModal);
        
        return () => {
            window.removeEventListener('openAddModal', handleOpenModal);
        };
    }, []);

    const fetchWorkshops = async () => {
        try {
            const { data, error } = await supabase
                .from('workshops')
                .select('*')
                .order('date', { ascending: true });

            if (error) throw error;
            setWorkshops(data);
        } catch (error) {
            console.error('Error fetching workshops:', error);
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
            const workshopData = {
                title: formData.title.trim(),
                description: formData.description?.trim() || null,
                date: formData.date.trim(),
                location: formData.location.trim(),
                category: formData.category.trim(),
                image_url: formData.image_url?.trim() || null,
                highlights: [] // Default empty array for highlights
            };
            
            // Remove any undefined values
            Object.keys(workshopData).forEach(key => {
                if (workshopData[key] === undefined) {
                    delete workshopData[key];
                }
            });

            if (currentWorkshop) {
                const { error } = await supabase
                    .from('workshops')
                    .update(workshopData)
                    .eq('id', currentWorkshop.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('workshops')
                    .insert([workshopData]);
                if (error) throw error;
            }
            fetchWorkshops();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving workshop:', error);
            alert(`Error saving workshop: ${error.message}`);
        }
    };

    const handleDelete = async (workshop) => {
        if (!window.confirm('Are you sure you want to delete this workshop?')) return;
        try {
            const { error } = await supabase
                .from('workshops')
                .delete()
                .eq('id', workshop.id);
            if (error) throw error;
            fetchWorkshops();
        } catch (error) {
            console.error('Error deleting workshop:', error);
        }
    };

    const handleEdit = (workshop) => {
        setCurrentWorkshop(workshop);
        setFormData({
            title: workshop.title,
            description: workshop.description || '',
            date: workshop.date,
            location: workshop.location,
            category: workshop.category || '',
            image_url: workshop.image_url || ''
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentWorkshop(null);
        setFormData({
            title: '',
            description: '',
            date: '',
            location: '',
            category: '',
            image_url: ''
        });
    };

    const columns = [
        { header: 'Title', accessor: 'title' },
        { header: 'Date', accessor: 'date' },
        { header: 'Location', accessor: 'location' },
        { header: 'Category', accessor: 'category' },
    ];

    if (loading) return <div className="text-white">Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Manage Workshops</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                    <FiPlus size={20} />
                    <span>Add Workshop</span>
                </button>
            </div>

            <DataTable
                columns={columns}
                data={workshops}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <AdminModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={currentWorkshop ? 'Edit Workshop' : 'Add New Workshop'}
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
                            <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
                            <input
                                type="text"
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                placeholder="e.g. March 15-16, 2026"
                                required
                                className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                placeholder="e.g. Competition, Workshop"
                                required
                                className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Location</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                required
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
                            {currentWorkshop ? 'Update Workshop' : 'Create Workshop'}
                        </button>
                    </div>
                </form>
            </AdminModal>
        </div>
    );
};

export default AdminWorkshops;
