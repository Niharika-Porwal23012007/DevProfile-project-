# Deployment and Operations Guide
## Project: DevProfile — Unified Developer Analytics Platform
**Document Version:** 1.0  
**Authors:** Niharika Porwal, Shruti Sunil Choudhary, Somya Gupta  
**Department:** Computer Science & Engineering, Medi-Caps University, Indore  
**Guide:** Prof. Shraddha Kumar  

---

## 1. Prerequisites and System Requirements

- **Node.js:** Version 20.0.0 or higher (v24 LTS recommended)
- **Package Manager:** `npm` v9+
- **Git:** Version 2.30+
- **Database:** SQLite (bundled, zero setup for local development) or PostgreSQL 15+ (for cloud deployment)

---

## 2. Local Development Quickstart

### 2.1 Repository Setup
```bash
# Clone the repository
git clone https://github.com/niharikaporwal/devprofile.git
cd "devprofile"

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Install extension dependencies
cd ../extension && npm install
```

### 2.2 Environment Configuration
Create `backend/.env` based on `backend/.env.example`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=devprofile_super_secret_jwt_signing_key_2026
TOKEN_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
FRONTEND_URL=http://localhost:5173
DATABASE_FILE=devprofile.sqlite
GEMINI_API_KEY=your_optional_gemini_api_key
```

### 2.3 Database Seeding & Testing
```bash
# Seed realistic 35-day academic data for Niharika Porwal's profile
cd backend && npm run seed

# Run the comprehensive test suite (22 unit & integration tests)
npm test
```

### 2.4 Launch Development Servers
From the root directory:
```bash
# Start backend API (port 5000) and frontend Vite server (port 5173) concurrently:
npm run dev
```
Open your browser at `http://localhost:5173`. Click **"Demo Login (Instant)"** to explore the dashboard immediately.

---

## 3. VS Code Extension Deployment

### 3.1 Local Development Host Testing
1. Open the `/extension` folder in VS Code.
2. Run `npm run compile`.
3. Press `F5` to open the **Extension Development Host**.
4. In the new window, open any project folder.
5. In Settings (`Cmd+,`), search `devprofile.apiKey` and paste your key.

### 3.2 Packaging to VSIX File
```bash
cd extension
npx @vscode/vsce package
```
This produces `devprofile-vscode-1.0.0.vsix`. Classmates can install this via **Extensions &rarr; Install from VSIX...** without publishing to the VS Code Marketplace.

---

## 4. Cloud Production Deployment

### 4.1 Frontend Deployment (Vercel / Netlify)
1. Link your GitHub repository to Vercel.
2. Set Root Directory to `frontend`.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Configure API proxy or set environment variable `VITE_API_URL`.

### 4.2 Backend Deployment (Render / Railway)
1. Deploy `backend` as a Node.js web service.
2. Build Command: `npm install && npm run build`
3. Start Command: `npm run start`
4. Add all environment variables in the host dashboard.
5. Set `NODE_ENV=production`.

### 4.3 Database Configuration (PostgreSQL / Supabase)
To use hosted PostgreSQL instead of SQLite, provide `DATABASE_URL` in your production environment variables.

### 4.4 Automated Nightly Cron Job
The backend includes a self-contained cron runner (`cron/scheduler.ts`) scheduled at `5 0 * * *` (00:05 AM). If deploying on serverless architectures (e.g. AWS Lambda or Vercel Serverless), configure a cron trigger (e.g. GitHub Actions or Cron-Job.org) to hit a secured webhook endpoint `POST /api/scheduler/trigger`.
