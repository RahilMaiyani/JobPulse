const pool = require('../config/db');

const getAllJobs = async () => {
  const result = await pool.query(`
    SELECT j.*, q.id as quiz_id, q.scheduled_end_time, q.results_published,
           (SELECT COUNT(*) FROM applications a 
            WHERE a.job_id = j.id AND a.status = 'interview' 
            AND NOT EXISTS (SELECT 1 FROM interview_slots i WHERE i.application_id = a.id)
           ) as unscheduled_count,
           (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) as applicant_count
    FROM jobs j
    LEFT JOIN mcq_quizzes q ON j.id = q.job_id
    ORDER BY j.created_at DESC
  `);
  return result.rows;
};

const createJob = async (jobData) => {
  const { 
    title, 
    description, 
    requirements, 
    salary_min, 
    salary_max, 
    location, 
    job_type,
    application_deadline,
    created_by 
  } = jobData;

  let salary_range = null;
  if (salary_min && salary_max) {
    salary_range = `₹${(salary_min/1000).toFixed(0)}k - ₹${(salary_max/1000).toFixed(0)}k per month`;
  } else if (salary_min) {
    salary_range = `₹${(salary_min/1000).toFixed(0)}k+ per month`;
  }

  const result = await pool.query(
    `INSERT INTO jobs (
      title, description, requirements, salary_min, salary_max, location, job_type, status, application_deadline, created_by, is_published, is_active, salary_range
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8, $9, true, true, $10)
     RETURNING *`,
    [
      title, 
      description, 
      requirements ? JSON.stringify(requirements) : null, 
      salary_min || null, 
      salary_max || null, 
      location || null, 
      job_type || 'Full-time', 
      application_deadline || null,
      created_by,
      salary_range
    ]
  );
  return result.rows[0];
};

const getJobById = async (id) => {
  const result = await pool.query('SELECT * FROM jobs WHERE id = $1', [id]);
  return result.rows[0];
};

const updateJob = async (id, jobData) => {
  const { 
    title, 
    description, 
    requirements, 
    salary_min, 
    salary_max, 
    location, 
    job_type,
    application_deadline,
    status
  } = jobData;

  let salary_range = null;
  if (salary_min && salary_max) {
    salary_range = `₹${(salary_min/1000).toFixed(0)}k - ₹${(salary_max/1000).toFixed(0)}k per month`;
  } else if (salary_min) {
    salary_range = `₹${(salary_min/1000).toFixed(0)}k+ per month`;
  }

  const result = await pool.query(
    `UPDATE jobs 
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         requirements = COALESCE($3, requirements),
         salary_min = COALESCE($4, salary_min),
         salary_max = COALESCE($5, salary_max),
         location = COALESCE($6, location),
         job_type = COALESCE($7, job_type),
         application_deadline = COALESCE($8, application_deadline),
         status = COALESCE($9, status),
         salary_range = COALESCE($10, salary_range),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $11
     RETURNING *`,
    [
      title, 
      description, 
      requirements ? JSON.stringify(requirements) : null, 
      salary_min || null, 
      salary_max || null, 
      location, 
      job_type,
      application_deadline || null,
      status,
      salary_range,
      id
    ]
  );
  return result.rows[0];
};

const deleteJob = async (id) => {
  const result = await pool.query('DELETE FROM jobs WHERE id = $1 RETURNING id', [id]);
  return result.rows[0];
};

module.exports = {
  getAllJobs,
  createJob,
  getJobById,
  updateJob,
  deleteJob
};
