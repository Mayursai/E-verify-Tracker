# Cloud Deployment Guide - E-Verify System (Free Tier for 150-200 Users)

## 🚀 Free Cloud Stack

### Services Used:
1. **Database**: Supabase (PostgreSQL) - FREE
   - 500MB storage (enough for 150-200 users)
   - Unlimited API requests
   - Real-time capabilities

2. **Backend**: Render.com - FREE
   - Auto-deploys from GitHub
   - Persistent web service
   - PostgreSQL connection

3. **Frontend**: Vercel - FREE (Optional)
   - CDN distribution
   - Auto-deploys
   - 100GB bandwidth/month

---

## 📋 Prerequisites

1. **GitHub Account** (free at github.com)
2. **Supabase Account** (free at supabase.com)
3. **Render Account** (free at render.com)
4. **Vercel Account** (free at vercel.com) - Optional

---

## ✅ Step-by-Step Deployment

### Phase 1: GitHub Setup (5 minutes)

#### 1a. Create GitHub Repository

1. Go to https://github.com/new
2. Create repository: **everify-system**
3. Description: "E-Verify Request Management System"
4. Choose **Public** (for free tier)
5. Click "Create repository"

#### 1b. Push Code to GitHub

```bash
cd "D:\My computer -Mayur\Data Flake\project\"

# Initialize git
git init
git add .
git commit -m "Initial commit: E-Verify system with SQLite"

# Add remote (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/everify-system.git
git branch -M main
git push -u origin main
```

---

### Phase 2: Supabase Database Setup (10 minutes)

#### 2a. Create Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Project name: **everify-db**
4. Password: Create strong password (save it!)
5. Region: Choose closest to you
6. Click "Create new project" (wait 2-3 minutes)

#### 2b. Get Connection Details

After project is created:
1. Go to Settings → Database
2. Under "Connection string", find **URI** tab
3. Copy the connection string (looks like):
   ```
   postgresql://postgres:[PASSWORD]@db.supabase.co:5432/postgres
   ```
4. Save this URL - you'll need it for Render

#### 2c. Create Tables in Supabase

1. In Supabase dashboard, go to SQL Editor
2. Click "New Query"
3. Copy and paste the SQL schema from file: `SUPABASE_SCHEMA.sql` (see bottom of this guide)
4. Click "Run"
5. All tables are now created!

---

### Phase 3: Render Deployment (15 minutes)

#### 3a. Connect GitHub to Render

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Click "Connect account" (GitHub)
4. Authorize Render on GitHub
5. Select repository: **everify-system**
6. Click "Connect"

#### 3b. Configure Render Service

**Name**: everify-api  
**Environment**: Node  
**Build Command**: `npm install`  
**Start Command**: `npm start`  
**Plan**: Free

#### 3c. Add Environment Variables

Click "Environment" and add:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | *Paste Supabase connection string from Phase 2* |
| `SESSION_SECRET` | `generate-a-random-secret-key-here` |
| `PORT` | `3000` |

#### 3d. Deploy

1. Click "Create Web Service"
2. Render will deploy automatically from GitHub
3. Wait 5-10 minutes (check logs)
4. Once deployed, you'll get a URL like: `https://everify-api.onrender.com`
5. The backend is now live!

---

### Phase 4: Vercel Frontend Deployment (Optional, 10 minutes)

#### 4a. Create Frontend Folder

1. Create `vercel-frontend.json` with frontend code
2. Set up separate frontend repo (optional)

#### 4b or Deploy Full Stack on Render

*Skip Vercel if you want - Render can serve both frontend and backend*

Simply visit: `https://everify-api.onrender.com` (the Render URL)

---

## 🔧 Connect Frontend to Cloud Backend

Update `public/app.js` to use cloud backend:

```javascript
// OLD (local)
const BASE_URL = '';

// NEW (cloud) - Use your Render.com URL
const BASE_URL = 'https://your-render-url.onrender.com';

// Update API class:
class API {
  static async request(method, endpoint, body = null) {
	const options = {
	  method,
	  headers: { 'Content-Type': 'application/json' }
	};

	if (body) {
	  options.body = JSON.stringify(body);
	}

	const response = await fetch(`${BASE_URL}/api${endpoint}`, options);
	// ... rest of code
  }
}
```

---

