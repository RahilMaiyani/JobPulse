require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Output exactly a json: {"test": 123}',
      config: { responseMimeType: 'application/json' }
    });
    console.log('SUCCESS:', response.text);
  } catch(e) {
    console.error('ERROR:', e.message);
  }
}
run();
