// services/emailService.js

const { sendEmail } = require('../config/hdmBridge');

const emailLayout = (content, appName, year = new Date().getFullYear()) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background: #f5f7fa; }
    .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1a56db, #1e40af); color: #fff; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; }
    .body { padding: 30px; color: #374151; line-height: 1.7; }
    .body h2 { color: #1a56db; margin-top: 0; }
    .body p { margin: 0 0 14px; }
    .info-box { background: #f0f4ff; border-left: 4px solid #1a56db; padding: 16px; margin: 16px 0; border-radius: 0 8px 8px 0; }
    .info-box strong { color: #1a56db; }
    .success-box { background: #ecfdf5; border-left: 4px solid #059669; padding: 16px; margin: 16px 0; border-radius: 0 8px 8px 0; }
    .warning-box { background: #fffbeb; border-left: 4px solid #d97706; padding: 16px; margin: 16px 0; border-radius: 0 8px 8px 0; }
    .danger-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 16px 0; border-radius: 0 8px 8px 0; }
    .btn { display: inline-block; background: #1a56db; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 10px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
    .footer p { margin: 4px 0; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th { background: #f0f4ff; color: #1a56db; padding: 10px; text-align: left; font-size: 13px; text-transform: uppercase; }
    td { padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
    .highlight { color: #059669; font-weight: 700; }
    .text-muted { color: #6b7280; font-size: 13px; }
    ul { padding-left: 20px; } ul li { margin-bottom: 6px; }
    blockquote { border-left: 4px solid #1a56db; margin: 16px 0; padding: 12px 16px; background: #f0f4ff; border-radius: 0 8px 8px 0; font-style: italic; }
    .attachment-notice { background: #fefce8; border: 1px dashed #eab308; padding: 12px; margin: 16px 0; border-radius: 8px; text-align: center; font-size: 13px; color: #a16207; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>${appName}</h1></div>
    <div class="body">${content}</div>
    <div class="footer"><p>&copy; ${year} ${appName}. All rights reserved.</p><p>${appName} — Empowering your future</p></div>
  </div>
</body>
</html>`;

const templates = {
  // ==================== SCHOOL ====================
  'school-application-received': (data) => ({
    subject: `Application Received — ${data.course}`,
    htmlBody: emailLayout(`
      <h2>Hi ${data.name},</h2><p>Thank you for applying to <strong>${data.schoolName}</strong>.</p>
      <div class="info-box"><p><strong>Course:</strong> ${data.course}</p><p><strong>Reference:</strong> ${data.appId}</p></div>
      ${data.courseDetails ? `<table><tr><td><strong>Duration</strong></td><td>${data.courseDetails.durationMonths} months</td></tr><tr><td><strong>Fee</strong></td><td class="highlight">KES ${data.courseDetails.totalFee?.toLocaleString()}</td></tr></table>` : ''}
      <div class="info-box"><p><strong>📞 Contact:</strong> ${data.schoolEmail||''} | ${data.schoolPhone||''}</p><p>📍 ${data.schoolAddress||''}</p></div>
    `, data.schoolName),
  }),

  'school-application-accepted': (data) => ({
    subject: `🎉 Accepted — ${data.course}`,
    htmlBody: emailLayout(`
      <h2>Congratulations, ${data.name}!</h2><p>Your application for <strong>${data.course}</strong> has been <span style="color:#059669;font-weight:700;">ACCEPTED</span>.</p>
      <div class="success-box"><p><strong>Course:</strong> ${data.course}</p><p><strong>Duration:</strong> ${data.durationMonths||'See brochure'} months</p><p><strong>Fee:</strong> KES ${data.totalFee?.toLocaleString()||'See structure'}</p></div>
      <h3>📋 Next Steps</h3><ol><li>Visit the school to complete enrollment</li><li>Bring your ID and passport photos</li><li>Pay the registration fee</li></ol>
      <div class="info-box"><p>📍 ${data.schoolAddress||''}</p><p>📞 ${data.schoolPhone||''} | ✉️ ${data.schoolEmail||''}</p></div>
      ${data.hasAttachment ? '<div class="attachment-notice">📎 Your admission letter PDF is attached.</div>' : ''}
    `, data.schoolName),
    attachments: data.attachmentContent ? [{ filename: data.attachmentName||'Admission_Letter.pdf', content: data.attachmentContent, type: 'application/pdf' }] : [],
  }),

  'school-application-rejected': (data) => ({
    subject: `Application Update — ${data.course}`,
    htmlBody: emailLayout(`<h2>Hi ${data.name},</h2><p>Unfortunately your application was not accepted.</p><div class="info-box"><p>📞 ${data.schoolPhone||''} | ✉️ ${data.schoolEmail||''}</p></div>`, data.schoolName),
  }),

  'school-payment-receipt': (data) => ({
    subject: `🧾 Payment Receipt — ${data.studentName}`,
    htmlBody: emailLayout(`<h2>Payment Receipt</h2><table><tr><td><strong>Student</strong></td><td>${data.studentName} (${data.regNumber})</td></tr><tr><td><strong>Amount</strong></td><td class="highlight">KES ${data.amount?.toLocaleString()}</td></tr><tr><td><strong>Balance</strong></td><td style="color:#dc2626;">KES ${data.balance?.toLocaleString()}</td></tr></table>`, data.schoolName),
  }),

  'school-portal-welcome': (data) => ({
    subject: `Welcome to ${data.schoolName} Portal`,
    htmlBody: emailLayout(`<h2>Hi ${data.name},</h2><p>Your portal account is ready!</p><div class="info-box"><p><strong>Reg Number:</strong> ${data.regNumber}</p></div><p style="text-align:center;"><a href="${data.portalUrl}" class="btn">Login</a></p>`, data.schoolName),
  }),

  'school-certificate-ready': (data) => ({
    subject: `📜 Certificate Ready — ${data.schoolName}`,
    htmlBody: emailLayout(`<h2>Congratulations, ${data.name}!</h2><p>Your certificate is ready!</p><div class="success-box"><p><strong>Certificate:</strong> ${data.certificateNumber}</p></div><div class="info-box"><p>📍 ${data.schoolAddress||''}</p></div>`, data.schoolName),
  }),

  'school-fee-structure': (data) => ({
    subject: `💰 Fee Structure — ${data.schoolName}`,
    htmlBody: emailLayout(`<h2>Fee Structure</h2>${data.courses?.length?`<table><thead><tr><th>Course</th><th>Duration</th><th>Fee</th></tr></thead><tbody>${data.courses.map(c=>`<tr><td>${c.name}</td><td>${c.durationMonths}mo</td><td class="highlight">KES ${c.totalFee?.toLocaleString()}</td></tr>`).join('')}</tbody></table>`:''}<div class="attachment-notice">📎 Fee structure PDF attached.</div>`, data.schoolName),
  }),

  'school-brochure': (data) => ({
    subject: `📖 Brochure — ${data.schoolName}`,
    htmlBody: emailLayout(`<h2>School Brochure</h2><p>Here is the official brochure for <strong>${data.schoolName}</strong>.</p><div class="attachment-notice">📎 Brochure PDF attached.</div>`, data.schoolName),
  }),

  'school-password-reset': (data) => ({
    subject: `Password Reset — ${data.schoolName}`,
    htmlBody: emailLayout(`<h2>Password Reset</h2><p style="text-align:center;"><a href="${data.resetUrl}" class="btn">Reset Password</a></p>`, data.schoolName),
  }),

  // ==================== CYBER ====================
  'cyber-trial-welcome': (data) => ({
    subject: `🚀 Welcome to ${data.appName}`,
    htmlBody: emailLayout(`<h2>Welcome aboard, ${data.name}! 🚀</h2><p>Your <strong>${data.trialDays}-day free trial</strong> is active.</p><div class="success-box"><p><strong>Trial Ends:</strong> ${data.trialEndDate}</p></div><p style="text-align:center;"><a href="${data.loginUrl}" class="btn">Go to Dashboard</a></p>`, data.appName),
  }),

  'cyber-registration-pending': (data) => ({
    subject: `Registration Received — ${data.appName}`,
    htmlBody: emailLayout(`<h2>Hi ${data.name},</h2><p>Your registration for <strong>${data.plan}</strong> is pending approval.</p>`, data.appName),
  }),

  'cyber-account-approved': (data) => ({
    subject: `✅ Account Approved — ${data.appName}`,
    htmlBody: emailLayout(`<h2>Great news, ${data.name}!</h2><p>Your account has been <span style="color:#059669;">APPROVED</span>.</p><p style="text-align:center;"><a href="${data.loginUrl}" class="btn">Go to Dashboard</a></p>`, data.appName),
  }),

  'cyber-account-rejected': (data) => ({
    subject: `Registration Update — ${data.appName}`,
    htmlBody: emailLayout(`<h2>Hi ${data.name},</h2><p>Your registration was not approved.</p>`, data.appName),
  }),

  'cyber-subscription-renewal': (data) => ({
    subject: `⏰ Renewal — ${data.appName}`,
    htmlBody: emailLayout(`<h2>Subscription Ending Soon</h2><p>Your <strong>${data.plan}</strong> expires in <strong>${data.daysLeft} days</strong>.</p><div class="warning-box"><p><strong>Expiry:</strong> ${data.expiryDate}</p></div><p style="text-align:center;"><a href="${data.renewUrl}" class="btn">Renew Now</a></p>`, data.appName),
  }),

  'cyber-subscription-expired': (data) => ({
    subject: `❌ Expired — ${data.appName}`,
    htmlBody: emailLayout(`<h2>Subscription Expired</h2><p>Your <strong>${data.plan}</strong> plan has expired.</p><p style="text-align:center;"><a href="${data.renewUrl}" class="btn">Renew Now</a></p>`, data.appName),
  }),

  'cyber-payment-confirmed': (data) => ({
    subject: `💳 Payment Confirmed — ${data.appName}`,
    htmlBody: emailLayout(`<h2>Payment Confirmed</h2><div class="success-box"><p><strong>Amount:</strong> KES ${data.amount?.toLocaleString()}</p><p><strong>Receipt:</strong> ${data.receipt}</p></div>`, data.appName),
  }),

  'cyber-payment-failed': (data) => ({
    subject: `⚠️ Payment Failed — ${data.appName}`,
    htmlBody: emailLayout(`<h2>Payment Unsuccessful</h2><p style="text-align:center;"><a href="${data.retryUrl}" class="btn">Retry</a></p>`, data.appName),
  }),

  'cyber-password-reset': (data) => ({
    subject: `Password Reset — ${data.appName}`,
    htmlBody: emailLayout(`<h2>Password Reset</h2><p style="text-align:center;"><a href="${data.resetUrl}" class="btn">Reset Password</a></p>`, data.appName),
  }),

  'cyber-support-reply': (data) => ({
    subject: `Ticket #${data.ticketId} — ${data.appName}`,
    htmlBody: emailLayout(`<h2>Support Update</h2><p>Hi ${data.name},</p><blockquote>${data.reply}</blockquote>`, data.appName),
  }),

  // ==================== INVOICE ====================
  'invoice-sent': (data) => ({
    subject: `Invoice ${data.invoiceNumber} from ${data.appName}`,
    htmlBody: emailLayout(`<h2>Invoice ${data.invoiceNumber}</h2><p>Dear ${data.customerName},</p><p>Here is your invoice from <strong>${data.appName}</strong>.</p><table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>${data.itemsHtml||'<tr><td colspan="4">No items</td></tr>'}</tbody></table><div class="info-box"><p><strong>Total:</strong> <span class="highlight">KES ${data.total?.toLocaleString()||'0'}</span></p><p><strong>Balance Due:</strong> <span style="color:#dc2626;font-weight:700;">KES ${data.balance?.toLocaleString()||'0'}</span></p></div><p class="text-muted">Thank you for your business!</p>`, data.appName),
  }),

  // ==================== BACKUP ====================
  'backup-completed': (data) => ({
    subject: `📦 Backup Completed — ${data.systemName}`,
    htmlBody: emailLayout(`<h2>Backup Completed</h2><p>A new backup has been created for <strong>${data.systemName}</strong>.</p><div class="info-box"><p><strong>File:</strong> ${data.filename}</p><p><strong>Size:</strong> ${(data.size/1024).toFixed(2)} KB</p><p><strong>Date:</strong> ${data.date}</p><p><strong>Records:</strong> ${typeof data.recordCount==='number'?data.recordCount.toLocaleString():'N/A'}</p></div>${data.hasAttachment?'<div class="attachment-notice">📎 Backup file attached.</div>':''}`, data.systemName),
    attachments: data.backupAttachment ? [{ filename: data.filename, content: data.backupAttachment, type: 'application/json' }] : [],
  }),
};

const sendTemplateEmail = async (templateName, data) => {
  const template = templates[templateName];
  if (!template) throw new Error(`Email template "${templateName}" not found`);
  const emailData = template(data);

  return sendEmail({
    to: data.to,
    subject: emailData.subject,
    htmlBody: emailData.htmlBody,
    textBody: emailData.htmlBody?.replace(/<[^>]*>/g, ''),
    system: data.system || 'school',
    attachments: emailData.attachments || [],
    customFromName: data.customFromName,
  });
};

module.exports = { sendTemplateEmail, templates };