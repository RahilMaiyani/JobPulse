const dotenv = require('dotenv');

dotenv.config();

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    const nodemailer = require('nodemailer');
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html, attachments }) => {
  if (!to || to.trim() === "") {
    console.log(`  \x1b[33m⚠\x1b[0m  \x1b[1mMail System:\x1b[0m \x1b[33mSkipped\x1b[0m \x1b[90m(No email address provided for: ${subject})\x1b[0m`);
    return;
  }

  try {
    const activeTransporter = getTransporter();
    await activeTransporter.sendMail({
      from: `"JobDrive" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments
    });

    console.log(`  \x1b[38;5;208m➜\x1b[0m  \x1b[1mMail System:\x1b[0m \x1b[36mDispatched\x1b[0m \x1b[90mto ${to}\x1b[0m`);

  } catch (err) {
    console.log(`\n  \x1b[41m\x1b[37m ERROR \x1b[0m \x1b[31mMail dispatch failed to ${to}:\x1b[0m ${err.message}`);
  }
};

module.exports = { sendEmail };
