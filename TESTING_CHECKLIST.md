# MedCore HMS - Testing Checklist

## Setup Tests
- [ ] PostgreSQL running and accessible
- [ ] Database `medcore_hms` created
- [ ] `npm install` completes successfully
- [ ] `npm run init-db` creates tables and seed data
- [ ] Backend starts with `npm run dev`
- [ ] Frontend loads at http://localhost:4000

## Authentication Tests
- [ ] Login modal opens correctly
- [ ] Login succeeds with admin@medcore.local / Admin@123
- [ ] Login fails with wrong credentials
- [ ] Session persists after refresh
- [ ] Sign out works correctly
- [ ] Multiple roles work (reception, doctor, lab, pharmacy)

## Core Feature Tests
- [ ] Dashboard shows real statistics
- [ ] Patient list displays with filtering
- [ ] Register new patient works
- [ ] Doctor directory loads
- [ ] Book appointment functionality
- [ ] Ward/bed management displays
- [ ] Lab tests tracking works
- [ ] Billing/invoices load
- [ ] Pharmacy inventory shows

## UI/UX Tests
- [ ] All modals open/close properly
- [ ] Forms validate input correctly
- [ ] No JavaScript errors in console
- [ ] Responsive design works on mobile
- [ ] Loading states display appropriately
- [ ] Error messages are user-friendly

## Performance Tests
- [ ] Page loads within 3 seconds
- [ ] API responses under 1 second
- [ ] No memory leaks (check browser dev tools)
- [ ] Database queries are optimized

## 📊 Dashboard Tests

### Real-Time Statistics
- [ ] "Total Patients" shows actual count from database
- [ ] "Occupied Beds" shows X/Y format with real data
- [ ] "Today's Appointments" shows actual count
- [ ] "Monthly Revenue" displays currency correctly
- [ ] All numbers update after data loads (no "loading..." text visible)

### Dashboard Charts
- [ ] Admissions chart displays bars with data
- [ ] Revenue chart shows monthly trend
- [ ] OPD vs IPD chart displays both series
- [ ] Charts have proper labels and legends

### Dashboard Mini-Calendar
- [ ] Calendar shows April 2026
- [ ] Today (3rd) is highlighted
- [ ] Appointment days have indicator dots
- [ ] Clicking a date shows appointment count

---

## 👥 Patient Management Tests

### Patient List View
- [ ] Lists all patients from database
- [ ] Shows correct columns: Name, ID, Age/Gender, Department, Doctor, Status, Admitted
- [ ] Data formats correctly (e.g., "34 / F" for age/gender)
- [ ] Patient status badges have correct colors:
  - Admitted = Blue
  - OPD = Green
  - Critical = Red
  - Discharged = Gray
- [ ] Page header shows dynamic count: "X registered patients • Y currently admitted"
- [ ] Shows "Showing X–X of Y" format with actual numbers

### Patient Filtering
- [ ] "All Patients" tab shows all patients
- [ ] "Currently Admitted" tab shows only admitted patients
- [ ] "OPD" tab shows only OPD patients
- [ ] "Discharged" tab shows only discharged patients
- [ ] Tab switch updates both table AND header count
- [ ] Toast shows "Filter: [type] patients"

### Patient Search
- [ ] Top search bar accepts input
- [ ] Searching finds patients by name
- [ ] Searching finds patients by ID
- [ ] Shows match count in toast (e.g., "Found 3 matches")

### Patient Registration Modal
- [ ] "Register Patient" button opens modal
- [ ] Modal has all required fields
- [ ] Validation works:
  - [ ] First name required
  - [ ] Last name required
  - [ ] Date of birth required
  - [ ] Gender required
  - [ ] Phone number validates (10-13 digits)
  - [ ] Shows error message below field
- [ ] Can enter valid data and submit
- [ ] Calculates age correctly from DOB
- [ ] Maps gender correctly (Male → M, Female → F)
- [ ] Maps admission type to status (IPD → admitted, OPD → opd, Emergency → critical)
- [ ] Toast shows success: "✓ Patient registered - ID: P-XXXX"
- [ ] New patient appears in patient list
- [ ] Form clears after successful submit
- [ ] Modal closes automatically
- [ ] Can register multiple patients in succession

### Patient Record View
- [ ] Clicking "View" button shows toast
- [ ] Shows patient name in toast message

---

## 👨‍⚕️ Doctor Management Tests

### Doctor List View
- [ ] Lists all doctors from database
- [ ] Shows correct information:
  - Doctor name
  - Department/specialty
  - Experience years
  - Number of active patients
  - Current status (On Duty, Off Duty, In Surgery)
- [ ] Status badges have correct colors:
  - On Duty = Green
  - Off = Gray
  - Surgery = Blue
