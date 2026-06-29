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
    SELECT a.*, j.title, j.location, j.job_type,
           q.id as quiz_id, q.scheduled_start_time, q.scheduled_end_time, q.results_published,
           mr.id as result_id, mr.score as mcq_score, mr.passed as mcq_passed
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    LEFT JOIN mcq_quizzes q ON j.id = q.job_id
    LEFT JOIN mcq_results mr ON a.id = mr.application_id
    WHERE a.user_id = $1
    ORDER BY a.applied_at DESC;
  `;
  const result = await db.query(query, [userId]);
  return result.rows;
};

const getJobApplications = async (jobId) => {
  const query = `
    SELECT 
      a.*, 
      u.full_name as candidate_name, 
      u.email as candidate_email, 
      u.is_active as candidate_is_active, 
      r.file_path as resume_path, 
      r.file_name as resume_name,
      m.score as mcq_score,
      m.passed as mcq_passed,
      m.completed_at as mcq_completed_at,
      m.started_at as mcq_started_at,
      m.original_score,
      m.is_proctoring_forgiven,
      m.candidate_answers,
      m.has_proctoring_violation
    FROM applications a
    JOIN users u ON a.user_id = u.id
    LEFT JOIN resumes r ON a.resume_id = r.id
    LEFT JOIN mcq_results m ON a.id = m.application_id
    WHERE a.job_id = $1
    ORDER BY a.ai_match_score DESC, a.applied_at ASC;
  `;
  const result = await db.query(query, [jobId]);
  return result.rows;
};

const deleteApplication = async (id, userId) => {
  const query = `DELETE FROM applications WHERE id = $1 AND user_id = $2 RETURNING *;`;
  const result = await db.query(query, [id, userId]);
  return result.rows[0];
};

const updateApplicationStatus = async (id, status) => {
  const query = `UPDATE applications SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *;`;
  const result = await db.query(query, [status, id]);
  return result.rows[0];
};

const bulkUpdateApplicationStatuses = async (updates) => {
  // updates is an array of { id, status }
  const queries = updates.map(u =>
    db.query(`UPDATE applications SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [u.status, u.id])
  );
  await Promise.all(queries);
  return true;
};

module.exports = {
  createApplication,
  getApplicationByUserAndJob,
  getUserApplications,
  getJobApplications,
  deleteApplication,
  updateApplicationStatus,
  bulkUpdateApplicationStatuses
};
