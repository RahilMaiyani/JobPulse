<div align="center">

# JobPulse — Job Drive System

### A Production-Grade Internal Hiring Portal & Recruitment Pipeline

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-Powered-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![License](https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge)](LICENSE)

<br/>

**An end-to-end internal hiring system — from job posting to aptitude testing to interview scheduling —  
powered by AI-assisted resume screening and real-time candidate tracking.**

[Quick Start](#-quick-start) · [Features](#-features) · [API Reference](#-api-reference) · [Schema](#-database-schema) · [Routes](#-frontend-routes)

---

</div>

## Overview

**JobPulse** is a full-stack internal recruitment platform built for organizations that want to manage the entire employee hiring lifecycle in one place. It covers job posting, AI-powered pre-screening, aptitude testing, interview scheduling, and candidate status management — all with role-based access control and a polished, responsive UI.

### At a Glance

| | |
|---|---|
| **Roles** | `admin` · `hr` · `candidate` — each with tailored dashboards and permissions |
| **AI Pre-Screening** | Gemini AI scores resume fit, surfaces strengths/weaknesses, and flags fraud |
| **Aptitude Testing** | Timed MCQ tests with auto-grading, scheduling windows, and result publishing |
| **Interview Scheduling** | Email invites with custom date, time, and notes sent to shortlisted candidates |
| **Security** | JWT with 10-hour expiry; hard redirect + toast on session expiry |
| **Notifications** | In-app bell with unread count for all status changes and events |
| **UI Polish** | Skeleton loaders, full dark mode, offline detection, toast alerts throughout |

---

## Features

<details>
<summary><strong>Authentication & Authorization</strong></summary>

- JWT-based login and registration for candidates
- Admin-created accounts for HR staff
- Role-based routing enforced on both frontend and backend
- Protected routes with automatic 401 interception
- On session expiry: hard redirect to `/` + informational toast
- Three roles: **Admin** (full system), **HR** (recruitment ops), **Candidate** (self-service)

</details>

<details>
<summary><strong>Job Management</strong></summary>

- Post jobs with title, description, requirements, salary range, location, type, and deadline
- Active/Closed status toggle per listing
- Jobs past their deadline hidden from candidates (unless already applied)
- Contextual badges: `Ready to Schedule` / `Quiz Set` / `Quiz Finished`
- Live unscheduled interview count tracked via subquery per job

</details>

<details>
<summary><strong>AI-Powered Pre-Screening</strong></summary>

- Candidate selects a resume and clicks **Analyze Fit** before applying
- Backend calls Google Gemini with the job description, resume text, and candidate profile
- AI returns a structured response:
  - **Match Score** (0–100)
  - **Strengths** (up to 3 bullet points)
  - **Weaknesses** (up to 3 bullet points)
  - **Reasoning** (1–2 sentences)
  - **Fraud Flag** — detected when a resume clearly belongs to someone else
- Fallback chain across multiple Gemini model versions for resilience
- Score shown to the candidate before they submit; full analysis stored on the application

</details>

<details>
<summary><strong>Aptitude Testing (MCQ Engine)</strong></summary>

- Admins/HR create multi-question tests per job: title, description, duration, passing score, and a scheduled window
- Candidates can only access tests within the active time window
- Timer shown during the test; auto-submits on timeout
- Auto-grading on submission; pass/fail determined by `passing_score`
- **Publish Results** atomically marks all non-passing shortlisted candidates as `rejected`
- Candidates who never attempted are auto-rejected with score = 0

</details>

<details>
<summary><strong>Interview Scheduling</strong></summary>

- HR schedules interviews for candidates in `interview` status after results are published
- Per-candidate date, time, and meeting notes/link
- Email invites sent via Gmail SMTP using Nodemailer
- Existing schedules pre-filled in the modal for easy updates
- Unscheduled count shown as a badge on each job listing

</details>

<details>
<summary><strong>User & Candidate Management</strong></summary>

- Admin creates HR accounts directly from the dashboard
- Full candidate list with search, role/status filter, and pagination
- **Hired** badge shown inline for candidates with `selected` or `hired` applications
- View detailed profile, application history, and MCQ scores per candidate
- Toggle user active/inactive status (soft deactivation)

</details>

<details>
<summary><strong>Notification System</strong></summary>

- In-app notifications for all major events (application submitted, status changed, test result)
- Bell icon with unread count badge in header
- Mark individual or all notifications as read at once

</details>

---

## Tech Stack

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
| Nodemailer | ^8.x | Email via Gmail SMTP |
| @google/genai | latest | Google Gemini AI SDK |
| CORS | ^2.x | Cross-origin support |
| dotenv / dotenvx | ^17.x / ^1.x | Environment variable management |

---

## Project Structure

```
Job-Drive-System/
├── backend/
│   └── src/
│       ├── config/
│       │   └── db.js                          # PostgreSQL pool setup
│       ├── controllers/
│       │   ├── authController.js              # Register, login, get current user
│       │   ├── applicationController.js       # Apply, analyze, update status, revoke
│       │   ├── dashboardController.js         # Admin & candidate stat aggregation
│       │   ├── interviewController.js         # Schedule & fetch interviews
│       │   ├── jobController.js               # CRUD for job postings
│       │   ├── mcqController.js               # Quiz CRUD, candidate test flow, publish
│       │   ├── notificationController.js      # Get & mark notifications
│       │   ├── resumeController.js            # Upload, list, delete resumes
│       │   └── userController.js              # Profile update, admin create, toggle status
│       ├── middleware/
│       │   ├── authMiddleware.js              # JWT verify + role-based guards
│       │   └── errorMiddleware.js             # Global error handler
│       ├── models/
│       │   ├── applicationModel.js
│       │   ├── jobModel.js                    # Job CRUD with aggregate subqueries
│       │   ├── mcqModel.js                    # Quiz, questions, results, publish logic
│       │   ├── resumeModel.js
│       │   └── userModel.js                   # User CRUD with is_hired subquery
│       ├── routes/                            # One file per resource
│       ├── services/
│       │   └── emailService.js               # Nodemailer Gmail transporter
│       ├── utils/
│       │   ├── emailTemplate.js              # HTML email builder
│       │   ├── notificationHelper.js         # createNotification utility
│       │   └── sendEmail.js                  # Core send wrapper
│       └── server.js                         # Express app entry point
│
└── frontend/
    └── src/
        ├── components/
        │   ├── admin/
        │   │   └── ManageQuizModal.jsx        # MCQ quiz builder for HR/Admin
        │   ├── modals/
        │   │   ├── ApplicationDetailsModal.jsx
        │   │   ├── JobApplicantsModal.jsx
        │   │   ├── JobApplicationModal.jsx    # Resume pick + AI analyze + submit
        │   │   ├── JobDetailsModal.jsx
        │   │   ├── JobFormModal.jsx
        │   │   └── ScheduleInterviewModal.jsx
        │   ├── skeletons/                     # 10 page-level skeleton loaders
        │   ├── Header.jsx                     # Top nav: clock, notifications, dark mode
        │   ├── OfflineBanner.jsx
        │   ├── PageLoader.jsx
        │   └── Sidebar.jsx                    # Role-aware collapsible sidebar
        ├── context/
        │   └── ThemeContext.jsx               # Dark/light mode state & persistence
        ├── hooks/                             # TanStack Query wrappers per resource
        ├── layouts/
        │   └── DashboardLayout.jsx            # Shell with Sidebar + Header
        ├── pages/
        │   ├── Home.jsx                       # Public landing page
        │   ├── Login.jsx / Register.jsx
        │   ├── NotFound.jsx
        │   ├── admin/
        │   │   ├── AdminDashboard.jsx
        │   │   ├── JobListings.jsx
        │   │   └── ManageUsers.jsx
        │   └── candidate/
        │       ├── CandidateDashboard.jsx
        │       ├── CandidateAptitudeTest.jsx  # Timed MCQ test interface
        │       ├── CandidateProfile.jsx
        │       ├── MyApplications.jsx
        │       └── ViewOpenings.jsx
        ├── routes/
        │   └── ProtectedRoute.jsx
        ├── services/                          # Axios service functions per resource
        ├── App.jsx                            # Root router + session expiry toast
        └── main.jsx                           # React + QueryClient bootstrap
```

---

## Quick Start

### Prerequisites

- **Node.js** v18+
- **PostgreSQL** v14+
- **Gmail account** with an [App Password](https://support.google.com/accounts/answer/185833) enabled
- **Google AI Studio API Key** ([Get one free](https://aistudio.google.com/))

### 1. Clone

```bash
git clone https://github.com/RahilMaiyani/Job-Drive-System.git
cd Job-Drive-System
```

### 2. Install Dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Configure Environment

**`backend/.env`**
```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/job_drive
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your_gmail_app_password
GEMINI_API_KEY=your_google_ai_studio_api_key
CLIENT_URL=http://localhost:5173
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Database Setup

Create a PostgreSQL database and apply the schema. The system uses these tables:

`users` · `jobs` · `resumes` · `applications` · `mcq_quizzes` · `mcq_questions` · `mcq_results` · `interview_slots` · `notifications`

> See the [Database Schema](#-database-schema) section below for full DDL.

### 5. Run

```bash
# Terminal 1 — Backend (http://localhost:5000)
cd backend && npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend && npm run dev
```

---

## API Reference

All endpoints are prefixed with `/api`.  
Authentication uses `Authorization: Bearer <token>`.

> **Role shorthand:** `A` = Admin · `H` = HR · `C` = Candidate · `*` = Any authenticated user

---

### Authentication

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register a new candidate |
| `POST` | `/auth/login` | Public | Login; returns signed JWT |
| `GET` | `/auth/me` | `*` | Get current authenticated user |

---

### Jobs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/jobs` | `*` | List jobs (admins see all; candidates see `active` only) |
| `GET` | `/jobs/:id` | `*` | Get single job |
| `POST` | `/jobs` | `A` `H` | Create a job posting |
| `PUT` | `/jobs/:id` | `A` `H` | Update job details or status |
| `DELETE` | `/jobs/:id` | `A` `H` | Delete a job posting |

---

### Resumes

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/resumes` | `C` | Upload a PDF resume (`multipart/form-data`, max 500 KB) |
| `GET` | `/resumes` | `C` | List own resumes |
| `DELETE` | `/resumes/:id` | `C` | Delete a resume |

---

### Applications

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/applications/analyze` | `C` | Run AI fit analysis for a job + resume pair |
| `POST` | `/applications/submit` | `C` | Submit application with AI analysis |
| `GET` | `/applications/my-applications` | `C` | Get own application history |
| `GET` | `/applications/job/:jobId` | `A` `H` | Get all applicants for a job |
| `GET` | `/applications/user/:userId` | `A` `H` | Get all applications for a specific user |
| `DELETE` | `/applications/:id/revoke` | `C` | Revoke/withdraw an application |
| `PUT` | `/applications/:id/status` | `A` `H` | Update application status |

**Status pipeline:**
```
applied → shortlisted → interview → selected → rejected → offer_sent
```
> Setting status to `selected` or `hired` automatically closes the associated job.

---

### Quizzes / Aptitude Tests

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/quizzes/job/:jobId` | `A` `H` | Get quiz and questions for a job |
| `POST` | `/quizzes/job/:jobId` | `A` `H` | Create or update quiz + questions |
| `POST` | `/quizzes/job/:jobId/publish` | `A` `H` | Publish results; auto-reject non-passing candidates |
| `DELETE` | `/quizzes/:quizId` | `A` `H` | Delete a quiz |
| `GET` | `/quizzes/application/:applicationId/test-info` | `C` | Get test availability for an application |
| `POST` | `/quizzes/application/:applicationId/start` | `C` | Start the test |
| `POST` | `/quizzes/application/:applicationId/submit` | `C` | Submit answers; triggers auto-grading |

---

### Interviews

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/interviews/schedule` | `A` `H` | Schedule or update an interview |
| `GET` | `/interviews/job/:jobId` | `A` `H` | Get all interviews for a job |
| `GET` | `/interviews/application/:applicationId` | `*` | Get interview details for an application |

**Schedule payload:**
```json
{
  "jobId": 1,
  "applicationId": 42,
  "candidateId": 7,
  "scheduledDate": "2025-06-15",
  "scheduledTime": "10:30",
  "notes": "Google Meet link or joining instructions"
}
```

---

### Users

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/users` | `A` `H` | List all users with `is_hired` flag |
| `GET` | `/users/:id/profile` | `*` | Get a user's profile |
| `PUT` | `/users/profile` | `C` | Update own profile |
| `PUT` | `/users/reset-password` | `*` | Change own password |
| `POST` | `/users` | `A` `H` | Admin-create a user (HR accounts) |
| `PATCH` | `/users/:id/toggle-status` | `A` | Toggle user `is_active` |

---

### Dashboard

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/dashboard/admin` | `A` `H` | Jobs, applications, users stats + recent activity |
| `GET` | `/dashboard/candidate` | `C` | Application counts by status |

---

### Notifications

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/notifications` | `*` | Get all notifications for current user |
| `PUT` | `/notifications/:id/read` | `*` | Mark a notification as read |

---

## Database Schema

> All primary keys are `SERIAL` (auto-incremented integers).

<details>
<summary><strong>users</strong></summary>

```sql
CREATE TABLE users (
  id                  SERIAL PRIMARY KEY,
  email               VARCHAR UNIQUE NOT NULL,
  password_hash       VARCHAR NOT NULL,
  full_name           VARCHAR NOT NULL,
  role                VARCHAR NOT NULL DEFAULT 'candidate'
                        CHECK (role IN ('candidate', 'hr', 'admin')),
  phone               VARCHAR,
  profile_picture_url VARCHAR,
  bio                 TEXT,
  skills              JSONB,
  experience_years    INTEGER,
  current_company     VARCHAR,
  linkedin_profile    VARCHAR,
  is_active           BOOLEAN DEFAULT TRUE,
  is_deleted          BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMPTZ
);
```
</details>

<details>
<summary><strong>jobs</strong></summary>

```sql
CREATE TABLE jobs (
  id                   SERIAL PRIMARY KEY,
  title                VARCHAR NOT NULL,
  description          TEXT NOT NULL,
  requirements         JSONB,
  salary_min           INTEGER,
  salary_max           INTEGER,
  salary_range         VARCHAR,
  location             VARCHAR,
  job_type             VARCHAR,
  status               VARCHAR DEFAULT 'draft'
                         CHECK (status IN ('draft', 'active', 'closed')),
  is_published         BOOLEAN DEFAULT FALSE,
  is_active            BOOLEAN DEFAULT TRUE,
  application_deadline DATE,
  created_by           INTEGER REFERENCES users(id),
  created_at           TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMPTZ
);
```
</details>

<details>
<summary><strong>resumes</strong></summary>

```sql
CREATE TABLE resumes (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id),
  file_name   VARCHAR NOT NULL,
  file_path   VARCHAR NOT NULL,
  parsed_text TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```
</details>

<details>
<summary><strong>applications</strong></summary>

```sql
CREATE TABLE applications (
  id                     SERIAL PRIMARY KEY,
  user_id                INTEGER NOT NULL REFERENCES users(id),
  job_id                 INTEGER NOT NULL REFERENCES jobs(id),
  resume_id              INTEGER REFERENCES resumes(id),
  status                 VARCHAR DEFAULT 'applied'
                           CHECK (status IN (
                             'applied', 'shortlisted', 'interview',
                             'selected', 'rejected', 'offer_sent'
                           )),
  ai_match_score         NUMERIC,
  ai_match_details       JSONB,       -- { strengths[], weaknesses[], reasoning }
  is_suspicious          BOOLEAN DEFAULT FALSE,
  ai_screening_timestamp TIMESTAMPTZ,
  applied_at             TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at             TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```
</details>

<details>
<summary><strong>mcq_quizzes · mcq_questions · mcq_results</strong></summary>

```sql
CREATE TABLE mcq_quizzes (
  id                   SERIAL PRIMARY KEY,
  job_id               INTEGER NOT NULL REFERENCES jobs(id),
  title                VARCHAR NOT NULL,
  description          TEXT,
  duration_minutes     INTEGER NOT NULL DEFAULT 30,
  passing_score        INTEGER DEFAULT 50,
  scheduled_start_time TIMESTAMPTZ,
  scheduled_end_time   TIMESTAMPTZ,
  results_published    BOOLEAN DEFAULT FALSE,
  created_at           TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mcq_questions (
  id                   SERIAL PRIMARY KEY,
  quiz_id              INTEGER NOT NULL REFERENCES mcq_quizzes(id),
  question_text        TEXT NOT NULL,
  options              JSONB NOT NULL,   -- ["Option A", "Option B", "Option C", "Option D"]
  correct_option_index INTEGER NOT NULL,
  created_at           TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mcq_results (
  id             SERIAL PRIMARY KEY,
  quiz_id        INTEGER NOT NULL REFERENCES mcq_quizzes(id),
  application_id INTEGER NOT NULL REFERENCES applications(id),
  score          INTEGER NOT NULL,
  passed         BOOLEAN NOT NULL,
  started_at     TIMESTAMPTZ,
  completed_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (quiz_id, application_id)
);
```
</details>

<details>
<summary><strong>interview_slots · notifications</strong></summary>

```sql
CREATE TABLE interview_slots (
  id              SERIAL PRIMARY KEY,
  job_id          INTEGER NOT NULL REFERENCES jobs(id),
  application_id  INTEGER NOT NULL REFERENCES applications(id),
  interviewer_id  INTEGER REFERENCES users(id),
  scheduled_date  DATE NOT NULL,
  scheduled_time  TIME NOT NULL,
  status          VARCHAR DEFAULT 'scheduled'
                    CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  title      VARCHAR NOT NULL,
  message    TEXT NOT NULL,
  type       VARCHAR DEFAULT 'info'
               CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```
</details>

---

## Frontend Routes

| Path | Role | Page | Description |
|---|---|---|---|
| `/` | Public | `Home` | Landing page with live analog clock |
| `/login` | Public | `Login` | Authentication |
| `/register` | Public | `Register` | Candidate self-registration |
| `/admin/dashboard` | A · H | `AdminDashboard` | KPI stats, pipeline ribbon, activity feed |
| `/admin/jobs` | A · H | `JobListings` | Job table with full actions dropdown |
| `/admin/users` | A · H | `ManageUsers` | User list with modals |
| `/candidate/dashboard` | C | `CandidateDashboard` | Application stats + recent activity |
| `/candidate/openings` | C | `ViewOpenings` | Job board with search, filter, pagination |
| `/candidate/applications` | C | `MyApplications` | History + test status cards |
| `/candidate/profile` | C | `CandidateProfile` | Profile editor + resume manager |
| `/candidate/test/:applicationId` | C | `CandidateAptitudeTest` | Timed MCQ test interface |
| `*` | Any | `NotFound` | Branded 404 |

---

## Key Flow Walkthroughs

### AI Pre-Screening

```
Candidate selects resume → clicks "Analyze Fit"
  └── POST /api/applications/analyze
        ├── Fetches job description, resume text, candidate profile
        ├── Builds structured Gemini prompt
        ├── Tries model chain:
        │     gemini-2.5-flash-lite → gemini-2.0-flash → gemini-1.5-flash → ...
        └── Returns: { ai_match_score, ai_match_details, is_suspicious }

Score + strengths/weaknesses shown to candidate
  └── Candidate clicks "Submit Application"
        └── POST /api/applications/submit (with full analysis payload)
              ├── Application saved with AI metadata
              ├── Confirmation email sent to candidate
              └── In-app notification created
```

### Aptitude Test Flow

```
HR creates quiz: questions + scheduled window
  └── Candidates enter the test window → "Start Test" unlocked

POST /api/quizzes/application/:id/start
  └── Creates mcq_results row (score=0, started_at=now)

Candidate answers within timer → auto-submits on timeout
  └── POST /api/quizzes/application/:id/submit
        ├── Server grades answers vs. correct_option_index
        └── Updates: score, passed, completed_at

After scheduled_end_time → HR clicks "Publish Results"
  └── POST /api/quizzes/job/:jobId/publish
        ├── Shortlisted candidates with no passing result → status = 'rejected', score = 0
        └── mcq_quizzes.results_published = TRUE
```

### Session Expiry Flow

```
JWT expires (10-hour window)
  └── Next API call → 401 Unauthorized
        └── Axios interceptor in api.js catches it
              ├── Clears sessionStorage + localStorage
              ├── Sets sessionExpired = "true" in sessionStorage
              └── window.location.href = '/'  (full state reset)

App.jsx mounts on '/'
  └── useEffect detects sessionExpired flag
        ├── Clears the flag
        └── Shows toast: "Your session expired. Please log in again."
```

---

<div align="center">

Built with care by [Rahil Maiyani](https://github.com/RahilMaiyani)

</div>