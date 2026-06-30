const pool = require('../config/db');
const supabase = require('../config/supabase');
const crypto = require('crypto');

const uploadProctoringEvent = async (req, res) => {
    const { applicationId } = req.params;
    const { quiz_id, event_type, image_data } = req.body;
    const user = req.user; // from authenticateToken

    try {
        if (quiz_id === undefined || !event_type) {
            console.log('Validation failed:', { quiz_id, event_type, body: req.body });
            return res.status(400).json({ error: 'Missing required fields', details: { quiz_id, event_type } });
        }

        // Validate the application exists and belongs to the user
        const appQuery = await pool.query(
            'SELECT * FROM applications WHERE id = $1 AND user_id = $2',
            [applicationId, user.id]
        );

        if (appQuery.rows.length === 0) {
            return res.status(403).json({ error: 'Unauthorized or application not found' });
        }

        let file_name = 'no-image';
        let file_path = 'no-image';

        // Decode base64 image and upload to Supabase
        if (image_data && image_data.startsWith('data:image/')) {
            const base64Data = image_data.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            // Ensure we create a standalone buffer without shared memory from Node's buffer pool
            const standaloneBuffer = Buffer.from(buffer);
            const uniqueFilename = `${user.id}-${applicationId}-${Date.now()}-${crypto.randomUUID()}.jpg`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('proctoring-snapshots')
                .upload(uniqueFilename, standaloneBuffer, {
                    contentType: 'image/jpeg',
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error('Supabase upload error:', uploadError);
                return res.status(500).json({ error: 'Failed to upload snapshot' });
            }

            const { data: publicUrlData } = supabase.storage.from('proctoring-snapshots').getPublicUrl(uniqueFilename);
            file_name = uniqueFilename;
            file_path = publicUrlData.publicUrl;
        }

        // Insert event into DB
        await pool.query(
            `INSERT INTO proctoring_events 
             (user_id, application_id, quiz_id, event_type, file_name, file_path) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [user.id, applicationId, quiz_id, event_type, file_name, file_path]
        );

        res.status(201).json({ success: true, message: 'Event logged successfully' });
    } catch (error) {
        console.error('Error logging proctoring event:', error);
        res.status(500).json({ error: 'Failed to log proctoring event' });
    }
};

const getProctoringEventsForApplication = async (req, res) => {
    const { applicationId } = req.params;
    try {
        const events = await pool.query(
            'SELECT * FROM proctoring_events WHERE application_id = $1 ORDER BY created_at DESC',
            [applicationId]
        );
        res.json({ events: events.rows });
    } catch (error) {
        console.error('Error fetching proctoring events:', error);
        res.status(500).json({ error: 'Failed to fetch proctoring events' });
    }
};

const forgiveProctoringViolations = async (req, res) => {
    const { applicationId } = req.params;
    try {
        const resultQuery = await pool.query('SELECT * FROM mcq_results WHERE application_id = $1', [applicationId]);
        if (resultQuery.rows.length === 0) {
            return res.status(404).json({ error: 'Test result not found' });
        }

        const mcqResult = resultQuery.rows[0];

        // Fetch quiz passing score
        const quizQuery = await pool.query('SELECT passing_score FROM mcq_quizzes WHERE id = $1', [mcqResult.quiz_id]);
        if (quizQuery.rows.length === 0) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        const passingScore = quizQuery.rows[0].passing_score;

        // Dynamically calculate the score based on their saved candidate_answers JSON
        const questionsQuery = await pool.query('SELECT id, correct_option_index FROM mcq_questions WHERE quiz_id = $1', [mcqResult.quiz_id]);
        const questions = questionsQuery.rows;

        let answers = mcqResult.candidate_answers || {};
        if (typeof answers === 'string') {
            try {
                answers = JSON.parse(answers);
            } catch (e) {
                answers = {};
            }
        }

        let correctCount = 0;
        for (const q of questions) {
            const selectedOption = answers[q.id];
            if (selectedOption !== undefined && Number(selectedOption) === q.correct_option_index) {
                correctCount++;
            }
        }

        const totalQ = questions.length;
        const calculatedScore = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;
        const newPassed = calculatedScore >= passingScore;

        const updateQuery = await pool.query(
            `UPDATE mcq_results 
             SET score = $1, original_score = $1, passed = $2, is_proctoring_forgiven = true 
             WHERE id = $3 RETURNING *`,
            [calculatedScore, newPassed, mcqResult.id]
        );

        res.json({ success: true, message: 'Violations forgiven and score restored', result: updateQuery.rows[0] });
    } catch (error) {
        console.error('Error forgiving proctoring violations:', error);
        res.status(500).json({ error: 'Failed to forgive violations' });
    }
};

module.exports = {
    uploadProctoringEvent,
    getProctoringEventsForApplication,
    forgiveProctoringViolations
};
