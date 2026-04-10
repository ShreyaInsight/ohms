# MedCore HMS 

This project is split into:
- Frontend: `index.html`, `styles.css`, `script.js`
- Backend: `backend/` (Express API + SQLite database)

## Architecture
- Layered backend: `routes -> services -> repositories -> db`
- Centralized error handling and async wrapper
- Security baseline: `helmet`, `cors`, `rate-limit`
- Request logging: `morgan`
- Token auth + role-based authorization for protected actions
- Seeded relational schema for all HMS modules:
  - Patients
  - Doctors
  - Appointments
  - Wards/Beds
  - Lab Tests
  - Billing/Invoices
  - Pharmacy/Medicines
  - Users / Roles

## Run
1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env` and adjust if needed
4. `npm run init-db`
5. `npm run dev`
6. Open `http://localhost:4000`

## Default Login Users
- `admin@medcore.local` / `Admin@123` (role: `admin`)
- `reception@medcore.local` / `Reception@123` (role: `reception`)
- `doctor@medcore.local` / `Doctor@123` (role: `doctor`)
- `lab@medcore.local` / `Lab@123` (role: `lab`)
- `pharmacy@medcore.local` / `Pharmacy@123` (role: `pharmacy`)

Use the `Sign In` button in the top bar. Protected actions (create patient, book appointment, reorder medicine, etc.) require proper role permissions.

## API Base
- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/dashboard/summary`
- `GET /api/search?q=<term>`
- `GET/POST /api/patients`
- `GET /api/doctors`
- `GET/POST /api/appointments`
- `GET /api/wards`
- `GET/POST /api/lab-tests`
- `GET/POST /api/invoices`
- `GET /api/medicines`
- `POST /api/medicines/:id/reorder`

## Docker
From project root:
1. `docker compose up --build`
2. Open `http://localhost:4000`

## CI
GitHub Actions workflow at `.github/workflows/ci.yml` runs:
- Backend dependency install
- Backend syntax checks
- Frontend script syntax check
