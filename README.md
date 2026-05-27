<div align="center">

# 🚀 Job Drive System

### A Production-Grade Internal Job Portal & Hiring Pipeline

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini_AI-Powered-4285F4?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/TanStack_Query-v5-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" />
</p>

<p align="center">
  <strong>An end-to-end internal hiring system — from job posting to aptitude testing to interview scheduling —<br/>powered by AI-assisted resume screening and real-time candidate tracking.</strong>
</p>

---

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Configuration](#️-configuration)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Frontend Routes & Navigation](#-frontend-routes--navigation)
- [Key Feature Walkthroughs](#-key-feature-walkthroughs)

---

## 🧭 Overview

**Job Drive System** is a full-stack internal hiring portal built for organizations that want to manage the entire employee recruitment lifecycle in one place. It handles job posting, AI-powered pre-screening, aptitude testing, interview scheduling, and candidate status management — all with role-based access control.

### ✨ Key Highlights

| Feature | Detail |
|---|---|
| **3 Roles** | `admin`, `hr`, `candidate` — each with tailored dashboards and permissions |
| **AI Pre-Screening** | Gemini AI analyzes resume vs. job description; outputs fit score, strengths/weaknesses, and fraud detection |
| **Aptitude Testing** | Scheduled MCQ-based tests with auto-grading, time limits, and result publishing |
| **Interview Scheduling** | Email invites sent to shortlisted candidates with custom date, time, and notes |
| **Session Security** | JWT with 10-hour expiry; automatic logout + toast on session expiry |
| **Real-Time Notifications** | In-app bell with unread count for all status changes and events |
| **Skeleton Loaders** | Professional skeleton placeholders across every data-heavy page |
| **Dark Mode** | Full dark mode support across all components and modals |

---

## 🌟 Features

### 🔐 Authentication & Authorization
- JWT-based login and registration for candidates
- Admin-created accounts for HR staff
- Role-based routing enforced on both frontend and backend
- Protected routes with automatic 401 interception
- On session expiry: hard redirect to home + toast notification informing user
- Three roles: **Admin** (full system), **HR** (recruitment), **Candidate** (self-service)

### 📋 Job Management
- Admins/HR post jobs with title, description, requirements, salary range, location, job type, and deadline
- Active/Closed status toggle per job
- Jobs with expired deadlines hidden from candidate view (except if already applied)
- `Ready to Schedule` / `Quiz Set` / `Quiz Finished` badges contextually shown on each job card
- Live unscheduled interview count tracked per job via subquery

### 🤖 AI-Powered Pre-Screening
- Candidate selects a resume and clicks **Analyze Fit** before applying
- Backend calls Google Gemini with full job description + resume text + candidate profile
- AI returns:
  - **Match Score** (0–100)
  - **Strengths** (up to 3 bullet points)
  - **Weaknesses** (up to 3 bullet points)
  - **Reasoning** (1–2 sentences)
  - **Fraud Flag** (`is_suspicious`: true if the resume clearly belongs to someone else)
- Fallback chain across multiple Gemini model versions for resilience
- Candidate can see their score before submitting; application saved with full AI analysis

### 📄 Resume Management
- Candidates upload PDFs (max 500KB)
- Resumes stored on disk under `/uploads/resumes/`
- Candidates can manage multiple resumes and delete old ones
- Resume text parsed and stored for AI comparison

### 🧪 Aptitude Testing (MCQ Engine)
- Admins/HR create multi-question MCQ tests per job with:
  - Title, description, duration (minutes), passing score (%)
  - Scheduled start and end time
- Candidates can only access the test within the active window
- Timer displayed in-test; auto-submits on timeout
- Auto-grading on submission; pass/fail determined by `passing_score`
- **Publish Results**: marks all non-passing `shortlisted` candidates as `rejected` atomically
- Candidates who didn't attempt are auto-rejected with score = 0

### 📅 Interview Scheduling
- After results published, HR schedules interviews for candidates in `interview` status
- Per-candidate date, time, and notes/meeting link
- Sends email invites via Gmail SMTP using Nodemailer
- Existing schedules shown pre-filled in the modal for easy updates
- Unscheduled count tracked and surfaced as a badge in job listings

### 👥 User & Candidate Management (Admin)
- Admin creates HR accounts directly
- Full candidate list with search, role/status filter, and pagination
- **Hired badge** shown inline for candidates with `selected` or `hired` applications
- View detailed profile, application history, and MCQ scores per candidate
- Toggle user active/inactive status

### 🔔 Notification System
- In-app notifications for all major events (application submitted, status changed, test result)
- Bell icon with unread count badge in header
- Mark individual or all notifications as read

### 📱 UX & Design
- Fully responsive layout across mobile, tablet, and desktop
- Dark/light mode toggle persisted via `ThemeContext`
- Skeleton loaders for all pages (10 custom skeleton components)
- Offline detection banner with animated indicator
- Toast notifications (react-hot-toast) for all actions
- Dropdown menus close on outside click
- Page-level 404 with branded "Return Home" flow

---

## 🛠 Tech Stack

### Frontend

| Package | Version | Purpose |
|---|---|---|
| React | ^19.x | UI library |
| Vite | ^8.x | Build tool & dev server |
| Tailwind CSS | ^4.x | Utility-first styling |
| React Router DOM | ^7.x | Client-side routing |
| TanStack Query | ^5.x | Server state management & caching |
| Axios | ^1.x | HTTP client with interceptors |
| Lucide React | latest | Icon library |
| React Hot Toast | ^2.x | Toast notification system |
| date-fns | latest | Date formatting utilities |

### Backend

| Package | Version | Purpose |
|---|---|---|
| Express | ^5.x | Web framework |
| pg (node-postgres) | ^8.x | PostgreSQL client |
| bcryptjs | ^3.x | Password hashing |
| jsonwebtoken | ^9.x | JWT authentication |
| Multer | ^2.x | File upload middleware |
| Nodemailer | ^8.x | Email sending via Gmail SMTP |
| @google/genai | latest | Google Gemini AI SDK |
| CORS | ^2.x | Cross-origin support |
| dotenv | ^17.x | Environment variable management |
| dotenvx | ^1.x | Enhanced env injection |

---

## 📁 Project Structure

```
Job-Drive-System/
│
├── backend/
│   └── src/
│       ├── config/
│       │   └── db.js                          # PostgreSQL pool setup
│       │
│       ├── controllers/
│       │   ├── authController.js              # Register, login, get current user
│       │   ├── applicationController.js       # Apply, analyze, update status, revoke
│       │   ├── dashboardController.js         # Admin & candidate stat aggregation
│       │   ├── interviewController.js         # Schedule, fetch interviews
│       │   ├── jobController.js               # CRUD for job postings
│       │   ├── mcqController.js               # Quiz CRUD, candidate test flow, publish
│       │   ├── notificationController.js      # Get & mark notifications
│       │   ├── resumeController.js            # Upload, list, delete resumes
│       │   └── userController.js              # Profile update, admin create, toggle status
│       │
│       ├── middleware/
│       │   ├── authMiddleware.js              # JWT verify, role-based guards
│       │   └── errorMiddleware.js             # Global error handler
│       │
│       ├── models/
│       │   ├── applicationModel.js            # Application CRUD & joins
│       │   ├── jobModel.js                    # Job CRUD with aggregate subqueries
│       │   ├── mcqModel.js                    # Quiz, questions, results, publish logic
│       │   ├── resumeModel.js                 # Resume file metadata
│       │   └── userModel.js                   # User CRUD with is_hired subquery
│       │
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── applicationRoutes.js
│       │   ├── dashboardRoutes.js
│       │   ├── interviewRoutes.js
│       │   ├── jobRoutes.js
│       │   ├── mcqRoutes.js
│       │   ├── notificationRoutes.js
│       │   ├── resumeRoutes.js
│       │   └── userRoutes.js
│       │
│       ├── services/
│       │   └── emailService.js                # Nodemailer Gmail transporter
│       │
│       ├── utils/
│       │   ├── emailTemplate.js               # HTML email builder
│       │   ├── notificationHelper.js          # createNotification utility
│       │   └── sendEmail.js                   # Core send wrapper
│       │
│       └── server.js                          # Express app, route mounting, error handler
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── admin/
│       │   │   └── ManageQuizModal.jsx         # MCQ quiz builder for HR/Admin
│       │   ├── modals/
│       │   │   ├── ApplicationDetailsModal.jsx # Full application detail + MCQ result view
│       │   │   ├── JobApplicantsModal.jsx      # All applicants for a job; status actions
│       │   │   ├── JobApplicationModal.jsx     # Resume pick + AI analyze + submit flow
│       │   │   ├── JobDetailsModal.jsx         # Public job detail view for candidates
│       │   │   ├── JobFormModal.jsx            # Create/edit job form
│       │   │   └── ScheduleInterviewModal.jsx  # Per-candidate interview date/time/notes
│       │   ├── skeletons/
│       │   │   ├── AdminRecentActivitySkeleton.jsx
│       │   │   ├── AptitudeTestSkeleton.jsx
│       │   │   ├── DashboardStatsSkeleton.jsx
│       │   │   ├── JobCardSkeleton.jsx
│       │   │   ├── JobListingsSkeleton.jsx
│       │   │   ├── ManageQuizSkeleton.jsx
│       │   │   ├── ManageUsersSkeleton.jsx
│       │   │   ├── MyApplicationsSkeleton.jsx
│       │   │   ├── ProfileSkeleton.jsx
│       │   │   └── ViewOpeningsSkeleton.jsx
│       │   ├── ui/                            # Shared primitive components
│       │   ├── Header.jsx                     # Top nav with notifications + dark mode
│       │   ├── OfflineBanner.jsx              # Animated offline detection strip
│       │   ├── PageLoader.jsx                 # Full-screen spinner for Suspense
│       │   └── Sidebar.jsx                    # Role-aware collapsible sidebar
│       │
│       ├── context/
│       │   └── ThemeContext.jsx               # Dark/light mode state & persistence
│       │
│       ├── hooks/
│       │   ├── useApplications.js             # useMyApplications, useApplicationsForJob, mutations
│       │   ├── useDashboard.js                # useAdminDashboard, useCandidateDashboard
│       │   ├── useInterviews.js               # useInterviewsByJob, useScheduleInterview
│       │   ├── useJobs.js                     # useJobs, useActiveJobs, mutations
│       │   ├── useNotifications.js            # useNotifications, useMarkAsRead
│       │   ├── useProfile.js                  # useProfile, useResumes, mutations
│       │   ├── useQuizzes.js                  # useQuizForJob, useTestInfo
│       │   └── useUsers.js                    # useUsers, useUserProfile, useUserApplications
│       │
│       ├── layouts/
│       │   └── DashboardLayout.jsx            # Shell with Sidebar + Header
│       │
│       ├── pages/
│       │   ├── Home.jsx                       # Public landing page
│       │   ├── Login.jsx                      # Auth page
│       │   ├── Register.jsx                   # Candidate self-registration
│       │   ├── NotFound.jsx                   # Branded 404 page
│       │   ├── admin/
│       │   │   ├── AdminDashboard.jsx          # Stats, recent activity, quick actions
│       │   │   ├── JobListings.jsx             # Job table with actions dropdown
│       │   │   └── ManageUsers.jsx             # Full user list with profile/application modals
│       │   └── candidate/
│       │       ├── CandidateDashboard.jsx      # Application stats + recent activity
│       │       ├── CandidateAptitudeTest.jsx   # Timed MCQ test interface
│       │       ├── CandidateProfile.jsx        # Profile edit, resume management
│       │       ├── MyApplications.jsx          # Application history + test status
│       │       └── ViewOpenings.jsx            # Job board with search, filter, pagination
│       │
│       ├── routes/
│       │   └── ProtectedRoute.jsx             # Guards by auth + role
│       │
│       ├── services/
│       │   ├── api.js                         # Axios instance + 401 interceptor
│       │   ├── applicationService.js
│       │   ├── dashboardService.js
│       │   ├── interviewService.js
│       │   ├── jobService.js
│       │   ├── notificationService.js
│       │   ├── profileService.js
│       │   └── userService.js
│       │
│       ├── App.jsx                            # Root router + session expiry toast
│       └── main.jsx                           # React + QueryClient bootstrap
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **PostgreSQL** v14 or higher
- **Gmail account** with [App Password](https://support.google.com/accounts/answer/185833) enabled
- **Google AI Studio API Key** for Gemini ([Get one free](https://aistudio.google.com/))

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/RahilMaiyani/Job-Drive-System.git
cd Job-Drive-System
```

#### 2. Backend Setup
```bash
cd backend
npm install
```

#### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

#### 4. Database Setup

Create a PostgreSQL database and run the schema migrations. The system uses the following tables:

- `users` — All accounts (admin, hr, candidate)
- `jobs` — Job postings
- `resumes` — Resume file metadata per candidate
- `applications` — Candidate applications with AI analysis
- `mcq_quizzes` — Aptitude tests per job
- `mcq_questions` — Questions for each quiz
- `mcq_results` — Candidate test attempts and scores
- `interview_slots` — Scheduled interview data per application
- `notifications` — In-app notification records

---

## ⚙️ Configuration

### Backend — `backend/.env`

```env
# Server
PORT=5000

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/job_drive

# Authentication
JWT_SECRET=your_super_secret_jwt_key_min_32_characters

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your_gmail_app_password

# AI (Google Gemini)
GEMINI_API_KEY=your_google_ai_studio_api_key

# Client URL
CLIENT_URL=http://localhost:5173
```

### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

### Running the Application

**Backend** (from `/backend`):
```bash
npm run dev      # Development with nodemon
npm start        # Production
```
Runs on `http://localhost:5000`

**Frontend** (from `/frontend`):
```bash
npm run dev      # Vite development server
npm run build    # Production build
npm run preview  # Preview production build
```
Runs on `http://localhost:5173`

---

## 📡 API Reference

All endpoints are prefixed with `/api`. Authentication is via `Authorization: Bearer <token>` header.

> **Roles:** `admin` = full access, `hr` = recruitment operations, `candidate` = self-service only

---

### 🔐 Authentication

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new candidate account |
| `POST` | `/api/auth/login` | Public | Login; returns signed JWT token |
| `GET` | `/api/auth/me` | Protected | Get current authenticated user |

---

### 💼 Jobs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/jobs` | Any (authenticated) | Get all jobs (admin sees all; candidates see only `active`) |
| `GET` | `/api/jobs/:id` | Any (authenticated) | Get single job by ID |
| `POST` | `/api/jobs` | Admin, HR | Create a new job posting |
| `PUT` | `/api/jobs/:id` | Admin, HR | Update job details or status |
| `DELETE` | `/api/jobs/:id` | Admin, HR | Delete a job posting |

**Job Object Fields:**
```
title, description, requirements[], salary_min, salary_max, salary_range,
location, job_type, status, application_deadline, created_by,
is_published, is_active, quiz_id, scheduled_end_time, results_published, unscheduled_count
```

---

### 📄 Resume Management

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/resumes` | Candidate | Upload a PDF resume (max 500KB, `multipart/form-data`) |
| `GET` | `/api/resumes` | Candidate | List all resumes belonging to the current user |
| `DELETE` | `/api/resumes/:id` | Candidate | Delete a resume by ID |

---

### 📨 Applications

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/applications/analyze` | Candidate | Run AI fit analysis for a job + resume pair (returns score, strengths, weaknesses) |
| `POST` | `/api/applications/submit` | Candidate | Submit application with AI analysis results |
| `GET` | `/api/applications/my-applications` | Candidate | Get all applications for the current candidate |
| `GET` | `/api/applications/job/:jobId` | Admin, HR | Get all applicants for a specific job |
| `GET` | `/api/applications/user/:userId` | Admin, HR | Get all applications for a specific user (admin view) |
| `DELETE` | `/api/applications/:id/revoke` | Candidate | Revoke/withdraw an application |
| `PUT` | `/api/applications/:id/status` | Admin, HR | Update application status |

**Valid Application Statuses:**
```
applied → shortlisted → interview → selected → rejected → offer_sent
```

> Setting status to `selected` or `hired` will automatically close the associated job.

---

### 🧪 Quizzes / Aptitude Tests

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/quizzes/job/:jobId` | Admin, HR | Get quiz and questions for a job |
| `POST` | `/api/quizzes/job/:jobId` | Admin, HR | Create or update quiz + questions for a job |
| `POST` | `/api/quizzes/job/:jobId/publish` | Admin, HR | Publish results; auto-reject non-passing candidates |
| `DELETE` | `/api/quizzes/:quizId` | Admin, HR | Delete a quiz |
| `GET` | `/api/quizzes/application/:applicationId/test-info` | Candidate | Get test status and availability for an application |
| `POST` | `/api/quizzes/application/:applicationId/start` | Candidate | Start the aptitude test (creates attempt record) |
| `POST` | `/api/quizzes/application/:applicationId/submit` | Candidate | Submit answers; triggers auto-grading |

**Quiz Fields:**
```
title, description, duration_minutes, passing_score (%), 
scheduled_start_time, scheduled_end_time, results_published
```

---

### 📅 Interviews

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/interviews/schedule` | Admin, HR | Schedule or update an interview for an applicant |
| `GET` | `/api/interviews/job/:jobId` | Admin, HR | Get all scheduled interviews for a job |
| `GET` | `/api/interviews/application/:applicationId` | Any (authenticated) | Get interview details for a specific application |

**Interview Schedule Payload:**
```json
{
  "jobId": "uuid",
  "applicationId": "uuid",
  "candidateId": "uuid",
  "scheduledDate": "2025-06-15",
  "scheduledTime": "10:30",
  "notes": "Google Meet link or instructions"
}
```

---

### 👤 Users

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users` | Admin, HR | Get all users with `is_hired` flag |
| `GET` | `/api/users/:id/profile` | Protected | Get a specific user's profile |
| `PUT` | `/api/users/profile` | Candidate | Update own profile (bio, skills, phone, etc.) |
| `PUT` | `/api/users/reset-password` | Protected | Change own password |
| `POST` | `/api/users` | Admin, HR | Admin-create a new user (HR accounts) |
| `PATCH` | `/api/users/:id/toggle-status` | Admin | Toggle user `is_active` status |

---

### 📊 Dashboard

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/admin` | Admin, HR | Get admin stats: total jobs, applications, users, recent activity |
| `GET` | `/api/dashboard/candidate` | Candidate | Get candidate stats: application counts by status |

---

### 🔔 Notifications

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | Protected | Get all notifications for the current user |
| `PUT` | `/api/notifications/:id/read` | Protected | Mark a specific notification as read |

---

## 🗄 Database Schema

> All IDs are **integer** (auto-incremented sequences), not UUIDs.

### `users`
```sql
id                  SERIAL PRIMARY KEY
email               VARCHAR UNIQUE NOT NULL
password_hash       VARCHAR NOT NULL
full_name           VARCHAR NOT NULL
role                VARCHAR NOT NULL DEFAULT 'candidate'
                    -- CHECK: 'candidate' | 'hr' | 'admin'
phone               VARCHAR
profile_picture_url VARCHAR
bio                 TEXT
skills              JSONB
experience_years    INTEGER
current_company     VARCHAR
linkedin_profile    VARCHAR
is_active           BOOLEAN DEFAULT TRUE
created_at          TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
updated_at          TIMESTAMPTZ
```

---

### `jobs`
```sql
id                   SERIAL PRIMARY KEY
title                VARCHAR NOT NULL
description          TEXT NOT NULL
requirements         JSONB
salary_min           INTEGER
salary_max           INTEGER
salary_range         VARCHAR           -- e.g. "₹30k - ₹50k per month"
location             VARCHAR
job_type             VARCHAR
status               VARCHAR DEFAULT 'draft'
                     -- CHECK: 'draft' | 'active' | 'closed'
is_published         BOOLEAN DEFAULT FALSE
is_active            BOOLEAN DEFAULT TRUE
application_deadline DATE
created_by           INTEGER REFERENCES users(id)
created_at           TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
updated_at           TIMESTAMPTZ
```

---

### `resumes`
```sql
id          SERIAL PRIMARY KEY
user_id     INTEGER NOT NULL REFERENCES users(id)
file_name   VARCHAR NOT NULL
file_path   VARCHAR NOT NULL
parsed_text TEXT
uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
```

---

### `applications`
```sql
id                     SERIAL PRIMARY KEY
user_id                INTEGER NOT NULL REFERENCES users(id)
job_id                 INTEGER NOT NULL REFERENCES jobs(id)
resume_id              INTEGER REFERENCES resumes(id)
status                 VARCHAR DEFAULT 'applied'
                       -- CHECK: 'applied' | 'screening_passed' | 'screening_failed'
                       --        'shortlisted' | 'interview' | 'selected'
                       --        'rejected' | 'offer_sent'
ai_match_score         NUMERIC                          -- 0 to 100
ai_match_details       JSONB                            -- { strengths[], weaknesses[], reasoning }
is_suspicious          BOOLEAN DEFAULT FALSE
ai_screening_timestamp TIMESTAMPTZ
applied_at             TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
updated_at             TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
```

---

### `mcq_quizzes`
```sql
id                   SERIAL PRIMARY KEY
job_id               INTEGER NOT NULL REFERENCES jobs(id)
title                VARCHAR NOT NULL
description          TEXT
duration_minutes     INTEGER NOT NULL DEFAULT 30
passing_score        INTEGER DEFAULT 50
scheduled_start_time TIMESTAMPTZ
scheduled_end_time   TIMESTAMPTZ
results_published    BOOLEAN DEFAULT FALSE
created_at           TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
updated_at           TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
```

---

### `mcq_questions`
```sql
id                   SERIAL PRIMARY KEY
quiz_id              INTEGER NOT NULL REFERENCES mcq_quizzes(id)
question_text        TEXT NOT NULL
options              JSONB NOT NULL    -- ["Option A", "Option B", "Option C", "Option D"]
correct_option_index INTEGER NOT NULL
created_at           TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
```

---

### `mcq_results`
```sql
id             SERIAL PRIMARY KEY
quiz_id        INTEGER NOT NULL REFERENCES mcq_quizzes(id)
application_id INTEGER NOT NULL REFERENCES applications(id)
score          INTEGER NOT NULL
passed         BOOLEAN NOT NULL
started_at     TIMESTAMPTZ
completed_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
UNIQUE (quiz_id, application_id)
```

---

### `interview_slots`
```sql
id              SERIAL PRIMARY KEY
job_id          INTEGER NOT NULL REFERENCES jobs(id)
application_id  INTEGER NOT NULL REFERENCES applications(id)
interviewer_id  INTEGER REFERENCES users(id)
scheduled_date  DATE NOT NULL
scheduled_time  TIME NOT NULL
status          VARCHAR DEFAULT 'scheduled'
                -- CHECK: 'scheduled' | 'completed' | 'cancelled'
notes           TEXT
created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
updated_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
```

---

### `notifications`
```sql
id         SERIAL PRIMARY KEY
user_id    INTEGER NOT NULL REFERENCES users(id)
title      VARCHAR NOT NULL
message    TEXT NOT NULL
type       VARCHAR DEFAULT 'info'    -- info | success | warning | error
is_read    BOOLEAN DEFAULT FALSE
created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
```

---

## 🗺 Frontend Routes & Navigation

| Path | Role | Component | Description |
|---|---|---|---|
| `/` | Public | `Home` | Landing page |
| `/login` | Public | `Login` | Auth login form |
| `/register` | Public | `Register` | Candidate self-registration |
| `/admin/dashboard` | Admin, HR | `AdminDashboard` | Stats, recent activity |
| `/admin/jobs` | Admin, HR | `JobListings` | Job table with full action dropdown |
| `/admin/users` | Admin, HR | `ManageUsers` | Full user list with modals |
| `/candidate/dashboard` | Candidate | `CandidateDashboard` | Application stats + activity |
| `/candidate/openings` | Candidate | `ViewOpenings` | Job board with search, filter, pagination |
| `/candidate/applications` | Candidate | `MyApplications` | Application history + test status cards |
| `/candidate/profile` | Candidate | `CandidateProfile` | Profile editor + resume manager |
| `/candidate/test/:applicationId` | Candidate | `CandidateAptitudeTest` | Timed MCQ test interface |
| `*` | Any | `NotFound` | 404 branded page |

---

## 🔍 Key Feature Walkthroughs

### AI Pre-Screening Pipeline

```
Candidate selects resume
        ↓
Clicks "Analyze Fit"
        ↓
POST /api/applications/analyze
   → Fetches job, resume text, candidate profile
   → Builds structured Gemini prompt
   → Tries model chain: gemini-3.1-flash-lite → gemini-3-flash → gemini-2.5-flash-lite → ...
   → Returns JSON: { ai_match_score, ai_match_details, is_suspicious }
        ↓
Frontend shows score + strengths/weaknesses
        ↓
Candidate clicks "Submit Application"
   → POST /api/applications/submit (with analysis payload)
   → Application saved with full AI metadata
   → Confirmation email sent to candidate
   → Notification created
```

### Aptitude Test Flow

```
HR creates quiz per job (questions + schedule window)
        ↓
Candidates reach test window → "Start Test" unlocked
        ↓
POST /api/quizzes/application/:id/start
   → Creates mcq_results record (score=0, started_at=now)
        ↓
Candidate answers questions within timer
        ↓
POST /api/quizzes/application/:id/submit
   → Server grades answers vs. correct_option_index
   → Updates score, passed, completed_at
        ↓
After scheduled_end_time:
   HR clicks "Publish Results"
        ↓
POST /api/quizzes/job/:jobId/publish
   → All shortlisted candidates without a passing result → status = 'rejected' (score = 0)
   → mcq_quizzes.results_published = TRUE
```

### Session Expiration Flow

```
User's JWT expires (10-hour window)
        ↓
Next API call returns 401 Unauthorized
        ↓
Axios response interceptor in api.js catches it
   → Clears sessionStorage + localStorage
   → Sets sessionExpired = "true" in sessionStorage
   → window.location.href = '/'  (hard redirect, full state reset)
        ↓
App.jsx useEffect on mount detects sessionExpired flag
   → Clears the flag
   → Shows toast: "Your session expired. Please log in again."
```

---