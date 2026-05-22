const resumeModel = require('../models/resumeModel');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }

    const userId = req.user.id;
    const fileName = req.file.originalname;
    const filePath = `/uploads/resumes/${req.file.filename}`;

    // Read and parse PDF text
    const dataBuffer = fs.readFileSync(req.file.path);
    let parsedText = '';
    try {
      const data = await pdfParse(dataBuffer);
      parsedText = data.text;
    } catch (parseErr) {
      // If parsing fails, we might still want to store the file or reject it
      console.error("PDF Parsing error:", parseErr);
      return res.status(400).json({ error: `Could not extract text from the provided PDF: ${parseErr.message || 'Unknown error'}` });
    }

    const newResume = await resumeModel.uploadResume(userId, fileName, filePath, parsedText);
    
    // Don't send the entire parsedText back in the list view to save bandwidth
    const { parsed_text, ...resumeData } = newResume;
    
    res.status(201).json({ message: 'Resume uploaded successfully', resume: resumeData });
  } catch (err) {
    next(err);
  }
};

const getUserResumes = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const resumes = await resumeModel.getUserResumes(userId);
    res.json({ resumes });
  } catch (err) {
    next(err);
  }
};

const deleteResume = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const resume = await resumeModel.getResumeById(id, userId);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Delete file from disk
    const absolutePath = path.join(__dirname, '..', '..', resume.file_path);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    await resumeModel.deleteResume(id, userId);
    res.json({ message: 'Resume deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadResume,
  getUserResumes,
  deleteResume
};
