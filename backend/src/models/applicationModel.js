const db = require('../config/db');

const createApplication = async (applicationData) => {
  const { userId, jobId, resumeId, aiMatchScore, aiMatchDetails, isSuspicious } = applicationData;
  const query = `
    INSERT INTO applications (user_id, job_id, resume_id, ai_match_score, ai_match_details, is_suspicious, ai_screening_timestamp)
    VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
    RETURNING *;
  `;
  const values = [userId, jobId, resumeId, aiMatchScore, aiMatchDetails, isSuspicious];
  const result = await db.query(query, values);
  return result.rows[0];
};

const getApplicationByUserAndJob = async (userId, jobId) => {
  const query = `
    SELECT * FROM applications WHERE user_id = $1 AND job_id = $2;
  `;
  const result = await db.query(query, [userId, jobId]);
  return result.rows[0];
};

const getUserApplications = async (userId) => {
  const query = `
    SELECT a.*, j.title, j.location, j.job_type 
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    WHERE a.user_id = $1
    ORDER BY a.applied_at DESC;
  `;
  const result = await db.query(query, [userId]);
  return result.rows;
};

const getJobApplications = async (jobId) => {
  const query = `
    SELECT a.*, u.full_name as candidate_name, u.email as candidate_email, r.file_path as resume_path, r.file_name as resume_name
    FROM applications a
    JOIN users u ON a.user_id = u.id
    LEFT JOIN resumes r ON a.resume_id = r.id
    WHERE a.job_id = $1
    ORDER BY a.ai_match_score DESC, a.applied_at ASC;
  `;
  const result = await db.query(query, [jobId]);
  return result.rows;
};

module.exports = {
  createApplication,
  getApplicationByUserAndJob,
  getUserApplications,
  getJobApplications
};
