// controllers/school/applicationController.js

const { connectSchool } = require('../../config/db');
const { env } = require('../../config/env');

let schoolConnection;
let Application, Settings;

const getModels = async () => {
  if (!schoolConnection) schoolConnection = await connectSchool();
  if (!Application) {
    Application = schoolConnection.model('Application');
    Settings = schoolConnection.model('Settings');
  }
  return { Application, Settings };
};

// @desc    Submit application
// @route   POST /api/school/applications
// @access  Public
const submitApplication = async (req, res) => {
  try {
    const { Application, Settings } = await getModels();
    const { name, email, phone, course, message } = req.body;
    if (!name || !email || !phone || !course) return res.status(400).json({ message: 'All fields are required' });
    const application = await Application.create({ name, email, phone, course, message: message || '' });

    const settings = await Settings.findOne();
    const courseData = settings?.courses?.find(c => c.name === course);

    const { sendTemplateEmail } = require('../../services/emailService');
    sendTemplateEmail('school-application-received', {
      to: email, name, course, appId: application._id,
      schoolName: settings?.schoolName || env.APP_NAME_SCHOOL,
      schoolEmail: settings?.email, schoolPhone: settings?.phone, schoolAddress: settings?.address,
      courseDetails: courseData ? { durationMonths: courseData.durationMonths, totalFee: courseData.totalFee, requirements: courseData.requirements || 'None specified' } : null,
      system: 'school',
    }).catch(err => console.error('Application received email failed:', err.message));

    res.status(201).json({ success: true, message: 'Application submitted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all applications
// @route   GET /api/school/applications
// @access  Private/Admin
const getAllApplications = async (req, res) => {
  try {
    const { Application } = await getModels();
    const applications = await Application.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update application status
// @route   PUT /api/school/applications/:id
// @access  Private/Admin
const updateApplicationStatus = async (req, res) => {
  try {
    const { Application, Settings } = await getModels();
    const { status, message: customMessage } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status, admissionLetterGenerated: status === 'accepted' },
      { new: true }
    );
    if (!application) return res.status(404).json({ message: 'Application not found' });

    const settings = await Settings.findOne();
    const schoolName = settings?.schoolName || env.APP_NAME_SCHOOL;
    const courseData = settings?.courses?.find(c => c.name === application.course);
    const { sendTemplateEmail } = require('../../services/emailService');

    if (status === 'accepted') {
      let pdfBase64 = null;
      try {
        const { generateAdmissionLetterPDF } = require('../../services/pdfService');
        const pdfBuffer = await generateAdmissionLetterPDF({
          studentName: application.name,
          course: application.course,
          schoolName,
          schoolAddress: settings?.address,
          schoolPhone: settings?.phone,
          schoolEmail: settings?.email,
          message: customMessage || `We are pleased to offer you admission to the ${application.course} course at ${schoolName}. Your application has been accepted and we look forward to having you join our institution. Please report to the admissions office on ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()} to complete your registration.`,
          stampImage: settings?.stampImage,
          logo: settings?.logo,
        });
        pdfBase64 = pdfBuffer.toString('base64');
      } catch (pdfErr) {
        console.error('PDF generation failed:', pdfErr.message);
      }

      sendTemplateEmail('school-application-accepted', {
        to: application.email,
        name: application.name,
        course: application.course,
        schoolName,
        schoolEmail: settings?.email,
        schoolPhone: settings?.phone,
        schoolAddress: settings?.address,
        durationMonths: courseData?.durationMonths,
        totalFee: courseData?.totalFee,
        requirements: courseData?.requirements,
        portalUrl: `${env.SCHOOL_URL}/portal`,
        hasAttachment: !!pdfBase64,
        attachmentContent: pdfBase64,
        attachmentName: `Admission_Letter_${application.name?.replace(/\s/g, '_')}.pdf`,
        system: 'school',
      }).catch(err => console.error('Acceptance email failed:', err.message));

    } else if (status === 'rejected') {
      sendTemplateEmail('school-application-rejected', {
        to: application.email,
        name: application.name,
        course: application.course,
        schoolName,
        schoolEmail: settings?.email,
        schoolPhone: settings?.phone,
        schoolAddress: settings?.address,
        system: 'school',
      }).catch(err => console.error('Rejection email failed:', err.message));
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete application
// @route   DELETE /api/school/applications/:id
// @access  Private/Admin
const deleteApplication = async (req, res) => {
  try {
    const { Application } = await getModels();
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    res.json({ message: 'Application deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { submitApplication, getAllApplications, updateApplicationStatus, deleteApplication };