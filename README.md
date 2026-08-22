# 🚀 Full-Stack Task Manager with Authentication

A complete full-stack task management application with user authentication, built with **React + TypeScript** frontend and **Express + TypeScript** backend.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

## ✨ Features

- ✅ **User Registration & Login** with secure JWT authentication
- ✅ **JWT Access Token** (15 minutes expiry) with automatic refresh
- ✅ **JWT Refresh Token** (7 days expiry) stored securely
- ✅ **Secure Logout** with token revocation
- ✅ **User-Scoped Task Operations** - Users can only see their own tasks
- ✅ **Complete CRUD Operations** for tasks
- ✅ **MongoDB Integration** with Mongoose ODM
- ✅ **Full TypeScript** on both frontend and backend
- ✅ **Password Hashing** with bcrypt
- ✅ **Protected Routes** with authentication middleware
- ✅ **Automatic Token Refresh** on expiry
- ✅ **Persistent Authentication** across page refreshes
- ✅ **Modern UI** with clean, responsive design

## 🏗️ Project Structure

```
task-manager-api/
├── src/                          # Backend TypeScript Source
│   ├── config/
│   │   └── db.ts                 # MongoDB connection
│   ├── models/
│   │   ├── User.ts               # User model
│   │   ├── Task.ts               # Task model with userId
│   │   └── RefreshToken.ts       # Refresh token model
│   ├── middleware/
│   │   └── auth.ts               # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.ts               # Auth routes
│   │   └── tasks.ts              # Task routes (user-scoped)
│   └── server.ts                 # Express app entry point
│
├── frontend/                     # React TypeScript Frontend
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
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── .env.example
│
├── .env.example                  # Backend environment template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB Atlas** account (or local MongoDB)
- **npm** or **yarn**

### 1. Clone the Repository

```bash
git clone git@github.com:Haresh-GoML/task.git
cd task
```

### 2. Backend Setup

```bash
# Install backend dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env and add your MongoDB URI and JWT secrets
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_access_token_secret
# JWT_REFRESH_SECRET=your_refresh_token_secret
# PORT=3000
# FRONTEND_URL=http://localhost:5173
```

**Generate secure JWT secrets:**
```bash
# On Linux/Mac
openssl rand -base64 32

# Or use online tool: https://randomkeygen.com/
```

```bash
# Run backend in development mode
npm run dev

# Or build and run in production mode
npm run build
npm start
```

Backend will run on `http://localhost:3000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env if needed (default should work)
# VITE_API_URL=http://localhost:3000

# Run frontend in development mode
npm run dev
```

Frontend will run on `http://localhost:5173`

### 4. MongoDB Setup

**Option A: MongoDB Atlas (Recommended for beginners)**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (Free M0 tier)
4. Create a database user
5. Whitelist your IP address (or use 0.0.0.0/0 for development)
6. Get your connection string
7. Add it to `.env` as `MONGO_URI`

**Option B: Local MongoDB**

```bash
# Install MongoDB locally
# Then use connection string:
MONGO_URI=mongodb://localhost:27017/task-manager
```

## 📡 API Endpoints

### Authentication

```
POST   /auth/register     - Register new user
POST   /auth/login        - Login user
POST   /auth/refresh      - Refresh access token
POST   /auth/logout       - Logout user
```

### Tasks (All Protected)

```
GET    /tasks             - Get user's own tasks
POST   /tasks             - Create task
PUT    /tasks/:id         - Update task (if owned by user)
DELETE /tasks/:id         - Delete task (if owned by user)
```

## 🔐 Authentication Flow

```
1. User registers → Password hashed → Stored in MongoDB
2. User logs in → Password verified → JWT tokens generated
3. Access token (15min) + Refresh token (7d) returned
4. Frontend stores tokens in localStorage
5. Protected requests include: Authorization: Bearer <accessToken>
6. Backend verifies token → Extracts userId → Sets req.user
7. All queries filtered by req.user.userId
8. Access token expires → Automatically refresh using refresh token
9. User logs out → Refresh token revoked from MongoDB
```

## 🔒 Security Features

- ✅ **Password Hashing** with bcrypt (10 rounds)
- ✅ **JWT Access Tokens** (short-lived, 15 minutes)
- ✅ **JWT Refresh Tokens** (long-lived, 7 days, stored in DB)
- ✅ **Token Revocation** on logout
- ✅ **Automatic Token Refresh** on 401 errors
- ✅ **User-Scoped Operations** - Tasks filtered by userId from JWT
- ✅ **CORS Configuration** to allow only specified frontend
- ✅ **Environment Variables** for sensitive data
- ✅ **Never Trusts Client-Side userId** - Always from verified JWT

### Critical Security Implementation

```typescript
// ❌ WRONG - Trusts client
const { userId } = req.body;
await Task.find({ userId });

// ✅ CORRECT - Uses JWT
await Task.find({ userId: req.user.userId });
```

## 🧪 Testing

### Test Authentication Flow

```bash
# Register User
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Save the accessToken from response

# Create Task
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"title":"Learn TypeScript"}'

# Get Tasks
curl -X GET http://localhost:3000/tasks \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Test Multi-User Isolation

1. Register User A and create tasks
2. Register User B and create tasks
3. Login as User A → Should only see User A's tasks
4. Login as User B → Should only see User B's tasks
5. User B cannot access/update/delete User A's tasks ✅

## 🚢 Deployment

### Backend (Render/Heroku)

1. Push code to GitHub
2. Create account on [Render](https://render.com)
3. Create new Web Service
4. Connect GitHub repository
5. Set environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `PORT`
   - `FRONTEND_URL`
6. Deploy!

### Frontend (Vercel/Netlify)

1. Create account on [Vercel](https://vercel.com)
2. Import GitHub repository
3. Set root directory to `frontend`
4. Set environment variable:
   - `VITE_API_URL` = your deployed backend URL
5. Deploy!

## 📚 Technologies Used

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables

### Frontend
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **React Router DOM** - Client-side routing
- **Vite** - Build tool & dev server
- **CSS3** - Styling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Environment Variables

### Backend `.env`

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/
JWT_SECRET=your_super_secret_access_token_key
JWT_REFRESH_SECRET=your_super_secret_refresh_token_key
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:3000
```

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Haresh**

- GitHub: [@Haresh-GoML](https://github.com/Haresh-GoML)

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---

**Made with ❤️ using TypeScript, React, and Express**
