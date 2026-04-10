# MedCore HMS - Developer Guide

## Technology Stack
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js + Express, PostgreSQL
- **DevOps**: Docker & Docker Compose

## Development Setup

### 1. Prerequisites
- Node.js (v14+)
- Docker Desktop
- Git

### 2. Clone & Setup
```bash
git clone <repository-url>
cd ohms

# Install backend dependencies
cd backend
npm install
```

### 3. Database Setup
```bash
# Start PostgreSQL with Docker
cd ..
docker compose up -d postgres

# Initialize database
cd backend
npm run init-db
```

### 4. Start Development
```bash
# Terminal 1: Start backend
npm run dev

# Terminal 2: Start frontend (served by backend)
# Open http://localhost:4000
```

### 5. Development Workflow
```bash
# Run tests
npm test

# Check code quality
npm run lint

# Database reset
npm run init-db
```

## Project Structure
```
ohms/
├── index.html          # Main HTML
├── script.js           # Frontend logic
├── styles.css          # Styling
├── docker-compose.yml  # Services
├── backend/
│   ├── src/
│   │   ├── server.js   # Entry point
│   │   ├── app.js      # Routes & middleware
│   │   ├── routes/     # API routes
│   │   ├── services/   # Business logic
│   │   └── db/         # Database files
```

## API Endpoints
- `GET /api/patients` - Get patients
- `POST /api/patients` - Create patient
- `GET /api/doctors` - Get doctors
- `POST /api/appointments` - Book appointment
- `POST /api/auth/login` - Login
│       │   ├── auth.js     # JWT verification
│       │   └── errorHandler.js # Global error handling
│       │
│       ├── routes/
│       │   └── api.routes.js # All API endpoints
│       │
│       ├── services/
│       │   ├── hmsService.js  # Business logic
│       │   └── authService.js # Authentication
│       │
│       ├── repositories/
│       │   └── hmsRepository.js # Database queries
│       │
│       └── utils/
│           ├── asyncHandler.js # Try-catch wrapper
│           ├── httpError.js    # Error class
│           ├── password.js     # Bcrypt hashing
│           └── token.js        # JWT utilities
│
└── docs/
    ├── QUICK_START.md      # 5-minute quick start
    ├── SETUP_AND_USAGE.md  # Detailed documentation
    ├── CHANGES_SUMMARY.md  # Code changes made
    └── DEVELOPER_GUIDE.md  # This file
```

---

## Code Patterns & Best Practices

### API Request Pattern
```javascript
// Frontend: Making API calls
async function apiRequest(path, options = {}) {
  const headers = { "Content-Type": "application/json" };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
    const payload = await response.json();
    
    if (!response.ok || !payload.success) {
      throw new Error(payload.error || `Request failed (${response.status})`);
    }
    return payload.data;
  } catch (error) {
    throw error; // Let caller handle
  }
}

// Backend: Receiving & responding
router.get("/patients", asyncHandler(async (req, res) => {
  const data = await service.getPatients();
  res.json({ success: true, data }); // Always return {success, data}
}));
```

### Data Transformation Pattern
```javascript
// Backend: Transform database rows to API response
const rowToPatientDto = (row) => ({
  id: row.id,                    // Database ID
  patientCode: row.patient_code, // Human-readable code
  fullName: `${row.first_name} ${row.last_name}`,
  // ... map all fields
});

