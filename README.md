<div align="center">

# 🚀 JobPulse — Job Drive System

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

[Quick Start](#-quick-start) · [Features](#-features) · [API Reference](#-api-reference) · [Schema](#-database-schema) · [Architecture Flows](#-architecture-flows)

---

</div>

## 📖 Overview

**JobPulse** is a full-stack internal recruitment platform built for organizations that want to manage the entire employee hiring lifecycle in one place. It covers job posting, AI-powered pre-screening, intelligent bulk shortlisting, aptitude testing, interview scheduling, and candidate status management — all with role-based access control and a highly polished, responsive UI.

### ✨ At a Glance

| | |
|---|---|
| 🔐 **Roles** | `admin` · `hr` · `candidate` — each with tailored dashboards and permissions |
| 🧠 **AI Pre-Screening** | Gemini AI scores resume fit, surfaces strengths/weaknesses, and flags fraud |
| ⚡ **Bulk Shortlist** | Target a specific quota and let AI auto-shortlist the top candidates from the pool |
| 📝 **Aptitude Testing** | Timed MCQ tests with auto-grading, scheduling windows, and result publishing |
| 📅 **Interview Scheduling**| Email invites with custom date, time, and notes sent directly to candidates |
| 🔔 **Smart Badges** | Real-time dock notifications indicating new unapplied active jobs and unread alerts |
| 🎨 **UI Polish** | 0ms optimistic cache updates, skeleton loaders, full dark mode, and toast alerts |

---

## 🎯 Features

<details open>
<summary><strong>🤖 AI-Powered Pre-Screening & Bulk Shortlisting</strong></summary>

- **Candidate Pre-Check**: Candidates select a resume from their vault (up to 5 allowed) and click **Analyze Fit**.
- **Gemini Evaluation**: The backend calls Google Gemini with the job description and parsed PDF text.
- **Deep Insights**: Returns a Match Score (0–100), key Strengths, Weaknesses, detailed reasoning, and even flags Identity Fraud.
- **Bulk Target Shortlisting**: Admins can set a **Target Total** of candidates. The system automatically selects the highest AI-ranked candidates from the "Applied" pool to hit that exact quota, shortlists them, and gracefully rejects the rest in one click.
</details>

<details>
<summary><strong>📝 Aptitude Testing (MCQ Engine)</strong></summary>

- Admins/HR create multi-question tests per job: title, description, duration, passing score, and a strict active window.
- Candidates can only access and take tests within the scheduled timeframe.
- Live countdown timer; test automatically submits upon timeout.
- Instant auto-grading on submission.
- **Publish Results Atomically**: Clicking publish automatically rejects all candidates who failed to meet the passing score or who skipped the test.
</details>

<details>
<summary><strong>💼 Job & Candidate Management</strong></summary>

- Post rich job listings with salaries, types, and deadlines.
- Contextual badges identify where jobs are in the pipeline (`Ready to Schedule` / `Quiz Set` / `Quiz Finished`).
- **Interactive Dock**: Candidates have a smart dock badge calculating exactly how many active jobs they *haven't* applied to yet.
- Visual **Hired** inline badges for candidates who have successfully passed the pipeline.
- Full application history and detailed candidate profile views.
</details>

<details>
<summary><strong>📅 Interview Scheduling & Notifications</strong></summary>

- Schedule interviews for candidates in the `interview` status phase.
- Assign dates, times, and specific interviewer notes/links.
- **Automated Emails**: Invites are generated and dispatched via Gmail SMTP.
- In-app notification bell with unread counters to track status changes and alerts.
</details>

<details>
<summary><strong>🔒 Security & Session Management</strong></summary>

- JWT-based authentication with strict 10-hour expiry policies.
- Role-based routing enforced on both frontend and API layers.
- Hard redirects with toast alerts intercepting `401` errors upon token expiration.
- Soft-delete strategies for candidate accounts and user access toggles.
</details>

---

## 🛠 Tech Stack

### Frontend
| Technology | Description |
|---|---|
| **React 19 & Vite** | Lightning fast UI rendering and build tooling |
| **Tailwind CSS 4** | Beautiful utility-first styling and Dark Mode support |
| **TanStack Query v5** | Server state caching and **0ms Optimistic UI updates** |
| **Lucide React** | Consistent, modern iconography |

### Backend
| Technology | Description |
|---|---|
| **Node.js & Express** | Robust API framework |
| **PostgreSQL (pg)** | Relational database with complex aggregation subqueries |
| **@google/genai** | Direct integration with Gemini models for AI analysis |
| **Nodemailer** | SMTP integration for real-world candidate emails |
| **pdf-parse** | Buffer-level PDF text extraction for resumes |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+
- **PostgreSQL** v14+
- **Gmail account** with an [App Password](https://support.google.com/accounts/answer/185833) enabled
- **Google AI Studio API Key** ([Get one free](https://aistudio.google.com/))

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
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Database Setup
Create your PostgreSQL database and run the schema setup. Ensure you create the following core tables:
`users`, `jobs`, `resumes`, `applications`, `mcq_quizzes`, `mcq_questions`, `mcq_results`, `interview_slots`, `notifications`.

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
    API->>AI: Send Job Description + Parsed PDF Text
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

### MCQ Aptitude Test Flow
```mermaid
stateDiagram-v2
    [*] --> Scheduled: HR Creates Test Window
    Scheduled --> Active: Time Window Opens
    Active --> Testing: Candidate Starts Test
    Testing --> Graded: Timer expires or Auto-Submit
    Graded --> Active: Results saved to DB
    Active --> Closed: Time Window Closes
    Closed --> Published: HR Publishes Results
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
- `PATCH /users/:id/toggle-status` — Soft delete / deactivate user

### Jobs & Applications
- `GET /jobs` — List jobs (Admins see all; Candidates see `active`)
- `POST /jobs` — Create a new job listing
- `POST /applications/analyze` — Run Gemini AI fit analysis
- `POST /applications/submit` — Submit application with AI payload
- `PUT /applications/:id/status` — Change pipeline phase (`applied` → `shortlisted` → `interview` → `selected`)

### Quizzes & Interviews
- `POST /quizzes/job/:jobId` — Save MCQ quiz and questions
- `POST /quizzes/application/:applicationId/submit` — Submit candidate answers for auto-grading
- `POST /quizzes/job/:jobId/publish` — Publish quiz results and execute bulk rejection
- `POST /interviews/schedule` — Dispatch interview email invites and save schedule

---

<div align="center">
  <p>Built for the future of recruiting. <br/> Feel free to open an issue or contribute to the repository.</p>
</div>