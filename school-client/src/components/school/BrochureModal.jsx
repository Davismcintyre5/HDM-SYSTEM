// src/components/school/BrochureModal.jsx

import { useSettings } from '../../hooks/useSettings';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/formatters';
import { printContent } from '../../utils/print';

export const BrochureModal = ({ isOpen, onClose }) => {
  const { settings, loading } = useSettings();
  const courses = settings?.courses || [];

  const getHTMLContent = () => {
    const coursesHtml = courses.map(c => `<div style="margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #eee;"><h3 style="color: #2f86eb; margin-bottom: 8px;">${c.name}</h3>${c.description ? `<p style="color: #666; margin-bottom: 8px;">${c.description}</p>` : ''}<p><strong>Duration:</strong> ${c.durationMonths} months</p><p><strong>Total Fee:</strong> ${formatCurrency(c.totalFee)}</p></div>`).join('');
    return `<h2>OUR COURSES</h2>${coursesHtml}`;
  };

  const downloadPDF = () => { const html = getHTMLContent(); printContent(html, `${settings?.schoolName || 'School'}_Brochure`, settings); };

  if (loading) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="School Brochure">
      <div className="max-h-96 overflow-auto">
        {courses.length === 0 ? <p className="text-[var(--text-secondary)] text-center py-8">No courses available.</p> : (
          <div className="space-y-4">{courses.map((c, i) => (<div key={i} className="border-b border-[var(--border-color)] pb-3"><h3 className="text-lg font-semibold text-primary-600">{c.name}</h3>{c.description && <p className="text-sm text-[var(--text-secondary)] mt-1">{c.description}</p>}<p className="text-[var(--text-secondary)] text-sm mt-1">{c.durationMonths} months · {formatCurrency(c.totalFee)}</p></div>))}</div>
        )}
      </div>
      <div className="flex justify-end gap-2 mt-4"><Button variant="secondary" onClick={downloadPDF}>🖨️ Download / Print PDF</Button></div>
    </Modal>
  );
};

export default BrochureModal;