const jobModel = require('../models/jobModel');
const applicationModel = require('../models/applicationModel');
const userModel = require('../models/userModel');
const emailService = require('../services/emailService');

const getAllJobs = async (req, res, next) => {
  try {
    const jobs = await jobModel.getAllJobs();
    res.json({ jobs });
  } catch (error) {
    next(error);
  }
};

const createJob = async (req, res, next) => {
  try {
    const jobData = req.body;
    
    // Comprehensive Validation
    if (!jobData.title || jobData.title.trim() === '') {
      return res.status(400).json({ error: "Job title is required." });
    }
    if (!jobData.description || jobData.description.trim() === '') {
      return res.status(400).json({ error: "Job description is required." });
    }
    if (jobData.salary_min && jobData.salary_max && Number(jobData.salary_min) > Number(jobData.salary_max)) {
      return res.status(400).json({ error: "Minimum salary cannot be greater than maximum salary." });
    }
    if (jobData.application_deadline && isNaN(Date.parse(jobData.application_deadline))) {
      return res.status(400).json({ error: "Invalid application deadline format." });
    }

    // Attach creator's ID
    jobData.created_by = req.user.id;

    const newJob = await jobModel.createJob(jobData);
    res.status(201).json({ job: newJob });
  } catch (error) {
    next(error);
  }
};

const getJobById = async (req, res, next) => {
  try {
    const job = await jobModel.getJobById(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json({ job });
  } catch (error) {
    next(error);
  }
};

const updateJob = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const jobData = req.body;

    if (jobData.salary_min && jobData.salary_max && Number(jobData.salary_min) > Number(jobData.salary_max)) {
      return res.status(400).json({ error: "Minimum salary cannot be greater than maximum salary." });
    }

    const updatedJob = await jobModel.updateJob(jobId, jobData);
    if (!updatedJob) return res.status(404).json({ error: "Job not found" });
    
    // Auto-reject candidates if job is closed
    if (jobData.status === 'closed') {
      try {
        const apps = await applicationModel.getJobApplications(jobId);
        const toReject = apps.filter(a => a.status !== 'selected' && a.status !== 'offer_sent' && a.status !== 'rejected');
        
        for (const app of toReject) {
          await applicationModel.updateApplicationStatus(app.id, 'rejected');
          if (app.candidate_email && app.candidate_name) {
            await emailService.sendStatusUpdateEmail(app.candidate_email, app.candidate_name, updatedJob.title, 'rejected');
          }
        }
      } catch (err) {
        console.error("Auto-reject failed on job close:", err);
      }
    }

    res.json({ job: updatedJob });
  } catch (error) {
    next(error);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const deletedJob = await jobModel.deleteJob(jobId);
    if (!deletedJob) return res.status(404).json({ error: "Job not found" });

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllJobs,
  createJob,
  getJobById,
  updateJob,
  deleteJob
};
