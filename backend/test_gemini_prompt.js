require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const prompt = `
You are an expert ATS (Applicant Tracking System). 
Analyze this candidate's resume against the job description and the candidate's profile data.
Also, verify if the resume likely belongs to this user based on their profile data (name, skills).

Job Title: Software Engineer
Job Description: Build scalable apps.
Job Requirements: ["React", "Node"]

Candidate Profile (from DB):
Name: John Doe
Experience: 5 years
Skills: ["React"]

Candidate Resume Text:
John Doe. Experience in React.

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

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    console.log('SUCCESS:', response.text);
  } catch(e) {
    console.error('ERROR:', e.message);
  }
}
run();
