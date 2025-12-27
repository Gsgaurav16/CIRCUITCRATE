import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import DataTable from '../../components/admin/ui/DataTable';
import AdminModal from '../../components/admin/ui/AdminModal';
import { FiPlus } from 'react-icons/fi';

const AdminElectronics = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        how_it_works: '',
        image_url: ''
    });

    useEffect(() => {
        fetchItems();
        
        // Listen for quick add event
        const handleOpenModal = (e) => {
            if (e.detail === 'electronics') {
                setIsModalOpen(true);
            }
        };
        window.addEventListener('openAddModal', handleOpenModal);
        
        return () => {
            window.removeEventListener('openAddModal', handleOpenModal);
        };
    }, []);

    const fetchItems = async () => {
        try {
            const { data, error } = await supabase
                .from('electronics')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            setItems(data);
        } catch (error) {
            console.error('Error fetching electronics:', error);
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
            // Generate ID from name (lowercase, replace spaces with underscores)
            const itemData = {
                name: formData.name.trim(),
                description: formData.description?.trim() || null,
                category: formData.category,
                how_it_works: formData.how_it_works?.trim() || null,
                image_url: formData.image_url?.trim() || null
            };

            if (currentItem) {
                const { error } = await supabase
                    .from('electronics')
                    .update(itemData)
                    .eq('id', currentItem.id);
                if (error) throw error;
            } else {
                // Generate ID from name for new items
                const id = formData.name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                const { error } = await supabase
                    .from('electronics')
                    .insert([{ ...itemData, id }]);
                if (error) throw error;
            }
            fetchItems();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving item:', error);
            alert(`Error saving item: ${error.message}`);
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        try {
            const { error } = await supabase
                .from('electronics')
                .delete()
                .eq('id', item.id);
            if (error) throw error;
            fetchItems();
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    const handleEdit = (item) => {
        setCurrentItem(item);
        setFormData({
            name: item.name || '',
            description: item.description || '',
            category: item.category || '',
            how_it_works: item.how_it_works || '',
            image_url: item.image_url || ''
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
        setFormData({
            name: '',
            description: '',
            category: '',
            how_it_works: '',
            image_url: ''
        });
    };

    const columns = [
        { header: 'Name', accessor: 'name' },
        { header: 'Category', accessor: 'category' },
        {
            header: 'Description', accessor: 'description', render: (item) => (
                <span className="text-xs truncate max-w-[200px] block" title={item.description || ''}>
                    {item.description || 'No description'}
                </span>
            )
        },
    ];

    if (loading) return <div className="text-white">Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Manage Electronics</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                    <FiPlus size={20} />
                    <span>Add Component</span>
                </button>
            </div>

            <DataTable
                columns={columns}
                data={items}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <AdminModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={currentItem ? 'Edit Component' : 'Add New Component'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
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
                            <option value="Passives">Passives</option>
                            <option value="Semiconductors">Semiconductors</option>
                            <option value="ICs">ICs</option>
                            <option value="Sensors">Sensors</option>
                            <option value="Displays">Displays</option>
                            <option value="Electromechanical">Electromechanical</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">How It Works</label>
                        <textarea
                            name="how_it_works"
                            value={formData.how_it_works}
                            onChange={handleInputChange}
                            rows="3"
                            className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                            placeholder="Explain how this component works..."
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
                            placeholder="https://example.com/image.jpg"
                        />
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
                            {currentItem ? 'Update Component' : 'Create Component'}
                        </button>
                    </div>
                </form>
            </AdminModal>
        </div>
    );
};

export default AdminElectronics;
