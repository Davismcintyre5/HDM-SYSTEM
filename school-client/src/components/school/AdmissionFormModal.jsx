// src/components/school/AdmissionFormModal.jsx

import { useSettings } from '../../hooks/useSettings';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { printContent } from '../../utils/print';

export const AdmissionFormModal = ({ isOpen, onClose }) => {
  const { settings } = useSettings();

  const getHTMLContent = () => {
    const courses = settings?.courses || [];
    const coursesOptions = courses.map(c => `<option value="${c.name}">${c.name}</option>`).join('');

    return `
      <h2>STUDENT ADMISSION FORM</h2>
      <p>Please fill in all details clearly.</p>
      <hr/>
      <form style="margin-top: 20px;">
        <div style="margin-bottom: 15px;"><label style="display: inline-block; width: 150px;"><strong>Ref No:</strong></label><input type="text" style="width: 200px; border: none; border-bottom: 1px solid #000;" /></div>
        <div style="margin-bottom: 15px;"><label style="display: inline-block; width: 150px;"><strong>Full Name:</strong></label><input type="text" style="width: 60%; border: none; border-bottom: 1px solid #000;" /></div>
        <div style="margin-bottom: 15px;"><label style="display: inline-block; width: 150px;"><strong>Age:</strong></label><input type="number" style="width: 100px; border: none; border-bottom: 1px solid #000;" /></div>
        <div style="margin-bottom: 15px;"><label style="display: inline-block; width: 150px;"><strong>Gender:</strong></label><div style="display: inline-block;"><label style="margin-right: 15px;"><input type="radio" name="gender" value="Male" /> Male</label><label style="margin-right: 15px;"><input type="radio" name="gender" value="Female" /> Female</label><label><input type="radio" name="gender" value="Other" /> Other</label></div></div>
        <div style="margin-bottom: 15px;"><label style="display: inline-block; width: 150px;"><strong>Phone Number:</strong></label><input type="tel" style="width: 200px; border: none; border-bottom: 1px solid #000;" /></div>
        <div style="margin-bottom: 15px;"><label style="display: inline-block; width: 150px;"><strong>ID Number:</strong></label><input type="text" style="width: 200px; border: none; border-bottom: 1px solid #000;" /></div>
        <div style="margin-bottom: 15px;"><label style="display: inline-block; width: 150px;"><strong>Course:</strong></label><select style="border: none; border-bottom: 1px solid #000; width: 200px;"><option value="" disabled selected>Select a course</option>${coursesOptions}</select></div>
        <div style="margin-bottom: 15px;"><label style="display: inline-block; width: 150px;"><strong>Enrollment Date:</strong></label><input type="date" style="width: 150px; border: none; border-bottom: 1px solid #000;" /></div>
        <div style="margin-bottom: 15px;"><label style="display: inline-block; width: 150px;"><strong>Previous School:</strong></label><input type="text" style="width: 60%; border: none; border-bottom: 1px solid #000;" /></div>
        <div style="margin-bottom: 15px;"><label style="display: inline-block; width: 150px;"><strong>Parent/Guardian Name:</strong></label><input type="text" style="width: 60%; border: none; border-bottom: 1px solid #000;" /></div>
        <div style="margin-bottom: 15px;"><label style="display: inline-block; width: 150px;"><strong>Parent/Guardian Contact:</strong></label><input type="tel" style="width: 200px; border: none; border-bottom: 1px solid #000;" /></div>
        <div style="margin-bottom: 15px;"><label style="display: inline-block; width: 150px;"><strong>Signature:</strong></label><div style="display: inline-block; width: 200px; border-bottom: 1px solid #000;">_________________</div></div>
        <div style="margin-bottom: 15px;"><label style="display: inline-block; width: 150px;"><strong>Date:</strong></label><input type="date" style="width: 150px; border: none; border-bottom: 1px solid #000;" /></div>
      </form>
      <p style="margin-top: 20px; font-size: 12px; color: #666;">Please submit this form to the admissions office along with required documents.</p>
    `;
  };

  const printForm = () => {
    const html = getHTMLContent();
    printContent(html, 'Admission_Form', settings);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Admission Form">
      <div className="mb-4"><p className="text-gray-600 dark:text-gray-400">This form can be printed and given to prospective students to fill during admission.</p></div>
      <div className="flex justify-end gap-2"><Button variant="secondary" onClick={printForm}>🖨️ Print Admission Form</Button></div>
    </Modal>
  );
};

export default AdmissionFormModal;