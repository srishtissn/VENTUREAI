# 🚀 Complete Setup Guide — VentureAI Platform

## Prerequisites
- Node.js 18+  →  https://nodejs.org
- Python 3.10+  →  https://python.org
- MongoDB Atlas account (free)  →  https://cloud.mongodb.com
- Git  →  https://git-scm.com

---

## Step 1: MongoDB Atlas Setup (5 min)

1. Go to cloud.mongodb.com → Create free cluster
2. Database Access → Add user (username + password)
3. Network Access → Add IP → Allow from Anywhere (0.0.0.0/0)
4. Connect → Drivers → Copy connection string
5. Replace `<password>` with your password

---

## Step 2: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# ML Service
cd ../ml-service
pip install -r requirements.txt
```

---

## Step 3: Environment Files

### backend/.env
```
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/venture_platform
JWT_SECRET=super_secret_key_change_me_please
ML_SERVICE_URL=http://localhost:8000
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### frontend/.env
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_ML_URL=http://localhost:8000
```

### ml-service/.env
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/venture_platform
PORT=8000
```

---

## Step 4: Start All Services

Open 3 terminal windows:

### Terminal 1 — Backend
```bash
cd backend
npm run dev
# ✅ Server on http://localhost:5000
```

### Terminal 2 — ML Service
```bash
cd ml-service
uvicorn main:app --reload --port 8000
# ✅ ML API on http://localhost:8000
```

### Terminal 3 — Frontend
```bash
cd frontend
npm start
# ✅ App on http://localhost:3000
```

---

## Step 5: Seed Demo Data (Optional)

```bash
cd backend
node scripts/seed.js
```

---

## Deployment

### Frontend → Vercel (Free)
```bash
cd frontend
npx vercel --prod
# Update REACT_APP_API_URL to your Render backend URL
```

### Backend + ML → Render (Free)

**Backend service:**
- Root: `backend/`
- Build: `npm install`
- Start: `node server.js`
- Add all .env vars in Render dashboard

**ML service:**
- Root: `ml-service/`  
- Build: `pip install -r requirements.txt`
- Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`

---

## API Endpoints Reference

### Auth
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
PUT  /api/auth/profile
POST /api/auth/mental-health
```

### Startups
```
GET  /api/startups
POST /api/startups
GET  /api/startups/:id
PUT  /api/startups/:id
GET  /api/startups/my/startups
GET  /api/startups/:id/competition
POST /api/startups/:id/analyze-video
```

### Matching
```
GET  /api/matching/startup/:id/investors
GET  /api/matching/investor/startups
POST /api/matching/swipe
POST /api/matching/startup-like
GET  /api/matching/my-matches
GET  /api/matching/cofounders/:id
```

### Analytics
```
GET /api/analytics/overview
GET /api/analytics/sectors
GET /api/analytics/sector/:sector
GET /api/analytics/simulation
```

### ML Service
```
GET  /health
POST /analyze-startup
POST /predict-success
POST /embed
POST /similarity
POST /find-competitors
POST /analyze-pitch
GET  /sector-insights/:sector
```

---

## Troubleshooting

**ML service slow on first start?**
→ Normal — scikit-learn trains on first boot (~5 sec)

**CORS errors?**
→ Check CLIENT_URL in backend .env matches your frontend URL exactly

**Socket.io not connecting?**
→ Check REACT_APP_SOCKET_URL points to backend, not ML service

**MongoDB connection refused?**
→ Check Atlas Network Access whitelist includes your IP or 0.0.0.0/0
