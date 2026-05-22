# OfficeLink — HR Management System

A full-stack Human Resource Management System built with the **MERN stack**, designed to handle real-world organizational workflows. OfficeLink provides a complete solution for HR operations including employee management, attendance tracking, leave management with balance tracking, document storage, payroll processing, internal support ticketing, and company-wide announcements.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Data Models](#data-models)
- [Routes & Navigation](#routes--navigation)

---

## Overview

OfficeLink goes beyond basic CRUD operations. It's built with role-based access control, workflow-driven features, comprehensive business logic validation, cloud-based file storage, and production-level UX patterns. The system simulates a real internal company tool with automated payroll processing, leave balance tracking, approval workflows, ghost-session resolution, department-targeted announcements, document management, and internal support ticketing.

**Key Highlights:**
- Role-based access (Admin & Employee)
- Automated monthly payroll engine with encrypted bank details
- Password-protected PDF payslips generated in memory and delivered via email
- Leave balance system with automatic deduction on approval
- Cloudinary integration for scalable file storage
- Company-wide announcement broadcasting with email delivery
- Thread-based support ticket system
- Ghost attendance session detection and bulk-fix tools
- Advanced leave validation logic including an Unpaid leave type
- Professional skeleton loaders for better UX
- Email notifications for all major workflow events
- Real-time badge notifications

---

## Features

### Authentication & Authorization
- JWT-based secure login system
- Role-based routing on both frontend and backend
- Protected routes with automatic permission validation
- Two roles: **Admin** (full system access) and **Employee** (personal operations)
- Dynamic page titles via the `useTitle` hook

### User Management
- Create, update, and delete employee profiles (Admin only)
- Assign roles and departments
- Cloudinary-hosted profile pictures with automatic optimization
- Admin can view detailed employee profiles via `UserDetailsModal`
- Employees can view and edit their own profile via `EmployeeProfileModal`
- Per-employee payroll configuration (salary structure and encrypted bank details) managed by Admin through `PayrollSetupModal`
- `leaveBalance` and `salaryDetails` fields embedded directly on the User model

### Attendance System
- Employees can check-in and check-out with automatic timestamp logging
- Daily attendance tracking with status indicators
- Admin dashboard showing today's attendance activity
- Employee personal attendance history via the `/me` endpoint
- Attendance trends visualization (last 7 days)
- Filter attendance records by date range or employee via the `/filters` endpoint
- **Ghost Session Detection:** Admin dashboard automatically surfaces past sessions where an employee checked in but never checked out
- **Bulk Fix:** Admin can resolve all ghost sessions at once or fix them individually via `/bulk-fix` and `/fix/:id`
- **Tomorrow's Away List:** Admin dashboard previews employees on approved leave the following day

### Leave Management System
- Employees apply for **Sick**, **Casual**, **Earned**, or **Unpaid** leave
- Leave balance cards displayed on the employee dashboard with per-type icons
- Advanced validation rules:
  - Prevent applications for past dates
  - Exclude weekends (Saturday and Sunday) from leave duration calculation
  - Maximum 2-week range per request
  - Prevent overlapping leave requests for the same employee
  - Balance check enforced at approval time — insufficient days block the action
- Leave balance automatically deducted when Admin approves; restored on rejection
- Admin approval workflow with optional comments
- Leave history with status tracking (Pending, Approved, Rejected)
- `LeaveDetailsModal` for employees to review admin feedback on individual requests
- Paginated leave table (8 records per page)
- Leave analytics dashboard with trend charts
- Pending leave count badge in sidebar, polled every 10 seconds for Admins

### Payroll System
- Admin configures per-employee salary structure (Basic Pay and Special Allowance) and encrypted bank details through `PayrollSetupModal`
- Bank account numbers are stored encrypted in the database using AES-256-CBC and are never exposed in API responses
- **Smart Trigger Banner:** The Admin dashboard automatically detects when the previous month's payroll has not been processed and surfaces a contextual action banner with a single Run Payroll button
- One-click monthly payroll generation calculates net pay for every configured employee:
  - Gross = Basic Pay + Special Allowance
  - Loss of Pay deduction calculated from approved Unpaid leaves falling within the pay period, at the employee's daily rate
  - Fixed Professional Tax deduction of ₹200
  - Net Pay = Gross − Loss of Pay − Professional Tax
- Payroll records are idempotent — the engine refuses to run twice for the same month
- On generation, a **password-protected PDF payslip** is created in memory using PDFKit and emailed directly to each employee
  - PDF password format: first 4 characters of the employee's name (lowercase, spaces stripped) + last 4 digits of their account number
  - The PDF is never written to disk; it is generated and streamed entirely in memory
- Employees receive a security notice email explaining the password format alongside the attached payslip
- Admin receives a **Payroll Execution Summary** email after each run showing employees processed and any delivery failures
- Failure to generate or deliver a PDF for one employee does not interrupt the payroll run for the rest of the company
- Employees view all payslips on the **My Financials** page with month and year filters and pagination
- A **privacy toggle** hides net pay amounts by default on payslip cards, revealing them on demand
- Employees can preview a full earnings and deductions breakdown in a modal or download a fresh password-protected PDF from the server
- Only the payslip owner or an Admin can trigger a PDF download

### Announcement System
- Admins publish company-wide or department-targeted announcements
- Four announcement types: **General**, **Urgent**, **Event**, and **Milestone** — each with a distinct email accent color (Indigo, Rose, Emerald, Amber)
- Optional expiry date; expired announcements are automatically hidden from employees
- Announcements can be archived by Admin at any time via `ArchiveModal`
- On creation, emails are automatically broadcast to all targeted employees — or all staff when no department filter is set
- Employees see an **Announcement Feed** on their dashboard showing only active, non-expired entries
- Admins see the full list including archived announcements

### Document Management System
- Employees upload and manage important documents
- Supported file types: PDF, PNG, JPG, JPEG, GIF, DOC, DOCX, TXT
- Document categories: Contract, ID Proof, Certification, Other
- Cloudinary-powered storage with secure URLs
- Automatic file deletion on Cloudinary when a document record is removed
- File metadata tracked: size, type, upload date
- Admin can view and manage all employee documents via `AdminDocumentViewer`
- Document preview modal with file-type detection
- Card and list view modes for the Document Vault

### Support Ticket System
- Employees create support tickets for any issue
- 5 Categories: IT Support, HR Inquiry, Payroll, Facilities, General
- 4 Priority Levels: Low, Medium, High, Urgent
- 4 Status States: Open, In-Progress, Resolved, Closed
- Thread-based reply system — both Admin and Employee can add replies
- Admin updates ticket status as work progresses
- Employees can close their own resolved tickets via `CloseTicketModal`
- `ConfirmModal` guards destructive or irreversible ticket actions
- Active ticket count badge in sidebar

### Data Visualization
- Attendance trends chart (last 7 days) — `AttendanceChart`
- Leave analytics dashboard:
  - Status distribution (Approved vs Rejected vs Pending) — `LeaveStatusChart`
  - Leave trends over time by type — `LeaveTrendChart`
- Built with Chart.js via `react-chartjs-2` for smooth, responsive charts

### Email Notifications
- Leave approval and rejection emails (with admin comment on rejection)
- Announcement broadcast emails sent to targeted employees on creation
- Monthly payslip emails with password-protected PDF attachment
- Payroll execution summary email sent to Admin after each run
- Styled HTML email templates via `buildEmailTemplate`
- Powered by Nodemailer with Gmail SMTP
- Manual email trigger available via `EmailModal` on the Admin dashboard

### User Experience
- Offline detection banner with animated indicator
- Toast notifications for all actions (success, error, info) via `react-hot-toast`
- Professional skeleton loaders for all data tables and dashboards
- `EmptyState` component for tables and pages with no data
- `DecisionModal` and `ConfirmModal` for safe approval and destructive actions
- Global page loader with Suspense boundary
- 404 Not Found page
- `HoverItem` tooltip component for contextual hints
- `DashboardLayout` wrapper shared across all authenticated pages
- API rate limiting (200 req/15 min general; 15 req/30 min for auth routes)

---

## Tech Stack

### Frontend

| Package | Version | Purpose |
|---|---|---|
| React | ^19.2.5 | UI library |
| Vite | ^8.0.9 | Build tool & dev server |
| Tailwind CSS | ^4.2.4 | Utility-first styling |
| React Router DOM | ^7.14.2 | Client-side routing |
| TanStack Query | ^5.99.2 | Server state management & caching |
| React Hook Form | ^7.73.1 | Form handling |
| Chart.js | ^4.5.1 | Data visualization |
| react-chartjs-2 | ^5.3.1 | React wrapper for Chart.js |
| Axios | ^1.15.2 | HTTP client |
| Lucide React | ^1.11.0 | Icon library |
| React Hot Toast | ^2.6.0 | Notification system |

### Backend

| Package | Version | Purpose |
|---|---|---|
| Express | ^5.2.1 | Web framework |
| Mongoose | ^9.5.0 | MongoDB ODM |
| bcryptjs | ^3.0.3 | Password hashing |
| jsonwebtoken | ^9.0.3 | JWT authentication |
| Cloudinary | ^1.41.3 | Cloud storage for files |
| Multer | ^2.1.1 | File upload middleware |
| multer-storage-cloudinary | ^4.0.0 | Cloudinary integration for Multer |
| Nodemailer | ^8.0.5 | Email sending |
| PDFKit | ^0.18.0 | In-memory PDF generation |
| express-rate-limit | ^8.4.1 | Rate limiting |
| dotenv | ^17.4.2 | Environment variable management |
| CORS | ^2.8.6 | Cross-origin support |

---

## Project Structure

```
HR-Management-System/
│
├── client/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   └── src/
│       ├── api/
│       │   ├── axios.js                      # Axios instance config
│       │   ├── authApi.js
│       │   ├── userApi.js
│       │   ├── attendanceApi.js
│       │   ├── leaveApi.js
│       │   ├── documentApi.js
│       │   ├── ticketApi.js
│       │   ├── announcementApi.js
│       │   ├── payrollApi.js
│       │   └── emailApi.js
│       │
│       ├── components/
│       │   ├── charts/
│       │   │   ├── AttendanceChart.jsx
│       │   │   ├── LeaveStatusChart.jsx
│       │   │   └── LeaveTrendChart.jsx
│       │   ├── ui/
│       │   │   ├── Button.jsx
│       │   │   └── Modal.jsx
│       │   ├── Header.jsx
│       │   ├── Sidebar.jsx
│       │   ├── HoverItem.jsx
│       │   ├── SmartTriggerBanner.jsx
│       │   ├── AnnouncementFeed.jsx
│       │   ├── CreateAnnouncementModal.jsx
│       │   ├── ArchiveModal.jsx
│       │   ├── UserModal.jsx
│       │   ├── UserDetailsModal.jsx
│       │   ├── EmployeeProfileModal.jsx
│       │   ├── LeaveModal.jsx
│       │   ├── LeaveDetailsModal.jsx
│       │   ├── DecisionModal.jsx
│       │   ├── ConfirmModal.jsx
│       │   ├── DeleteModal.jsx
│       │   ├── PayrollSetupModal.jsx
│       │   ├── DocumentCard.jsx
│       │   ├── DocumentList.jsx
│       │   ├── DocumentUploadModal.jsx
│       │   ├── DocumentPreviewModal.jsx
│       │   ├── AdminDocumentViewer.jsx
│       │   ├── CreateTicketModal.jsx
│       │   ├── TicketDetailModal.jsx
│       │   ├── CloseTicketModal.jsx
│       │   ├── EmailModal.jsx
│       │   ├── EmptyState.jsx
│       │   ├── PageLoader.jsx
│       │   ├── Skeleton.jsx
│       │   └── [Skeleton loaders for all tables and pages]
│       │
│       ├── hooks/
│       │   ├── useAuth.js
│       │   ├── useUsers.js
│       │   ├── useAttendance.js
│       │   ├── useLeaves.js
│       │   ├── useDocuments.js
│       │   ├── useTickets.js
│       │   ├── useAnnouncements.js
│       │   ├── usePayroll.js
│       │   ├── useEmail.js
│       │   └── useTitle.js
│       │
│       ├── layouts/
│       │   └── DashboardLayout.jsx
│       │
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Admin.jsx
│       │   ├── Employee.jsx
│       │   ├── Users.jsx
│       │   ├── AdminLeaves.jsx
│       │   ├── MyLeaves.jsx
│       │   ├── LeaveReport.jsx
│       │   ├── AdminDocuments.jsx
│       │   ├── DocumentVault.jsx
│       │   ├── AdminHelpdesk.jsx
│       │   ├── EmployeeHelpdesk.jsx
│       │   ├── AttendanceHistory.jsx
│       │   └── MyPayslips.jsx
│       │
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── routes/
│       │   └── ProtectedRoute.jsx
│       ├── NotFound.jsx
│       ├── App.jsx
│       └── main.jsx
│
├── server/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── attendanceController.js
│   │   ├── leaveController.js
│   │   ├── documentController.js
│   │   ├── ticketController.js
│   │   ├── announcementController.js
│   │   ├── payrollController.js
│   │   └── emailController.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Attendance.js
│   │   ├── Leave.js
│   │   ├── Document.js
│   │   ├── Ticket.js
│   │   ├── Announcement.js
│   │   └── Payslip.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── leaveRoutes.js
│   │   ├── documentRoutes.js
│   │   ├── ticketRoutes.js
│   │   ├── announcementRoutes.js
│   │   ├── payrollRoutes.js
│   │   └── emailRoutes.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   ├── rateLimiter.js
│   │   ├── errorMiddleware.js
│   │   └── uploadMiddleware.js
│   │
│   ├── utils/
│   │   ├── sendEmail.js
│   │   ├── emailTemplate.js
│   │   ├── crypto.js
│   │   └── pdfGenerator.js
│   │
│   └── server.js
│
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js v18 or higher
- MongoDB (local installation or Atlas cloud database)
- Gmail account with [App Password](https://support.google.com/accounts/answer/185833) enabled
- Cloudinary account (free tier available at [cloudinary.com](https://cloudinary.com))

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/your-username/hr-management-system.git
cd hr-management-system
```

#### 2. Backend Setup
```bash
cd server
npm install
```

#### 3. Frontend Setup
```bash
cd client
npm install
```

---

## Configuration

### Server — `/server/.env`

```env
# Server
PORT=5000

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/hrms

# Authentication
JWT_SECRET=your_super_secret_jwt_key_min_32_characters

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Payroll PDF Security
ADMIN_PDF_PASSWORD=your_admin_master_pdf_password
```

### Client — `/client/.env`

```env
# Default check-out time used when resolving ghost attendance sessions
VITE_DEFAULT_CHECKOUT_TIME=18:00
```

### Running the Application

**Backend** (from `/server`):
```bash
npm run dev      # Development with nodemon
npm start        # Production
```
Runs on `http://localhost:5000`

**Frontend** (from `/client`):
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```
Runs on `http://localhost:5173`

---

## API Reference

All endpoints are prefixed with `/api`. General rate limit: 200 req/15 min. Auth routes: 15 req/30 min.

### Authentication
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login, returns JWT token |

### User Management
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/users` | Admin | Get all employees |
| POST | `/api/users` | Admin | Create new employee |
| PUT | `/api/users/:id` | Admin | Update employee details |
| DELETE | `/api/users/:id` | Admin | Delete employee |

### Attendance
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/attendance/check-in` | Employee | Check in |
| POST | `/api/attendance/check-out` | Employee | Check out |
| GET | `/api/attendance/today` | Employee | Today's own attendance |
| GET | `/api/attendance/me` | Employee | Personal attendance history |
| GET | `/api/attendance/all` | Admin | All attendance records |
| GET | `/api/attendance/user/:userId` | Admin | Attendance for a specific user |
| GET | `/api/attendance/filters` | Both | Filtered attendance records |
| PATCH | `/api/attendance/bulk-fix` | Admin | Bulk-resolve ghost sessions |
| PATCH | `/api/attendance/fix/:id` | Admin | Fix a single ghost session |

### Leave Management
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/leaves` | Employee | Apply for leave |
| GET | `/api/leaves/me` | Employee | Personal leave history |
| GET | `/api/leaves` | Admin | All leave requests |
| GET | `/api/leaves/active` | Admin | Current and pending leaves |
| GET | `/api/leaves/recent` | Admin | Recently updated leaves |
| GET | `/api/leaves/pending-count` | Admin | Pending leave count (sidebar badge) |
| PATCH | `/api/leaves/:id` | Admin | Approve or reject leave |

### Payroll
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/payroll/status` | Admin | Check if current month's payroll has been processed |
| PUT | `/api/payroll/setup/:id` | Admin | Configure salary and bank details for an employee |
| POST | `/api/payroll/generate` | Admin | Run monthly payroll for all configured employees |
| GET | `/api/payroll/my-payslips` | Employee | Get personal payslip history |
| GET | `/api/payroll/download/:id` | Both | Download a payslip as a password-protected PDF |

### Announcements
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/announcements` | Both | Get announcements (filtered by role) |
| POST | `/api/announcements` | Admin | Create announcement and broadcast email |
| PUT | `/api/announcements/:id` | Admin | Edit announcement |
| PUT | `/api/announcements/:id/archive` | Admin | Archive announcement |

### Document Management
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/documents/upload` | Employee | Upload document (multipart/form-data) |
| GET | `/api/documents/my-documents` | Employee | Personal documents |
| GET | `/api/documents/:id` | Both | Document details |
| PUT | `/api/documents/:id` | Employee | Update metadata |
| DELETE | `/api/documents/:id` | Employee | Delete document |
| GET | `/api/documents/user/:userId` | Admin | All documents for a specific user |

### Support Tickets
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/tickets` | Employee | Create ticket |
| GET | `/api/tickets/my` | Employee | Personal tickets |
| GET | `/api/tickets/all` | Admin | All tickets |
| POST | `/api/tickets/:id/reply` | Both | Add reply to thread |
| PATCH | `/api/tickets/:id/status` | Admin | Update ticket status |

### Email
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/email/send` | Admin | Send manual email notification |

---

## Data Models

### User
```javascript
{
  name:         String,          // Full name
  email:        String,          // Unique
  password:     String,          // bcrypt hashed
  role:         String,          // "admin" | "employee"
  profilePic:   String,          // Cloudinary URL
  department:   String,

  leaveBalance: {
    sick:       Number,          // Default: 12
    casual:     Number,          // Default: 12
    earned:     Number,          // Default: 0
    unpaid:     Number           // Tracks days taken; no cap (default: 0)
  },

  salaryDetails: {
    basicPay:           Number,  // Default: 0
    specialAllowance:   Number   // Default: 0
  },

  bankDetails: {
    accountNumber:  String,      // AES-256-CBC encrypted; excluded from queries by default
    ifscCode:       String,
    bankName:       String
  },

  createdAt:    Date,
  updatedAt:    Date
}
```

### Payslip
```javascript
{
  userId:   ObjectId,            // Ref: User

  month:    String,              // e.g. "May"
  year:     Number,              // e.g. 2026

  earnings: {
    basicPay:           Number,
    specialAllowance:   Number
  },

  deductions: {
    lossOfPay:          Number,  // Calculated from approved Unpaid leaves in the period
    professionalTax:    Number   // Fixed at ₹200
  },

  netPay:   Number,
  isSent:   Boolean,             // True once the payslip email with PDF has been delivered

  createdAt: Date,
  updatedAt: Date
}
```

### Leave
```javascript
{
  userId:       ObjectId,        // Ref: User
  type:         String,          // "sick" | "casual" | "earned" | "unpaid"
  fromDate:     Date,
  toDate:       Date,
  reason:       String,
  status:       String,          // "pending" | "approved" | "rejected"
  reviewedBy:   ObjectId,        // Ref: User (Admin)
  adminComment: String,
  reviewedAt:   Date,
  createdAt:    Date,
  updatedAt:    Date
}
```

### Attendance
```javascript
{
  userId:   ObjectId,            // Ref: User
  checkIn:  Date,
  checkOut: Date,
  date:     String,              // YYYY-MM-DD
  createdAt: Date,
  updatedAt: Date
}
```

### Announcement
```javascript
{
  title:              String,
  message:            String,
  type:               String,    // "General" | "Urgent" | "Event" | "Milestone"
  targetDepartments:  [String],  // ["All"] or specific department names
  status:             String,    // "Active" | "Archived"
  expiresAt:          Date,
  createdBy:          ObjectId,  // Ref: User (Admin)
  createdAt:          Date,
  updatedAt:          Date
}
```

### Document
```javascript
{
  userId:    ObjectId,           // Ref: User
  title:     String,
  fileUrl:   String,             // Cloudinary URL
  publicId:  String,             // Cloudinary ID (used for deletion)
  fileType:  String,             // "pdf" | "png" | "jpg" | "doc" | "docx" | "txt"
  category:  String,             // "Contract" | "ID Proof" | "Certification" | "Other"
  fileSize:  Number,             // In bytes
  createdAt: Date,
  updatedAt: Date
}
```

### Ticket
```javascript
{
  userId:      ObjectId,         // Ref: User
  subject:     String,
  description: String,
  category:    String,           // "IT Support" | "HR Inquiry" | "Payroll" | "Facilities" | "General"
  priority:    String,           // "Low" | "Medium" | "High" | "Urgent"
  status:      String,           // "Open" | "In-Progress" | "Resolved" | "Closed"
  replies: [{
    senderId:   ObjectId,
    senderName: String,
    role:       String,          // "admin" | "employee"
    message:    String,
    createdAt:  Date
  }],
  createdAt:   Date,
  updatedAt:   Date
}
```

---

## Routes & Navigation

| Path | Role | Component | Purpose |
|---|---|---|---|
| `/` | Public | Login | Authentication |
| `/admin` | Admin | Admin | Overview, stats, payroll trigger, announcements |
| `/users` | Admin | Users | Employee management and payroll setup |
| `/admin/leaves` | Admin | AdminLeaves | Leave approval |
| `/admin/reports` | Admin | LeaveReport | Analytics and charts |
| `/admin/documents` | Admin | AdminDocuments | Manage all employee documents |
| `/admin/helpdesk` | Admin | AdminHelpdesk | Manage support tickets |
| `/employee` | Employee | Employee | Personal dashboard and announcements |
| `/employee/leaves` | Employee | MyLeaves | Leave history and apply |
| `/employee/attendance` | Employee | AttendanceHistory | Check-in/out history |
| `/employee/vault` | Employee | DocumentVault | Personal document storage |
| `/employee/helpdesk` | Employee | EmployeeHelpdesk | Create and track tickets |
| `/employee/payslips` | Employee | MyPayslips | View and download payslips |
| `*` | Any | NotFound | 404 page |

---

## Key Features in Detail

### Payroll Engine
The payroll engine runs once per month and is triggered by the Admin via the Smart Trigger Banner on the dashboard. The banner only appears when the previous month's payroll has not yet been processed, eliminating the need to navigate a separate menu or remember a schedule.

For each employee with a configured salary, the engine computes:
- **Daily Rate** = (Basic Pay + Special Allowance) / Total Days in Month
- **Loss of Pay** = Days of approved Unpaid leave falling within the pay period × Daily Rate
- **Net Pay** = Gross − Loss of Pay − ₹200 Professional Tax

A password-protected PDF payslip is generated in memory using PDFKit and emailed to the employee. The PDF password is derived from the employee's name and bank account number so it is deterministic without needing to be stored anywhere. Failure to deliver to one employee is caught in isolation and logged without stopping the rest of the run. The Admin receives an execution summary email once the full run completes.

### Bank Detail Security
Account numbers are encrypted before storage using AES-256-CBC, with the encryption key derived from the server's `JWT_SECRET`. The `accountNumber` field is excluded from all database queries by default (`select: false`) and is only decrypted at the moment a PDF needs to be generated. The raw account number is never returned to the frontend in any response.

### Leave Balance System
Each employee carries a `leaveBalance` object with per-type day counters. When an Admin approves a leave request, the system checks the employee's remaining balance for that leave type before committing. Insufficient balance blocks the approval. On approval the balance is deducted; on rejection it is restored. Unpaid leave is tracked separately without a cap, since its approved days feed directly into the payroll Loss of Pay calculation each month.

Default annual allocations:
- Sick: 12 days
- Casual: 12 days
- Earned: 0 days (accrual-based)
- Unpaid: tracked, no cap

### Leave Validation Rules
- **Past dates** — prevented; only future dates allowed
- **Weekends** — Saturday and Sunday automatically excluded from duration
- **Duration limit** — maximum 14 calendar days per request
- **Overlaps** — system rejects requests overlapping an existing one for the same employee
- **Balance check** — enforced at approval time; insufficient balance blocks the action

### Ghost Session Resolution
A ghost session is an attendance record from a past date where a check-out timestamp is missing. The Admin dashboard detects and surfaces these automatically. The Admin can set a default end-of-day time via `VITE_DEFAULT_CHECKOUT_TIME` and apply it to all ghost sessions at once, or resolve them individually.

### Announcement Broadcasting
When an Admin publishes an announcement, the system immediately dispatches an email to every employee in the targeted department. Setting `targetDepartments` to `["All"]` broadcasts to the entire company. Each announcement type maps to a distinct email accent color to aid at-a-glance recognition in inboxes.

### Ticket Workflow
1. Employee creates ticket → Status: **Open**
2. Admin reviews and begins work → Status: **In-Progress**
3. Admin and Employee exchange replies in a thread
4. Admin marks issue resolved → Status: **Resolved**
5. Employee confirms and closes → Status: **Closed**

### Authentication Flow
1. User submits email and password via the Login page
2. Server validates credentials and returns a signed JWT
3. Frontend stores the token in `localStorage` via `AuthContext`
4. All subsequent API requests include the token in the `Authorization` header
5. Protected routes on both frontend and backend validate the token and enforce role-based access before granting entry