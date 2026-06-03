const resumeModel = require('../models/resumeModel');
const pdfParse = require('pdf-parse');
const supabase = require('../config/supabase');

const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }

    const userId = req.user.id;

    // Check resume limit
    const existingResumes = await resumeModel.getUserResumes(userId);
    if (existingResumes.length >= 5) {
      return res.status(400).json({ error: 'You can only upload a maximum of 5 resumes' });
    }

    const fileName = req.file.originalname;

    // Read and parse PDF text from memory buffer
    let parsedText = '';
    try {
      const data = await pdfParse(req.file.buffer);
      parsedText = data.text;
    } catch (parseErr) {
      console.error("PDF Parsing error:", parseErr);
      return res.status(400).json({ error: `Could not extract text from the provided PDF: ${parseErr.message || 'Unknown error'}` });
    }

    // Upload to Supabase Storage
    const uniqueFilename = `${userId}-${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(uniqueFilename, req.file.buffer, {
        contentType: req.file.mimetype
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return res.status(500).json({ error: 'Failed to upload resume to storage' });
    }

    const { data: publicUrlData } = supabase.storage.from('resumes').getPublicUrl(uniqueFilename);
    const filePath = publicUrlData.publicUrl;

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

    // Delete file from Supabase Storage
    try {
      const fileNameToDelete = resume.file_path.split('/').pop();
      if (fileNameToDelete) {
        const { error: removeError } = await supabase.storage.from('resumes').remove([fileNameToDelete]);
        if (removeError) {
          console.error("Error removing from Supabase:", removeError);
        }
      }
    } catch (storageErr) {
      console.error("Could not delete from storage:", storageErr);
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