// Frontend: Transform API response for rendering
function mapApiPatients(data) {
  return data.map((p) => ({
    dbId: p.id,           // Keep DB ID for updates
    id: p.patientCode,    // Use human-readable ID for display
    name: p.fullName,
    avatar: toInitials(p.fullName),
    color: colorByDepartment(p.department),
    // ... prepare for rendering
  }));
}
```

### Error Handling Pattern
```javascript
// Backend: Consistent error responses
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Frontend: Handle errors from any API call
try {
  await apiRequest("/patients", { method: "POST", body: JSON.stringify(data) });
  showToast("✓ Success message");
} catch (error) {
  if (handleUnauthorized(error)) return; // Handle 401/403
  showToast(`✗ Operation failed: ${error.message}`);
  setFieldError("fieldName", error.message);
}
```

---

## Adding a New Feature

### Example: Add Doctor Scheduling
1. **Database** (`schema.sql`):
   ```sql
   CREATE TABLE schedules (
     id SERIAL PRIMARY KEY,
     doctor_id INTEGER REFERENCES doctors(id),
     day_of_week TEXT,
     start_time TIME,
     end_time TIME
   );
   ```

2. **Repository** (`hmsRepository.js`):
   ```javascript
   async function getDoctorSchedule(doctorId) {
     const { rows } = await pool.query(
       "SELECT * FROM schedules WHERE doctor_id = $1",
       [doctorId]
     );
     return rows;
   }
   ```

3. **Service** (`hmsService.js`):
   ```javascript
   async function getDoctorSchedule(doctorId) {
     return repository.getDoctorSchedule(doctorId);
   }
   ```

4. **Route** (`api.routes.js`):
   ```javascript
   router.get("/doctors/:id/schedule", asyncHandler(async (req, res) => {
     const data = await service.getDoctorSchedule(req.params.id);
     res.json({ success: true, data });
   }));
   ```

5. **Frontend** (`script.js`):
   ```javascript
   async function loadDoctorSchedule(doctorId) {
     const schedule = await apiRequest(`/doctors/${doctorId}/schedule`);
     renderSchedule(schedule);
   }
   ```

6. **HTML** (`index.html`):
   ```html
   <div id="doctor-schedule"></div>
   ```

---

## Database Queries

### Safe Query Pattern (Prevents SQL Injection)
```javascript
// ✅ GOOD: Parameterized query
const { rows } = await pool.query(
  "SELECT * FROM patients WHERE patient_code = $1",
  [patientCode] // Parameters passed separately
);

// ❌ BAD: String concatenation
const { rows } = await pool.query(
  `SELECT * FROM patients WHERE patient_code = '${patientCode}'` // Vulnerable!
);
```

### Complex Query with Joins
```javascript
async function getAppointments({ date }) {
  let sql = `
    SELECT a.*, p.first_name, p.last_name, d.name AS doctor_name
    FROM appointments a
    JOIN patients p ON p.id = a.patient_id
    JOIN doctors d ON d.id = a.doctor_id
    WHERE 1 = 1
  `;
  const params = [];
  
  // Build dynamic conditions
  if (date) {
    sql += " AND DATE(a.scheduled_at) = DATE($1)";
    params.push(date);
  }
  
  sql += " ORDER BY a.scheduled_at ASC";
  return pool.query(sql, params);
}
```

---

## Frontend Data Flow

### Loading Data for a Page
```javascript
// 1. Load data from APIs in parallel
async function loadModuleData() {
  const [patients, doctors, wards] = await Promise.all([
    apiRequest("/patients"),
    apiRequest("/doctors"),
    apiRequest("/wards"),
  ]);

  // 2. Transform for rendering
  patients = mapApiPatients(patients);
  doctors = mapApiDoctors(doctors);
  wards = wards;

  // 3. Render to DOM
  renderPatientsTable();
  renderDoctors();
  renderWards();

  // 4. Update UI statistics
  updatePageStatistics();
}
```

### Handling User Interactions
```javascript
// 1. User clicks button
// <button onclick="openModal('modal-id')">

// 2. Open modal
function openModal(id) {
  document.getElementById(id).classList.add("open");
}

// 3. User submits form
// <button onclick="createPatientFromModal()">

// 4. Validate & process
async function createPatientFromModal() {
  // Validate inputs
  if (!firstName) {
    setFieldError("field-id", "Error message");
    return;
  }

  // Call API
  try {
    const result = await apiRequest("/patients", {
      method: "POST",
      body: JSON.stringify(data),
    });

    // Close modal & reload data
    closeModal("modal-id");
    showToast("Success!");
    await loadModuleData();
  } catch (error) {
    showToast(`Error: ${error.message}`);
  }
}
```

---

## Testing Your Changes

### Frontend Testing
```javascript
// Test in browser console (F12)
// 1. Check data loads
console.log("Patients:", patients);
console.log("Doctors:", doctors);

// 2. Test function
updatePageStatistics();

// 3. Check DOM
document.getElementById("patient-stats-summary").textContent;
```

### Backend Testing
```bash
# Test API endpoint
curl -X GET http://localhost:4000/api/patients

# With authentication
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:4000/api/patients

# Test API with data
curl -X POST http://localhost:4000/api/patients \
     -H "Content-Type: application/json" \
     -d '{"firstName":"John","lastName":"Doe",...}'
```

### Database Testing
```bash
# Connect to database
psql -U postgres -d medcore_hms

