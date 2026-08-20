<p align="center">
  <img width="231" height="89" alt="logo-light" src="https://github.com/user-attachments/assets/acdaa293-c80c-439b-b483-7fa8d254e516" />
</p>

<p align="center">
  <img src="https://deploy-badge.vercel.app/vercel/hirelens" alt="Vercel Deploy"></img>
  &nbsp; &nbsp;
  <img src="https://img.shields.io/badge/Render-Deploying-blue?logo=render&style=for-the-badge" alt="Render Deploy"></img>
</p>

---

# HireLens

> An AI Recruiter system that explains, compares, and guides hiring decisions

<img width="1902" height="869" alt="image" src="https://github.com/user-attachments/assets/a98cfdd8-3556-418b-a4b5-7b1b1f05bd9a" />

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

**What we're solving:** https://www.youtube.com/shorts/vDfTbBMQCcI

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

- **Framework**: Next.js 16.2.3
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui, Base UI, Phantom UI
- **State Management**: Redux Toolkit, React Query
- **Forms**: React Hook Form
- **Rich Text Editor**: Tiptap
- **Charts**: Recharts
- **Icons**: Lucide React, React Icons
- **Authentication**: Google OAuth, JWT
- **File Upload**: UploadThing
- **PDF Generation**: jsPDF, jsPDF-AutoTable
- **Excel Export**: xlsx-js-style
- **Onboarding**: react-joyride
- **Notifications**: Custom localStorage-based notification system

### Backend

- **Runtime**: Node.js
- **Framework**: Express 5.2.1
- **Language**: TypeScript 6.0.2
- **Database**: MongoDB with Mongoose 9.4.1
- **Authentication**: Passport.js, JWT, Google OAuth
- **File Upload**: Multer, UploadThing
- **Email**: Nodemailer
- **PDF Parsing**: pdf-parse
- **CSV Processing**: csv-parser
- **Excel Processing**: xlsx
- **AI Integration**: Google Generative AI (Gemma-4-31b-it)
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
- Google Cloud Project (for AI and OAuth)

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
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=

# JWT
JWT_SECRET=
JWT_EXPIRE=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# Google AI
GOOGLE_AI_API_KEY=

# Email (Nodemailer + Google SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=

# UploadThing
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=
```

### Frontend (.env)

```env
# API
NEXT_PUBLIC_API_URL=

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=

# UploadThing
NEXT_PUBLIC_UPLOADTHING_APP_ID=
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

**Built with ❤️ by Code01**




we need to check how the job submission flow what i need is when the job cretated all the filde from the job during the appying all those filder must be on the applicanrt dashbord i f is cv upload be able to uplaod if is the exprience ,certificate make sure all those field are on the applicant appplying form for better that will be submit on the admin and be in databse in order when we need to screening all those applied on the job to be easy depend on they form information