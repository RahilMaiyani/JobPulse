const pool = require('../config/db');

const getAdminStats = async (req, res, next) => {
  try {
    const jobsCountResult = await pool.query("SELECT COUNT(*) FROM jobs WHERE status = 'active'");
    const candidatesCountResult = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'candidate'");
    const applicationsCountResult = await pool.query("SELECT COUNT(*) FROM applications");

    const recentJobsResult = await pool.query("SELECT * FROM jobs ORDER BY created_at DESC LIMIT 5");

    res.json({
      activeJobsCount: parseInt(jobsCountResult.rows[0].count),
      totalCandidatesCount: parseInt(candidatesCountResult.rows[0].count),
      totalApplicationsCount: parseInt(applicationsCountResult.rows[0].count),
      recentJobs: recentJobsResult.rows
    });
  } catch (error) {
    next(error);
  }
};

const getCandidateStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const activeJobsResult = await pool.query("SELECT COUNT(*) FROM jobs WHERE status = 'active' AND is_published = true");
    const myApplicationsResult = await pool.query("SELECT COUNT(*) FROM applications WHERE user_id = $1", [userId]);

    // Recent openings
    const recentOpeningsResult = await pool.query("SELECT * FROM jobs WHERE status = 'active' AND is_published = true ORDER BY created_at DESC LIMIT 3");

    res.json({
      openRolesCount: parseInt(activeJobsResult.rows[0].count),
      myApplicationsCount: parseInt(myApplicationsResult.rows[0].count),
      recentOpenings: recentOpeningsResult.rows
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getCandidateStats
};
