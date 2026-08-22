# Full-Stack Task Manager with Authentication

A complete full-stack task management application with user authentication, built with React + TypeScript frontend and Express + TypeScript backend.

## Features

- ✅ User Registration & Login
- ✅ JWT Access Token (15 minutes expiry)
- ✅ JWT Refresh Token (7 days expiry)
- ✅ Secure Logout with Token Revocation
- ✅ User-Scoped Task CRUD Operations
- ✅ MongoDB Integration with Mongoose
- ✅ TypeScript on Both Frontend & Backend
- ✅ Password Hashing with bcrypt
- ✅ Protected Routes & Authentication Middleware

## Project Structure

```
task-manager-api/
├── src/                      # Backend source (TypeScript)
│   ├── config/
│   │   └── db.ts             # MongoDB connection
│   ├── models/
│   │   ├── User.ts           # User model
│   │   ├── Task.ts           # Task model (with userId)
│   │   └── RefreshToken.ts   # Refresh token model
│   ├── middleware/
│   │   └── auth.ts           # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.ts           # Auth routes (register, login, refresh, logout)
│   │   └── tasks.ts          # Task routes (CRUD with user ownership)
│   └── server.ts             # Express app entry point
├── frontend/                 # React frontend (TypeScript)
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── pages/
│   │   │   ├── Register.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Tasks.tsx
│   │   ├── services/
│   │   │   └── api.ts        # API service for auth & tasks
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── main.tsx
│   └── .env                  # Frontend environment variables
├── .env                      # Backend environment variables
├── .gitignore
├── tsconfig.json
├── package.json
└── README.md
```

## Environment Variables

### Backend (.env)
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB
- npm or yarn

### Backend Setup

1. Install backend dependencies:
```bash
cd task-manager-api
npm install
```

2. Install TypeScript dependencies:
```bash
npm install --save-dev typescript @types/express @types/node @types/bcrypt @types/cors @types/jsonwebtoken ts-node-dev
```

3. Configure environment variables in `.env`

4. Run backend:
```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

Backend will run on `http://localhost:3000`

### Frontend Setup

1. Install frontend dependencies:
```bash
cd frontend
npm install
```

2. Configure frontend environment variable in `.env`

3. Run frontend:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication Endpoints

#### Register
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

#### Refresh Token
```
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token"
}

Response:
{
  "message": "Access token refreshed successfully",
  "accessToken": "new_jwt_token"
}
```

#### Logout
```
POST /auth/logout
Content-Type: application/json

{
  "refreshToken": "refresh_token"
}
```

### Task Endpoints (All require Authorization header)

#### Get All Tasks (User's own tasks only)
```
GET /tasks
Authorization: Bearer <access_token>
```

#### Create Task
```
POST /tasks
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Learn React"
}
```

#### Update Task
```
PUT /tasks/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Learn TypeScript",
  "done": true
}
```

#### Delete Task
```
DELETE /tasks/:id
Authorization: Bearer <access_token>
```

## User Ownership & Security

### CRITICAL Security Features:
1. **userId from JWT**: All task operations use `req.user.userId` from the verified JWT, NEVER from request body
2. **Scoped Queries**: Tasks are filtered by userId:
   - `GET /tasks` → Returns only current user's tasks
   - `PUT /tasks/:id` → Updates only if task belongs to user
   - `DELETE /tasks/:id` → Deletes only if task belongs to user
3. **Token Security**:
   - Access tokens expire in 15 minutes
   - Refresh tokens stored in MongoDB
   - Logout revokes refresh tokens
4. **Password Security**:
   - Passwords hashed with bcrypt (10 rounds)
   - Never returned in API responses

## Testing Multi-User Isolation

### Test with TWO users:

1. **Register User A**
   - Register with `userA@test.com`
   - Login and create 2 tasks
   - Verify you see only your 2 tasks

2. **Register User B**
   - Register with `userB@test.com`
   - Login and create 1 task
   - Verify you see only your 1 task (NOT User A's tasks)

3. **Verify Isolation**
   - User B should NOT be able to:
     - See User A's tasks
     - Update User A's tasks
     - Delete User A's tasks

## Deployment

### Backend Deployment (Render/Heroku)

1. Build the TypeScript code:
```bash
npm run build
```

2. Set environment variables in hosting platform:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `PORT`
   - `FRONTEND_URL` (deployed frontend URL)

3. Start command: `npm start`

### Frontend Deployment (Vercel/Netlify)

1. Build the frontend:
```bash
npm run build
```

2. Set environment variable:
   - `VITE_API_URL` (deployed backend URL)

3. Deploy the `dist` folder

### MongoDB Deployment

Use MongoDB Atlas:
1. Create a cluster
2. Create a database user
3. Whitelist IP addresses
4. Get connection string
5. Update `MONGO_URI` in backend `.env`

## Technologies Used

### Backend
- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- bcrypt
- jsonwebtoken
- cors
- dotenv

### Frontend
- React 19
- TypeScript
- React Router DOM
- Vite
- CSS3

## Lab 2 Requirements Checklist

✅ **Requirement 1**: Wire up register/login forms calling POST /auth/register and POST /auth/login
✅ **Requirement 2**: Store JWT access token and send as Authorization: Bearer <token> on every protected request
✅ **Requirement 3**: Scope every task fetch/create/update/delete to req.user.userId on backend
✅ **Requirement 4**: Ready for deployment (environment variables configured, build scripts ready)

## License

MIT
