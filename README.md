# E-Verify Request Management System

A comprehensive internal web application for managing employee e-verify requests with role-based access for Employees, Employers, and HR personnel.

## Features

### 👤 Three User Roles

1. **Employee**: Submit e-verify requests with personal information
2. **Employer**: Review and approve/deny employee requests
3. **HR**: Manage all requests, update statuses, and configure custom fields

### 📋 Core Functionality

- **Request Management**: Employees can create requests with their name, email, start date, and custom fields
- **Verification Workflow**: Employers verify and approve or deny requests with comments
- **Status Tracking**: HR marks requests as pending, approved, denied, or completed
- **Auto-Deletion**: Completed requests automatically delete after 7 days
- **Filtering & Sorting**: 
  - Filter by start date
  - Sort by date (newest/oldest) or status
  - View request count and statistics
- **Custom Fields**: HR can add, edit, and delete custom fields for requests
- **Comments**: Employer and HR can add comments to requests for communication

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Navigate to the project directory:
```bash
cd "path/to/project"
```

2. Install dependencies:
```bash
npm install
```

### Running the Application

Start the server:
```bash
npm start
```

The application will be accessible at: **http://localhost:3000**

## 📝 Demo Credentials

### Employee Login
- **Username**: emp1
- **Password**: password123
- **Role**: Employee

### Employer Login
- **Username**: employer1
- **Password**: password123
- **Role**: Employer

### HR Login
- **Username**: hr1
- **Password**: password123
- **Role**: HR

## 🔄 Workflow

### 1. Employee Creates Request
- Navigate to Employee Dashboard
- Fill in: Name, Email, Start Date, and any additional custom fields
- Click "Submit Request"
- View your submitted requests in "My Requests" section

### 2. Employer Reviews Request
- Navigate to Employer Dashboard
- View all pending requests
- Click "Verify" button on a request to open the action modal
- Enter comments and click "Approve" or "Deny"
- Filter requests by date or status

### 3. HR Completes Process
- Navigate to HR Dashboard
- Go to "All Requests" tab
- Click "Update Status" to change request status
- Mark as "Completed" to trigger the 7-day deletion timer
- View statistics on dashboard
- Use "Manage Fields" tab to add/remove custom request fields

## 📊 HR Admin Features

### Manage Custom Fields
1. Go to HR Dashboard → Manage Fields tab
2. Enter field name, select field type (text, textarea, select)
3. Mark as required if needed
4. Click "Add" to create the field
5. Fields appear on all employee request forms
6. Delete fields by clicking the delete button

### View Statistics
- Total requests count
- Breakdown by status (pending, approved, denied, completed)
- Real-time updates on dashboard

## 🎨 User Interface

- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Gradient design with intuitive navigation
- **Status Badges**: Color-coded status indicators
- **Modal Forms**: Clean modal interfaces for actions and updates

## 🔐 Security

- **Session-Based Authentication**: Secure login system with sessions
- **Role-Based Access Control**: Users only see relevant functionality
- **Password Hashing**: bcryptjs for secure password storage
- **CSRF Protection**: Express-session for session management

## 💾 Database

- **SQLite**: Lightweight database stored locally (everify.db)
- **Schema**: Optimized tables for users, requests, custom fields, and field values
- **Auto-Cleanup**: Automatic deletion of completed requests after 7 days

## 📁 Project Structure

```
project/
├── server.js                      # Main Express server
├── package.json                   # Dependencies and scripts
├── db/
│   └── database.js                # SQLite configuration
├── routes/
│   ├── auth.js                    # Authentication endpoints
│   ├── requests.js                # Request CRUD endpoints
│   └── admin.js                   # HR admin endpoints
└── public/
	├── login.html                 # Login page
	├── employee-dashboard.html     # Employee interface
	├── employer-dashboard.html     # Employer interface
	├── hr-dashboard.html          # HR interface
	└── app.js                     # Shared utility functions
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Requests
- `GET /api/requests` - Get requests (filtered by role)
- `GET /api/requests/:id` - Get single request
- `POST /api/requests` - Create new request (Employee only)
- `PUT /api/requests/:id` - Update request status
- `DELETE /api/requests/:id` - Delete request (HR only)

### Admin (HR)
- `GET /api/admin/fields` - Get all custom fields
- `POST /api/admin/fields` - Create custom field (HR only)
- `DELETE /api/admin/fields/:id` - Delete custom field (HR only)
- `GET /api/admin/stats` - Get request statistics (HR only)

## ⏰ Auto-Deletion Feature

- Completed requests are automatically deleted **7 days** after marking as completed
- Deletion runs daily at **midnight (00:00)**
- Requires server to be running for deletion to occur
- Uses node-cron for scheduling

## 🛠️ Dependencies

- **express**: Web framework
- **sqlite3**: Database
- **bcryptjs**: Password hashing
- **express-session**: Session management
- **node-cron**: Scheduled tasks

## 📝 Notes

- No external database setup required - SQLite is file-based
- Default users are created on first run
- Custom fields are shared across all employee requests
- Employees can only view their own requests
- Employers can view and action all requests
- HR has full control over all requests and system configuration

## 🐛 Troubleshooting

**Port 3000 already in use:**
- Change the PORT variable in server.js

**Database errors:**
- Delete everify.db file to reset database
- Ensure write permissions in project directory

**Session not persisting:**
- Clear browser cookies and login again
- Check that express-session is properly configured

## 🚀 Future Enhancements

- Email notifications for request status changes
- Document upload support
- Advanced reporting and analytics
- Multi-language support
- 2FA authentication
- Audit logs
- Integration with third-party e-verify services

## 📄 License

ISC

---

For support or questions, please contact your HR department.
