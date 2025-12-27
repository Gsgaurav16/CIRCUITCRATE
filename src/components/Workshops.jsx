import React, { useState, useEffect } from 'react';
import { getWorkshops } from '../lib/supabase';
import { MapPin, Calendar, ArrowRight, X, Check } from 'lucide-react';
import './Workshops.css';

const Workshops = () => {
    const [selectedWorkshop, setSelectedWorkshop] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [workshops, setWorkshops] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWorkshops();
    }, []);

    const fetchWorkshops = async () => {
        try {
            setLoading(true);
            const data = await getWorkshops();
            // Transform data to match component structure
            const transformedWorkshops = data.map(workshop => ({
                id: workshop.id,
                title: workshop.title,
                desc: workshop.description || '',
                category: workshop.category || '',
                date: workshop.date || '',
                location: workshop.location || '',
                image: workshop.image_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
                highlights: workshop.highlights || []
            }));
            setWorkshops(transformedWorkshops);
        } catch (error) {
            console.error('Error fetching workshops:', error);
        } finally {
            setLoading(false);
        }
    };

    // In a real app, you'd handle form state here
    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate API call
        setTimeout(() => {
            setIsSuccess(true);
        }, 500);
    };

    const closeModal = () => {
        setSelectedWorkshop(null);
        setIsSuccess(false);
    };

    return (
        <section id="workshops" className="workshops-section">
            <div className="container mx-auto px-4">
                <div className="workshop-header">
                    <h2 className="workshop-title">Upcoming <span className="text-gradient">Workshops</span></h2>
                    <p className="workshop-desc">
                        Join our immersive, hands-on sessions designed to accelerate your hardware journey in record time.
                    </p>
                </div>

                <div className="workshop-grid">
                    {loading ? (
                        <div className="text-white text-center py-12">Loading workshops...</div>
                    ) : workshops.length === 0 ? (
                        <div className="text-white text-center py-12">No workshops found.</div>
                    ) : (
                        workshops.map((workshop) => (
                        <div key={workshop.id} className="workshop-card">
                            <div className="workshop-img-wrapper">
                                <img src={workshop.image} alt={workshop.title} className="workshop-img" />
                                <div className="workshop-date">
                                    {workshop.date}
                                </div>
                            </div>

                            <div className="workshop-content">
                                <span className="w-category">{workshop.category}</span>
                                <h3 className="w-title">{workshop.title}</h3>
                                <p className="w-text">{workshop.desc}</p>

                                <div className="w-highlights">
                                    {workshop.highlights.map((tag, i) => (
                                        <span key={i} className="w-tag">{tag}</span>
                                    ))}
                                </div>

                                <div className="w-location">
                                    <MapPin size={16} />
                                    {workshop.location}
                                </div>

                                <button
                                    className="w-btn"
                                    onClick={() => setSelectedWorkshop(workshop)}
                                >
                                    Register Now
                                </button>
                            </div>
                        </div>
                        ))
                    )}
                </div>

                <div className="cta-box">
                    <h3 className="cta-title">Want to host a workshop?</h3>
                    <p className="text-slate-400">
                        We bring the equipment, the curriculum, and the instructors to your school or college.
                    </p>
                    <button className="cta-btn-outline">
                        Partner With Us
                    </button>
                </div>
            </div>

            {/* Registration Modal */}
            {selectedWorkshop && (
                <div className="workshop-modal-overlay" onClick={closeModal}>
                    <div className="workshop-modal" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeModal}>
                            <X size={24} />
                        </button>

                        {!isSuccess ? (
                            <>
                                <div className="modal-header">
                                    <span>Registering for</span>
                                    <h3>{selectedWorkshop.title}</h3>
                                </div>

                                <form className="reg-form" onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input type="text" placeholder="Enter your name" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input type="email" placeholder="john@example.com" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input type="tel" placeholder="+91 98765 43210" required />
                                    </div>

                                    <button type="submit" className="submit-btn">
                                        Confirm Registration
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="success-message">
                                <div className="success-icon">
                                    <Check size={32} />
                                </div>
                                <h3>Registration Successful!</h3>
                                <p>We have sent the ticket details to your email.</p>
                                <button className="submit-btn" onClick={closeModal}>
                                    Done
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
};

export default Workshops;
