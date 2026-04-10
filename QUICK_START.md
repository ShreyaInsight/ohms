# MedCore HMS - Quick Start Guide

## 🚀 Getting Started (5 minutes)

### Option 1: Using Docker (Recommended)
**Requires: Docker Desktop installed and running**

```bash
cd c:\Users\HP\ohms
docker compose up
```

Open browser to: http://localhost:4000

### Option 2: Using Local PostgreSQL
**Requires: PostgreSQL installed locally**

```bash
# Terminal 1 - Start the backend
cd c:\Users\HP\ohms\backend
npm run dev

# Terminal 2 - Initialize database (first time only)
cd c:\Users\HP\ohms\backend
npm run init-db
```

Open browser to: http://localhost:4000

### Option 3: Using Docker for DB Only
```bash
# Start just PostgreSQL
cd c:\Users\HP\ohms
docker compose up -d postgres

# Wait 2-3 seconds, then:
cd backend
npm run init-db
npm run dev
```

Open browser to: http://localhost:4000

---

## 🔐 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@medcore.local | Admin@123 |
| Reception | reception@medcore.local | Reception@123 |
| Doctor | doctor@medcore.local | Doctor@123 |
| Lab Tech | lab@medcore.local | Lab@123 |
| Pharmacy | pharmacy@medcore.local | Pharmacy@123 |

---

## 🔧 Troubleshooting

### "Cannot connect to database"
```bash
# Check PostgreSQL is running:
docker ps | grep postgres
# Or restart: docker compose up postgres
```

### "Port 4000 already in use"
```bash
# Change port in backend/.env:
PORT=5000
# Restart: npm run dev
```

### "Tables don't exist"
```bash
cd backend
npm run init-db
```

### Can't login
- Ensure you ran `npm run init-db`
- Check browser console (F12) for errors

---

**Ready to go?** Run `docker compose up` now! 🎉

Need help? Check SETUP_AND_USAGE.md for detailed features.
