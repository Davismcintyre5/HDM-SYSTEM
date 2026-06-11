// src/components/school/CertificateModal.jsx

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useSettings } from '../../hooks/useSettings';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { printContent } from '../../utils/print';
import { formatShortDate } from '../../utils/formatters';

export const CertificateModal = ({ isOpen, onClose }) => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [serialNumber, setSerialNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);
  const { settings } = useSettings();

  useEffect(() => { if (isOpen) { api.get('/school/students').then(res => setStudents(res.data)).finally(() => setLoading(false)); } }, [isOpen]);

  const fetchOrGenerateNumber = async (studentId) => {
    try { const res = await api.get(`/school/certificates/generate/${studentId}`); setSerialNumber(res.data.serialNumber); }
    catch (err) { alert('Failed to generate certificate number'); }
  };

  const handleStudentSelect = (studentId) => {
    const student = students.find(s => s._id === studentId);
    setSelectedStudent(student);
    if (student) fetchOrGenerateNumber(student._id);
  };

// src/components/school/CertificateModal.jsx — printCertificate with portrait

const printCertificate = () => {
  if (!selectedStudent || !serialNumber) return;
  setPrinting(true);

  const schoolName = settings?.schoolName || 'HDM Computer School';
  const motto = settings?.motto || 'Technology for Tomorrow';
  const address = settings?.address || '';
  const phone = settings?.phone || '';
  const email = settings?.email || '';
  const now = new Date();
  const completionDate = selectedStudent.completionDate ? new Date(selectedStudent.completionDate) : null;
  const formattedCompletion = completionDate ? new Date(completionDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
  const stampUrl = settings?.stampImage ? `${settings.stampImage}?t=${Date.now()}` : '';

  const html = `
    <div style="position:relative;text-align:center;border:12px double #2f86eb;padding:5vh 5vw;background:#fffcf5;box-shadow:0 0 20px rgba(0,0,0,0.1);font-family:'Georgia','Times New Roman',serif;width:100%;height:100%;display:flex;flex-direction:column;justify-content:space-between;box-sizing:border-box">
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-25deg);opacity:0.08;font-size:8vw;font-weight:bold;white-space:nowrap;pointer-events:none;color:#000">${schoolName}</div>
      <div style="position:absolute;top:2vh;left:2vw;font-size:1.2vh;color:#999">${serialNumber}</div>
      <div>
        <h1 style="font-size:5vh;margin-bottom:1vh;color:#2f86eb">${schoolName}</h1>
        <p style="font-size:1.8vh;font-style:italic">${motto}</p>
        <hr style="width:10vw;border:1px solid #2f86eb;margin:1vh auto">
      </div>
      <div>
        <h2 style="font-size:3.5vh;letter-spacing:2px;margin-bottom:2vh">CERTIFICATE OF COMPLETION</h2>
        <p style="font-size:2vh">This is to certify that</p>
        <p style="font-size:4vh;font-weight:bold;margin:2vh 0;text-transform:uppercase">${selectedStudent.name}</p>
        <p style="font-size:2vh">has successfully completed the course</p>
        <p style="font-size:3vh;font-weight:bold;margin:2vh 0">${selectedStudent.course}</p>
        <p style="font-size:2vh">with effect from ${formattedCompletion}</p>
        <p style="font-size:2vh;margin-top:2vh">In witness whereof, we have hereunto set our hand and seal this ${now.toLocaleDateString()}.</p>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:5vh">
        <div style="text-align:center;width:20%"><div style="border-top:1px solid #000;width:100%"></div><p style="margin-top:1vh;font-size:1.5vh">Student Signature</p></div>
        <div style="text-align:center">${stampUrl?`<img id="stampImg" src="${stampUrl}" style="width:8vh;height:auto;margin-bottom:1vh" />`:'<div style="width:8vh;height:7vh;border-top:1px dashed #999;margin-bottom:1vh"></div>'}<p style="font-size:1.5vh">Official Stamp</p></div>
        <div style="text-align:center;width:20%"><div style="border-top:1px solid #000;width:100%"></div><p style="margin-top:1vh;font-size:1.5vh">Principal / Director</p></div>
      </div>
      <div style="margin-top:3vh;font-size:1.5vh;text-align:center;color:#666">
        <p>${schoolName} | ${address} | 📞 ${phone} | ✉️ ${email}</p>
        <p>Issued: ${now.toLocaleString()}</p>
      </div>
    </div>
  `;

  const w = window.open('', '_blank', 'width=750,height=950');
  w.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Certificate - ${selectedStudent.name}</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @page { size: A4 portrait; margin: 0.2in; }
        html, body { height: 100%; width: 100%; background: white; }
        body {
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Georgia', 'Times New Roman', serif;
        }
        .certificate-container {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .certificate-content {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        @media print {
          body { margin: 0; padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="certificate-container">
        <div class="certificate-content">
          ${html}
        </div>
      </div>
      <script>
        var img = document.getElementById('stampImg');
        if (img) {
          img.onload = function() { setTimeout(function() { window.print(); window.onafterprint = function() { window.close(); }; }, 300); };
          img.onerror = function() { window.print(); window.onafterprint = function() { window.close(); }; };
        } else {
          window.onload = function() { setTimeout(function() { window.print(); window.onafterprint = function() { window.close(); }; }, 300); };
        }
      </script>
    </body>
    </html>
  `);
  w.document.close();

  const checkClosed = setInterval(() => {
    if (w.closed) { clearInterval(checkClosed); setPrinting(false); onClose(); }
  }, 500);
};

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Print Certificate">
      {loading ? <p className="text-center py-4">Loading students...</p> : (
        <>
          <div className="mb-4"><label className="block text-sm font-medium mb-1">Select Student</label><select className="input" value={selectedStudent?._id || ''} onChange={(e) => handleStudentSelect(e.target.value)}><option value="">-- Select a student --</option>{students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.regNumber}) – {s.course}</option>)}</select></div>
          {selectedStudent && <div className="mb-4 p-3 bg-[var(--bg-secondary)] rounded-lg"><p><strong>Student:</strong> {selectedStudent.name}</p><p><strong>Course:</strong> {selectedStudent.course}</p><p><strong>Completion:</strong> {selectedStudent.completionDate ? formatShortDate(selectedStudent.completionDate) : 'Not set'}</p>{serialNumber && <p><strong>Certificate #:</strong> {serialNumber}</p>}</div>}
          <div className="flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={printCertificate} disabled={!selectedStudent || !serialNumber || printing}>{printing ? 'Printing...' : '🖨️ Print Certificate'}</Button></div>
        </>
      )}
    </Modal>
  );
};

export default CertificateModal;