- [ ] Page header shows count: "X doctors • Y on duty today"
- [ ] Doctor cards display in grid layout (3 columns)

### Doctor Selection
- [ ] When registering patient, doctor dropdown populates with real doctors
- [ ] Shows format: "Name (Department)"
- [ ] Can select a doctor

---

## 📅 Appointment Management Tests

### Appointment Booking Modal
- [ ] "Book Appointment" button opens modal
- [ ] Modal has required fields:
  - Patient (text input with autocomplete)
  - Department (dropdown)
  - Doctor (dropdown)
  - Appointment Type (dropdown)
  - Date (date picker)
  - Time Slot (time select)
  - Notes (textarea)
- [ ] Can type patient name/code for search
- [ ] Datalist appears with matching patients
- [ ] Shows format: "P-0001 - Priya Mehta"
- [ ] Can select doctor from dropdown
- [ ] Can select appointment type (Consultation, Follow-up, etc.)
- [ ] Can pick future date
- [ ] Time slots show in 12-hour format (09:00 AM, 02:00 PM, etc.)
- [ ] Can add optional notes

### Appointment Submission
- [ ] Validates that patient is selected
- [ ] Validates that date is selected
- [ ] Validates that time is selected
- [ ] Shows error if patient not found
- [ ] Toast shows "Booking appointment..."
- [ ] Toast shows success: "✓ Appointment booked successfully"
- [ ] Appointment appears in list (if today)
- [ ] Form clears after submit

### Calendar View
- [ ] Mini calendar shows April 2026
- [ ] Days with appointments have indicator dots
- [ ] Clicking an appointment day shows appointments

---

## 🏥 Ward & Bed Management Tests

### Ward Status Display
- [ ] Lists all wards: ICU, General Ward, Maternity, Pediatrics
- [ ] Shows real bed status counts
- [ ] Page header shows: "X occupied · Y available · Z maintenance"

### Bed Visualization
- [ ] ICU Ward shows 20 beds in grid
- [ ] General Ward shows 24 beds
- [ ] Maternity shows 16 beds
- [ ] Pediatrics shows 24 beds
- [ ] Bed colors:
  - Occupied = Red
  - Available = Green
  - Maintenance = Amber
- [ ] Clicking bed shows tooltip (e.g., "Occupied", "Available")
- [ ] Numbers visible on beds

### Ward Statistics
- [ ] Shows occupancy percentage
- [ ] Updates when patient status changes

---

## 🧪 Laboratory Tests

### Lab Test List
- [ ] Shows all lab tests from database
- [ ] Columns: Test ID, Patient, Test Name, Ordered By, Priority, Status, Time
- [ ] Status badges have correct colors:
  - Pending = Amber
  - In Progress = Blue
  - Ready = Green
- [ ] Priority badges:
  - Routine = Gray
  - Urgent = Red
  - STAT = Red
- [ ] Page header shows: "X tests pending • Y results ready"

### Lab Test Ordering
- [ ] "New Test Request" button works
- [ ] Shows toast (feature in progress)

---

## 💳 Billing & Invoicing

### Invoice List
- [ ] Shows all invoices from database
- [ ] Columns: Invoice #, Patient, Services, Amount, Insurance, Net Due, Status
- [ ] Status badges:
  - Paid = Green
  - Pending = Amber
  - Partial = Blue
  - Overdue = Red
- [ ] Amounts show in rupees (₹)
- [ ] Page header shows real billing summary
- [ ] Statistics show with formatted amounts

---

## 💊 Pharmacy Management

### Medicine Inventory
- [ ] Lists all medicines from database
- [ ] Columns: Medicine, Category, Stock, Unit, Expiry, Status, Action
- [ ] Status badges:
  - Adequate = Green
  - Low Stock = Amber
  - Critical = Red
- [ ] Expiry dates show in "Mon Year" format (e.g., "Jun 2026")
- [ ] Stock numbers show correctly
- [ ] Page header shows: "X medicines • Y low stock alerts"

### Low Stock Alert
- [ ] Alert box appears if medicines are low
- [ ] Lists medicine names needing reorder
- [ ] Can click "Reorder" button
- [ ] Toast shows reorder was placed
- [ ] Stock updates after reorder

---

## 🔍 Search Functionality

### Global Search
- [ ] Search bar in topbar accepts input
- [ ] Searches across patients, doctors, medicines
- [ ] Shows toast with match count
- [ ] Works with min 2 characters

---

## ⚠️ Error Handling Tests

### Network Errors
- [ ] Stop backend server
- [ ] Try to load data
- [ ] Shows error toast: "Backend unavailable. Start server..."
- [ ] No JavaScript errors in console
- [ ] Restart backend and refresh
- [ ] Data loads successfully

