// src/pages/public/Landing.jsx

import { useState, useEffect } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import { BrochureModal } from '../../components/school/BrochureModal';
import { ApplicationFormModal } from '../../components/school/ApplicationFormModal';
import { FeeStructureModal } from '../../components/school/FeeStructureModal';

const Landing = () => {
  const { user } = useAuthContext();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [brochureOpen, setBrochureOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [feeOpen, setFeeOpen] = useState(false);

  useEffect(() => {
    api.get('/school/settings').then(res => setSettings(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-[var(--text-secondary)]">Loading...</div>;

  return (
    <div>
      <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 lg:py-28 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">{settings?.schoolName || 'School'}</h1>
          <p className="mt-4 text-lg text-primary-100">{settings?.motto || 'Technology for Tomorrow'}</p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" className="bg-white text-primary-700 hover:bg-gray-100" onClick={() => setBrochureOpen(true)}>📖 View Brochure</Button>
            <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white border-none" onClick={() => setApplyOpen(true)}>📝 Apply Now</Button>
          </div>
        </div>
      </section>

      <section id="about" className="py-16">
        <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">About Us</h2>
            <p className="text-[var(--text-secondary)]">{settings?.landing?.aboutText || 'Quality tech education.'}</p>
            <div className="mt-4 space-y-1 text-sm text-[var(--text-secondary)]">
              <p>📍 {settings?.address || 'Nairobi, Kenya'}</p>
              <p>📞 {settings?.phone || '+254 700 123 456'}</p>
              <p>✉️ {settings?.email || 'info@school.com'}</p>
            </div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl h-64 flex items-center justify-center overflow-hidden">
            {settings?.landing?.heroImage ? <img src={settings.landing.heroImage} alt="School" className="w-full h-full object-cover" /> : <span className="text-[var(--text-secondary)]">School Photo</span>}
          </div>
        </div>
      </section>

      <section id="courses" className="py-16 bg-blue-50 dark:bg-blue-950">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[var(--text-primary)] mb-10">Our Courses</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {(settings?.courses || []).map((course, i) => (
              <div key={i} className="card text-center">
                <span className="text-3xl">💻</span>
                <h3 className="font-bold text-lg mt-3">{course.name}</h3>
                {course.description && <p className="text-sm text-[var(--text-secondary)] mt-2">{course.description}</p>}
                <p className="text-sm text-[var(--text-secondary)] mt-2">{course.durationMonths} months • KES {course.totalFee?.toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="secondary" onClick={() => setFeeOpen(true)}>💰 View Full Fee Structure</Button>
          </div>
        </div>
      </section>

      <section id="contact" className="py-16 text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Find Us</h2>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 text-[var(--text-secondary)]">
            <p className="text-2xl mb-2">📍</p>
            <p>{settings?.address || 'Nairobi, Kenya'}</p>
            <p className="mt-2">📞 {settings?.phone || '+254 700 123 456'}</p>
            <p>✉️ {settings?.email || 'info@school.com'}</p>
          </div>
        </div>
      </section>

      <BrochureModal isOpen={brochureOpen} onClose={() => setBrochureOpen(false)} />
      <ApplicationFormModal isOpen={applyOpen} onClose={() => setApplyOpen(false)} />
      <FeeStructureModal isOpen={feeOpen} onClose={() => setFeeOpen(false)} />
    </div>
  );
};

export default Landing;