import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import CoursesPage from './pages/CoursesPage';
import LearningPage from './pages/LearningPage';
import WorkshopsPage from './pages/WorkshopsPage';
import ContactPage from './pages/ContactPage';
import AuthPage from './pages/AuthPage';
import ElectronicsPage from './pages/ElectronicsPage';
import NotFoundPage from './components/demo-404';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCourses from './pages/admin/AdminCourses';
import AdminWorkshops from './pages/admin/AdminWorkshops';
import AdminElectronics from './pages/admin/AdminElectronics';
import AdminProjects from './pages/admin/AdminProjects';
import AdminSettings from './pages/admin/AdminSettings';
import AdminNotifications from './pages/admin/AdminNotifications';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="learning" element={<LearningPage />} />
          <Route path="workshops" element={<WorkshopsPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="auth" element={<AuthPage />} />
          <Route path="electronics" element={<ElectronicsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="workshops" element={<AdminWorkshops />} />
          <Route path="electronics" element={<AdminElectronics />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="notifications" element={<AdminNotifications />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
