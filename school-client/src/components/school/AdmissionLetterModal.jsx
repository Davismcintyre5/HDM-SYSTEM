// src/components/school/AdmissionLetterModal.jsx

import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { printContent } from '../../utils/print';
import { useSettings } from '../../hooks/useSettings';
import api from '../../api/axios';

export const AdmissionLetterModal = ({ isOpen, onClose, application, onLetterGenerated }) => {
  const { settings } = useSettings();
  const [editableMessage, setEditableMessage] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (application && settings) {
      const defaultMessage = `We are pleased to offer you admission to the ${application.course} course at ${settings.schoolName || 'HDM Computer School'}. Your application has been accepted and we look forward to having you join our institution. Please report to the admissions office on ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()} to complete your registration.`;
      setEditableMessage(defaultMessage);
    }
  }, [application, settings]);

  const getLetterHTML = () => {
    if (!application || !settings) return '';
    const now = new Date();
    const refNo = `ADM/${application.course?.substring(0, 3).toUpperCase() || 'GEN'}/${application._id?.slice(-6) || '000000'}`;
    const schoolName = settings.schoolName || 'HDM Computer School';

    return `
      <h2>ADMISSION LETTER</h2>
      <table style="width: 100%; margin: 20px 0; background: #f9f9f9;">
        <tr><td style="width: 120px;"><strong>Date:</strong></td><td>${now.toLocaleDateString()}</td></tr>
        <tr><td><strong>Ref No:</strong></td><td>${refNo}</td></tr>
        <tr><td><strong>To:</strong></td><td>${application.name}</td></tr>
        <tr><td><strong>Contact:</strong></td><td>${application.email} | ${application.phone}</td></tr>
      </table>
      <p>Dear ${application.name},</p>
      <div style="margin: 20px 0; line-height: 1.6;">${editableMessage.replace(/\n/g, '<br/>')}</div>
      <p>We look forward to welcoming you to ${schoolName}.</p>
      <div class="signature" style="margin-top: 60px; text-align: right;">
        <p>Yours sincerely,</p>
        <div style="margin-top: 40px;"><p><strong>Admissions Office</strong></p></div>
      </div>
    `;
  };

  const downloadPDF = () => {
    const html = getLetterHTML();
    printContent(html, `Admission_Letter_${application?.name?.replace(/\s/g, '_') || 'Student'}`, settings);
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Admission Letter - ${application?.name}`,
          text: `Admission letter for ${application?.name} - ${application?.course}`,
          url: window.location.href
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          await navigator.clipboard.writeText(window.location.href);
          alert('Link copied to clipboard!');
        }
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const markGenerated = async () => {
    setGenerating(true);
    try {
      await api.put(`/school/applications/${application._id}`, {
        status: 'accepted',
        message: editableMessage
      });
      if (onLetterGenerated) onLetterGenerated();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setGenerating(false);
    }
  };

  if (!application) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Admission Letter" size="xl">
      <div className="mb-4">
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Message (editable)</label>
        <textarea
          rows={6}
          className="input"
          value={editableMessage}
          onChange={(e) => setEditableMessage(e.target.value)}
        />
        <p className="text-xs text-[var(--text-secondary)] mt-1">You can customize the message before generating the letter. This exact message will be sent to the student via email with a PDF attachment.</p>
      </div>

      <div className="border border-[var(--border-color)] p-6 mb-4 max-h-[500px] overflow-auto bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="min-w-[700px]" dangerouslySetInnerHTML={{ __html: getLetterHTML() }} />
      </div>

      <div className="flex justify-end gap-2 sticky bottom-0 bg-[var(--bg-primary)] pt-4 border-t border-[var(--border-color)]">
        <Button variant="secondary" onClick={downloadPDF}>📄 Print PDF</Button>
        <Button variant="secondary" onClick={share}>📤 Share</Button>
        <Button onClick={markGenerated} disabled={generating}>
          {generating ? 'Sending...' : '✓ Mark as Accepted & Send Email'}
        </Button>
      </div>
    </Modal>
  );
};

export default AdmissionLetterModal;