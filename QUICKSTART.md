# Quick Start Guide - E-Verify Request System

## ⚡ 5-Minute Setup

### Step 1: Install & Run
```bash
cd "D:\My computer -Mayur\Data Flake\project\"
npm start
```

### Step 2: Open in Browser
Navigate to: **http://localhost:3000**

### Step 3: Login with Demo Account
Choose a role and login:
- **Employee**: emp1 / password123
- **Employer**: employer1 / password123
- **HR**: hr1 / password123

---

## 👨‍💼 Employee - Submit a Request

1. Login as Employee (emp1)
2. Fill in the "Create New Request" form:
   - Full Name: Your name
   - Email: Your email (auto-filled)
   - Start Date: Choose a date
   - Any additional fields added by HR
3. Click "Submit Request"
4. Check "My Requests" section to see status

---

## 🏢 Employer - Verify Request

1. Login as Employer (employer1)
2. View pending requests in the table
3. Click "Verify" on a request
4. Add comment (optional)
5. Click "Approve" or "Deny"
6. Request status updates immediately

---

## 👥 HR - Manage Everything

### View All Requests:
1. Login as HR (hr1)
2. Go to "All Requests" tab
3. See statistics dashboard
4. Filter by date or status
5. Click "Update Status" to change request status
6. Mark as "Completed" or "Denied"

### Add Custom Fields:
1. Go to "Manage Fields" tab
2. Enter field name (e.g., "Department")
3. Select field type
4. Mark as required if needed
5. Click "Add"
6. Custom field appears on all new employee request forms

---

## 📊 Key Features By Role

### Employee
✅ Create request with name, email, start date
✅ View own requests and their status
✅ See comments from employer and HR
✅ Filter requests by date
✅ Sort requests by date or status

### Employer
✅ View all employee requests
✅ Approve or deny requests
✅ Add comments for employees
✅ Filter by date or status
✅ See request details and custom fields

### HR
✅ View all requests with full history
✅ Update request status (pending → approved → completed)
✅ Add comments for audit trail
✅ Manage custom request fields
✅ View dashboard statistics
✅ Delete completed requests (auto-deletes after 7 days)

---

## 🔄 Typical Workflow

1. **Employee** submits e-verify request
   ↓
2. **Employer** reviews and approves/denies
   ↓
3. **HR** updates status to completed
   ↓
4. **System** auto-deletes after 7 days (optional)

---

## ⚙️ Troubleshooting

**Server won't start?**
- Check nodejs is installed: `node --version`
- Delete `node_modules` and run `npm install` again
- Make sure port 3000 is free

**Can't login?**
- Use exact demo credentials (case-sensitive)
- Try refreshing the page
- Clear browser cookies

**Database issues?**
- Delete `db/everify.db` file
- Restart server - database recreates automatically

---

## 📞 Default Users

```
Employee 1:
Username: emp1
Email: emp1@company.com
Password: password123

Employee 2:
Username: emp2
Email: emp2@company.com
Password: password123

Employer:
Username: employer1
Email: employer1@company.com
Password: password123

HR:
Username: hr1
Email: hr1@company.com
Password: password123
```

---

## 🎯 Next Steps

1. Start the server: `npm start`
2. Try each role to understand the workflow
3. Add custom fields as HR
4. Create test requests as Employee
5. Approve/Deny as Employer
6. Complete and manage as HR

Enjoy your E-Verify Request Management System! 🚀
