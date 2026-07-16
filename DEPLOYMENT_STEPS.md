# 🚀 Complete Deployment Guide - Free Cloud Stack

## FREE Stack for 150-200 Users

| Service | Cost | Includes |
|---------|------|----------|
| **Supabase** PostgreSQL | FREE | 500MB storage |
| **Render.com** | FREE | 750 hrs/mo compute |
| **GitHub** | FREE | Unlimited repos |
| **Vercel** (optional) | FREE | 100GB BW/mo |
| **TOTAL** | **$0/month** | Full production app |

---

## 📋 Pre-Deployment Checklist

- [ ] GitHub account created
- [ ] Supabase account created  
- [ ] Render.com account created
- [ ] Code pushed to GitHub
- [ ] .env.example file ready
- [ ] Database schema prepared

---

## ✅ Step 1: GitHub Setup (5 mins)

### 1.1 Create GitHub Repository

1. Go to https://github.com/new
2. **Repository name**: `everify-system`
3. **Description**: "E-Verify Request Management System - Free Tier"
4. **Visibility**: Public (required for free tier)
5. Click "Create repository"

### 1.2 Push Code to GitHub

```bash
# Navigate to project
cd "D:\My computer -Mayur\Data Flake\project\"

# Initialize git (if not done)
git init
git add .
git commit -m "Initial deployment: PostgreSQL + Production Ready"

# Add remote (replace YOURUSER with your GitHub username)
git remote add origin https://github.com/YOURUSER/everify-system.git
git branch -M main
git push -u origin main
```

### 1.3 Verify GitHub Push

Visit: `https://github.com/YOURUSER/everify-system`  
Should see all files including:
- ✓ `server-pg.js`
- ✓ `db/postgres.js`
- ✓ `routes/`
- ✓ `public/`
- ✓ `package.json`
- ✓ `.gitignore`
- ✓ `.env.example`

---

## ✅ Step 2: Supabase PostgreSQL Setup (10 mins)

### 2.1 Create Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project" or "Start your project"
3. **Project name**: `everify-db`
4. **Database password**: Create STRONG password (save it!)
5. **Region**: Choose closest to you
6. Click "Create new project"
7. **Wait 2-3 minutes** for database initialization

### 2.2 Get PostgreSQL Connection String

**After project is ready:**

1. Go to **Settings** → **Database**
2. Find **Connection string** section
3. Click **"URI"** tab
4. Copy the connection string:
   ```
   postgresql://postgres:[PASSWORD]@db.[region].supabase.co:5432/postgres
   ```
5. **Save this URL** - needed for Render

### 2.3 Create Database Tables

1. In Supabase, go to **SQL Editor** on left sidebar
2. Click **"New query"**
3. Copy-paste this SQL:

```sql
-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Requests Table
CREATE TABLE IF NOT EXISTS requests (
  id SERIAL PRIMARY KEY,
  employee_name VARCHAR(255) NOT NULL,
  employee_email VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  request_status VARCHAR(50) DEFAULT 'pending',
  employer_comment TEXT,
  employer_action_by INTEGER REFERENCES users(id),
  hr_comment TEXT,
  hr_action_by INTEGER REFERENCES users(id),
  completed_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Custom Request Fields
CREATE TABLE IF NOT EXISTS request_fields (
  id SERIAL PRIMARY KEY,
  field_name VARCHAR(255) UNIQUE NOT NULL,
  field_type VARCHAR(50) DEFAULT 'text',
  is_required INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Request Field Values
CREATE TABLE IF NOT EXISTS request_field_values (
  id SERIAL PRIMARY KEY,
  request_id INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  field_id INTEGER NOT NULL REFERENCES request_fields(id),
  field_value TEXT
);

-- Create Indexes
CREATE INDEX idx_requests_employee_email ON requests(employee_email);
CREATE INDEX idx_requests_status ON requests(request_status);
CREATE INDEX idx_requests_start_date ON requests(start_date);
```

4. Click **"Run"** button
5. Should see: ✓ Tables created successfully

---

## ✅ Step 3: Render.com Deployment (15 mins)

### 3.1 Connect GitHub to Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect account"** (GitHub)
4. Authorize Render to access GitHub
5. Select repository: **everify-system**
6. Click **"Connect"**

### 3.2 Configure Web Service

**Basic Settings:**
- **Name**: `everify-api`
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `node server-pg.js`
- **Plan**: Free

### 3.3 Add Environment Variables

Click **"Environment"** and add these variables:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | *Paste Supabase URL from Step 2.2* |
| `SESSION_SECRET` | `generate-a-random-long-secret-key-123456` |
| `PORT` | `10000` |

**Important**: Replace DATABASE_URL with your actual Supabase connection string!

### 3.4 Deploy

1. Click **"Create Web Service"**
2. Render will:
   - Build from GitHub (npm install)
   - Deploy code
   - Show deployment logs
3. **Wait 5-10 minutes**
4. Once deployed, you'll see:
   ```
   ✓ Your service is live at:
   https://everify-api.onrender.com
   ```

