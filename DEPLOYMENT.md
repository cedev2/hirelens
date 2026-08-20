# HireLens Deployment Guide

## Backend on Render

1. Push code to GitHub
2. Go to https://render.com > New > Web Service
3. Connect your repo, select `backend` folder
4. Settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Node version: match your local (check `node -v`)
5. Go to Environment tab and copy all vars from `backend/.env.render`
6. Replace placeholder values with your real ones
7. Render will deploy. Note your service URL (e.g. `https://your-app.onrender.com`)

### Code changes needed for Render (backend/src/server.ts)

Replace the `cors()` line with:
```ts
import ENV from "./config/env";

app.use(
  cors({
    origin: ENV.frontend_url,
    credentials: true,
  }),
);
```

Add health check endpoint before `export { app }`:
```ts
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});
```

Add PORT fallback in `backend/src/config/env.ts`:
```ts
port: process.env.PORT || "5001",
```

### Important: Render filesystem note
Render's free tier uses an ephemeral filesystem. Uploaded files (CVs, pictures) will be lost on redeploy. For persistent uploads, consider:
- Cloudinary
- AWS S3
- Google Cloud Storage

---

## Frontend on Vercel

1. Go to https://vercel.com > New Project
2. Import your GitHub repo
3. Framework Preset: Next.js
4. Root Directory: `frontend`
5. Go to Settings > Environment Variables and add all vars from `frontend/.env.vercel`
6. Replace `https://your-app.onrender.com` with your actual Render URL
7. Deploy

---

## MongoDB Atlas

1. Go to https://cloud.mongodb.com
2. Create a free M0 cluster
3. Database Access > Add a new user (username + password)
4. Network Access > Add IP Address > Allow Access from Anywhere (0.0.0.0/0)
5. Clusters > Connect > Connect your application
6. Copy the connection string and use it as `MONGO_URI`
7. Replace `<username>` and `<password>` in the connection string

---

## Gmail SMTP Setup

1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to https://myaccount.google.com/apppasswords
4. Generate a new app password (name it "HireLens")
5. Copy the 16-character password
6. Use your Gmail as `SMTP_USER` and `EMAIL_FROM`
7. Use the app password (not your regular password) as `SMTP_PASS`
