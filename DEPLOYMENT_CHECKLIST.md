# ✅ Cloud Deployment Checklist

## 📋 Pre-Deployment (Today)

### Accounts & Setup
- [ ] GitHub account created (github.com)
- [ ] Supabase account created (supabase.com)
- [ ] Render account created (render.com)
- [ ] Code directory organized

### Code Preparation
- [ ] server-pg.js created and tested (locally)
- [ ] db/postgres.js configured
- [ ] routes/requests-pg.js updated
- [ ] routes/admin-pg.js updated
- [ ] routes/auth.js updated
- [ ] .env.example created
- [ ] .gitignore created
- [ ] package.json updated with PostgreSQL deps
- [ ] No hardcoded secrets in code

---

## 🔧 Step 1: GitHub Setup (5 mins)

- [ ] GitHub repo created: `everify-system`
- [ ] Code pushed to GitHub:
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  git remote add origin https://github.com/USERNAME/everify-system.git
  git push -u origin main
  ```
- [ ] All files visible on GitHub
- [ ] .gitignore working (node_modules not pushed)

---

## 🗄️ Step 2: Supabase Setup (10 mins)

### Create Database
- [ ] Supabase project created: "everify-db"
- [ ] Database initialized (wait 2-3 mins)
- [ ] Strong password saved securely

### Get Connection Details
- [ ] Settings → Database accessed
- [ ] Connection string (URI) copied
- [ ] URL format: `postgresql://postgres:[PASSWORD]@db.[region].supabase.co:5432/postgres`
- [ ] URL saved in secure location

### Create Tables
- [ ] SQL Editor opened
- [ ] SQL schema copied from documentation
- [ ] Tables created successfully:
  - [ ] users
  - [ ] requests
  - [ ] request_fields
  - [ ] request_field_values
- [ ] Indexes created

---

## 🚀 Step 3: Render Deployment (15 mins)

### Connect GitHub
- [ ] Render account logged in
- [ ] GitHub authorization completed
- [ ] Repository `everify-system` selected
- [ ] Connection verified

### Configure Service
- [ ] Service name: `everify-api`
- [ ] Environment: Node
- [ ] Build Command: `npm install`
- [ ] Start Command: `node server-pg.js`
- [ ] Plan: Free (selected)

### Add Environment Variables
- [ ] NODE_ENV = `production`
- [ ] DATABASE_URL = [Supabase URI from Step 2]
- [ ] SESSION_SECRET = [random secret key]
- [ ] PORT = `10000`
- [ ] All variables saved

### Deploy
- [ ] "Create Web Service" clicked
- [ ] Deployment started (watch logs)
- [ ] Build completed successfully
- [ ] Service deployed successfully
- [ ] URL received: `https://everify-api.onrender.com`
- [ ] Logs show:
  - [ ] ✓ PostgreSQL connection successful
  - [ ] ✓ Server running
  - [ ] ✓ Default users initialized

---

## 🧪 Step 4: Testing (10 mins)

### Connectivity Test
- [ ] Visit: `https://everify-api.onrender.com`
- [ ] Login page loads
- [ ] No 500 errors in console

### Employee Test
- [ ] Login: emp1 / password123 / employee
- [ ] Create test request
- [ ] View request in dashboard
- [ ] Request persists after refresh

### Employer Test
- [ ] Logout
- [ ] Login: employer1 / password123 / employer
- [ ] View pending request
- [ ] Approve request with comment
- [ ] Request status changed

### HR Test
- [ ] Logout
- [ ] Login: hr1 / password123 / hr
- [ ] View approved request
- [ ] Mark as completed
- [ ] View statistics
- [ ] Add custom field

### Post-Test Cleanup
- [ ] Delete test custom field
- [ ] Delete test request (as HR)
- [ ] Verify deletion

---

## 📲 Step 5: Production Readiness

### Documentation
- [ ] CLOUD_QUICK_START.md reviewed
- [ ] DEPLOYMENT_STEPS.md reviewed
- [ ] Admin procedures documented
- [ ] Support contacts documented

### User Credentials
- [ ] Demo accounts ready
- [ ] Employee accounts created
- [ ] Employer accounts created
- [ ] HR accounts created

### Monitoring
- [ ] Render dashboard bookmarked
- [ ] Supabase dashboard bookmarked
- [ ] GitHub repo bookmarked
- [ ] Alert emails configured (optional)

### Backups
- [ ] Supabase auto-backup enabled
- [ ] GitHub repo private (optional)
- [ ] First backup timestamp noted

---

## 🌐 Step 6: Share & Launch

### Before Sharing
- [ ] URL tested one more time
- [ ] Demo credentials verified
- [ ] All 3 dashboards working
- [ ] Mobile view tested

### User Communication
- [ ] Share URL: `https://everify-api.onrender.com`
- [ ] Send demo credentials to admins
- [ ] Provide support email/contact
- [ ] Create Quick Start guide for users
- [ ] Schedule training (optional)

### Go Live
- [ ] Users can access application
- [ ] First requests submitted
- [ ] Employer reviews workflow tested
- [ ] HR completes workflow tested

---

## 📊 Post-Launch Checklist

### Day 1
- [ ] Monitor application for errors
- [ ] Check Render logs for issues
- [ ] Test all 3 user roles with real data
- [ ] Verify database storing data correctly
- [ ] Get user feedback

### Week 1
- [ ] Monitor free-tier usage
- [ ] Verify auto-deletion still works
- [ ] Check performance with actual load
- [ ] Address any user issues

### Week 2+
- [ ] Ongoing monitoring
- [ ] Collect usage metrics
- [ ] Plan for any needed improvements
- [ ] Consider custom field requests
- [ ] Gather feature requests

---

## 🆘 Emergency Contacts

**If Application Down:**
1. Check Render Dashboard → Status
2. Check recent deployments
3. View logs for error messages
4. Check Supabase connection

**If Database Issues:**
1. Check Supabase dashboard
2. Verify DATABASE_URL correct
3. Test connection in Supabase console
4. Check network/firewall

**If Deployment Failed:**
1. View Render build logs
2. Check for syntax errors
3. Verify package.json
4. Check environment variables
5. Re-push to GitHub

---

## 💰 Cost Verification

### Current Month (First Month)
- Supabase: FREE (500MB tier)
- Render: FREE (750 hrs/mo)
- GitHub: FREE
- **Total: $0**

### Ongoing (Month 2+)
- Supabase: FREE (unless >500MB)
- Render: FREE (unless >750 hrs/mo)
- GitHub: FREE
- **Total: $0** ✅

---

## ✅ Sign-Off

- [ ] All checklist items completed
- [ ] Application tested & working
- [ ] Users notified and trained
- [ ] Documentation complete
- [ ] Support plan in place
- [ ] Go/No-Go decision made

**Date Deployed**: _______________

**Deployed By**: _______________

**Contact**: _______________

---

**🎉 Deployment Complete! 🎉**

Your E-Verify system is now live for 150-200 users, completely free, and automatically scaling!

---

## 📞 Quick Support

**Website Down?**
→ Check Render Dashboard

**Database Issue?**
→ Check Supabase Dashboard

**Code Problem?**
→ Check GitHub logs & Render logs

**Help?**
→ See CLOUD_DEPLOYMENT.md
