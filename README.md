<div align="center">

# JobPulse — Job Drive System

### A Production-Grade Internal Hiring Portal & Recruitment Pipeline

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Supabase](https://img.shields.io/badge/Supabase-Storage-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-Powered-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![License](https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge)](LICENSE)

<br/>

**An end-to-end internal hiring system — from job posting to AI-screened applications to proctored aptitude testing to interview scheduling —  
powered by Gemini AI and real-time candidate tracking.**

[Quick Start](#-quick-start) · [Features](#-features) · [API Reference](#-api-reference) · [Schema](#-database-schema) · [Architecture Flows](#-architecture-flows)

---

</div>

## 📖 Overview

**JobPulse** is a full-stack internal recruitment platform built for organizations that want to manage the entire employee hiring lifecycle in one place. It covers job posting, AI-powered pre-screening, intelligent bulk shortlisting, proctored aptitude testing with live webcam monitoring, interview scheduling, and candidate status management — all with role-based access control and a highly polished, responsive UI.

### ✨ At a Glance

| | |
|---|---|
| 🔐 **Roles** | `admin` · `hr` · `candidate` — each with tailored dashboards and permissions |
| 🧠 **AI Pre-Screening** | Gemini AI scores resume fit, surfaces strengths/weaknesses, and flags fraud |
| ⚡ **Bulk Shortlist** | Target a specific quota and let AI auto-shortlist the top candidates from the pool |
| 📝 **Proctored Testing** | Timed MCQ tests with live webcam monitoring, anti-cheat detection, and auto-submission |
| 🎥 **Anti-Cheat Engine** | Tab-switch, mouse-exit, copy detection — 3-strike system with snapshot evidence |
| 📅 **Interview Scheduling**| Email invites with custom date, time, and notes sent directly to candidates |
| 🔔 **Smart Badges** | Real-time dock notifications indicating new unapplied active jobs and unread alerts |
| 🎨 **UI Polish** | 0ms optimistic cache updates, skeleton loaders, full dark mode, and toast alerts |

---

## 🎯 Features

<details open>
<summary><strong>🤖 AI-Powered Pre-Screening & Bulk Shortlisting</strong></summary>

- **Candidate Pre-Check**: Candidates select a resume from their vault (up to 5 allowed, PDF & DOCX) and click **Analyze Fit**.
- **Gemini Evaluation**: The backend calls Google Gemini with the job description and parsed resume text.
- **Deep Insights**: Returns a Match Score (0–100), key Strengths, Weaknesses, detailed reasoning, and even flags Identity Fraud.
- **Bulk Target Shortlisting**: Admins can set a **Target Total** of candidates. The system automatically selects the highest AI-ranked candidates from the "Applied" pool to hit that exact quota, shortlists them, and gracefully rejects the rest in one click.
- **Candidate Comparison**: Admins can open a side-by-side comparison modal to directly compare AI scores, strengths, and weaknesses across multiple applicants.
</details>

<details>
<summary><strong>📝 Proctored Aptitude Testing (MCQ Engine)</strong></summary>

- Admins/HR create multi-question tests per job: title, description, duration, passing score, and a strict active window.
- **CSV Bulk Import**: Upload questions in bulk via a `.csv` file (`Question, Opt1, Opt2, Opt3, Opt4, CorrectIndex`).
- Candidates can only access and take tests within the scheduled timeframe.
- Live countdown timer; test automatically submits upon timeout.
- Instant auto-grading on submission.
- **Publish Results Atomically**: Clicking publish automatically rejects all candidates who failed to meet the passing score or who skipped the test.

**Proctoring & Anti-Cheat System:**
- Requires camera access before the test begins — with clear error messages if denied.
- Live webcam feed is embedded in the sticky test header throughout the session.
- Detects **tab switches**, **mouse leaving the window**, and **copy attempts**.
- **Grace period**: A 5-second timer runs before logging a violation, allowing accidental mouse slips without penalty.
- A canvas buffer draws a fresh frame every 500ms; the frame is pre-captured *before* the tab switches to guarantee a non-black screenshot.
- Each violation uploads a JPEG snapshot to Supabase Storage and logs the event to the database.
- **3-strike rule**: The test is force-submitted and terminated after 3 confirmed violations.
- Camera hardware is fully released on test submission or component unmount.
</details>

<details>
<summary><strong>💼 Job & Candidate Management</strong></summary>

- Post rich job listings with salaries, types, and deadlines.
- Contextual badges identify where jobs are in the pipeline (`Ready to Schedule` / `Quiz Set` / `Quiz Finished`).
- **Interactive Dock**: Candidates have a smart dock badge calculating exactly how many active jobs they *haven't* applied to yet.
- Candidates can revoke their own application at any time before shortlisting.
- Visual **Hired** inline badges for candidates who have successfully passed the pipeline.
- Full application history and detailed candidate profile views.
</details>

<details>
<summary><strong>📅 Interview Scheduling & Notifications</strong></summary>

- Schedule interviews for candidates in the `interview` status phase.
- Assign dates, times, round names, meeting links, and specific interviewer notes.
- **Automated Emails**: Invites are generated and dispatched via Gmail SMTP.
- In-app notification bell with unread counters to track status changes and alerts.
</details>

<details>
<summary><strong>📬 Support Inbox (Contact Us)</strong></summary>

- Candidates can send support messages to HR/Admins directly from their dashboard.
- Admins see a full inbox with unread counts, read/archive controls, and message history.
- Messages are linked to the sending user's account for full context.
</details>

<details>
<summary><strong>🔒 Security & Session Management</strong></summary>

- JWT-based authentication with strict 10-hour expiry policies.
- Role-based routing enforced on both frontend and API layers.
- Hard redirects with toast alerts intercepting `401` errors upon token expiration.
- **Rate Limiting**: All `/api` routes are protected with `express-rate-limit` (150 req / 15 min).
- Soft-delete strategies for candidate accounts and user access toggles.
- **Idle Screensaver**: An animated lock overlay appears when an admin session is idle, requiring interaction to resume.
- CORS dynamically allows all `*.vercel.app` origins and private LAN IP ranges for local network testing.
</details>

---

## 🛠 Tech Stack

### Frontend
| Technology | Description |
|---|---|
| **React 19 & Vite** | Lightning fast UI rendering and build tooling |
| **Tailwind CSS 4** | Beautiful utility-first styling and Dark Mode support |
| **TanStack Query v5** | Server state caching and **0ms Optimistic UI updates** |
| **React Hook Form + Zod** | Performant, schema-validated form handling |
| **PapaParse** | Client-side CSV parsing for bulk question import |
| **Lucide React** | Consistent, modern iconography |

### Backend
| Technology | Description |
|---|---|
| **Node.js & Express 5** | Robust API framework |
| **PostgreSQL (pg)** | Relational database with complex aggregation subqueries |
| **Supabase Storage** | Cloud storage for resume files and proctoring snapshots |
| **@google/genai** | Direct integration with Gemini models for AI analysis |
| **Nodemailer** | SMTP integration for real-world candidate emails |
| **pdf-parse & mammoth** | Buffer-level PDF and DOCX text extraction for resumes |
| **express-rate-limit** | API-level rate limiting for abuse prevention |
| **Joi** | Backend request schema validation |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+
- **PostgreSQL** v14+
- **Gmail account** with an [App Password](https://support.google.com/accounts/answer/185833) enabled
- **Google AI Studio API Key** ([Get one free](https://aistudio.google.com/))
- **Supabase project** with two storage buckets: `resumes` and `proctoring-snapshots` ([supabase.com](https://supabase.com))

### 1. Clone & Install
```bash
git clone https://github.com/RahilMaiyani/Job-Drive-System.git
cd Job-Drive-System

# Install Backend
cd backend && npm install

# Install Frontend
cd ../frontend && npm install
```

### 2. Configure Environment
Create `.env` files in both directories.

**`backend/.env`**
```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/job_drive
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your_gmail_app_password
GEMINI_API_KEY=your_google_ai_studio_api_key
CLIENT_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Database Setup
Create your PostgreSQL database and run `backend/schema.sql` to create all tables:
`users`, `jobs`, `resumes`, `applications`, `mcq_quizzes`, `mcq_questions`, `mcq_results`, `interview_slots`, `notifications`, `contact_messages`, `proctoring_events`.

### 4. Run Servers
```bash
# Terminal 1 — Backend (http://localhost:5000)
cd backend && npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend && npm run dev
```

---

## 🏗 Architecture Flows

Here are visual representations of the core logic pipelines running inside JobPulse.

### AI Pre-Screening Pipeline
```mermaid
sequenceDiagram
    participant C as Candidate
    participant API as Backend API
    participant AI as Gemini AI
    
    C->>API: Select Resume & Click "Analyze Fit"
    API->>AI: Send Job Description + Parsed PDF/DOCX Text
    AI-->>API: Return JSON { Score, Strengths, Weaknesses, FraudFlag }
    API-->>C: Display analysis to user
    C->>API: "Submit Application"
    API->>API: Save Application + AI Metadata to DB
    API-->>C: Trigger Toast & Send Email Confirmation
```

### Bulk Auto-Shortlist Engine
```mermaid
flowchart TD
    A[HR Admin Views Applicants] --> B{Set Target Quota N}
    B --> C[Fetch 'Applied' Candidates]
    C --> D[Sort Descending by AI Match Score]
    D --> E[Select Top Candidates to reach Quota N]
    E --> F[Update status to 'shortlisted']
    D --> G[Select Remaining Candidates]
    G --> H[Update status to 'rejected']
    F --> I[Optimistic UI Cache Update 0ms]
    H --> I
    I --> J[Background API sync]
```

### Proctored MCQ Test Flow
```mermaid
stateDiagram-v2
    [*] --> CameraGate: Candidate Opens Test
    CameraGate --> Testing: Camera Allowed & Test Started
    CameraGate --> [*]: Candidate Cancels

    Testing --> Warning: Tab Switch / Mouse Exit / Copy
    Warning --> Testing: Returns within 5s grace period
    Warning --> Strike: Grace period expires
    Strike --> Testing: Strike 1 or 2 logged + snapshot uploaded
    Strike --> ForceSubmit: Strike 3 reached

    Testing --> Graded: Timer expires or Manual Submit
    ForceSubmit --> Graded: Auto-submitted

    Graded --> Active: Results saved to DB
    Active --> Published: HR Publishes Results

    Published --> [*]

    note right of Published
      Candidates below passing score
      are automatically rejected.
    end note
```

---

## 📡 API Reference

All endpoints are prefixed with `/api`. Authentication uses `Authorization: Bearer <token>`.

### Authentication & Users
- `POST /auth/register` — Register a candidate
- `POST /auth/login` — Sign in and receive JWT
- `GET /auth/me` — Authenticate current session
- `GET /users` — List all users (Admins/HR)
- `GET /users/:id/profile` — View a user's full profile
- `POST /users` — Admin creates a new HR/Admin account
- `PATCH /users/:id/toggle-status` — Soft delete / deactivate user
- `DELETE /users/:id` — Permanently delete a user (Admin only)
- `PUT /users/profile` — Candidate updates own profile
- `PUT /users/reset-password` — Candidate resets own password

### Jobs & Applications
- `GET /jobs` — List jobs (Admins see all; Candidates see `active`)
- `POST /jobs` — Create a new job listing
- `POST /applications/analyze` — Run Gemini AI fit analysis
- `POST /applications/submit` — Submit application with AI payload
- `GET /applications/my-applications` — Candidate fetches own applications
- `DELETE /applications/:id/revoke` — Candidate withdraws an application
- `PUT /applications/:id/status` — Change pipeline phase (`applied` → `shortlisted` → `interview` → `selected`)
- `PUT /applications/job/:jobId/bulk-status` — Bulk auto-shortlist by AI score quota

### Resumes
- `POST /resumes` — Upload a PDF or DOCX resume (500KB limit, max 5 per user)
- `GET /resumes` — List candidate's own resumes
- `DELETE /resumes/:id` — Delete a resume (also removes from Supabase Storage)

### Quizzes & Interviews
- `GET /quizzes/job/:jobId` — Fetch quiz and questions for a job (Admin/HR)
- `POST /quizzes/job/:jobId` — Create or update MCQ quiz and questions
- `DELETE /quizzes/:quizId` — Delete a quiz
- `POST /quizzes/job/:jobId/publish` — Publish quiz results and execute bulk rejection
- `GET /quizzes/application/:applicationId/test-info` — Candidate checks test eligibility
- `POST /quizzes/application/:applicationId/start` — Candidate starts the test (returns questions without correct answers)
- `POST /quizzes/application/:applicationId/submit` — Submit candidate answers for auto-grading
- `POST /interviews/schedule` — Dispatch interview email invites and save schedule

### Proctoring
- `POST /proctoring/events/application/:applicationId` — Upload a violation event (snapshot + event type) to DB and Supabase Storage

### Notifications & Contact
- `GET /notifications` — Fetch user's notifications
- `PUT /notifications/:id/read` — Mark a single notification as read
- `PUT /notifications/read-all` — Mark all notifications as read
- `POST /contact` — Candidate sends a support message
- `GET /contact` — Admin/HR fetches all messages
- `GET /contact/unread-count` — Admin/HR gets unread message badge count
- `PUT /contact/:id/read` — Mark a message as read
- `PUT /contact/:id/archive` — Archive a message

---

## 🗄 Database Schema

Core tables managed by `backend/schema.sql`:

| Table | Purpose |
|---|---|
| `users` | All accounts (candidates, HR, admin) with profile fields and soft-delete |
| `jobs` | Job listings with status, deadlines, and salary data |
| `resumes` | Resume metadata + Supabase Storage URL + parsed text |
| `applications` | Application records with AI score, match details, fraud flag, and pipeline status |
| `mcq_quizzes` | Quiz configuration per job (window, duration, passing score) |
| `mcq_questions` | Individual questions with options stored as JSONB |
| `mcq_results` | Candidate scores, pass/fail, and timestamps |
| `interview_slots` | Scheduled interviews with meeting details and status |
| `notifications` | In-app alerts per user |
| `contact_messages` | Candidate support messages with read/archive state |
| `proctoring_events` | Violation logs with event type, Supabase snapshot URL, and FK to user/application/quiz |

---

<div align="center">
  <p>Built for the future of recruiting. <br/> Feel free to open an issue or contribute to the repository.</p>
</div>