const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const TEMP_DIR = path.join(__dirname, '..', 'temp');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

// ... existing functions ...

const generateAdmissionLetterPDF = ({ studentName, course, schoolName, schoolAddress, schoolPhone, schoolEmail, message, stampImage, logo }) => {
  return new Promise(async (resolve, reject) => {
    const filepath = path.join(TEMP_DIR, `admission_${Date.now()}.pdf`);
    const doc = new PDFDocument({ margin: 60, size: 'A4' });
    const stream = fs.createWriteStream(filepath);
    const chunks = [];

    doc.pipe(stream);

    // Header with logo
    if (logo) {
      try {
        const response = await axios.get(logo, { responseType: 'arraybuffer' });
        doc.image(Buffer.from(response.data), 60, 40, { width: 60 });
      } catch (err) {}
    }

    doc.moveDown(logo ? 4 : 1);
    doc.fontSize(22).font('Helvetica-Bold').fillColor('#1a365d').text(schoolName, { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica').fillColor('#4a5568').text(schoolAddress || '', { align: 'center' });
    doc.fontSize(10).text(`📞 ${schoolPhone || ''} | ✉️ ${schoolEmail || ''}`, { align: 'center' });
    
    doc.moveDown(0.5);
    doc.moveTo(60, doc.y).lineTo(doc.page.width - 60, doc.y).stroke('#e2e8f0');
    doc.moveDown(1);

    // Title
    doc.fontSize(18).font('Helvetica-Bold').fillColor('#1a365d').text('ADMISSION LETTER', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica').fillColor('#4a5568').text(`Date: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.fontSize(10).text(`Ref: ADM/${course?.substring(0, 3).toUpperCase()}/${Date.now().toString(36).toUpperCase()}`, { align: 'center' });
    doc.moveDown(1);

    // Recipient
    doc.fontSize(12).font('Helvetica').fillColor('#2d3748').text(`To: ${studentName}`);
    doc.fontSize(11).text(`Course: ${course}`);
    doc.moveDown(1);

    // Body
    doc.fontSize(11).font('Helvetica').fillColor('#4a5568').text(`Dear ${studentName},`);
    doc.moveDown(0.5);
    doc.fontSize(11).text(message || `We are pleased to offer you admission to ${course} at ${schoolName}.`);
    doc.moveDown(1);
    doc.text('Please report to the admissions office with the following:');
    doc.moveDown(0.3);
    doc.fontSize(10).list(['National ID or Birth Certificate', 'Passport size photos (2)', 'Previous school leaving certificate', 'Registration fee payment']);
    doc.moveDown(1);
    doc.text('We look forward to welcoming you to our institution.');
    doc.moveDown(2);

    // Signature
    doc.fontSize(11).text('Yours sincerely,', { align: 'right' });
    doc.moveDown(2);
    
    if (stampImage) {
      try {
        const response = await axios.get(stampImage, { responseType: 'arraybuffer' });
        doc.image(Buffer.from(response.data), doc.page.width - 160, doc.y, { width: 80 });
      } catch (err) {}
    }
    
    doc.moveDown(3);
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#2d3748').text('Admissions Office', { align: 'right' });
    doc.fontSize(10).font('Helvetica').fillColor('#4a5568').text(schoolName, { align: 'right' });

    // Footer
    doc.moveDown(2);
    doc.moveTo(60, doc.y).lineTo(doc.page.width - 60, doc.y).stroke('#e2e8f0');
    doc.moveDown(0.5);
    doc.fontSize(9).font('Helvetica').fillColor('#a0aec0').text(`${schoolName} | ${schoolAddress}`, { align: 'center' });
    doc.text(`Printed: ${new Date().toLocaleString()}`, { align: 'center' });

    doc.end();

    stream.on('finish', () => {
      const buffer = fs.readFileSync(filepath);
      fs.unlinkSync(filepath); // Clean up temp file
      resolve(buffer);
    });
    stream.on('error', reject);
  });
};

module.exports = { generateBrochure, generateReceipt, generateCertificate, generateAdmissionLetterPDF };