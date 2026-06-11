// config/hdmBridge.js

const axios = require('axios');
const { env } = require('./env');

const sendEmail = async ({ to, subject, htmlBody, textBody, system = 'school', attachments = [] }) => {
  const config = system === 'cyber'
    ? { apiKey: env.HDM_CYBER_API_KEY, fromEmail: env.HDM_CYBER_FROM_EMAIL, fromName: env.HDM_CYBER_FROM_NAME }
    : { apiKey: env.HDM_SCHOOL_API_KEY, fromEmail: env.HDM_SCHOOL_FROM_EMAIL, fromName: env.HDM_SCHOOL_FROM_NAME };

  try {
    const payload = {
      from: config.fromEmail,
      fromName: config.fromName,
      to,
      subject,
      htmlBody,
      textBody: textBody || htmlBody?.replace(/<[^>]*>/g, ''),
    };

    if (attachments.length > 0) {
      payload.attachments = attachments;
    }

    const response = await axios.post(
      `${env.HDM_API_URL}/emails/send`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(`\x1b[36m📧 [${config.fromName}]\x1b[0m Email sent to ${to}: ${subject}${attachments.length ? ' 📎' : ''}`);
    return response.data;
  } catch (error) {
    console.error(`\x1b[31m❌ HDM Bridge [${config.fromName}] error:\x1b[0m`, error.response?.data || error.message);
    throw error;
  }
};

module.exports = { sendEmail };