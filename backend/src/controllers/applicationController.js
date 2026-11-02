const applicationModel = require('../models/applicationModel');
const resumeModel = require('../models/resumeModel');
const jobModel = require('../models/jobModel');
const userModel = require('../models/userModel');
const emailService = require('../services/emailService');
const { createNotification } = require('../utils/notificationHelper');
const resumeQueue = require("../queues/resumeQueue");

const analyzeApplication = async (req, res, next) => {
  try {
    const { jobId, resumeId } = req.body;
    const userId = req.user.id;

    if (!jobId || !resumeId) {
      return res.status(400).json({ error: 'jobId and resumeId are required' });
    }

    const [job, resume] = await Promise.all([
      jobModel.getJobById(jobId),
      resumeModel.getResumeById(resumeId, userId),
    ]);

    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (!resume) return res.status(404).json({ error: 'Resume not found' });

    const queueJob = await resumeQueue.add('analyze-resume', {
      jobId,
      resumeId,
      userId,
    });

    return res.status(202).json({
      message: "Resume analysis queued successfully.",
      jobId: queueJob.id,
      status: 'queued',
    });

  } catch (err) {
    next(err);
  }
};

const getAnalysisStatus = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await resumeQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: "Analysis job not found or expired. " });
    }

    if (job.data.userId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized to view this analysis" });
    }

    const state = await job.getState();
    const progress = job.progress || 0;

    if (state === 'completed') {
      return res.json({
        status: "completed",
        progress: 100,
        analysis: job.returnvalue,
      });
    }

    if (state === 'failed') {
      return res.json({
        state: 'failed',
        error: job.failedReason || "Resume analysis failed",
      });
    }

    return res.json({
      status: state,
      progress,
    });

  } catch (err) {
    next(err);
  }
}

const submitApplication = async (req, res, next) => {
  try {
    const { jobId, resumeId, analysis } = req.body;
    const userId = req.user.id;

    const existing = await applicationModel.getApplicationByUserAndJob(userId, jobId);
    if (existing) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }

    const applicationData = {
      userId,
      jobId,
      resumeId,
      aiMatchScore: analysis.ai_match_score,
      aiMatchDetails: analysis.ai_match_details,
      isSuspicious: analysis.is_suspicious
    };

    const newApp = await applicationModel.createApplication(applicationData);

    try {
      const user = await userModel.getUserById(userId);
      const job = await jobModel.getJobById(jobId);
      if (user && job) {
        await emailService.sendApplicationReceivedEmail(user.email, user.full_name, job.title);
        await createNotification(userId, "Application Submitted", `Your application for ${job.title} has been received.`, "success");
      }
    } catch (emailErr) {
      console.error("Failed to send application email:", emailErr);
    }

    res.status(201).json({ message: 'Application submitted successfully', application: newApp });
  } catch (err) {
    next(err);
  }
};

const getMyApplications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const applications = await applicationModel.getUserApplications(userId);
    res.json({ applications });
  } catch (err) {
    next(err);
  }
};

const getJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const applications = await applicationModel.getJobApplications(jobId);
    res.json({ applications });
  } catch (err) {
    next(err);
  }
};

const getUserApplicationsAdmin = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const applications = await applicationModel.getUserApplications(userId);
    res.json({ applications });
  } catch (err) {
    next(err);
  }
};

const revokeApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deletedApp = await applicationModel.deleteApplication(id, userId);

    if (!deletedApp) {
      return res.status(404).json({ error: 'Application not found or you do not have permission to revoke it' });
    }

    res.json({ message: 'Application revoked successfully' });
  } catch (err) {
    next(err);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['applied', 'shortlisted', 'interview', 'selected', 'rejected', 'offer_sent'];
    if (status && !validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updatedApp = await applicationModel.updateApplicationStatus(id, status);

    if (!updatedApp) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (status.toLowerCase() === 'selected' || status.toLowerCase() === 'hired') {
      await jobModel.updateJob(updatedApp.job_id, { status: 'closed' });
    }

    // Send Email Notification
    try {
      // Need user and job details
      const user = await userModel.getUserById(updatedApp.user_id);
      const job = await jobModel.getJobById(updatedApp.job_id);
      if (user && job) {
        await emailService.sendStatusUpdateEmail(user.email, user.full_name, job.title, status);
        await createNotification(user.id, "Application Status Updated", `Your application for ${job.title} is now: ${status}`, "info");
      }
    } catch (emailErr) {
      console.error("Failed to send status update email:", emailErr);
    }

    res.json({ message: 'Status updated successfully', application: updatedApp });
  } catch (err) {
    next(err);
  }
};

const bulkUpdateJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: 'Invalid updates array' });
    }

    await applicationModel.bulkUpdateApplicationStatuses(updates);

    // Send notifications/emails asynchronously so we don't block the response
    const job = await jobModel.getJobById(jobId);
    if (job) {
      updates.forEach(async (update) => {
        try {
          // In a real app we'd fetch the user email, but we might just skip it for bulk to avoid spamming the console
          // We will just update DB status.
        } catch (e) {
          console.error("Bulk email error", e);
        }
      });
    }

    res.json({ message: 'Bulk status update successful' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  analyzeApplication,
  getAnalysisStatus,
  submitApplication,
  getMyApplications,
  getJobApplications,
  getUserApplicationsAdmin,
  revokeApplication,
  updateApplicationStatus,
  bulkUpdateJobApplications
};