## 📊 Free Tier Limits & Capacity

### Supabase (PostgreSQL)
- **Storage**: 500MB
- **Connections**: Unlimited
- **Estimated Users**: 150-200 (perfect fit)

### Render.com
- **Compute**: 750 hours/month (free tier)
- **Bandwidth**: Unlimited
- **Auto-sleep**: Yes (15 min inactivity)
- **Note**: FREE tier auto-sleeps; paid is $7/month (optional)

### Vercel (Frontend)
- **Bandwidth**: 100GB/month
- **Deployments**: Unlimited
- **Functions**: 100,000/month

---

## ⚙️ After Deployment

### 1. Test the System

1. Go to `https://your-render-url.onrender.com`
2. Login with demo credentials:
   - Employee: emp1 / password123
   - Employer: employer1 / password123
   - HR: hr1 / password123

### 2. Create Backup

In Supabase Dashboard:
- Settings → Backups
- Enable nightly backups

### 3. Monitor Usage

**Supabase Dashboard**:
- Settings → Usage
- Check storage and connections

**Render Dashboard**:
- Logs
- Resource usage
- Billing

### 4. Custom Domain (Optional)

**Render Custom Domain**:
1. In Render Settings → Custom Domains
2. Add your domain
3. Update DNS records

---

## 🔄 Continuous Deployment (Auto-Deploy)

**Automatic deployment is already configured!**

Every time you push to GitHub:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Render automatically redeploys within 1-2 minutes. Check deployment logs in Render dashboard.

---

## 📱 URL Access

**Production URL**: `https://everify-api.onrender.com`

Share this URL with your 150-200 users!

---

## 🛠️ Troubleshooting

### "Render service keeps sleeping"
- Render free tier auto-sleeps after 15 min inactivity
- Solution: Upgrade to paid ($7/month) OR use ping service to keep alive

### "Database connection fails"
- Check Supabase Connection URL is correct
- Verify `DATABASE_URL` environment variable in Render

### "Port already in use"
- Render assigns PORT automatically
- Ensure `server.js` uses: `process.env.PORT || 3000`

### "Frontend can't reach backend"
- Update `BASE_URL` in `public/app.js`
- Check Render deployment logs
- Verify environment variables

---

## 📚 SQL Schema for Supabase

Save this as `SUPABASE_SCHEMA.sql` and run in Supabase SQL Editor:

```sql
-- Users Table
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Requests Table
CREATE TABLE requests (
  id BIGSERIAL PRIMARY KEY,
  employee_name TEXT NOT NULL,
  employee_email TEXT NOT NULL,
  start_date DATE NOT NULL,
  request_status TEXT DEFAULT 'pending',
  employer_comment TEXT,
  employer_action_by BIGINT REFERENCES users(id),
  hr_comment TEXT,
  hr_action_by BIGINT REFERENCES users(id),
  completed_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Custom Fields
CREATE TABLE request_fields (
  id BIGSERIAL PRIMARY KEY,
  field_name TEXT UNIQUE NOT NULL,
  field_type TEXT DEFAULT 'text',
  is_required INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Field Values
CREATE TABLE request_field_values (
  id BIGSERIAL PRIMARY KEY,
  request_id BIGINT REFERENCES requests(id),
  field_id BIGINT REFERENCES request_fields(id),
  field_value TEXT
);

-- Create indexes
CREATE INDEX idx_requests_employee_email ON requests(employee_email);
CREATE INDEX idx_requests_status ON requests(request_status);
CREATE INDEX idx_requests_start_date ON requests(start_date);
```

---

## 💰 Total Cost

| Service | Cost | Notes |
|---------|------|-------|
| Supabase | FREE | 500MB storage tier |
| Render | FREE | Auto-sleeps after 15 min |
| Vercel  | FREE | Optional (100GB BW/mo) |
| Domain  | ~$10/yr | Optional |
| **TOTAL** | **FREE** | **Everything included** |

---

## 🚀 Summary

Your E-Verify system is now:
- ✅ Running on PostgreSQL (scalable)
- ✅ Deployed on cloud (accessible anywhere)
- ✅ Auto-deploying from GitHub (zero downtime)
- ✅ Completely FREE for 150-200 users
- ✅ Production-ready

---

Need help? Check logs in Render dashboard or Supabase console.

Enjoy! 🎉
