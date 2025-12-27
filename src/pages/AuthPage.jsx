import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '../components/ui/premium-auth';

const AuthPage = () => {
    const navigate = useNavigate();

    const handleAuthSuccess = (userData) => {
        // Redirect to home page after successful login/signup
        setTimeout(() => {
            navigate('/');
        }, 1000); // Small delay to show success message
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4" style={{ paddingTop: '100px' }}>
            <div className="w-full max-w-md">
                <AuthForm onSuccess={handleAuthSuccess} />
            </div>
        </div>
    );
};

export default AuthPage;


