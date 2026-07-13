# VSLA Accountability System - Complete Setup Guide

## 🚀 Project Overview

The **VSLA Accountability System** is a comprehensive web application designed for Village Savings and Loan Associations to manage members, savings, loans, and financial transactions.

**Repository:** https://github.com/charlesayesiga54-svg/-vsl-accountability-hub

---

## 📋 Prerequisites

- **Node.js** v16+ ([Download](https://nodejs.org/))
- **PostgreSQL** v12+ ([Download](https://www.postgresql.org/))
- **Git** ([Download](https://git-scm.com/))
- **npm** or **yarn**

---

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/charlesayesiga54-svg/-vsl-accountability-hub.git
cd -vsl-accountability-hub
```

### 2. Setup PostgreSQL Database

```bash
# Create database
psql -U postgres -c "CREATE DATABASE vsl_accountability;"

# Run schema
psql -U postgres -d vsl_accountability -f api/config/database-schema.sql
```

**Alternative (using pgAdmin):**
- Open pgAdmin
- Create new database: `vsl_accountability`
- Right-click → Query Tool
- Open and run `api/config/database-schema.sql`

### 3. Configure Environment Variables

```bash
# Create .env file from template
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vsl_accountability
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASSWORD=your_app_password
```

### 4. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 5. Start the Application

**Development Mode:**

```bash
# Terminal 1 - Backend (port 5000)
npm run dev:server

# Terminal 2 - Frontend (port 5173)
cd client && npm run dev
```

**Or use concurrently:**

```bash
npm run dev
```

### Access the Application

- **Frontend:** http://localhost:5173
- **API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

---

## 👥 Default Test Credentials

### Developer Account
- **Email:** dev@vsla.com
- **Password:** password123
- **Role:** Developer (Full Access)

### Secretary Account
- **Email:** secretary@vsla.com
- **Password:** password123
- **Role:** Secretary (Recording Access)

### Member Account
- **Email:** member@vsla.com
- **Password:** password123
- **Role:** Member (View Only)

---

## 📁 Project Structure

```
-vsl-accountability-hub/
├── api/
│   ├── config/
│   │   ├── database.js              # Database connection
│   │   └── database-schema.sql      # Database schema
│   ├── middleware/
│   │   └── auth.js                  # Authentication & authorization
│   ├── routes/
│   │   ├── auth.js                  # User authentication
│   │   ├── members.js               # Member management
│   │   ├── savings.js               # Savings module
│   │   ├── loans.js                 # Loan management
│   │   ├── dashboard.js             # Dashboard stats
│   │   ├── transactions.js          # Financial transactions
│   │   ├── fines.js                 # Fines management
│   │   ├── meetings.js              # Meeting management
│   │   ├── notifications.js         # Notifications
│   │   └── reports.js               # Reports & analytics
│   └── server.js                    # Main Express server
│
├── client/
│   ├── src/
│   │   ├── pages/                   # React pages
│   │   ├── components/              # React components
│   │   ├── store/                   # Zustand state management
│   │   ├── utils/                   # Utility functions
│   │   ├── App.jsx                  # Main app component
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Tailwind CSS
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── .env.example                     # Environment template
├── .gitignore
├── package.json
├── README.md
└── DEPLOYMENT.md
```

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register            # Register new user
POST   /api/auth/login               # User login
POST   /api/auth/change-password     # Change password
```

### Members
```
GET    /api/members                  # Get all members
GET    /api/members/:id              # Get member by ID
POST   /api/members                  # Create member
PUT    /api/members/:id              # Update member
DELETE /api/members/:id              # Delete member
```

### Savings
```
GET    /api/savings                  # Get all savings
GET    /api/savings/member/:id       # Get member savings summary
POST   /api/savings                  # Record savings
PUT    /api/savings/:id              # Update savings
```

### Loans
```
GET    /api/loans                    # Get all loans
POST   /api/loans                    # Apply for loan
PUT    /api/loans/:id/approve        # Approve loan
POST   /api/loans/:id/repayment      # Record repayment
```

### Dashboard
```
GET    /api/dashboard/stats          # Get dashboard statistics
```

### Transactions
```
GET    /api/transactions             # Get transactions
POST   /api/transactions             # Record transaction
GET    /api/transactions/cashbook    # Get cashbook report
```

### Fines
```
GET    /api/fines                    # Get all fines
POST   /api/fines                    # Record fine
PUT    /api/fines/:id/pay            # Mark fine as paid
```

### Meetings
```
GET    /api/meetings                 # Get all meetings
POST   /api/meetings                 # Create meeting
POST   /api/meetings/:id/attendance  # Record attendance
PUT    /api/meetings/:id/minutes     # Update minutes
```

### Reports
```
GET    /api/reports/financial        # Financial statement
GET    /api/reports/savings          # Savings report
GET    /api/reports/loans            # Loans report
GET    /api/reports/attendance       # Attendance report
GET    /api/reports/member/:id       # Member statement
```

---

## 🔐 Security Features

✅ **Bcrypt Password Hashing** - Secure password storage
✅ **JWT Authentication** - Stateless token-based auth
✅ **Role-Based Access Control** - Developer, Secretary, Member roles
✅ **SQL Injection Prevention** - Parameterized queries
✅ **CORS Protection** - Cross-origin request handling
✅ **Audit Logging** - Track all actions
✅ **Secure Password Change** - Current password verification

---

## 📊 Database Schema

**15 Tables:**
- `users` - User accounts
- `groups` - VSLA groups
- `members` - Group members
- `savings` - Savings records
- `loans` - Loan applications
- `loan_repayments` - Repayment tracking
- `fines` - Member fines
- `meetings` - Group meetings
- `meeting_attendance` - Meeting attendance
- `transactions` - Financial transactions
- `documents` - Stored documents
- `notifications` - User notifications
- `audit_logs` - Action logs

---

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- Docker deployment
- Heroku deployment
- AWS deployment
- Vercel frontend deployment

---

## 🛠️ Development

### Running Tests
```bash
npm test
```

### Code Quality
```bash
npm run lint
```

### Build for Production
```bash
npm run build
npm run build:server
cd client && npm run build
```

---

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|----------|
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 5432 |
| DB_NAME | Database name | vsl_accountability |
| DB_USER | Database user | postgres |
| DB_PASSWORD | Database password | secure_password |
| JWT_SECRET | JWT signing key | your_secret_key |
| JWT_EXPIRE | Token expiration | 7d |
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
| EMAIL_HOST | SMTP server | smtp.gmail.com |
| EMAIL_USER | Email address | your@email.com |
| EMAIL_PASSWORD | Email password | app_password |

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use a different port
PORT=5001 npm run dev:server
```

### Database Connection Error
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Verify credentials in .env
# Make sure database exists
psql -U postgres -l
```

### CORS Errors
- Update CORS origins in `api/server.js`
- Check frontend URL matches allowed origins

### JWT Errors
- Regenerate JWT_SECRET in .env
- Clear browser localStorage
- Re-login with new token

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand State Management](https://github.com/pmndrs/zustand)

---

## 💡 Tips & Best Practices

1. **Always use environment variables** for sensitive data
2. **Keep database backups** regularly
3. **Use strong passwords** for all accounts
4. **Monitor error logs** for issues
5. **Update dependencies** periodically
6. **Use HTTPS** in production
7. **Enable audit logging** for compliance
8. **Test thoroughly** before deployment

---

## 📞 Support

For issues or questions:
- Email: charlesayesiga54@gmail.com
- GitHub Issues: https://github.com/charlesayesiga54-svg/-vsl-accountability-hub/issues

---

## 📄 License

MIT License - See LICENSE file

---

## ✅ Checklist for First Run

- [ ] Clone repository
- [ ] Install Node.js & PostgreSQL
- [ ] Create `.env` file
- [ ] Create PostgreSQL database
- [ ] Run database schema
- [ ] Install npm dependencies
- [ ] Start backend server
- [ ] Start frontend development server
- [ ] Login with test credentials
- [ ] Test core features

---

**Happy coding! 🚀**
