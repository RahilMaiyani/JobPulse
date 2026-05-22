import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((error) => {
  if (error) {
    console.log(`\n  \x1b[41m\x1b[37m ERROR \x1b[0m \x1b[31mMail engine failure:\x1b[0m ${error.message}`);
  } else {
    console.log(`  \x1b[38;5;208m➜\x1b[0m  \x1b[1mMail Engine:\x1b[0m \x1b[32mReady\x1b[0m \x1b[90m(gmail_verified)\x1b[0m`);
  }
});

export const sendEmail = async ({ to, subject, html, attachments }) => {
  // 1. THE SHIELD: Prevent "No recipients defined" crash
  if (!to || to.trim() === "") {
    console.log(`  \x1b[33m⚠\x1b[0m  \x1b[1mMail System:\x1b[0m \x1b[33mSkipped\x1b[0m \x1b[90m(No email address provided for: ${subject})\x1b[0m`);
    return; 
  }

  try {
    await transporter.sendMail({
      from: `"OfficeLink" <${process.env.EMAIL_USER}>`,
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