### Invalid Input
- [ ] Try to register patient without first name
- [ ] Shows error "First name is required"
- [ ] Error appears below field
- [ ] Field has error styling
- [ ] Cannot submit form with errors

### API Errors
- [ ] Backend validation works (invalid data rejects)
- [ ] User-friendly error messages appear
- [ ] Errors don't break the UI

---

## 🎨 UI/UX Tests

### Responsive Design
- [ ] Desktop (1920px) - Sidebar + Content layout
- [ ] Tablet (768px) - Properly responsive
- [ ] Mobile (375px) - Readable and usable
- [ ] No horizontal scroll on mobile
- [ ] Touch-friendly button sizes

### Visual Consistency
- [ ] All badges use consistent colors
- [ ] Buttons style consistently
- [ ] Forms align and space properly
- [ ] Tables are readable and sortable
- [ ] Cards have consistent spacing

### Toast Notifications
- [ ] Appear in bottom right
- [ ] Auto-close after 2.8 seconds
- [ ] Stack if multiple appear
- [ ] Don't block content
- [ ] Have appropriate colors (green for success, red for error)

### Modal Dialogs
- [ ] Center on screen
- [ ] Overlay darkens background
- [ ] Close button (X) works
- [ ] Click outside modal closes it
- [ ] Escape key closes it (if implemented)
- [ ] Form fields focus properly
- [ ] Submit button clearly visible

---

## ⚡ Performance Tests

### Page Load Time
- [ ] Initial page load < 2 seconds
- [ ] Data loads without visible lag
- [ ] Smooth animations (no stuttering)

### Interaction Responsiveness
- [ ] Button clicks feel instant
- [ ] Modal opens quickly
- [ ] Form submission completes in < 1 second
- [ ] Table filtering is instant

### Memory Usage
- [ ] Page doesn't consume excessive memory
- [ ] No memory leaks on repeated interactions
- [ ] Browser doesn't slow down over time

---

## 🔐 Security Tests

### Password Security
- [ ] Passwords don't display in plain text
- [ ] Can't access admin data without login
- [ ] Session expires on browser close
- [ ] JWT token stored in localStorage (check F12 → Application)

### Data Protection
- [ ] Patient data only shown to authenticated users
- [ ] No sensitive data in API responses (no passwords)
- [ ] No SQL errors leaked to frontend
- [ ] API validates all input

---

## 📱 Cross-Browser Tests

### Chrome/Edge
- [ ] All features work
- [ ] No console errors
- [ ] Performance is smooth

### Firefox
- [ ] All features work
- [ ] No console errors
- [ ] Styling is correct

### Safari (if available)
- [ ] All features work
- [ ] Forms submit correctly
- [ ] Navigation works

---

## 📝 Data Integrity Tests

### Create Operations
- [ ] Patient created with correct data
- [ ] Data persists after page refresh
- [ ] Database shows new record
- [ ] ID is unique

### Read Operations
- [ ] List shows all records
- [ ] Details show correct patient info
- [ ] Counts are accurate

### Filter Operations
- [ ] Filters return correct subset
- [ ] Counts update correctly
- [ ] Can filter multiple ways

### Error Cases
- [ ] Can't create duplicate entries
- [ ] Missing required fields rejected
- [ ] Invalid data rejected

---

## ✅ Final Verification

- [ ] No console errors (F12 → Console)
- [ ] No network errors (F12 → Network)
- [ ] All features from this checklist work
- [ ] Database has seed data (10 patients, 8 doctors, etc.)
- [ ] Can register and view new patient
- [ ] Can book and view appointment
- [ ] Can perform all admin tasks
- [ ] Application ready for deployment

---

## 🚀 Go-Live Checklist

Before deploying to production:

- [ ] Update `.env` with production database credentials
- [ ] Change `TOKEN_SECRET` to strong random value
- [ ] Set `NODE_ENV=production`
- [ ] Configure HTTPS/SSL
- [ ] Update `FRONTEND_ORIGIN` to production domain
- [ ] Setup database backups
- [ ] Configure error logging (Sentry, LogRocket, etc.)
- [ ] Setup monitoring (uptime, performance)
- [ ] Review security settings
- [ ] Test with production-like data volume
- [ ] Document deployment process
- [ ] Setup rollback plan

---

**Test Date**: _______________  
**Tester Name**: _______________  
**All Tests Passed**: [ ] Yes [ ] No  
**Issues Found**: _______________  

**Status**: ✅ Ready for Production | ⚠️ Needs Fixes | 🔴 Not Ready

---

*Use this checklist before each release to ensure quality and stability.*
