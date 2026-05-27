const db = require('../config/db');

const createUser = async (userData) => {
  const { email, passwordHash, fullName, role } = userData;
  const query = `
    INSERT INTO users (email, password_hash, full_name, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, email, full_name, role, created_at;
  `;
  const values = [email, passwordHash, fullName, role];
  const result = await db.query(query, values);
  return result.rows[0];
};

const getUserByEmail = async (email) => {
  const query = `SELECT * FROM users WHERE email = $1;`;
  const result = await db.query(query, [email]);
  return result.rows[0];
};

const getUserById = async (id) => {
  const query = `SELECT id, email, full_name, role, phone, bio, skills, experience_years, current_company, linkedin_profile, created_at FROM users WHERE id = $1;`;
  const result = await db.query(query, [id]);
  return result.rows[0];
};

const getAllUsers = async () => {
  const query = `
    SELECT id, email, full_name, role, phone, is_active, created_at,
           EXISTS(SELECT 1 FROM applications a WHERE a.user_id = users.id AND a.status IN ('hired', 'selected')) AS is_hired
    FROM users 
    ORDER BY created_at DESC;
  `;
  const result = await db.query(query);
  return result.rows;
};

const updateUserProfile = async (id, profileData) => {
  const { phone, bio, skills, experience_years, current_company, linkedin_profile } = profileData;
  const query = `
    UPDATE users 
    SET phone = COALESCE($1, phone),
        bio = COALESCE($2, bio),
        skills = COALESCE($3, skills),
        experience_years = COALESCE($4, experience_years),
        current_company = COALESCE($5, current_company),
        linkedin_profile = COALESCE($6, linkedin_profile),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $7
    RETURNING id, email, full_name, role, phone, bio, skills, experience_years, current_company, linkedin_profile;
  `;
  const result = await db.query(query, [
    phone || null,
    bio || null,
    skills ? JSON.stringify(skills) : null,
    experience_years || null,
    current_company || null,
    linkedin_profile || null,
    id
  ]);
  return result.rows[0];
};

const updateUserPassword = async (id, newPasswordHash) => {
  const query = `UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id;`;
  const result = await db.query(query, [newPasswordHash, id]);
  return result.rows[0];
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  getAllUsers,
  updateUserProfile,
  updateUserPassword
};
