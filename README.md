# VSLA Accountability System

A modern, responsive web application for **Village Savings and Loan Associations (VSLA)**. Built with Node.js, Express, and PostgreSQL.

## 🎯 Features

### User Roles
- **Developer**: Full system management, user management, backup/restore
- **Secretary**: Member registration, savings/loan recording, attendance tracking
- **Member**: View personal accounts, savings, loans, repayments
- **Admin**: System configuration and oversight

### Core Modules
- 👥 **Member Management**: Registration, profiles, status tracking
- 💰 **Savings Module**: Weekly/voluntary savings, interest calculation
- 💳 **Loan Management**: Applications, approvals, repayments, penalty tracking
- 📊 **Dashboard**: Real-time statistics and financial overview
- 📈 **Reports**: PDF generation for all financial documents
- 📢 **Notifications**: WhatsApp, SMS, Email reminders
- 📋 **Meeting Management**: Attendance, agenda, minutes
- 🔐 **Security**: Encrypted passwords, JWT tokens, audit logs

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v12+)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/charlesayesiga54-svg/-vsl-accountability-hub.git
   cd -vsl-accountability-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup Database**
   - Create PostgreSQL database:
     ```sql
     CREATE DATABASE vsl_accountability;
     ```
   - Run schema:
     ```bash
     psql -U postgres -d vsl_accountability -f api/config/database-schema.sql
     ```

4. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

Server will run on `http://localhost:5000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/change-password` - Change password

### Members
- `GET /api/members` - Get all members
- `GET /api/members/:id` - Get member details
- `POST /api/members` - Create member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

### Savings
- `GET /api/savings` - Get savings records
- `GET /api/savings/member/:memberId/summary` - Member savings summary
- `POST /api/savings` - Record savings
- `PUT /api/savings/:id` - Update savings

### Loans
- `GET /api/loans` - Get all loans
- `POST /api/loans` - Apply for loan
- `PUT /api/loans/:id/approve` - Approve loan
- `POST /api/loans/:loanId/repayment` - Record repayment

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🔐 Security

- ✅ Bcrypt password hashing
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ SQL injection prevention
- ✅ Audit logging
- ✅ Secure password change

## �� Project Structure

```
├── api/
│   ├── config/
│   │   ├── database.js
│   │   └── database-schema.sql
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── members.js
│   │   ├── savings.js
│   │   ├── loans.js
│   │   └── dashboard.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🛠️ Development

### Start Development Server
```bash
npm run dev
```

### Database Migrations
```bash
psql -U postgres -d vsl_accountability -f api/config/database-schema.sql
```

## 📝 License

MIT License - See LICENSE file for details

## 👥 Contributing

Contributions welcome! Please fork and create a pull request.

## 📧 Support

For support, email: charlesayesiga54@gmail.com
