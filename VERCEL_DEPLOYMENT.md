# 🚀 Vercel Deployment Guide - Backend API

Complete guide to deploy your TypeScript + Express backend as a Vercel Serverless Function.

## 📋 What Was Changed

### Files Created:
1. **`src/app.ts`** - Separated Express app (without app.listen)
2. **`api/index.ts`** - Vercel serverless entry point
3. **`vercel.json`** - Vercel configuration
4. **`VERCEL_DEPLOYMENT.md`** - This guide

### Files Modified:
1. **`src/server.ts`** - Now imports app and only used for local dev
2. **`src/config/db.ts`** - Optimized for serverless (connection caching)
3. **`.gitignore`** - Added `.vercel` directory

### Files Unchanged:
- All routes: `src/routes/auth.ts`, `src/routes/tasks.ts`
- All models: `src/models/User.ts`, `src/models/Task.ts`, `src/models/RefreshToken.ts`
- Middleware: `src/middleware/auth.ts`
- All authentication logic (JWT, bcrypt, refresh tokens)
- All task ownership logic
- package.json dependencies

---

## 🔧 Pre-Deployment Checklist

✅ Backend builds successfully: `npm run build`  
✅ Local dev still works: `npm run dev`  
✅ MongoDB Atlas is accessible  
✅ `.env` is in `.gitignore`  
✅ Changes committed to GitHub  

---

## 📦 Step 1: Commit and Push Changes

```bash
cd d:\fullstack\task-manager-api

git add .
git commit -m "Configure backend for Vercel serverless deployment"
git push origin main
```

---

## 🌐 Step 2: Deploy Backend to Vercel

### A. Create New Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository: `Haresh-GoML/task`
4. Click **"Import"**

### B. Configure Project

**Project Name:**
```
task-manager-backend
```
(or any name you prefer)

**Framework Preset:**
```
Other
```

**Root Directory:**
```
./
```
(Leave as is, or select the root)

**Build Settings:**

- **Build Command:** Leave empty or use `npm run build`
- **Output Directory:** Leave empty
- **Install Command:** `npm install`

**Node.js Version:**
```
18.x
```
(Vercel uses Node 18 by default)

### C. Add Environment Variables

Click **"Environment Variables"** and add:

| Name | Value |
|------|-------|
| `MONGO_URI` | `mongodb+srv://knharesh2006_db_user:9Q5lLMFIkaFgWzRZ@cluster0.jlvfevk.mongodb.net/?appName=Cluster0` |
| `JWT_SECRET` | `6j0zyUP9DiOb9LAbUM7DoF0C1pFVsJbunRE5ugAATQV` |
| `JWT_REFRESH_SECRET` | `R62Palp50XTa4xVKO7fgcB6nNjGZh0eYSqCJc3w5Gzh` |
| `FRONTEND_URL` | `https://task-sepia-mu.vercel.app` |

**IMPORTANT:** 
- Use the **same values** from your local `.env` file
- Select **"All Environments"** (Production, Preview, Development)
- Click **"Add"** after each variable

### D. Deploy

Click **"Deploy"**

Wait for deployment to complete (~2-3 minutes).

---

## ✅ Step 3: Get Your Backend URL

After deployment completes, you'll see:

```
🎉 Deployment Complete!
https://task-manager-backend.vercel.app
```

**Copy this URL** - you'll need it for the frontend.

---

## 🧪 Step 4: Test Backend API

### Test Health Check

Open in browser or use curl:

```bash
https://your-backend-url.vercel.app/
```

Expected response:
```json
{
  "message": "Task Manager API is running"
}
```

### Test Register

```bash
curl -X POST https://your-backend-url.vercel.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Expected response (201):
```json
{
  "message": "User registered successfully",
  "userId": "..."
}
```

### Test Login

```bash
curl -X POST https://your-backend-url.vercel.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Expected response (200):
```json
{
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Save the accessToken for next tests!**

### Test Create Task

```bash
curl -X POST https://your-backend-url.vercel.app/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"title":"Test Task from Vercel"}'
```

Expected response (201):
```json
{
  "_id": "...",
  "title": "Test Task from Vercel",
  "done": false,
  "userId": "...",
  "createdAt": "...",
  "updatedAt": "..."
}
```

### Test Get Tasks

```bash
curl -X GET https://your-backend-url.vercel.app/tasks \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Expected response (200):
```json
[
  {
    "_id": "...",
    "title": "Test Task from Vercel",
    "done": false,
    "userId": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

### Test Update Task

```bash
curl -X PUT https://your-backend-url.vercel.app/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"title":"Updated Task","done":true}'
```

### Test Delete Task

```bash
curl -X DELETE https://your-backend-url.vercel.app/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Expected response (200):
```json
{
  "message": "Task deleted successfully"
}
```

### Test Logout

