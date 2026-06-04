const { sendEmail } = require('../utils/sendEmail');
const { buildEmailTemplate } = require('../utils/emailTemplate');

const sendApplicationReceivedEmail = async (email, name, jobTitle) => {
  const html = buildEmailTemplate({
    title: "Application Received \uD83C\uDF89",
    message: `
      <p style="margin-bottom: 16px;">Hi <strong>${name}</strong>,</p>
      <p style="margin-bottom: 16px;">Thank you for applying for the <strong>${jobTitle}</strong> position at JobPulse. We have successfully received your application!</p>
      <p style="margin-bottom: 16px;">Our hiring team will review your profile and get back to you with the next steps shortly.</p>
      <p style="margin-bottom: 0;">Best of luck!<br>The JobPulse Team</p>
    `,
    color: "#4f46e5"
  });

  await sendEmail({
    to: email,
    subject: `Application Received: ${jobTitle}`,
    html
  });
};

const sendStatusUpdateEmail = async (email, name, jobTitle, newStatus) => {
  let statusMessage = '';
  let color = '#4f46e5';

  switch (newStatus.toLowerCase()) {
    case 'shortlisted':
      statusMessage = `Great news! You have been <strong>shortlisted</strong> for the <strong>${jobTitle}</strong> position. Keep an eye out for further instructions or aptitude test availability on your dashboard.`;
      color = '#d97706'; // amber
      break;
    case 'interview':
      statusMessage = `Congratulations! You've been selected for an <strong>Interview</strong> for the <strong>${jobTitle}</strong> position. Our team will reach out to you shortly to schedule the interview.`;
      color = '#7e22ce'; // purple
      break;
    case 'selected':
      statusMessage = `Incredible news! You have been <strong>Selected / Hired</strong> for the <strong>${jobTitle}</strong> position. Welcome to the team! We will be in touch with your offer details.`;
      color = '#059669'; // emerald
      break;
    case 'rejected':
      statusMessage = `Thank you for your interest in the <strong>${jobTitle}</strong> position. After careful consideration, we have decided to move forward with other candidates at this time.`;
      color = '#e11d48'; // rose
      break;
    default:
      statusMessage = `Your application for <strong>${jobTitle}</strong> has been updated to: <strong>${newStatus}</strong>.`;
  }

  const html = buildEmailTemplate({
    title: "Application Status Update",
    message: `
      <p style="margin-bottom: 16px;">Hi <strong>${name}</strong>,</p>
      <p style="margin-bottom: 16px;">${statusMessage}</p>
      <p style="margin-bottom: 0;">Best regards,<br>The JobPulse Team</p>
    `,
    color
  });

  await sendEmail({
    to: email,
    subject: `Update on your application for ${jobTitle}`,
    html
  });
};

const sendTestAvailableEmail = async (email, name, jobTitle, scheduledEndTime) => {
  const formattedDate = new Date(scheduledEndTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }) + ' IST';

  const html = buildEmailTemplate({
    title: "Aptitude Test Available \u23F0",
    message: `
      <p style="margin-bottom: 16px;">Hi <strong>${name}</strong>,</p>
      <p style="margin-bottom: 16px;">Your Aptitude Test for the <strong>${jobTitle}</strong> position is now available on your JobPulse dashboard.</p>
      <p style="margin-bottom: 16px; padding: 12px; background-color: #f1f5f9; border-radius: 8px; font-weight: bold; text-align: center;">
        Deadline: ${formattedDate}
      </p>
      <p style="margin-bottom: 16px;">Please log in to your account and complete the test before the deadline.</p>
      <p style="margin-bottom: 0;">Good luck!<br>The JobPulse Team</p>
    `,
    color: "#3b82f6" // blue
  });

  await sendEmail({
    to: email,
    subject: `Action Required: Aptitude Test for ${jobTitle}`,
    html
  });
};

const sendTestResultEmail = async (email, name, jobTitle, score, passed) => {
  const resultText = passed ? 'Passed' : 'Failed';
  const color = passed ? '#059669' : '#e11d48';

  const html = buildEmailTemplate({
    title: "Aptitude Test Results \uD83D\uDCCA",
    message: `
      <p style="margin-bottom: 16px;">Hi <strong>${name}</strong>,</p>
      <p style="margin-bottom: 16px;">The results for the <strong>${jobTitle}</strong> Aptitude Test have been published.</p>
      <div style="margin-bottom: 16px; padding: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b;">Your Score</p>
        <p style="margin: 0 0 8px 0; font-size: 32px; font-weight: 900; color: ${color};">${score}%</p>
        <span style="display: inline-block; padding: 4px 12px; border-radius: 999px; background-color: ${passed ? '#d1fae5' : '#ffe4e6'}; color: ${color}; font-size: 12px; font-weight: bold;">
          ${resultText}
        </span>
      </div>
      <p style="margin-bottom: 16px;">Check your dashboard for any further updates on your application status.</p>
      <p style="margin-bottom: 0;">Best regards,<br>The JobPulse Team</p>
    `,
    color
  });

  await sendEmail({
    to: email,
    subject: `Test Results: ${jobTitle}`,
    html
  });
};

