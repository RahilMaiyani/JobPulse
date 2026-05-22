const applicationModel = require('../models/applicationModel');
const resumeModel = require('../models/resumeModel');
const jobModel = require('../models/jobModel');
const userModel = require('../models/userModel');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const analyzeApplication = async (req, res, next) => {
  try {
    const { jobId, resumeId } = req.body;
    const userId = req.user.id;

    // Fetch Job, Resume, and User Profile
    const job = await jobModel.getJobById(jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const resume = await resumeModel.getResumeById(resumeId, userId);
    if (!resume) return res.status(404).json({ error: 'Resume not found' });

    const userProfile = await userModel.getUserById(userId);

    // Call Gemini
    const prompt = `
You are an expert ATS (Applicant Tracking System). 
Analyze this candidate's resume against the job description and the candidate's profile data.
Also, verify if the resume likely belongs to this user based on their profile data (name, skills).

Job Title: ${job.title}
Job Description: ${job.description}
Job Requirements: ${JSON.stringify(job.requirements || [])}

Candidate Profile (from DB):
Name: ${userProfile.full_name}
Experience: ${userProfile.experience_years} years
Skills: ${JSON.stringify(userProfile.skills || [])}

Candidate Resume Text:
${resume.parsed_text}

Output EXACTLY a JSON object with this format (no markdown tags, just pure JSON).
Limit strengths and weaknesses to a MAXIMUM of 3 short bullet points each (1 sentence max per point).
Limit reasoning to 1-2 short sentences.
Format:
{
  "ai_match_score": number (0 to 100),
  "ai_match_details": {
    "strengths": ["...", "..."],
    "weaknesses": ["...", "..."],
    "reasoning": "..."
  },
  "is_suspicious": boolean (true if the resume clearly belongs to someone else with a different name/background)
}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    let aiResult;
    try {
      let responseText = response.text.trim();
      if (responseText.startsWith('```json')) {
        responseText = responseText.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (responseText.startsWith('```')) {
        responseText = responseText.replace(/^```/, '').replace(/```$/, '').trim();
      }
      aiResult = JSON.parse(responseText);
    } catch (parseErr) {
      console.error("Gemini JSON Parse Error:", parseErr, "\nRAW TEXT:\n", response.text);
      require('fs').writeFileSync('gemini_error_log.txt', response.text);
      return res.status(500).json({ error: 'Failed to analyze resume', details: parseErr.message, rawText: response.text });
    }

    res.json({ analysis: aiResult });
  } catch (err) {
    next(err);
  }
};

const submitApplication = async (req, res, next) => {
  try {
    const { jobId, resumeId, analysis } = req.body;
    const userId = req.user.id;

    // Check if already applied
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
    res.status(201).json({ message: 'Application submitted successfully', application: newApp });
  } catch (err) {
    next(err);
  }
};

const getMyApplications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // We'll create this in the model
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

module.exports = {
  analyzeApplication,
  submitApplication,
  getMyApplications,
  getJobApplications,
  getUserApplicationsAdmin
};
