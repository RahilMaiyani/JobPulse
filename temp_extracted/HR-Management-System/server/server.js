import express from "express";
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import ticketRoutes from './routes/ticketRoutes.js';
import announcementRoutes from "./routes/announcementRoutes.js";
import payrollRoutes from "./routes/payrollRoutes.js";
import analyticsRoutes from './routes/analyticsRoutes.js';
import { apiLimiter } from "./middleware/rateLimiter.js";

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',          // Local Development
  'http://localhost:4173',
  process.env.CLIENT_URL,           // Production Frontend
  'https://officelink-q3dppywc0-xyzerg808-5448s-projects.vercel.app/',
  'https://officelink-ui-git-main-xyzerg808-5448s-projects.vercel.app/',
  'https://officelink-ui.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      console.log("CORS Blocked Origin:", origin);
      return callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));


app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use("/api", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/payroll", payrollRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use(errorMiddleware);

app.get("/", (req, res) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OfficeLink API | Status</title>
        <style>
            :root {
                --bg: #f8fafc;
                --card: #ffffff;
                --primary: #4f46e5;
                --text-main: #1e293b;
                --text-muted: #64748b;
                --border: #e2e8f0;
            }
            body {
                background-color: var(--bg);
                color: var(--text-main);
                font-family: 'Inter', system-ui, -apple-system, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
            }
            .logo-wrapper {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 32px;
            }
            .logo-icon {
                background-color: var(--primary);
                color: white;
                padding: 10px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .logo-text {
                font-size: 24px;
                font-weight: 800;
                color: #0f172a;
                letter-spacing: -0.025em;
            }
            .container {
                background-color: var(--card);
                padding: 3rem;
                border-radius: 1.5rem;
                border: 1px solid var(--border);
                box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
                text-align: center;
                max-width: 440px;
                width: 90%;
            }
            .status-indicator {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                background: #f0fdf4;
                color: #166534;
                padding: 6px 16px;
                border-radius: 9999px;
                font-size: 12px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.025em;
                margin-bottom: 24px;
                border: 1px solid #dcfce7;
            }
            .pulse-dot {
                width: 8px;
                height: 8px;
                background-color: #22c55e;
                border-radius: 50%;
                animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            h1 {
                font-size: 20px;
                font-weight: 700;
                margin: 0 0 12px 0;
                color: #0f172a;
            }
            p {
                color: var(--text-muted);
                font-size: 14px;
                line-height: 1.6;
                margin-bottom: 32px;
            }
            .timestamp {
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                font-size: 11px;
                color: var(--text-muted);
                background: #f1f5f9;
                padding: 8px;
                border-radius: 8px;
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: .5; }
            }
        </style>
    </head>
    <body>
        <div class="logo-wrapper">
            <div class="logo-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <span class="logo-text">OfficeLink</span>
        </div>
        <div class="container">
            <div class="status-indicator">
                <div class="pulse-dot"></div>
                API Live
            </div>
            <h1>Internal System Active</h1>
            <p>Your corporate credentials have been verified. The backend API is ready to process dashboard requests.</p>
            <div class="timestamp">
                SYSTEM_STAMP: ${new Date().toISOString()}
            </div>
        </div>
    </body>
    </html>
  `);
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log('\n' + ' '.repeat(2) + '\x1b[33m%s\x1b[0m', '⚡'); // Ember Bolt
    console.log('  \x1b[1m\x1b[37mOFFICELINK CORE\x1b[0m');
    console.log('  \x1b[90m-----------------------------\x1b[0m');
    console.log('  \x1b[33mReady:\x1b[0m \x1b[32mhttp://localhost:' + PORT + '\x1b[0m');
    console.log('  \x1b[33mStatus:\x1b[0m \x1b[36m'+process.env.NODE_ENV.toUpperCase()+'\x1b[0m\n');
  });
}

export default app;