# Check data
SELECT COUNT(*) FROM patients;
SELECT * FROM doctors LIMIT 5;
SELECT * FROM appointments WHERE DATE(scheduled_at) = CURRENT_DATE;
```

---

## Common Issues & Solutions

### Issue: "TypeError: Cannot read property 'map' of undefined"
**Solution**: Check that API is returning data correctly
```javascript
// Debug in frontend
console.log("API Response:", patientsData);
if (!Array.isArray(patientsData)) {
  console.error("Expected array, got:", typeof patientsData);
}
```

### Issue: "Cannot INSERT patient - doctor_id doesn't exist"
**Solution**: Verify doctor exists before inserting patient
```javascript
// Backend validation
const doctor = await pool.query("SELECT id FROM doctors WHERE id = $1", [doctorId]);
if (doctor.rows.length === 0) {
  throw new HttpError(400, "Doctor not found");
}
```

### Issue: Modal doesn't close after submit
**Solution**: Ensure closeModal is called
```javascript
// Verify in onclick handler
console.log("Before close:", document.getElementById("modal-id").classList);
closeModal("modal-id");
console.log("After close:", document.getElementById("modal-id").classList);
```

### Issue: Toast notification doesn't appear
**Solution**: Check toast element exists and CSS is loaded
```javascript
const toastEl = document.getElementById("toast");
console.log("Toast element:", toastEl);
console.log("Has 'show' class:", toastEl.classList.contains("show"));
```

---

## Performance Optimization Tips

### Frontend
```javascript
// ✅ Good: Parallel API calls
const [a, b, c] = await Promise.all([api1(), api2(), api3()]);

// ❌ Slow: Sequential API calls
const a = await api1();
const b = await api2();
const c = await api3();

// ✅ Good: Batch DOM updates
const html = items.map(i => `<tr>...</tr>`).join("");
tbody.innerHTML = html; // Single update

// ❌ Slow: Individual DOM updates
items.forEach(i => tbody.innerHTML += `<tr>...</tr>`); // Multiple updates
```

### Backend
```javascript
// ✅ Good: Use connection pooling (already configured)
const pool = new Pool(); // Reuses connections

// ✅ Good: Parameterized queries (prevents SQL injection)
pool.query("SELECT * FROM users WHERE id = $1", [id]);

// ✅ Good: Indexes on frequently queried columns
CREATE INDEX idx_patient_code ON patients(patient_code);

// ✅ Good: Limit results
SELECT * FROM appointments ORDER BY scheduled_at DESC LIMIT 50;
```

---

## Security Checklist

- [x] Parameterized SQL queries (prevents injection)
- [x] JWT token-based authentication
- [x] Password hashing with bcrypt
- [x] CORS configured for specific origin
- [x] Rate limiting (500 req/15 min)
- [x] Helmet.js for security headers
- [x] Environment variables for secrets
- [x] Input validation on client & server
- [x] Error messages don't leak sensitive info
- [x] HTTPS recommended for production

---

## Debugging Tips

### Frontend Debugging
1. **Check Network Tab** (DevTools → Network)
   - Verify API requests are being made
   - Check response status and data

2. **Check Console Tab** (DevTools → Console)
   - Look for JavaScript errors
   - Use `console.log()` to trace execution

3. **Check Elements Tab** (DevTools → Elements)
   - Verify HTML structure
   - Check CSS classes and styles

4. **Use Breakpoints** (DevTools → Sources)
   - Set breakpoints in code
   - Step through execution line by line

### Backend Debugging
1. **Check Server Logs** (Terminal where npm run dev is running)
2. **Add console.log statements** in code
3. **Test endpoints with curl** or Postman
4. **Check database directly** with psql

---

## Version Control

### Commit Message Format
```
[FEATURE] Add new X feature
- Change 1
- Change 2

[BUGFIX] Fix Y issue
- Root cause
- Solution applied

[REFACTOR] Improve Z code
- Code quality improvements
- Performance optimizations
```

### Branch Naming
```
feature/doctor-scheduling
bugfix/modal-close-issue
refactor/api-error-handling
```

---

## Further Learning

### Database
- Read: [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- Practice: Write complex queries with JOINs, CTEs

### Backend
- Learn: [Express.js Guide](https://expressjs.com/)
- Explore: Middleware patterns, error handling strategies

### Frontend
- Study: Vanilla JavaScript patterns (no frameworks!)
- Practice: DOM manipulation, event handling

### DevOps
- Learn: Docker basics and Docker Compose
- Practice: Container orchestration

---

## Contact & Support

For questions about:
- **Architecture**: Review the code structure above
- **Features**: Check QUICK_START.md
- **Setup**: See SETUP_AND_USAGE.md
- **Changes**: Review CHANGES_SUMMARY.md

---

**Last Updated**: April 2026  
**Version**: 1.0  
**Status**: Production Ready ✅
