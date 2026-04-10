# MedCore HMS - Setup & Usage Guide

## Prerequisites
- Node.js (v14+)
- PostgreSQL database server running
- npm (comes with Node.js)

## Installation & Setup

### 1. Database Setup
Ensure PostgreSQL is installed and running. Create a database for HMS:
```bash
createdb medcore_hms
```

### 2. Backend Configuration
```bash
cd backend

# Install dependencies
npm install

# Create .env file with database credentials
# Update src/config/env.js with your PostgreSQL connection details:
# - DB_HOST: localhost
# - DB_PORT: 5432
# - DB_NAME: medcore_hms
# - DB_USER: your_postgres_user
# - DB_PASSWORD: your_postgres_password

# Initialize database with schema and seed data
npm run init-db

# Start the development server
npm run dev
# Server runs on http://localhost:4000
```

### 3. Frontend Setup
The frontend files are served from the root directory:
```bash
# No additional installation needed - frontend uses vanilla JS
# Access the application at http://localhost:4000
```

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@medcore.local | Admin@123 |
| Reception | reception@medcore.local | Reception@123 |
| Doctor | doctor@medcore.local | Doctor@123 |
| Lab Tech | lab@medcore.local | Lab@123 |
| Pharmacy | pharmacy@medcore.local | Pharmacy@123 |

## Core Features

### Dashboard
- Real-time Statistics: Patient count, bed occupancy, appointments, revenue
- Analytics: Monthly revenue trends, admission patterns
- Calendar View: Appointment scheduling visualization

### Patient Management
- Register Patients: Capture patient demographics, insurance info, medical history
- Patient List: View all patients with filtering by status (Admitted, OPD, Discharged)
- Patient Search: Find patients by code, name, or doctor assignment
- Status Tracking: Monitor patient admission status across departments

### Doctor Management
- Doctor Directory: View all doctors with specialties and experience
- Availability Status: Real-time duty status (On Duty, Off, In Surgery)
- Patient Load: See active patient count per doctor

### Appointment Scheduling
- Book Appointments: Schedule appointments with specific doctors and time slots
- Calendar View: Visual representation of daily appointments
- Status Tracking: Monitor appointment progress (Scheduled, In Progress, Done, Waiting)

### Ward & Bed Management
- Occupancy Status: Visual grid of bed status (Occupied, Available, Maintenance)
- Multi-Ward Support: Manage ICU, General Ward, Maternity, Pediatrics
- Real-time Updates: Immediate bed availability updates

### Laboratory Management
- Test Ordering: Request lab tests for patients
- Priority Management: Routine, Urgent, STAT priority levels
- Status Tracking: Pending → In Progress → Ready workflow
- Result Ready Notifications: Track when results are available

### Billing & Invoicing
- Invoice Creation: Generate bills for patient services
- Payment Tracking: Monitor paid, pending, partial, and overdue payments
- Insurance Integration: Track insurance coverage and claims
- **Financial Reports**: Monthly collection rates and revenue analysis

### Pharmacy Management
- **Medicine Inventory**: Track stock levels for all medicines
- **Expiry Alerts**: Automatic alerts for expired or expiring medicines
- **Reorder Management**: One-click reordering for low-stock items
- **Stock Status**: Color-coded status (Adequate, Low Stock, Critical)

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Data Endpoints (All public, no auth required)
- `GET /api/dashboard/summary` - Dashboard statistics
- `GET /api/patients` - List all patients (supports filtering & search)
- `POST /api/patients` - Register new patient
- `GET /api/doctors` - List all doctors
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Book new appointment
- `GET /api/wards` - Ward information with bed status
- `GET /api/lab-tests` - List lab tests
- `POST /api/lab-tests` - Create lab test request
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `GET /api/medicines` - List medicines
- `POST /api/medicines/{id}/reorder` - Reorder medicine

## Code Quality Improvements

### What's Fixed
✅ **Dynamic Data Display**: All hardcoded values replaced with real database queries  
✅ **Error Handling**: Comprehensive try-catch blocks with user-friendly messages  
✅ **Input Validation**: Client-side validation for all form submissions  
✅ **Security**: JWT authentication, password hashing, SQL parameterization  
✅ **Modal Management**: Proper open/close functionality with form reset  
✅ **Button Handlers**: All action buttons properly wired with event listeners  
✅ **Responsive Design**: Works on desktop, tablet, and mobile devices  
✅ **Performance**: Parallel data loading, efficient DOM rendering  

### Architecture
- **Separation of Concerns**: Frontend (UI logic) and Backend (business logic) clearly separated
- **Parameterized Queries**: All SQL queries use parameterization to prevent SQL injection
- **Error Middleware**: Centralized error handling in backend
- **Environment Configuration**: Sensitive data in environment variables
- **Database Transactions**: Consistent data integrity across operations
- **Rate Limiting**: API protection with rate limiting (500 req/15min)
- **CORS**: Proper cross-origin resource sharing configuration

## Troubleshooting

### "Backend unavailable" message
- Ensure PostgreSQL is running
- Check backend is started with `npm run dev` in the backend directory
- Verify connection string in `src/config/env.js`

### Data not loading
- Check browser console (F12) for error messages
- Verify database initialization: `npm run init-db`
- Check that all API endpoints are returning data

### Login issues
- Use the demo credentials provided above
- Clear browser cache and try again
- Check that JWT token is being stored in localStorage

### Modal buttons not working
- Ensure JavaScript is enabled
- Check browser console for errors
- Verify all onclick handlers are properly attached

## Production Deployment Checklist

- [ ] Update `env.js` with production database credentials
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS/SSL
- [ ] Set secure CORS origins
- [ ] Implement rate limiting
- [ ] Add database backups
- [ ] Setup monitoring and logging
- [ ] Implement 2FA for admin accounts
- [ ] Regular security audits
- [ ] Database migration strategy

## Support & Maintenance
For issues or improvements, review the code comments and existing patterns in:
- Backend: `src/services/hmsService.js` (business logic)
- Frontend: `script.js` (UI interactions)
- Database: `src/db/schema.sql` (data structure)

---
**MedCore HMS v1.0** | Last Updated: April 2026
