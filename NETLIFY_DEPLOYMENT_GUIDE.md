# 🚀 Netlify Deployment Guide - Step by Step

All necessary code changes have been made! Follow these steps to deploy your app.

## ✅ Changes Already Made

1. ✅ Updated `frontend/src/App.js` - Now uses environment variable for API URL
2. ✅ Created `frontend/netlify.toml` - Netlify configuration file
3. ✅ Created `frontend/public/_redirects` - React routing support
4. ✅ Updated `backend/app.py` - CORS configured for Netlify domains

---

## 📋 Step-by-Step Deployment Instructions

### STEP 1: Push Code to GitHub

1. **Open PowerShell/Terminal** in your project folder:
   ```powershell
   cd "c:\Random Projects\sticker_making_and_video_editing"
   ```

2. **Initialize Git** (if not already done):
   ```powershell
   git init
   ```

3. **Create a GitHub Repository:**
   - Go to [github.com](https://github.com)
   - Click the **"+"** icon → **"New repository"**
   - Name it: `whatsapp-sticker-maker` (or any name you like)
   - Choose **Public** or **Private**
   - **DO NOT** initialize with README
   - Click **"Create repository"**

4. **Push your code:**
   ```powershell
   git add .
   git commit -m "Ready for Netlify deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```
   *(Replace YOUR_USERNAME and YOUR_REPO_NAME with your actual GitHub username and repo name)*

---

### STEP 2: Deploy Frontend to Netlify

1. **Sign up/Login to Netlify:**
   - Go to [netlify.com](https://www.netlify.com)
   - Click **"Sign up"** → Choose **"Sign up with GitHub"**
   - Authorize Netlify to access your GitHub account

2. **Create New Site:**
   - Click **"Add new site"** → **"Import an existing project"**
   - Click **"Deploy with GitHub"**
   - If prompted, authorize Netlify again
   - Select your repository from the list

3. **Configure Build Settings:**
   - **Base directory:** `frontend`
   - **Build command:** `npm install && npm run build`
   - **Publish directory:** `frontend/build`
   
   *(These should auto-detect from netlify.toml, but verify them)*

4. **Add Environment Variable:**
   - Before deploying, click **"Show advanced"** → **"New variable"**
   - **Key:** `REACT_APP_API_URL`
   - **Value:** `http://localhost:5000/api` (temporary - we'll update this later)
   - Click **"Deploy site"**

5. **Wait for Build:**
   - Build will take 2-5 minutes
   - Watch the build logs
   - When done, you'll see: **"Site is live"**
   - Copy your Netlify URL (e.g., `https://amazing-app-123.netlify.app`)

---

### STEP 3: Deploy Backend (Choose ONE option)

#### Option A: Railway.app (Recommended - Easiest) ⭐

1. **Sign up:**
   - Go to [railway.app](https://railway.app)
   - Click **"Start a New Project"**
   - Choose **"Deploy from GitHub repo"**
   - Select your repository

2. **Configure:**
   - Railway auto-detects Python
   - Click on the service → **"Settings"**
   - Set **Root Directory:** `backend`
   - Go to **"Variables"** tab → Add:
     - `PORT` = `5000`
   - Go to **"Deploy"** tab → Set **Start Command:** `python app.py`

3. **Get Backend URL:**
   - After deployment, click **"Settings"** → **"Generate Domain"**
   - Copy the URL (e.g., `https://your-app-production.up.railway.app`)

#### Option B: Render.com

1. **Sign up:**
   - Go to [render.com](https://render.com)
   - Click **"New +"** → **"Web Service"**
   - Connect GitHub → Select your repository

2. **Configure:**
   - **Name:** `sticker-backend`
   - **Environment:** `Python 3`
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python app.py`
   - Click **"Create Web Service"**

3. **Get Backend URL:**
   - Copy the URL (e.g., `https://sticker-backend.onrender.com`)

---

### STEP 4: Connect Frontend to Backend

1. **Update Netlify Environment Variable:**
   - Go to Netlify Dashboard → Your site
   - Click **"Site settings"** → **"Environment variables"**
   - Find `REACT_APP_API_URL` → Click **"Edit"**
   - Change value to: `https://YOUR_BACKEND_URL/api`
   - Example: `https://your-app-production.up.railway.app/api`
   - Click **"Save"**

2. **Trigger New Deploy:**
   - Go to **"Deploys"** tab
   - Click **"Trigger deploy"** → **"Deploy site"**
   - Wait for rebuild (1-2 minutes)

---

### STEP 5: Update Backend CORS (Final Step)

1. **Get your Netlify URL:**
   - From Netlify dashboard (e.g., `https://amazing-app-123.netlify.app`)

2. **Update backend CORS:**
   - Open `backend/app.py`
   - Find the CORS configuration (around line 10)
   - Add your specific Netlify URL to the origins list:
   ```python
   CORS(app, resources={
       r"/api/*": {
           "origins": [
               "http://localhost:3000",
               "https://amazing-app-123.netlify.app",  # Add your URL here
               "https://*.netlify.app",
               "https://*.netlify.com"
           ]
       }
   })
   ```

3. **Commit and Push:**
   ```powershell
   git add backend/app.py
   git commit -m "Update CORS for Netlify deployment"
   git push
   ```

4. **Backend will auto-redeploy** (Railway/Render auto-deploys on git push)

---

### STEP 6: Test Your Deployment

1. **Visit your Netlify URL** in a browser
2. **Upload a test video**
3. **Try converting it**
4. **Check browser console** (F12) for any errors
5. **Verify download works**

---

## 🎯 Quick Checklist

- [ ] Code pushed to GitHub
- [ ] Frontend deployed to Netlify
- [ ] Backend deployed (Railway/Render)
- [ ] Netlify environment variable set with backend URL
- [ ] Backend CORS updated with Netlify URL
- [ ] Tested the application

---

## 🔧 Troubleshooting

### Frontend shows "Cannot connect to backend"
- ✅ Check `REACT_APP_API_URL` in Netlify environment variables
- ✅ Ensure backend URL ends with `/api`
- ✅ Verify backend is running (check Railway/Render dashboard)

### CORS Errors
- ✅ Update backend CORS with your exact Netlify URL
- ✅ Redeploy backend after CORS changes
- ✅ Check browser console for specific CORS error

### Build Fails
- ✅ Check Netlify build logs
- ✅ Verify `package.json` is in `frontend` folder
- ✅ Ensure all dependencies are listed in `package.json`

### Backend Not Starting
- ✅ Check Railway/Render logs
- ✅ Verify `requirements.txt` has all dependencies
- ✅ Ensure Python version is compatible

---

## 📝 Important Notes

1. **Netlify Free Tier:**
   - 100 GB bandwidth/month
   - 300 build minutes/month
   - Perfect for personal projects

2. **Railway Free Tier:**
   - $5 credit/month
   - Auto-sleeps after inactivity
   - First request may be slow (wake-up time)

3. **Render Free Tier:**
   - 750 hours/month
   - Sleeps after 15 min inactivity
   - First request may be slow

4. **FFmpeg:**
   - Railway includes FFmpeg ✅
   - Render includes FFmpeg ✅
   - PythonAnywhere: May need manual installation

---

## 🎉 You're Done!

Once deployed, your app will be live at:
- **Frontend:** `https://your-app-name.netlify.app`
- **Backend:** `https://your-backend-url.railway.app` (or render.com)

Share your Netlify URL with others to use your WhatsApp Sticker Maker!

---

## Need Help?

If you encounter any issues:
1. Check the build logs in Netlify/Railway/Render
2. Check browser console (F12) for errors
3. Verify all environment variables are set correctly
4. Ensure backend is running and accessible