```bash
curl -X POST https://your-backend-url.vercel.app/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

Expected response (200):
```json
{
  "message": "Logout successful"
}
```

---

## 🔗 Step 5: Connect Frontend to Backend

### A. Update Frontend Environment Variable on Vercel

1. Go to your **Frontend project** on Vercel: `task-sepia-mu`
2. Go to **Settings** → **Environment Variables**
3. Find `VITE_API_URL` or add it if missing
4. Update/Set value to:
   ```
   https://your-backend-url.vercel.app
   ```
5. Select **"Production"**, **"Preview"**, and **"Development"**
6. Click **"Save"**

### B. Redeploy Frontend

After updating the environment variable:

1. Go to **Deployments** tab
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**
4. Wait for redeployment (~1 minute)

---

## 🧪 Step 6: Test Full Stack Flow

### Test from Frontend UI

1. Open: `https://task-sepia-mu.vercel.app`
2. Click **"Register here"**
3. Register: `yourname@example.com` / `password123`
4. Should redirect to login
5. Login with same credentials
6. Should redirect to Tasks page
7. Create a task: "Test from deployed app"
8. Task should appear in list
9. Edit task
10. Delete task
11. Click **"Logout"**
12. Should redirect to login

### Test Browser Refresh Persistence

1. Login to tasks page
2. **Refresh the browser** (F5)
3. Should **stay on tasks page** ✅
4. Should **not redirect to login** ✅
5. Tasks should still be visible ✅

### Test Multi-User Isolation

**User A:**
1. Register: `userA@test.com` / `pass123`
2. Login
3. Create 2 tasks
4. Logout

**User B:**
1. Register: `userB@test.com` / `pass456`
2. Login
3. Create 1 task
4. Should **only see User B's 1 task**
5. Should **NOT see User A's tasks** ✅

---

## 🎯 Final Architecture

```
Frontend (Vercel)
https://task-sepia-mu.vercel.app
         ↓
    HTTPS Requests
         ↓
Backend (Vercel Serverless)
https://your-backend-url.vercel.app
         ↓
    MongoDB Atlas
```

---

## 🔐 API Endpoints (Production)

All endpoints are now at:

```
https://your-backend-url.vercel.app
```

### Authentication:
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user

### Tasks (Protected):
- `GET /tasks` - Get user's own tasks
- `POST /tasks` - Create task
- `PUT /tasks/:id` - Update task (if owned)
- `DELETE /tasks/:id` - Delete task (if owned)

### Health Check:
- `GET /` - API health check

---

## 🐛 Troubleshooting

### Backend returns 500 error

**Check Vercel logs:**
1. Go to backend project on Vercel
2. Click **"Functions"** tab
3. Click on the function
4. Check error logs

**Common issues:**
- MongoDB connection failed → Check MONGO_URI
- JWT verification failed → Check JWT_SECRET and JWT_REFRESH_SECRET
- CORS error → Check FRONTEND_URL matches your frontend URL

### Frontend can't connect to backend

**Check:**
1. Frontend `VITE_API_URL` is set correctly
2. Frontend was redeployed after changing env var
3. Backend is deployed and responding to health check
4. No typos in the backend URL

### Database connection issues

**Check:**
1. MongoDB Atlas is accessible
2. MONGO_URI is correct
3. IP whitelist includes `0.0.0.0/0` (allow all)
4. Database user has read/write permissions

### CORS errors

**Check:**
1. `FRONTEND_URL` in backend env vars matches frontend URL
2. No trailing slash in URLs
3. `credentials: true` is set in CORS config

---

## 📊 Environment Variables Summary

### Backend (Vercel):
```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
FRONTEND_URL=https://task-sepia-mu.vercel.app
```

### Frontend (Vercel):
```env
VITE_API_URL=https://your-backend-url.vercel.app
```

---

## 🎉 Success Checklist

- ✅ Backend deployed to Vercel
- ✅ Health check returns 200 OK
- ✅ Register works
- ✅ Login works and returns JWT tokens
- ✅ Create task works
- ✅ Get tasks returns only user's tasks
- ✅ Update task works
- ✅ Delete task works
- ✅ Logout revokes refresh token
- ✅ Frontend connected to backend
- ✅ Browser refresh keeps user logged in
- ✅ Multi-user isolation works
- ✅ No CORS errors
- ✅ All authentication flows working

---

## 🚀 Local Development Still Works

To run locally after these changes:

```bash
# Backend
npm run dev

# Frontend
cd frontend
npm run dev
```

Everything works exactly the same locally! The changes only affect deployment.

---

## 📝 Notes

- Vercel automatically handles HTTPS certificates
- Serverless functions have cold start (~1-2 seconds on first request)
- MongoDB connection is cached between requests
- All existing functionality is preserved
- No changes to authentication or task logic

**Your full-stack app is now live! 🎉**
