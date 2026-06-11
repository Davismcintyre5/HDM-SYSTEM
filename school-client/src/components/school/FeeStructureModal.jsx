// src/components/school/FeeStructureModal.jsx

import { useState, useEffect } from 'react';
import { useSettings } from '../../hooks/useSettings';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/formatters';
import { printContent } from '../../utils/print';

export const FeeStructureModal = ({ isOpen, onClose }) => {
  const { settings, loading } = useSettings();
  const [courses, setCourses] = useState([]);

  useEffect(() => { if (settings?.courses) setCourses(settings.courses); }, [settings]);

  const getHTMLContent = () => {
    const now = new Date();
    const tableRows = courses.map(c => `<tr><td style="padding:12px;border:1px solid #ddd"><strong>${c.name}</strong>${c.description?`<br/><span style="font-size:12px;color:#666">${c.description}</span>`:''}</td><td style="padding:12px;border:1px solid #ddd;text-align:center">${c.durationMonths} months</td><td style="padding:12px;border:1px solid #ddd;text-align:right">${formatCurrency(c.totalFee)}</td></tr>`).join('');
    return `<h2>FEE STRUCTURE</h2><p>Effective from: ${now.toLocaleDateString()}</p><table style="width:100%;border-collapse:collapse;margin-top:20px"><thead><tr style="background:#f2f2f2"><th style="padding:12px;border:1px solid #ddd;text-align:left">Course</th><th style="padding:12px;border:1px solid #ddd;text-align:center">Duration</th><th style="padding:12px;border:1px solid #ddd;text-align:right">Total Fee (KES)</th></tr></thead><tbody>${tableRows}</tbody></table>`;
  };

  const downloadPDF = () => { const html = getHTMLContent(); printContent(html, `${settings?.schoolName||'School'}_Fee_Structure`, settings); };

  const share = async () => { if (navigator.share) { try { await navigator.share({ title: `${settings?.schoolName||'School'} Fee Structure`, text: 'Check out our course fees!', url: window.location.href }); } catch (err) { if (err.name!=='AbortError') { await navigator.clipboard.writeText(window.location.href); alert('Link copied!'); } } } else { await navigator.clipboard.writeText(window.location.href); alert('Link copied!'); } };

  if (loading) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Fee Structure">
      <div className="max-h-96 overflow-auto">
        {courses.length === 0 ? <p className="text-center py-8 text-[var(--text-secondary)]">No courses configured yet.</p> : (
          <table className="min-w-full"><thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="p-2 text-left">Course</th><th className="p-2 text-left">Duration</th><th className="p-2 text-left">Fee (KES)</th></tr></thead><tbody>{courses.map((c,i)=>(<tr key={i} className="border-t border-[var(--border-color)]"><td className="p-2"><div className="font-medium">{c.name}</div>{c.description&&<div className="text-xs text-[var(--text-secondary)]">{c.description}</div>}</td><td className="p-2">{c.durationMonths} months</td><td className="p-2">{formatCurrency(c.totalFee)}</td></tr>))}</tbody></table>
        )}
      </div>
      <div className="flex justify-end gap-2 mt-4"><Button variant="secondary" onClick={downloadPDF}>🖨️ Download / Print PDF</Button><Button onClick={share}>📤 Share</Button></div>
    </Modal>
  );
};

export default FeeStructureModal;