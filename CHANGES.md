# Bireena Medico - Lab Module Changes

## What Was Built

### 1. Database (MongoDB Atlas - Cloud)

**Connection:** `mongodb+srv://medico_admin:Medico%402026!@cluster0.8ayybxw.mongodb.net/medico_hospital`

Collections with data:
- `patients` — 4 patients (Rahul Verma, Priya Singh, Amit Patel, Neha Gupta)
- `users` — admin + lab assistant + other role accounts
- `labtests` — 10 lab tests (CBC, LFT, RFT, TSH, HbA1c, UA, Lipid, X-Ray, ECG, Ultrasound)
- `labreports` — 5 reports with detailed history timeline tracking
- `doctors` — doctor records

### 2. Backend (Express + Node.js)

**Port:** `5001`

New/modified files:
- `models/LabReport.js` — `history[]` array for timeline tracking, auto-generated `reportId` (LAB1001, LAB1002...)
- `models/LabTest.js` — `testCode` as unique primary key
- `models/User.js` — Added `username` field for username login
- `services/laboratory.service.js` — `deleteReport()` with Supabase file cleanup, `getTestByCode()`, history push on status change/file upload
- `controllers/laboratory.controller.js` — Added `deleteReport`, `extractReport`; duplicate key error handling (11000); create report first then upload file to Supabase folder
- `routes/laboratory.routes.js` — `DELETE /reports/:id`, `POST /extract`
- `utils/documentExtractor.js` — NEW: Extracts text from PDF/DOCX, parses patient/doctor/test/findings
- `utils/localUpload.js` — File upload to **Supabase Storage** with report-ID-based folders (e.g., `LAB1002/file.jpg`)
- `services/auth.service.js` — Login supports email, employeeId, or **username**
- `middlewares/upload.middleware.js` — Multer memory storage, supports PDF/DOCX/TXT/images

### 3. Frontend (React + Vite)

**Port:** `5173`

New/modified files:
- `services/labService.js` — API client with `extractReport()`, `deleteReport()`, `getPatients()`, Supabase URL resolution
- `services/authService.js` — Real backend auth, role normalization
- `lib/reports-store.js` — `update()`, `remove()` methods with `_raw._id` matching
- `lib/constants.js` — Dynamic category counts from actual data (not hardcoded)
- `pages/lab/UploadReports.jsx` — Create New Report mode, auto-extract from PDF/DOCX, DOCX support
- `pages/lab/LabReports.jsx` — Edit/Delete buttons, modal, history timeline, print, focus refresh, attached file display
- `pages/lab/tests.jsx` — Enhanced alerts, duplicate code check, dynamic category counts
- `pages/lab/add-test.jsx` — Manual test code entry
- `components/lab/ui.jsx` — Button, Modal, Card, Field, etc.
- `index.css` — Print CSS for report detail panel

---

## Cloud Infrastructure

| Layer | Service | URL |
|-------|---------|-----|
| Database | MongoDB Atlas | `cluster0.8ayybxw.mongodb.net` |
| File Storage | Supabase Storage | `mrorsviggdjzajlvtyzk.supabase.co` |
| Backend | Local (port 5001) | `http://localhost:5001` |
| Frontend | Local (port 5173) | `http://localhost:5173` |

### Supabase Storage Structure
```
lab-reports (bucket, public)
├── LAB1001/
│   └── file.pdf
├── LAB1002/
│   └── file.jpg
└── LAB1006/
    └── file.pdf
```

---

## Credentials

### Login

| Role | Email | Username | Password |
|------|-------|----------|----------|
| Admin | admin@medico.com | admin.medico | medicouseradmin |
| Lab Assistant | lab@medico.com | lab.medico | medicouserlab |

### MongoDB Atlas

| Item | Value |
|------|-------|
| URI | `mongodb+srv://medico_admin:Medico%402026!@cluster0.8ayybxw.mongodb.net/medico_hospital` |
| DB Name | `medico_hospital` |
| Username | `medico_admin` |
| Password | `Medico@2026!` |

### Supabase

| Item | Value |
|------|-------|
| URL | `https://mrorsviggdjzajlvtyzk.supabase.co` |
| Key (service_role) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yb3JzdmlnZ2RqemFqbHZ0eXprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTE1OTc3MCwiZXhwIjoyMDk2NzM1NzcwfQ.Dxg_n0-WZ1rE_NW2zqkmzpd6xvm3TXzDoV5PHV2Q1Is` |
| Bucket | `lab-reports` (public) |

### Environment Variables (backend/.env)

```
PORT=5001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:8080
MONGO_URI=mongodb+srv://medico_admin:Medico%402026!@cluster0.8ayybxw.mongodb.net/medico_hospital?appName=Cluster0
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d
SUPABASE_URL=https://mrorsviggdjzajlvtyzk.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_BUCKET=lab-reports
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:5001/api
```

---

## How to Run

```bash
# 1. Backend
cd backend
npm install
node script/seed.js    # creates sample data on Atlas
node server.js         # runs on port 5001

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev            # runs on port 5173

# 3. Open http://localhost:5173
# Login with admin.medico / medicouseradmin
```

**No local MongoDB needed** — all data lives on MongoDB Atlas.

---

## Sample Data Created by Seed Script

- 4 patients (Rahul Verma PAT001, Priya Singh PAT002, Amit Patel PAT003, Neha Gupta PAT004)
- 10 lab tests (CBC, LFT, RFT, TSH, HbA1c, UA, Lipid Profile, X-Ray Chest, ECG, Ultrasound Abdomen)
- 5 lab reports with detailed history timelines and varied statuses
- 1 doctor (Dr. Raj Sharma)
- Admin + Lab user accounts with username login

---

## Key Features

- Upload PDF/DOCX/images → stored in Supabase Storage in report-specific folders
- Auto-extract patient, doctor, test, findings from uploaded documents
- Edit reports (status + notes) via modal
- Delete reports with confirmation (also deletes file from Supabase)
- History Timeline tracks all status changes and file uploads (real-time)
- Attached file section in report detail with Open link
- Duplicate test code / report ID validation with friendly error alerts
- Download PDF / Print buttons
- CSV export
- Auto-refresh on tab focus
- Username or email login

---

## Known Issues / Notes

- Port 5000 is blocked by macOS ControlCenter, so backend uses 5001
- Document extraction works best with structured PDFs
- Supabase bucket must be created manually (RLS blocks anon key)
- For production: deploy backend to Render/Railway and frontend to Vercel

---

## Changelog

### June 15, 2026 — Cloud Migration
- Switched database from local MongoDB to **MongoDB Atlas** (cloud)
- Switched file storage from local filesystem to **Supabase Storage** (cloud)
- Files organized in report-ID-based folders (`LAB1002/file.jpg`)
- Added `username` field to User model for username login
- Login supports email, employeeId, or username
- Added duplicate key error handling (friendly alerts for duplicate test codes/report IDs)
- Created `getTestByCode()` service method
- Seed script now creates 10 lab tests + 5 reports with detailed history + 4 patients
- Dynamic category counts from actual data (no more hardcoded numbers)
- Fixed print CSS (`#root > *` instead of `body > *`)
- Updated file filter to accept DOCX and TXT files
- Deleted local `backend/uploads/` files (all in Supabase now)
- Updated CHANGES.md with cloud infrastructure details
