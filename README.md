# Chaos Tasks ⚡

Chaos Tasks is an interesting gamified task verification application where users complete weird, real-world tasks and prove them via photo uploads. An AI Judge (Groq-powered) evaluates the proof and awards chaos points.

## 🚀 Project Overview

The project consists of two main parts:
- **Backend**: Node.js Express server with SQLite for lightning-fast data persistence.
- **Frontend**: Next.js 14 application with a cinematic, glassmorphic UI.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Authentication**: NextAuth.js (Credentials & Social)
- **Styling**: Tailwind CSS + Lucide Icons
- **Animations**: CSS Keyframes + Framer Motion (planned/subtle)
- **API Client**: Axios

### Backend
- **Runtime**: Node.js + Express
- **Database**: SQLite (`better-sqlite3`)
- **AI Integration**: Groq API (for task verification)
- **Security**: Bcrypt (hashing), JWT (session tokens), Express Rate Limit

---

## ⚙️ Setup Instructions

Follow these steps to get the project running on your local machine.

### 1. Clone the Repository
```bash
git clone <repository-url>
cd chaos-tasks
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd chaos-game-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `chaos-game-backend` folder (you can use `.env.example` as a template):
   ```env
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   JWT_SECRET=your_jwt_secret_here
   GROQ_API_KEY=your_groq_api_key_here
   HF_TOKEN=your_huggingface_token_if_needed
   NODE_ENV=development
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```
   The server will run on [http://localhost:5000](http://localhost:5000).

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd chaos-game-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the `chaos-game-frontend` folder (you can use `.env.example` as a template):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret_here
   
   # Optional for Social Login
   GOOGLE_CLIENT_ID=your_google_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_google_secret
   ```
4. Start the frontend application:
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

---

## 📂 Project Structure

### Backend (`/chaos-game-backend`)
- `src/index.js`: Main entry point and global routes.
- `src/routes/`: API endpoints (auth, tasks, sessions, rewards).
- `src/database/db.js`: SQLite schema and connection logic.
- `data/`: Contains the `chaos_game.db` SQLite file.
- `uploads/`: Temporary storage for user-uploaded proof images.

### Frontend (`/chaos-game-frontend`)
- `app/`: Next.js App Router files and main layout.
- `components/`: Reusable UI components (Header, TabBar, etc.).
- `components/screens/`: Main view components (Home, Spin, Leaderboard, Dashboard).
- `lib/`: API utility functions and helpers.
- `public/`: Static assets.

---

## 🛡️ Key Features
- **AI Verification**: Real-time image analysis using Large Multimodal Models via Groq.
- **Dynamic Leaderboard**: Global ranking based on chaos points.
- **Session Persistence**: Anonymous point tracking that syncs once you sign up.
- **Chaos Events**: Intentional UI glitches and "chaos triggers" for immersive gameplay.

## 🤝 Contributing
1. Create a feature branch.
2. Ensure your code follows the established glassmorphic design system.
3. Submit a PR with detailed notes on changes.

Enjoy chaos task!
---


