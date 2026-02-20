# 🚂 Railway Deployment Setup Guide

## Important: Railway Configuration Steps

When deploying to Railway, you need to configure it properly:

### Step 1: Create New Project in Railway

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository: `whatsapp_sticker_maker`

### Step 2: Configure the Service

**CRITICAL:** After Railway creates the service, you MUST configure it:

1. **Click on your service** (the one that was just created)
2. Go to **"Settings"** tab
3. Find **"Root Directory"** section
4. Set it to: `backend`
5. Click **"Save"**

### Step 3: Set Start Command

1. Still in **Settings** → **Deploy** section
2. **Start Command:** `python app.py`
   - Or leave blank (Procfile will be used)
3. Click **"Save"**

### Step 4: Add Environment Variable (Optional but Recommended)

1. Go to **"Variables"** tab
2. Add variable:
   - **Key:** `PORT`
   - **Value:** `5000`
   - Railway will override this, but it's good to have

### Step 5: Generate Domain

1. Go to **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Copy the URL (e.g., `https://your-app.up.railway.app`)

### Step 6: Check Logs

1. Go to **"Deployments"** tab
2. Click on the latest deployment
3. Check the logs for any errors
4. Look for: "🚀 Starting Flask server..."

---

## Why It Was Failing

Railway was trying to deploy from the root directory, but your Python app is in the `backend/` folder. By setting the **Root Directory** to `backend`, Railway will:
- Find `requirements.txt` in the backend folder
- Find `app.py` in the backend folder
- Use the `Procfile` from the backend folder
- Install dependencies correctly

---

## Files Created

✅ `railway.json` - Railway configuration
✅ `nixpacks.toml` - Nixpacks build configuration (includes FFmpeg)
✅ `backend/Procfile` - Start command
✅ `backend/runtime.txt` - Python version

---

## After Configuration

Once you set the Root Directory to `backend`:
1. Railway will automatically redeploy
2. Check the logs to see if it's working
3. Test the health endpoint: `https://YOUR_URL/api/health`

---

## Troubleshooting

**If build still fails:**
1. Check Railway logs for specific error
2. Verify Root Directory is set to `backend`
3. Ensure all files are pushed to GitHub
4. Check that `requirements.txt` exists in `backend/` folder

**If app starts but crashes:**
1. Check logs for Python errors
2. Verify FFmpeg is available (check logs)
3. Check PORT environment variable

---

## Next Steps After Railway Works

1. Copy your Railway backend URL
2. Update Netlify environment variable `REACT_APP_API_URL`
3. Redeploy Netlify frontend
4. Test the full application!
