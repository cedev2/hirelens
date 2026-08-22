# HireLens

> An AI Recruiter system that explains, compares, and guides hiring decisions

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)

## Overview

HireLens is an AI-powered recruitment platform that revolutionizes the hiring process by leveraging artificial intelligence to screen, rank, and compare candidates. The system provides detailed insights, reasoning, and recommendations to help HR professionals make data-driven hiring decisions.

## ✨ Features

- **AI-Powered Screening**
- **Candidate Comparison**
- **Weighted Evaluation**
- **Pipeline Management**
- **Automated Workflows**
- **Interactive Onboarding**
- **Real-time Notifications**

## Tech Stack

### Frontend

- **Framework**: Next.js 16.3.1
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui, Base UI, Phantom UI
- **State Management**: Redux Toolkit, React Query
- **Forms**: React Hook Form
- **Rich Text Editor**: Tiptap
- **Charts**: Recharts
- **Icons**: Lucide React, React Icons
- **Authentication**: JWT
- **PDF Generation**: jsPDF, jsPDF-AutoTable
- **Excel Export**: xlsx-js-style
- **Onboarding**: react-joyride
- **Notifications**: Custom localStorage-based notification system

### Backend

- **Runtime**: Node.js
- **Framework**: Express 5.2.1
- **Language**: TypeScript 6.0.3
- **Database**: MongoDB with Mongoose 9.4.1
- **Authentication**: JWT, bcrypt
- **File Upload**: Multer
- **Email**: Nodemailer
- **PDF Parsing**: pdf-parse
- **CSV Processing**: csv-parser
- **Excel Processing**: xlsx
- **AI Integration**: Google Generative AI (Gemini), Groq SDK (Llama)
- **API Documentation**: Swagger UI
- **Security**: Helmet, CORS, bcrypt

## 📁 Project Structure

```
hirelens/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── public/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── utils/
│   └── dist/
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- npm
- MongoDB (local or Atlas)
- Gemini API key and/or Groq API key (for AI screening)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ndizeyedavid/hirelens.git
   cd hirelens
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables** (see [Environment Variables](#environment-variables))

5. **Start the development servers**

   Backend (in `/backend`):

   ```bash
   npm run dev
   ```

   Server runs on `http://localhost:5000`

   Frontend (in `/frontend`):

   ```bash
   npm run dev
   ```

   Server runs on `http://localhost:8080`

## Environment Variables

### Backend (.env)

```env
PORT=
MONGO_URI=

GEMINI_API_KEY=
GEMINI_MODEL=

# AI Screening performance
SCREENING_AI_CONCURRENCY=10
SCREENING_AI_RETRIES=2
SCREENING_AI_TOP_K=0

GROQ_API_KEY=
GROQ_MODEL=llama-4-scout

ENABLE_EMAILS=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=

JWT_SECRET=
JWT_EXPIRES_IN=

FRONTEND_URL=
```

### Frontend (.env)

```env
NEXT_PUBLIC_API_BASE_URL=
```

## Available Scripts

### Backend

```bash
npm run dev      # Start development server with nodemon
npm run build    # Compile TypeScript to JavaScript
npm start        # Start production server
npm run swagger  # Generate Swagger documentation
```

### Frontend

```bash
npm run dev      # Start Next.js development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## Deployment

- Frontend = Vercel
- Backend = Render
- Database = MongoDB Atlas

## Contact

For questions or support, please open an issue on GitHub. We will get to you really fast.

---

**Built with ❤️ by Group X**
