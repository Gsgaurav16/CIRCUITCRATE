import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import StaggeredMenu from './StaggeredMenu';
import Footer from './Footer';
import logo from '../assets/c2_logo.png';

const Layout = () => {
    const location = useLocation();

    const menuItems = [
        { label: 'Home', ariaLabel: 'Home', link: '/' },
        { label: 'About', ariaLabel: 'About Us', link: '/about' },
        { label: 'Courses', ariaLabel: 'Our Courses', link: '/courses' },
        { label: 'Projects', ariaLabel: 'Projects', link: '/learning' },
        { label: 'Library', ariaLabel: 'Electronics Library', link: '/electronics' },
        { label: 'Workshops', ariaLabel: 'Events', link: '/workshops' },
        { label: 'Contact', ariaLabel: 'Contact', link: '/contact' }
        // Login item removed - now shown as UserIcon component
    ];

    const socialItems = [
        { label: 'Instagram', link: 'https://instagram.com' },
        { label: 'Twitter', link: 'https://twitter.com' },
        { label: 'LinkedIn', link: 'https://linkedin.com' }
    ];

    return (
        <div className="layout">
            <StaggeredMenu
                position="right"
                items={menuItems}
                socialItems={socialItems}
                displaySocials={true}
                displayItemNumbering={true}
                menuButtonColor="#ffffff"
                openMenuButtonColor="#000000"
                changeMenuColorOnOpen={true}
                colors={['#38bdf8', '#3b82f6', '#2563eb']}
                logoUrl={logo}
                accentColor="#38bdf8"
                isFixed={true}
                onMenuOpen={() => console.log('Menu opened')}
                onMenuClose={() => console.log('Menu closed')}
            />
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