### 3.5 Test Deployment

Visit: `https://everify-api.onrender.com`

Should see:
- ✓ Login page loads
- ✓ Demo credentials work (emp1 / password123)
- ✓ Connection to PostgreSQL successful

**Logs you should see:**

```
✓ PostgreSQL connection successful
✓ Server running at http://localhost:10000
✓ Default users initialized
✓ Database schema initialized
```

---

## ✅ Step 4: Frontend Update (for cloud backend)

### 4.1 Update Backend URL

Edit `public/app.js`:

**Find this line:**
```javascript
const BASE_URL = '';
```

**Replace with:**
```javascript
const BASE_URL = 'https://everify-api.onrender.com';
```

**And update the API class:**
```javascript
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
	// ... rest stays the same
  }
}
```

### 4.2 Push Changes

```bash
git add public/app.js
git commit -m "Update to use cloud backend URL"
git push origin main
```

Render will **auto-redeploy** within 1-2 minutes!

---

## ✅ Step 5: Test Full System

### 5.1 Open Application

Visit: `https://everify-api.onrender.com`

### 5.2 Test All Roles

**Employee Login:**
- Username: `emp1`
- Password: `password123`
- Create a test request

**Employer Login:**
- Username: `employer1`  
- Password: `password123`
- Verify the request

**HR Login:**
- Username: `hr1`
- Password: `password123`
- Complete/manage requests

### 5.3 Check Logs

In Render Dashboard:
- Go to your service
- Click **"Logs"** tab
- Should see successful database queries

---

## 📊 Monitoring & Maintenance

### Check Stats

**Supabase Dashboard:**
- Settings → Usage
- Monitor storage (500MB free)
- Check connections

**Render Dashboard:**
- Resources tab
- View compute usage (750 hrs/mo free)

### Automatic Updates

**When you push to GitHub:**
1. Render auto-detects changes
2. Redeploys automatically
3. No downtime (new instance starts first)
4. Takes 2-5 minutes

Commit and push:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

---

## 🔧 Troubleshooting

### "Service keeps spinning"

Render free tier auto-sleeps after 15 minutes of inactivity.

**Solutions:**
1. **Upgrade to Paid** ($7/mo) - Remove auto-sleep
2. **Use Cron Service** - Ping every 14 minutes (free)
3. **Accept Sleep** - First request takes 30 seconds (then fast)

**To add cron ping (free):**
- Use https://cron-job.org or similar
- Ping: `https://everify-api.onrender.com` every 10 minutes

### "Database connection timeout"

**Check:**
1. Supabase DATABASE_URL is correct
2. Database password is correct
3. Network access allowed (Supabase allows all by default)
4. Render environment variables saved

**Test via psql if available:**
```bash
psql "postgresql://postgres:PASSWORD@db.region.supabase.co:5432/postgres"
```

### "Frontend can't reach backend"

**Verify:**
1. `BASE_URL` in `public/app.js` is correct
2. No URL typos
3. CORS isn't blocking (should work - same domain)
4. Browser console for 404 or CORS errors

### "Build fails"

**Check Render logs:**
1. Dashboard → Your service → Logs
2. Look for error message
3. Common issues:
   - Missing dependencies (run `npm install` locally)
   - Syntax errors (check server-pg.js)
   - Wrong Node.js version

---

## 💰 Cost Breakdown

### Current Month
| Service | Free Tier | Your Usage | Cost |
|---------|-----------|-----------|------|
| Supabase | 500MB | ~50-100MB | $0 |
| Render | 750 hrs | ~500 hrs | $0 |
| Vercel | 100GB BW | ~10GB | $0 |
| GitHub | Unlimited | 1 repo | $0 |
| **TOTAL** | | | **$0/mo** |

### Projected 12-Month Cost
**$0 - Completely Free**

(Upgrades only if you exceed free tiers after 150-200+ users)

---

## 🎉 You're Live!

Your E-Verify system is now:

✅ **Running on PostgreSQL** - Scalable database  
✅ **Deployed on Render** - Cloud hosting  
✅ **Auto-deploying from GitHub** - Zero-downtime updates  
✅ **Completely FREE** - For 150-200 users  
✅ **Production-ready** - Secure, logged, monitored  

---

## 📱 Share with Users

**Public URL**: `https://everify-api.onrender.com`

**Give them:**
- URL to bookmark
- Their role login credentials
- Contact support info

---

## 🚀 Next Steps

1. ✅ Point domain name (optional)
2. ✅ Set up automated backups
3. ✅ Configure email notifications (SendGrid free tier)
4. ✅ Add more custom fields
5. ✅ Create team admin accounts

---

## 📞 Support

**Issues?**
- Check Render logs: Dashboard → Logs
- Check Supabase dashboard: Database activity
- Check GitHub Actions: Deployment status
- Review file: CLOUD_DEPLOYMENT.md

**Common Links:**
- https://dashboard.render.com
- https://app.supabase.com
- https://github.com/YOUR-USER/everify-system

---

**Deployed Successfully! 🎊**
