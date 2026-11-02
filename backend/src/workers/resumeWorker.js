const { Worker } = require("bullmq");
const redisConnection = require("../config/redis");
const jobModel = require('../models/jobModel')
const resumeModel = require('../models/resumeModel')
const userModel = require('../models/userModel')
const { GoogleGenAI } = require("@google/genai")

const resumeWorker = new Worker('resume-analysis',
    async (job) => {
        const { jobId, resumeId, userId } = job.data;
        console.log(`[Worker] Starting analysis for Job ID: ${job.id} (User: ${userId})`);

        await job.updateProgress(15);

        const [jobDetails, resume, userProfile] = await Promise.all([
            jobModel.getJobById(jobId),
            resumeModel.getResumeById(resumeId, userId),
            userModel.getUserById(userId),
        ]);
        if (!jobDetails) throw new Error('Job not found');
        if (!resume) throw new Error('Resume not found');
        await job.updateProgress(40);

        const prompt = `
            You are an expert ATS (Applicant Tracking System). 
            Analyze this candidate's resume against the job description and the candidate's profile data.
            Also, verify if the resume likely belongs to this user based on their profile data (name, skills).
            Job Title: ${jobDetails.title}
            Job Description: ${jobDetails.description}
            Job Requirements: ${JSON.stringify(jobDetails.requirements || [])}
            Candidate Profile (from DB):
            Name: ${userProfile?.full_name || 'N/A'}
            Experience: ${userProfile?.experience_years || 0} years
            Skills: ${JSON.stringify(userProfile?.skills || [])}
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
                "is_suspicious": boolean
            }
        `;
        await job.updateProgress(60);

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const fallbackModels = ['gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3-flash', 'gemini-2.5-flash-lite'];
        let response = null;
        let lastErr = null;
        for (const model of fallbackModels) {
            try {
                console.log(`[Worker] Trying Gemini model: ${model} for Job ${job.id}...`);
                response = await ai.models.generateContent({
                    model: model,
                    contents: prompt,
                    config: { responseMimeType: "application/json" }
                });
                break;
            } catch (err) {
                lastErr = err;
                console.warn(`[Worker] Model ${model} failed: ${err.message}`);
            }
        }
        if (!response) {
            throw new Error(`All Gemini models failed. Last error: ${lastErr?.message}`);
        }
        await job.updateProgress(85);

        let responseText = response.text.trim();
        if (responseText.startsWith('```json')) {
            responseText = responseText.replace(/^```json/, '').replace(/```$/, '').trim();
        } else if (responseText.startsWith('```')) {
            responseText = responseText.replace(/^```/, '').replace(/```$/, '').trim();
        }
        const aiResult = JSON.parse(responseText);
        await job.updateProgress(100);
        console.log(`[Worker] Successfully completed analysis for Job ID: ${job.id}`);

        return aiResult;
    },
    {
        connection: redisConnection,
        concurrency: 5,
    }
);

resumeWorker.on('completed', (job) => {
    console.log(`[BullMQ] Job ${job.id} completed successfully`);
});

resumeWorker.on('failed', (job, err) => {
    console.error(`[BullMQ] Job ${job.id} failed with error: ${err.message}`);
});

module.exports = resumeWorker;