const sendWelcomeEmail = async (email, name, activeJobs = []) => {
  let jobsHtml = '';
  if (activeJobs.length > 0) {
    jobsHtml = `
      <p style="margin-bottom: 16px;">Here are some of our currently open positions that might interest you:</p>
      <div style="margin-bottom: 16px;">
        ${activeJobs.map(job => `
          <div style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 8px; background-color: #f8fafc;">
            <p style="margin: 0 0 4px 0; font-weight: bold; color: #0f172a;">${job.title}</p>
            <p style="margin: 0; font-size: 13px; color: #64748b;">${job.location || 'Remote'} • ${job.job_type}</p>
          </div>
        `).join('')}
      </div>
      <p style="margin-bottom: 16px;">Head over to the platform to see more details and apply!</p>
    `;
  }

  const html = buildEmailTemplate({
    title: "Welcome to JobPulse! \uD83D\uDE80",
    message: `
      <p style="margin-bottom: 16px;">Hi <strong>${name}</strong>,</p>
      <p style="margin-bottom: 16px;">Welcome to JobPulse! We're thrilled to have you on board. Your account has been successfully created.</p>
      <p style="margin-bottom: 16px;">You can now complete your profile, upload your resume, and start applying for your dream roles.</p>
      ${jobsHtml}
      <p style="margin-bottom: 0;">Best regards,<br>The JobPulse Team</p>
    `,
    color: "#4f46e5"
  });

  await sendEmail({
    to: email,
    subject: "Welcome to JobPulse!",
    html
  });
};

const sendInterviewScheduledEmail = async (email, name, jobTitle, scheduledDate, scheduledTime, notes) => {
  const formattedDate = new Date(scheduledDate).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const html = buildEmailTemplate({
    title: "Interview Scheduled \uD83D\uDCC5",
    message: `
      <p style="margin-bottom: 16px;">Hi <strong>${name}</strong>,</p>
      <p style="margin-bottom: 16px;">We are excited to invite you to an interview for the <strong>${jobTitle}</strong> position.</p>
      <div style="margin-bottom: 16px; padding: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
        <p style="margin: 0 0 8px 0;"><strong>Date:</strong> ${formattedDate}</p>
        <p style="margin: 0 0 8px 0;"><strong>Time:</strong> ${scheduledTime} IST</p>
        ${notes ? `<p style="margin: 0;"><strong>Notes:</strong> ${notes}</p>` : ''}
      </div>
      <p style="margin-bottom: 16px;">Our team is looking forward to speaking with you. Please prepare accordingly.</p>
      <p style="margin-bottom: 0;">Best regards,<br>The JobPulse Team</p>
    `,
    color: "#4f46e5"
  });

  await sendEmail({
    to: email,
    subject: `Interview Invitation: ${jobTitle}`,
    html
  });
};

const sendTestClosedEmail = async (email, name, jobTitle) => {
  const html = buildEmailTemplate({
    title: "Aptitude Test Closed \uD83D\uDD12",
    message: `
      <p style="margin-bottom: 16px;">Hi <strong>${name}</strong>,</p>
      <p style="margin-bottom: 16px;">The Aptitude Test for the <strong>${jobTitle}</strong> position is now closed.</p>
      <p style="margin-bottom: 16px;">We are currently evaluating the tests and results will be declared soon.</p>
      <p style="margin-bottom: 0;">Best of luck!<br>The JobPulse Team</p>
    `,
    color: "#eab308" // yellow
  });

  await sendEmail({
    to: email,
    subject: `Update: Aptitude Test for ${jobTitle} is Closed`,
    html
  });
};

const sendAccountDeactivatedEmail = async (email, name, reason = "Administrative decision") => {
  const html = buildEmailTemplate({
    title: "Account Deactivated",
    message: `
      <p style="margin-bottom: 16px;">Hi <strong>${name}</strong>,</p>
      <p style="margin-bottom: 16px;">Your JobPulse account has been deactivated by an administrator.</p>
      <div style="margin-bottom: 16px; padding: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
        <p style="margin: 0;"><strong>Reason:</strong> ${reason}</p>
      </div>
      <p style="margin-bottom: 16px;">You will no longer be able to log in or access your dashboard. If you believe this is a mistake, please contact support.</p>
      <p style="margin-bottom: 0;">Best regards,<br>The JobPulse Team</p>
    `,
    color: "#f59e0b" // amber
  });

  await sendEmail({
    to: email,
    subject: "Notice: Account Deactivated",
    html
  });
};

const sendAccountReactivatedEmail = async (email, name) => {
  const html = buildEmailTemplate({
    title: "Account Reactivated 🎉",
    message: `
      <p style="margin-bottom: 16px;">Hi <strong>${name}</strong>,</p>
      <p style="margin-bottom: 16px;">Great news! Your JobPulse account has been successfully reactivated.</p>
      <p style="margin-bottom: 16px;">You can now log back in to access your dashboard, view job listings, and continue your journey with us.</p>
      <p style="margin-bottom: 0;">Welcome back!<br>The JobPulse Team</p>
    `,
    color: "#10b981" // emerald
  });

  await sendEmail({
    to: email,
    subject: "Your Account has been Reactivated!",
    html
  });
};

const sendAccountDeletedEmail = async (email, name) => {
  const html = buildEmailTemplate({
    title: "Account Deleted",
    message: `
      <p style="margin-bottom: 16px;">Hi <strong>${name}</strong>,</p>
      <p style="margin-bottom: 16px;">We are writing to confirm that your JobPulse account has been permanently deleted.</p>
      <p style="margin-bottom: 16px;">All your personal data, applications, and resumes have been securely removed from our active systems in accordance with our data policies.</p>
      <p style="margin-bottom: 0;">Thank you for using JobPulse.<br>The JobPulse Team</p>
    `,
    color: "#ef4444" // red
  });

  await sendEmail({
    to: email,
    subject: "Confirmation: Account Deleted",
    html
  });
};

module.exports = {
  sendApplicationReceivedEmail,
  sendStatusUpdateEmail,
  sendTestAvailableEmail,
  sendTestResultEmail,
  sendWelcomeEmail,
  sendInterviewScheduledEmail,
  sendTestClosedEmail,
  sendAccountDeactivatedEmail,
  sendAccountReactivatedEmail,
  sendAccountDeletedEmail
};