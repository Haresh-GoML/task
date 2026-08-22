# Quick Start Guide

## Prerequisites
- Node.js installed
- MongoDB Atlas account (or local MongoDB)
- Two terminal windows

## Step 1: Configure Environment Variables

### Backend (.env):
```env
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_super_secret_access_token_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_token_key_here
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env):
```env
VITE_API_URL=http://localhost:3000
```

## Step 2: Install Dependencies

### Backend:
```bash
cd d:\fullstack\task-manager-api
npm install
```

### Frontend:
```bash
cd d:\fullstack\task-manager-api\frontend
npm install
```

## Step 3: Run the Application

### Terminal 1 - Backend:
```bash
cd d:\fullstack\task-manager-api
npm run dev
```

Expected output:
```
Server running on http://localhost:3000
MongoDB connected successfully
```

### Terminal 2 - Frontend:
```bash
cd d:\fullstack\task-manager-api\frontend
npm run dev
```

Expected output:
```
VITE ready in XXX ms
➜  Local:   http://localhost:5173/
```

## Step 4: Test the Application

1. Open browser: http://localhost:5173
2. Click "Register here"
3. Create account: test@example.com / password123
4. Login with same credentials
5. Create tasks
6. Test edit, delete, toggle completion
7. Logout

## Quick Commands Reference

### Backend:
```bash
npm run dev      # Development with auto-reload
npm run build    # Compile TypeScript
npm start        # Production mode
```

### Frontend:
```bash
npm run dev      # Development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Troubleshooting

### "MongoDB connection failed"
→ Check MONGO_URI in backend .env

### "Cannot connect to backend"
→ Check VITE_API_URL in frontend .env
→ Ensure backend is running on port 3000

### CORS errors
→ Ensure FRONTEND_URL in backend .env matches frontend URL

### Port already in use
→ Change PORT in backend .env
→ Update VITE_API_URL in frontend .env

## Testing Multi-User Isolation

1. Open two browser windows (or use incognito)
2. Window 1: Register as userA@test.com, create tasks
3. Window 2: Register as userB@test.com, create tasks
4. Verify each user sees only their own tasks

## API Endpoints

```
POST   /auth/register     - Register new user
POST   /auth/login        - Login user
POST   /auth/refresh      - Refresh access token
POST   /auth/logout       - Logout user
GET    /tasks             - Get user's tasks
POST   /tasks             - Create task
PUT    /tasks/:id         - Update task
DELETE /tasks/:id         - Delete task
```

## Next Steps

- Read README.md for complete documentation
- Follow TESTING_GUIDE.md for comprehensive testing
- Follow DEPLOYMENT_GUIDE.md to deploy to production

## Support

For detailed information, see:
- README.md - Complete project documentation
- TESTING_GUIDE.md - Detailed testing instructions
- DEPLOYMENT_GUIDE.md - Deployment instructions
- IMPLEMENTATION_SUMMARY.md - Complete implementation details
