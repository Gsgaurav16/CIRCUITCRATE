import React, { useState } from 'react';
import './Contact.css';
import { submitContactForm } from '../lib/supabase';

const Contact = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Validate form
            if (!formData.firstName || !formData.lastName || !formData.email || !formData.subject || !formData.message) {
                setMessage({ type: 'error', text: 'Please fill in all fields' });
                setLoading(false);
                return;
            }

            // Submit to Supabase
            await submitContactForm(formData);
            
            // Success message
            setMessage({ type: 'success', text: 'Message sent successfully! We\'ll get back to you soon.' });
            
            // Reset form
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                subject: '',
                message: ''
            });
        } catch (error) {
            console.error('Error submitting form:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to send message. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="contact-section" id="contact">
            <div className="container contact-wrapper">
                {/* Left Side: Typography */}
                <div className="contact-text">
                    <h2 className="contact-title">
                        LET'S<br />
                        GET IN<br />
                        TOUCH
                    </h2>
                    <p className="contact-description">
                        We'd love to hear from you! Whether you have questions, feedback, or need support, feel free to reach out to us.
                    </p>
                </div>

                {/* Right Side: Form */}
                <div className="contact-form-container">
                    <form className="contact-form" onSubmit={handleSubmit}>
                        {message.text && (
                            <div className={`form-message ${message.type === 'success' ? 'success' : 'error'}`}>
                                {message.text}
                            </div>
                        )}
                        
                        <div className="form-row">
                            <div className="form-group half-width">
                                <label htmlFor="firstName">First Name</label>
                                <input 
                                    type="text" 
                                    id="firstName" 
                                    name="firstName" 
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group half-width">
                                <label htmlFor="lastName">Last Name</label>
                                <input 
                                    type="text" 
                                    id="lastName" 
                                    name="lastName" 
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="subject">Subject</label>
                            <input 
                                type="text" 
                                id="subject" 
                                name="subject" 
                                value={formData.subject}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="message">Message</label>
                            <textarea 
                                id="message" 
                                name="message" 
                                rows="5"
                                value={formData.message}
                                onChange={handleChange}
                                required
                            ></textarea>
                        </div>

                        <button 
                            type="submit" 
                            className="submit-btn" 
                            disabled={loading}
                        >
                            {loading ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Contact;
