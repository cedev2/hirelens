# Backend

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Database Structure](#database-structure)
- [API Endpoints](#api-endpoints)
- [AI Integration](#ai-integration)
- [Authentication](#authentication)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)

## 🎯 Overview

This is the backend API for HireLens, an AI-powered recruitment platform developed by Group X. It provides RESTful APIs for:

- User authentication and authorization
- Job posting management
- Candidate profile management
- AI-powered candidate screening and ranking
- Hiring pipeline management
- Email automation
- File upload and processing

**What we're solving:** https://www.youtube.com/shorts/vDfTbBMQCcI

## 🛠 Tech Stack

### Core Framework

- **Node.js** - JavaScript runtime
- **Express 5.2.1** - Web framework
- **TypeScript 6.0.2** - Type-safe JavaScript

### Database

- **MongoDB** - NoSQL database
- **Mongoose 9.4.1** - ODM for MongoDB

### Authentication & Security

- **Passport.js 0.7.0** - Authentication middleware
- **Passport Google OAuth 2.0.0** - Google OAuth strategy
- **JWT 9.0.3** - JSON Web Tokens
- **bcrypt 6.0.0** - Password hashing
- **Helmet 8.1.0** - Security headers
- **CORS 2.8.6** - Cross-origin resource sharing

### AI Integration

- **@google/genai 1.49.0** - Google Generative AI SDK
- **Google AI (Gemma-4-31b-it)** - AI model for candidate screening

### File Processing

- **Multer 1.4.5-lts.1** - File upload middleware
- **pdf-parse 1.1.4** - PDF parsing
- **csv-parser 3.0.0** - CSV parsing
- **xlsx 0.18.5** - Excel processing
- **mime 4.1.0** - MIME type detection

### Email

- **Nodemailer 8.0.5** - Email sending

### File Upload Service

- **UploadThing 7.7.4** - Cloud file storage

### API Documentation

- **Swagger UI Express 5.0.1** - API documentation
- **Swagger Autogen 2.23.7** - Auto-generate Swagger docs

### Utilities

- **Axios 1.7.2** - HTTP client
- **dotenv 17.4.1** - Environment variables
- **Morgan 1.10.1** - HTTP request logger
- **Google Auth Library 10.3.0** - Google authentication

### Development

- **ts-node 10.9.2** - TypeScript execution
- **Nodemon 3.1.14** - Auto-restart on changes
- **TypeScript type definitions** for all major packages

## 🗄 Database Structure

### 1. Jobs Collection

```typescript
{
  _id: ObjectId;
  title: string;
  description: string;
  requirements: string[];
  weights: {
    skills: number;      // 0-1 (decimal)
    experience: number;  // 0-1 (decimal)
    education: number;   // 0-1 (decimal)
  };
  deadline: Date;
  jobType: "full-time" | "part-time";
  locationType: "on-site" | "hybrid" | "remote";
  status: "open" | "closed" | "draft";
  salary: {
    amount: number;
    currency: "USD" | "RWF";
  };
  benefits: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. Users Collection

```typescript
{
  _id: ObjectId;
  userId: ObjectId;  // Reference to UserAuth
  role: "admin" | "talent";
  firstName: string;
  lastName: string;
  email: string;
  headline?: string;
  bio?: string;
  location?: string;
  skills: {
    name: string;
    level: "beginner" | "intermediate" | "advanced" | "expert";
  }[];
  languages?: {
    language: string;
    proficiency: "basic" | "conversational" | "fluent" | "native";
  }[];
  experience: {
    title: string;
    company: string;
    startDate: Date;
    endDate?: Date;
    description: string;
  }[];
  education: {
    institution: string;
    degree: string;
    field: string;
    startDate: Date;
    endDate?: Date;
  }[];
  certifications?: {
    name: string;
    issuer: string;
    date: Date;
  }[];
  projects: {
    title: string;
    description: string;
    technologies: string[];
    link?: string;
  }[];
  availability: {
    status: "available" | "not-available" | "open-to-opportunities";
    noticePeriod?: string;
  };
  socialLinks?: string[];
  rawCv?: any;  // Parsed CV data
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. UserAuth Collection

```typescript
{
  _id: ObjectId;
  googleId: string;
  email: string;
  role: "admin" | "talent";
  createdAt: Date;
}
```

### 4. Screening Collection

```typescript
{
  _id: ObjectId;
  jobId: ObjectId;
  comparisonSummary?: string;  // AI-generated overall summary
  candidates: {
    candidateId: ObjectId;
    rank: number;
    matchScore: number;  // 0-100
    confidence: "high" | "medium" | "low";
    strengths: string[];
    gaps: string[];
    reasoning: string;
    finalRecommendation: string;
    comparisonNotes?: string;  // Unique value proposition
  }[];
  pipelineState?: {
    currentStep: "results" | "shortlist" | "interview_email" | "interview_manage" | "contract_generate" | "contract_email" | "complete";
    shortlistedIds: ObjectId[];
    interviewCandidates: {
      candidateId: ObjectId;
      status: "scheduled" | "completed" | "cancelled";
      scheduledDate?: Date;
      notes?: string;
    }[];
    contractCandidates: {
      candidateId: ObjectId;
      contractGenerated: boolean;
      contractSent: boolean;
      contractSigned: boolean;
    }[];
    completedHires: ObjectId[];
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### 5. Applications Collection

```typescript
{
  _id: ObjectId;
  jobId: ObjectId;
  candidateId: ObjectId;
  status: "pending" | "reviewed" | "shortlisted" | "rejected" | "hired";
  appliedAt: Date;
  updatedAt: Date;
}
```

### 6. AnalysisLogs Collection

```typescript
{
  _id: ObjectId;
  jobId: ObjectId;
  screeningId?: ObjectId;
  prompt: string;
  response: object;
  model: string;
  tokensUsed?: number;
  createdAt: Date;
}
```

## 🔌 API Endpoints

### Authentication

- `POST /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - Google OAuth callback
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout user

### Jobs

- `GET /jobs` - Get all jobs
- `GET /jobs/:jobId` - Get job by ID
- `POST /jobs` - Create new job
- `PUT /jobs/:jobId` - Update job
- `DELETE /jobs/:jobId` - Delete job

### Candidates/Talents

- `GET /talents` - Get all talents
- `GET /talents/:talentId` - Get talent by ID
- `PUT /talents/:talentId` - Update talent profile
- `POST /talents/:talentId/upload-cv` - Upload and parse CV

### Screening

- `POST /screening` - Initiate AI screening
- `GET /screening/:screeningId` - Get screening results
- `PUT /screening/:screeningId/pipeline` - Update pipeline state
- `GET /external-screening/results/:screeningId/detailed` - Get external screening results

### Applications

- `POST /applications` - Submit job application
- `GET /applications/candidate/:candidateId` - Get candidate applications
- `GET /applications/job/:jobId` - Get job applications
- `PUT /applications/:applicationId/status` - Update application status

### File Upload

- UploadThing endpoints for file uploads

## 🤖 AI Integration

### Google Generative AI (Gemma-4-31b-it)

The backend uses Google's Generative AI to power candidate screening and resume parsing.

#### Resume Parsing Prompt

```yaml
Extract the following information from the resume:
  - Skills (with proficiency levels)
  - Years of experience
  - Education (degrees, institutions, dates)
  - Projects (title, description, technologies)
  - Work experience (title, company, dates, description)
  - Certifications
  - Languages
  - Contact information
```

#### Ranking & Reasoning Prompt

```yaml
You are a senior recruiter with expertise in technical hiring.

Job Requirements:
  - Title: {jobTitle}
  - Description: {jobDescription}
  - Requirements: {requirements}
  - Weights: Skills {skillsWeight}%, Experience {experienceWeight}%, Education {educationWeight}%

Candidates:
  {candidateData}

Tasks:
1. Rank the top 10 candidates based on job fit
2. Score each candidate (0-100) considering the weighted criteria
3. For each candidate provide:
   - Strengths (key matching skills and experiences)
   - Gaps (missing or weak areas)
   - Reasoning (detailed analysis of fit)
   - Comparison to top candidate (why they're not #1)
   - Confidence level (high/medium/low)
   - Final recommendation (Highly Recommend/Recommend/Consider/Not Suitable)

Be strict and objective. Do not give similar scores unless justified by clear differences.
Provide a comparison summary highlighting overall candidate pool quality.
```

### AI Features

- **Resume Parsing**: Automatically extract structured data from PDF/Word resumes
- **Candidate Ranking**: AI-powered scoring based on job requirements
- **Comparison Analysis**: Detailed reasoning for candidate comparisons
- **Confidence Scoring**: Assess reliability of AI recommendations
- **Pipeline Summaries**: Overall analysis of candidate pool

## 🔐 Authentication

### Google OAuth Flow

1. User initiates login via frontend
2. Redirects to Google OAuth consent screen
3. On success, Google redirects to backend callback
4. Backend exchanges OAuth token for user info
5. Backend checks/creates user in database
6. Backend issues JWT token
7. Token stored in httpOnly cookie
8. Protected routes validate JWT on each request

### JWT Strategy

- **Secret**: Configured via environment variable
- **Expiration**: 7 days (configurable)
- **Storage**: httpOnly cookie for security
- **Payload**: User ID, role, email

### Protected Routes

Middleware checks for valid JWT token and verifies user role for admin-only routes.

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/        # Request handlers
│   │   ├── authController.ts
│   │   ├── jobController.ts
│   │   ├── talentController.ts
│   │   ├── screeningController.ts
│   │   └── applicationController.ts
│   ├── models/            # Mongoose schemas
│   │   ├── User.ts
│   │   ├── UserAuth.ts
│   │   ├── Job.ts
│   │   ├── Screening.ts
│   │   └── Application.ts
│   ├── routes/            # Express route definitions
│   │   ├── auth.ts
│   │   ├── jobs.ts
│   │   ├── talents.ts
│   │   ├── screening.ts
│   │   └── applications.ts
│   ├── middleware/        # Custom middleware
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── upload.ts
│   ├── utils/             # Utility functions
│   │   ├── ai.ts          # AI integration
│   │   ├── pdfParser.ts   # PDF parsing
│   │   └── email.ts       # Email sending
│   ├── config/            # Configuration files
│   │   ├── database.ts
│   │   └── google.ts
│   ├── swagger.ts         # Swagger documentation
│   ├── seed.ts            # Database seeding
│   └── index.ts           # Application entry point
├── dist/                  # Compiled JavaScript
├── .env                   # Environment variables
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v20 or higher)
- MongoDB (local or Atlas)
- Google Cloud Project with AI API enabled
- Google OAuth credentials

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**
   Create a `.env` file in the root directory (see [Environment Variables](#environment-variables))

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Access API**
   API runs on `http://localhost:5000`
   Swagger docs at `http://localhost:5000/api-docs`

## 🔐 Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/hirelens
# or MongoDB Atlas: mongodb+srv://user:pass@cluster.mongodb.net/hirelens

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# Google AI
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password

# UploadThing
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id
```

## 📦 Available Scripts

```bash
npm run dev      # Start development server with nodemon
npm run build    # Compile TypeScript to JavaScript
npm start        # Start production server
npm run swagger  # Generate Swagger documentation
npm run seed     # Seed database with sample data
```

## 🌐 Deployment

### Render (Recommended)

1. **Connect repository**
   - Link GitHub repository to Render

2. **Configure environment variables**
   - Add all environment variables in Render dashboard

3. **Deploy**
   - Automatic deployment on push to main branch

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Production Considerations

- Use MongoDB Atlas for production database
- Set `NODE_ENV=production`
- Use strong JWT secrets
- Enable HTTPS
- Configure proper CORS origins
- Set up monitoring and logging
- Use environment-specific configurations

---

**Built with ❤️ by Group X**
