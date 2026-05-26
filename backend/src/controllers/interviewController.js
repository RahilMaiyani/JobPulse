const db = require('../config/db');
const { sendInterviewScheduledEmail } = require('../services/emailService');
const { createNotification } = require('../utils/notificationHelper');

exports.scheduleInterview = async (req, res) => {
  const { jobId, applicationId, candidateId, scheduledDate, scheduledTime, notes } = req.body;
  const hrId = req.user.id;

  try {
    await db.query('BEGIN');

    // Delete any existing slots for this application to keep it simple
    await db.query(`DELETE FROM interview_slots WHERE application_id = $1`, [applicationId]);

    // Insert new slot
    const slotRes = await db.query(
      `INSERT INTO interview_slots 
        (job_id, application_id, interviewer_id, scheduled_date, scheduled_time, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [jobId, applicationId, hrId, scheduledDate, scheduledTime, notes]
    );

    // Update application status to 'interview'
    await db.query(
      `UPDATE applications SET status = 'interview', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [applicationId]
    );

    // Get candidate and job info for email
    const appInfo = await db.query(
      `SELECT a.id, j.title, u.full_name, u.email 
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN users u ON a.user_id = u.id
       WHERE a.id = $1`,
      [applicationId]
    );

    if (appInfo.rows.length > 0) {
      const { title, full_name, email } = appInfo.rows[0];

      // Send Email
      await sendInterviewScheduledEmail(email, full_name, title, scheduledDate, scheduledTime, notes);

      // Send Notification
      await createNotification(
        candidateId,
        "Interview Scheduled \uD83D\uDCC5",
        `Your interview for the ${title} position has been scheduled on ${new Date(scheduledDate).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'long' })} at ${scheduledTime} IST.`,
        'success'
      );
    }

    await db.query('COMMIT');
    res.status(201).json({ message: "Interview scheduled successfully", slot: slotRes.rows[0] });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error("Schedule interview error:", error);
    res.status(500).json({ error: "Failed to schedule interview" });
  }
};

exports.getInterviewsByJob = async (req, res) => {
  const { jobId } = req.params;
  try {
    const result = await db.query(
      `SELECT i.*, u.full_name as interviewer_name
       FROM interview_slots i
       LEFT JOIN users u ON i.interviewer_id = u.id
       WHERE i.job_id = $1`,
      [jobId]
    );
    res.json({ interviews: result.rows });
  } catch (error) {
    console.error("Get interviews error:", error);
    res.status(500).json({ error: "Failed to get interviews" });
  }
};

exports.getInterviewByApplication = async (req, res) => {
  const { applicationId } = req.params;
  try {
    const result = await db.query(
      `SELECT * FROM interview_slots WHERE application_id = $1`,
      [applicationId]
    );
    res.json({ interview: result.rows[0] });
  } catch (error) {
    console.error("Get interview error:", error);
    res.status(500).json({ error: "Failed to get interview details" });
  }
};
