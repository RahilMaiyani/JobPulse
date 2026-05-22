-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'candidate', -- 'candidate', 'hr', 'admin'
  phone VARCHAR(20),
  profile_picture_url VARCHAR(500),
  bio TEXT,
  skills JSONB, -- {"skills": ["Node.js", "React", ...]}
  experience_years INT,
  current_company VARCHAR(255),
  linkedin_profile VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_role CHECK (role IN ('candidate', 'hr', 'admin'))
);

-- Jobs table
CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  requirements JSONB, 
  salary_min INTEGER,
  salary_max INTEGER,
  location VARCHAR(255),
  job_type VARCHAR(50), 
  status VARCHAR(50) DEFAULT 'draft', 
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  application_deadline DATE,
  is_published BOOLEAN DEFAULT FALSE,
  CONSTRAINT valid_status CHECK (status IN ('draft', 'active', 'closed'))
);

-- Resumes Table
CREATE TABLE resumes (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  parsed_text TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Applications table
CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id INT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  resume_id INT REFERENCES resumes(id) ON DELETE SET NULL,
  cover_letter TEXT,
  status VARCHAR(50) DEFAULT 'applied',
  ai_match_score DECIMAL(5, 2), 
  ai_match_details JSONB, 
  is_suspicious BOOLEAN DEFAULT FALSE,
  ai_screening_timestamp TIMESTAMP WITH TIME ZONE,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  rejection_reason TEXT,
  UNIQUE(user_id, job_id),
  CONSTRAINT valid_status CHECK (status IN ('applied', 'screening_passed', 'screening_failed', 'shortlisted', 'selected', 'rejected', 'offer_sent')),
  CONSTRAINT valid_score CHECK (ai_match_score >= 0 AND ai_match_score <= 100)
);

-- MCQ Quizzes Table
CREATE TABLE mcq_quizzes (
    id SERIAL PRIMARY KEY,
    job_id INT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INT NOT NULL DEFAULT 30,
    passing_score INT DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- MCQ Questions Table
CREATE TABLE mcq_questions (
    id SERIAL PRIMARY KEY,
    quiz_id INT NOT NULL REFERENCES mcq_quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option_index INT NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- MCQ Results Table
CREATE TABLE mcq_results (
    id SERIAL PRIMARY KEY,
    quiz_id INT NOT NULL REFERENCES mcq_quizzes(id) ON DELETE CASCADE,
    application_id INT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    score INT NOT NULL,
    passed BOOLEAN NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(quiz_id, application_id)
);

-- Interview Slots
CREATE TABLE interview_slots (
  id SERIAL PRIMARY KEY,
  job_id INT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  application_id INT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  interviewer_id INT REFERENCES users(id), -- This will map to an HR user
  round_name VARCHAR(255) NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  end_time TIME,
  status VARCHAR(50) DEFAULT 'scheduled', 
  meeting_link VARCHAR(500),
  meeting_platform VARCHAR(50), 
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_status CHECK (status IN ('scheduled', 'completed', 'cancelled'))
);

-- Evaluations
CREATE TABLE evaluations (
  id SERIAL PRIMARY KEY,
  slot_id INT NOT NULL REFERENCES interview_slots(id) ON DELETE CASCADE,
  interviewer_id INT NOT NULL REFERENCES users(id),
  score INT NOT NULL,
  feedback TEXT,
  recommendation VARCHAR(50) NOT NULL, 
  technical_skills_score INT,
  communication_score INT,
  problem_solving_score INT,
  cultural_fit_score INT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_recommendation CHECK (recommendation IN ('pass', 'fail', 'maybe'))
);

-- Indexes for performance
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_user ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_by ON jobs(created_by);
CREATE INDEX idx_users_role ON users(role);
