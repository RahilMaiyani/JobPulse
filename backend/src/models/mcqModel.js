const db = require('../config/db');

const getQuizByJobId = async (jobId) => {
  const query = `SELECT * FROM mcq_quizzes WHERE job_id = $1`;
  const result = await db.query(query, [jobId]);
  return result.rows[0];
};

const createQuiz = async (quizData) => {
  const { job_id, title, description, duration_minutes, passing_score, scheduled_start_time, scheduled_end_time } = quizData;
  const query = `
    INSERT INTO mcq_quizzes (job_id, title, description, duration_minutes, passing_score, scheduled_start_time, scheduled_end_time)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const values = [job_id, title, description, duration_minutes, passing_score, scheduled_start_time, scheduled_end_time];
  const result = await db.query(query, values);
  return result.rows[0];
};

const updateQuiz = async (quizId, quizData) => {
  const { title, description, duration_minutes, passing_score, scheduled_start_time, scheduled_end_time } = quizData;
  const query = `
    UPDATE mcq_quizzes 
    SET title = $1, description = $2, duration_minutes = $3, passing_score = $4, scheduled_start_time = $5, scheduled_end_time = $6, updated_at = CURRENT_TIMESTAMP
    WHERE id = $7
    RETURNING *;
  `;
  const values = [title, description, duration_minutes, passing_score, scheduled_start_time, scheduled_end_time, quizId];
  const result = await db.query(query, values);
  return result.rows[0];
};

const deleteQuiz = async (quizId) => {
  const query = `DELETE FROM mcq_quizzes WHERE id = $1 RETURNING id`;
  const result = await db.query(query, [quizId]);
  return result.rows[0];
};

// QUESTION OPERATIONS
const getQuestionsByQuizId = async (quizId) => {
  const query = `SELECT * FROM mcq_questions WHERE quiz_id = $1 ORDER BY id ASC`;
  const result = await db.query(query, [quizId]);
  return result.rows;
};

const createQuestion = async (questionData) => {
  const { quiz_id, question_text, options, correct_option_index } = questionData;
  const query = `
    INSERT INTO mcq_questions (quiz_id, question_text, options, correct_option_index)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [quiz_id, question_text, JSON.stringify(options), correct_option_index];
  const result = await db.query(query, values);
  return result.rows[0];
};

const updateQuestion = async (questionId, questionData) => {
  const { question_text, options, correct_option_index } = questionData;
  const query = `
    UPDATE mcq_questions 
    SET question_text = $1, options = $2, correct_option_index = $3
    WHERE id = $4
    RETURNING *;
  `;
  const values = [question_text, JSON.stringify(options), correct_option_index, questionId];
  const result = await db.query(query, values);
  return result.rows[0];
};

const deleteQuestion = async (questionId) => {
  const query = `DELETE FROM mcq_questions WHERE id = $1 RETURNING id`;
  const result = await db.query(query, [questionId]);
  return result.rows[0];
};

// CANDIDATE OPERATIONS
const getQuizByApplicationId = async (applicationId) => {
  const query = `
    SELECT q.* 
    FROM mcq_quizzes q
    JOIN applications a ON q.job_id = a.job_id
    WHERE a.id = $1
  `;
  const result = await db.query(query, [applicationId]);
  return result.rows[0];
};

const getResultByApplicationId = async (applicationId) => {
  const query = `SELECT * FROM mcq_results WHERE application_id = $1`;
  const result = await db.query(query, [applicationId]);
  return result.rows[0];
};

const startTest = async (quizId, applicationId) => {
  const query = `
    INSERT INTO mcq_results (quiz_id, application_id, score, passed, started_at, completed_at)
    VALUES ($1, $2, 0, false, CURRENT_TIMESTAMP, NULL)
    ON CONFLICT (quiz_id, application_id) 
    DO UPDATE SET score = mcq_results.score
    RETURNING *;
  `;
  const result = await db.query(query, [quizId, applicationId]);
  return result.rows[0];
};

const submitTest = async (resultId, score, passed, originalScore = 0, candidateAnswers = {}, hasProctoringViolation = false) => {
  const query = `
    UPDATE mcq_results
    SET score = $1, passed = $2, original_score = $3, candidate_answers = $4, has_proctoring_violation = $5, completed_at = CURRENT_TIMESTAMP
    WHERE id = $6
    RETURNING *;
  `;
  const result = await db.query(query, [score, passed, originalScore, JSON.stringify(candidateAnswers), hasProctoringViolation, resultId]);
  return result.rows[0];
};

const publishQuizResults = async (jobId, quizId) => {
  // Find shortlisted applicants who don't have a completed result, or have no result at all
  const query = `
    WITH failing_apps AS (
      SELECT a.id 
      FROM applications a
      LEFT JOIN mcq_results mr ON a.id = mr.application_id AND mr.quiz_id = $2
      WHERE a.job_id = $1 AND a.status = 'shortlisted' AND (mr.id IS NULL OR mr.completed_at IS NULL OR mr.passed = false)
    ),
    inserted_results AS (
      INSERT INTO mcq_results (quiz_id, application_id, score, passed, started_at, completed_at)
      SELECT $2, id, 0, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      FROM failing_apps
      ON CONFLICT (quiz_id, application_id) 
      DO UPDATE SET score = EXCLUDED.score, passed = false, completed_at = CURRENT_TIMESTAMP
      RETURNING application_id
    )
    UPDATE applications
    SET status = 'rejected'
    WHERE id IN (SELECT application_id FROM inserted_results)
    RETURNING id;
  `;
  const result = await db.query(query, [jobId, quizId]);

  // Mark quiz as published
  await db.query(`UPDATE mcq_quizzes SET results_published = TRUE WHERE id = $1`, [quizId]);

  return result.rows.length; // return count of auto-rejected applicants
};

module.exports = {
  getQuizByJobId,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuestionsByQuizId,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getQuizByApplicationId,
  getResultByApplicationId,
  startTest,
  submitTest,
  publishQuizResults
};
