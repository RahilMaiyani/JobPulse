const mcqModel = require('../models/mcqModel');
const jobModel = require('../models/jobModel');
const applicationModel = require('../models/applicationModel');
const emailService = require('../services/emailService');
const { createNotification } = require('../utils/notificationHelper');

// QUIZ ENDPOINTS
const getQuizByJobId = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const quiz = await mcqModel.getQuizByJobId(jobId);

    if (!quiz) {
      return res.status(404).json({ message: 'No quiz found for this job' });
    }

    const questions = await mcqModel.getQuestionsByQuizId(quiz.id);
    res.json({ quiz, questions });
  } catch (err) {
    next(err);
  }
};

const createOrUpdateQuiz = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { title, description, duration_minutes, passing_score, scheduled_start_time, scheduled_end_time, questions } = req.body;

    let quiz = await mcqModel.getQuizByJobId(jobId);

    if (quiz) {
      quiz = await mcqModel.updateQuiz(quiz.id, {
        title, description, duration_minutes, passing_score, scheduled_start_time, scheduled_end_time
      });
    } else {
      quiz = await mcqModel.createQuiz({
        job_id: jobId, title, description, duration_minutes, passing_score, scheduled_start_time, scheduled_end_time
      });
    }

    // Handle questions (For simplicity, if updating, we delete all existing questions and re-insert)
    // A better approach would be to upsert, but this ensures a clean slate
    const existingQuestions = await mcqModel.getQuestionsByQuizId(quiz.id);
    for (const q of existingQuestions) {
      await mcqModel.deleteQuestion(q.id);
    }

    const newQuestions = [];
    if (questions && questions.length > 0) {
      for (const q of questions) {
        const createdQ = await mcqModel.createQuestion({
          quiz_id: quiz.id,
          question_text: q.question_text,
          options: q.options,
          correct_option_index: q.correct_option_index
        });
        newQuestions.push(createdQ);
      }
    }

    // Send Test Available Email to Shortlisted Candidates
    try {
      const job = await jobModel.getJobById(jobId);
      const apps = await applicationModel.getJobApplications(jobId);
      const shortlisted = apps.filter(app => app.status === 'shortlisted');
      for (const app of shortlisted) {
        await emailService.sendTestAvailableEmail(
          app.candidate_email,
          app.candidate_name,
          job.title,
          quiz.scheduled_end_time
        );
        await createNotification(
          app.user_id,
          "Aptitude Test Available \u23F0",
          `Your Aptitude Test for ${job.title} is now available. Deadline: ${new Date(quiz.scheduled_end_time).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })} IST.`,
          "info"
        );
      }
    } catch (emailErr) {
      console.error("Failed to send Test Available emails:", emailErr);
    }

    res.status(200).json({ message: 'Quiz saved successfully', quiz, questions: newQuestions });
  } catch (err) {
    next(err);
  }
};

const deleteQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    await mcqModel.deleteQuiz(quizId);
    res.json({ message: 'Quiz deleted successfully' });
  } catch (err) {
    next(err);
  }
};

const publishResults = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const quiz = await mcqModel.getQuizByJobId(jobId);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found for this job' });

    const now = new Date();
    const end = new Date(quiz.scheduled_end_time);

    if (now < end) {
      return res.status(400).json({ error: 'Cannot publish results before the test deadline' });
    }

    if (quiz.results_published) {
      return res.status(400).json({ error: 'Results already published' });
    }

    const autoRejectedCount = await mcqModel.publishQuizResults(jobId, quiz.id);

    // Send Test Result Emails
    try {
      const job = await jobModel.getJobById(jobId);
      const apps = await applicationModel.getJobApplications(jobId);
      // Everyone who has a completed test result gets an email
      const evaluated = apps.filter(app => app.mcq_completed_at !== null);
      for (const app of evaluated) {
        await emailService.sendTestResultEmail(
          app.candidate_email,
          app.candidate_name,
          job.title,
          app.mcq_score,
          app.mcq_passed
        );
        await createNotification(
          app.user_id,
          "Aptitude Test Results \uD83D\uDCCA",
          `The results for the ${job.title} Aptitude Test have been published. You scored ${app.mcq_score}%.`,
          app.mcq_passed ? "success" : "error"
        );
      }
    } catch (emailErr) {
      console.error("Failed to send Test Result emails:", emailErr);
    }

    res.json({ message: 'Results published successfully', autoRejectedCount });
  } catch (err) {
    next(err);
  }
};

// CANDIDATE ENDPOINTS
const getCandidateTestInfo = async (req, res, next) => {
  try {
    const { applicationId } = req.params;

    // We should verify the user owns this application, but let's assume middleware or candidate role handles it
    const quiz = await mcqModel.getQuizByApplicationId(applicationId);
    if (!quiz) {
      return res.json({ quiz: null, result: null });
    }

    const result = await mcqModel.getResultByApplicationId(applicationId);
    res.json({ quiz, result });
  } catch (err) {
    next(err);
  }
};

const startCandidateTest = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const quiz = await mcqModel.getQuizByApplicationId(applicationId);

    if (!quiz) return res.status(404).json({ error: 'No quiz found' });

    const now = new Date();
    const start = new Date(quiz.scheduled_start_time);
    const end = new Date(quiz.scheduled_end_time);

    if (now < start) return res.status(403).json({ error: 'Test window has not started yet' });
    if (now > end) return res.status(403).json({ error: 'Test window has closed' });

    let result = await mcqModel.getResultByApplicationId(applicationId);
    if (result && result.completed_at) {
      return res.status(403).json({ error: 'Test already completed' });
    }

    if (!result) {
      result = await mcqModel.startTest(quiz.id, applicationId);
    }

    const questions = await mcqModel.getQuestionsByQuizId(quiz.id);
    // Strip correct_option_index
    const safeQuestions = questions.map(q => ({
      id: q.id,
      question_text: q.question_text,
      options: q.options
    }));

    res.json({ result, questions: safeQuestions, duration_minutes: quiz.duration_minutes });
  } catch (err) {
    next(err);
  }
};

const submitCandidateTest = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { answers } = req.body; // { questionId: selectedIndex }

    const quiz = await mcqModel.getQuizByApplicationId(applicationId);
    if (!quiz) return res.status(404).json({ error: 'No quiz found' });

    const result = await mcqModel.getResultByApplicationId(applicationId);
    if (!result) return res.status(403).json({ error: 'Test not started' });
    if (result.completed_at) return res.status(403).json({ error: 'Test already submitted' });

    // Validate time? We trust client auto-submit mostly, but could enforce duration server-side
    // const startedAt = new Date(result.started_at);
    // const timeElapsedMs = new Date() - startedAt;
    // const maxAllowedMs = (quiz.duration_minutes * 60000) + 60000; // 1 min grace

    const questions = await mcqModel.getQuestionsByQuizId(quiz.id);

    let correctCount = 0;
    for (const q of questions) {
      if (answers[q.id] === q.correct_option_index) {
        correctCount++;
      }
    }

    const maxScore = 100;
    const totalQ = questions.length;
    const finalScore = totalQ > 0 ? Math.round((correctCount / totalQ) * maxScore) : 0;
    const passed = finalScore >= quiz.passing_score;

    const updatedResult = await mcqModel.submitTest(result.id, finalScore, passed);

    res.json({ message: 'Test submitted', result: updatedResult });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getQuizByJobId,
  createOrUpdateQuiz,
  deleteQuiz,
  publishResults,
  getCandidateTestInfo,
  startCandidateTest,
  submitCandidateTest
};
