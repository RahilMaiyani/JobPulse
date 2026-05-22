const db = require('../config/db');

const uploadResume = async (userId, fileName, filePath, parsedText) => {
  const query = `
    INSERT INTO resumes (user_id, file_name, file_path, parsed_text)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [userId, fileName, filePath, parsedText];
  const result = await db.query(query, values);
  return result.rows[0];
};

const getUserResumes = async (userId) => {
  const query = `
    SELECT id, file_name, file_path, uploaded_at 
    FROM resumes 
    WHERE user_id = $1
    ORDER BY uploaded_at DESC;
  `;
  const result = await db.query(query, [userId]);
  return result.rows;
};

const getResumeById = async (id, userId) => {
  const query = `
    SELECT * 
    FROM resumes 
    WHERE id = $1 AND user_id = $2;
  `;
  const result = await db.query(query, [id, userId]);
  return result.rows[0];
};

const deleteResume = async (id, userId) => {
  const query = `
    DELETE FROM resumes 
    WHERE id = $1 AND user_id = $2
    RETURNING *;
  `;
  const result = await db.query(query, [id, userId]);
  return result.rows[0];
};

module.exports = {
  uploadResume,
  getUserResumes,
  getResumeById,
  deleteResume
};
