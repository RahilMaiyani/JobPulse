const pool = require('../config/db');

const getAdminStats = async (req, res, next) => {
  try {
    const jobsCountResult = await pool.query("SELECT COUNT(*) FROM jobs WHERE status = 'active'");
    const candidatesCountResult = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'candidate'");
    const applicationsCountResult = await pool.query("SELECT COUNT(*) FROM applications");

    const recentJobsResult = await pool.query("SELECT * FROM jobs ORDER BY created_at DESC LIMIT 5");

    // 1. Hiring Funnel Query
    const funnelResult = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM applications 
      GROUP BY status
    `);
    const funnelStats = {
      applied: 0,
      shortlisted: 0,
      interview: 0,
      selected: 0,
      hired: 0,
      rejected: 0
    };
    funnelResult.rows.forEach(row => {
      const s = (row.status || '').toLowerCase();
      if (s in funnelStats) {
        funnelStats[s] = parseInt(row.count);
      }
    });

    // 2. Recent Live Activity Queries
    // Recent applications
    const recentAppsResult = await pool.query(`
      SELECT a.id, u.full_name, a.ai_match_score, j.title as job_title, a.applied_at as timestamp, 'applied' as activity_type
      FROM applications a
      JOIN users u ON a.user_id = u.id
      JOIN jobs j ON a.job_id = j.id
      ORDER BY a.applied_at DESC
      LIMIT 5
    `);

    // Recent test completions
    const recentTestsResult = await pool.query(`
      SELECT r.id, u.full_name, r.score, j.title as job_title, r.completed_at as timestamp, 'quiz_completed' as activity_type
      FROM mcq_results r
      JOIN applications a ON r.application_id = a.id
      JOIN users u ON a.user_id = u.id
      JOIN jobs j ON a.job_id = j.id
      ORDER BY r.completed_at DESC
      LIMIT 5
    `);

    // Recent scheduled interviews
    const recentInterviewsResult = await pool.query(`
      SELECT i.id, u.full_name, i.scheduled_date, i.scheduled_time, j.title as job_title, i.created_at as timestamp, 'interview_scheduled' as activity_type
      FROM interview_slots i
      JOIN applications a ON i.application_id = a.id
      JOIN users u ON a.user_id = u.id
      JOIN jobs j ON i.job_id = j.id
      ORDER BY i.created_at DESC
      LIMIT 5
    `);

    // Combine and sort activities
    const allActivities = [
      ...recentAppsResult.rows,
      ...recentTestsResult.rows,
      ...recentInterviewsResult.rows
    ];

    allActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const recentActivities = allActivities.slice(0, 5);

    res.json({
      activeJobsCount: parseInt(jobsCountResult.rows[0].count),
      totalCandidatesCount: parseInt(candidatesCountResult.rows[0].count),
      totalApplicationsCount: parseInt(applicationsCountResult.rows[0].count),
      recentJobs: recentJobsResult.rows,
      funnelStats,
      recentActivities
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

    // Most recent active application
    const recentApplicationResult = await pool.query(`
      SELECT a.id, a.status, a.applied_at, j.title as job_title 
      FROM applications a 
      JOIN jobs j ON a.job_id = j.id 
      WHERE a.user_id = $1 
      ORDER BY a.applied_at DESC 
      LIMIT 1
    `, [userId]);

    // Pending test
    const pendingTestResult = await pool.query(`
      SELECT q.id as quiz_id, q.title as quiz_title, q.duration_minutes, q.scheduled_end_time, a.id as application_id, j.title as job_title
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN mcq_quizzes q ON j.id = q.job_id
      LEFT JOIN mcq_results mr ON a.id = mr.application_id
      WHERE a.user_id = $1 AND a.status = 'shortlisted' AND mr.id IS NULL AND q.scheduled_end_time > CURRENT_TIMESTAMP
      ORDER BY q.scheduled_end_time ASC
      LIMIT 1
    `, [userId]);

    // Upcoming interview
    const upcomingInterviewResult = await pool.query(`
      SELECT i.scheduled_date, i.scheduled_time, j.title as job_title
      FROM interview_slots i
      JOIN applications a ON i.application_id = a.id
      JOIN jobs j ON i.job_id = j.id
      WHERE a.user_id = $1 AND i.status = 'scheduled' AND (i.scheduled_date + i.scheduled_time) > CURRENT_TIMESTAMP
      ORDER BY i.scheduled_date ASC, i.scheduled_time ASC
      LIMIT 1
    `, [userId]);

    res.json({
      openRolesCount: parseInt(activeJobsResult.rows[0].count),
      myApplicationsCount: parseInt(myApplicationsResult.rows[0].count),
      recentOpenings: recentOpeningsResult.rows,
      recentApplication: recentApplicationResult.rows[0] || null,
      pendingTest: pendingTestResult.rows[0] || null,
      upcomingInterview: upcomingInterviewResult.rows[0] || null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getCandidateStats
};
