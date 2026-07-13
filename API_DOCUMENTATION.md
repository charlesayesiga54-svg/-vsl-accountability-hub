# API Documentation - VSLA Accountability System

## Base URL
```
http://localhost:5000/api
```

## Authentication

All endpoints (except `/auth/login` and `/auth/register`) require JWT token:

```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+256700000000",
  "groupId": 1,
  "role": "member"
}

Response 201:
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "member"
  },
  "token": "eyJhbGc..."
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response 200:
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "member"
  },
  "token": "eyJhbGc..."
}
```

### Change Password
```http
POST /auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}

Response 200:
{
  "message": "Password changed successfully"
}
```

---

## Members Endpoints

### Get All Members
```http
GET /members?groupId=1
Authorization: Bearer <token>

Response 200:
[
  {
    "id": 1,
    "user_id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+256700000000",
    "membership_status": "active",
    "total_savings": 500000,
    "active_loans": 1
  }
]
```

### Get Member by ID
```http
GET /members/1
Authorization: Bearer <token>

Response 200:
{
  "id": 1,
  "user_id": 1,
  "national_id": "CM123456",
  "date_of_birth": "1990-05-15",
  "gender": "Male",
  "address": "123 Main Street",
  "occupation": "Farmer",
  "membership_status": "active"
}
```

### Create Member
```http
POST /members
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": 1,
  "groupId": 1,
  "nationalId": "CM123456",
  "dateOfBirth": "1990-05-15",
  "gender": "Male",
  "address": "123 Main Street",
  "occupation": "Farmer",
  "emergencyContactName": "Jane Doe",
  "emergencyContactPhone": "+256700000001"
}

Response 201:
{
  "message": "Member created successfully",
  "member": { ... }
}
```

---

## Savings Endpoints

### Get All Savings
```http
GET /savings?groupId=1&memberId=1
Authorization: Bearer <token>

Response 200:
[
  {
    "id": 1,
    "member_id": 1,
    "savings_type": "weekly",
    "amount": 50000,
    "transaction_date": "2026-07-13",
    "created_at": "2026-07-13T10:00:00Z"
  }
]
```

### Record Savings
```http
POST /savings
Authorization: Bearer <token>
Content-Type: application/json

{
  "memberId": 1,
  "groupId": 1,
  "savingsType": "weekly",
  "amount": 50000,
  "openingBalance": 0,
  "notes": "Weekly savings deposit"
}

Response 201:
{
  "message": "Savings recorded successfully",
  "savings": { ... }
}
```

### Get Savings Summary
```http
GET /savings/member/1/summary
Authorization: Bearer <token>

Response 200:
{
  "member_id": 1,
  "total_transactions": 52,
  "total_savings": 2600000,
  "last_transaction": "2026-07-13"
}
```

---

## Loans Endpoints

### Get All Loans
```http
GET /loans?groupId=1&status=active
Authorization: Bearer <token>

Response 200:
[
  {
    "id": 1,
    "member_id": 1,
    "amount": 1000000,
    "purpose": "Business expansion",
    "status": "active",
    "outstanding_balance": 800000,
    "due_date": "2026-12-13"
  }
]
```

### Apply for Loan
```http
POST /loans
Authorization: Bearer <token>
Content-Type: application/json

{
  "memberId": 1,
  "groupId": 1,
  "amount": 1000000,
  "purpose": "Business expansion",
  "guarantor1Id": 2,
  "guarantor2Id": 3,
  "durationMonths": 12
}

Response 201:
{
  "message": "Loan application submitted",
  "loan": { ... }
}
```

### Approve Loan
```http
PUT /loans/1/approve
Authorization: Bearer <token>

Response 200:
{
  "message": "Loan approved successfully",
  "loan": { ... }
}
```

### Record Repayment
```http
POST /loans/1/repayment
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 100000,
  "interestPaid": 10000,
  "penaltiesPaid": 0,
  "receiptNumber": "REC001",
  "notes": "Monthly installment"
}

Response 201:
{
  "message": "Repayment recorded successfully",
  "repayment": { ... }
}
```

---

## Dashboard Endpoints

### Get Dashboard Statistics
```http
GET /dashboard/stats?groupId=1
Authorization: Bearer <token>

Response 200:
{
  "totalMembers": 50,
  "totalSavings": 2600000,
  "activeLoans": 8,
  "activeLoanAmount": 5000000,
  "loanRepayments": 800000,
  "cashBalance": 1500000,
  "monthlyIncome": 500000,
  "monthlyExpenses": 200000,
  "recentTransactions": [...],
  "upcomingMeetings": [...]
}
```

---

## Reports Endpoints

### Financial Statement
```http
GET /reports/financial?groupId=1&startDate=2026-01-01&endDate=2026-07-31
Authorization: Bearer <token>

Response 200:
{
  "report": "Financial Statement",
  "income": {
    "breakdown": [...],
    "total": 2000000
  },
  "expenses": {
    "breakdown": [...],
    "total": 500000
  },
  "netIncome": 1500000
}
```

### Savings Report
```http
GET /reports/savings?groupId=1
Authorization: Bearer <token>

Response 200:
{
  "report": "Savings Report",
  "totalRecords": 260,
  "totalAmount": 2600000,
  "data": [...]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid token"
}
```

### 403 Forbidden
```json
{
  "error": "Unauthorized access"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

- Rate limit: 100 requests per 15 minutes per IP
- Headers included in response

---

## Pagination

Supported on list endpoints:
```http
GET /members?groupId=1&page=1&limit=20
```

---

## Testing with cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@vsla.com","password":"password123"}'

# Get Members
curl -X GET 'http://localhost:5000/api/members?groupId=1' \
  -H "Authorization: Bearer <token>"

# Record Savings
curl -X POST http://localhost:5000/api/savings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "memberId": 1,
    "groupId": 1,
    "savingsType": "weekly",
    "amount": 50000
  }'
```

---

**API Documentation Complete! 📚**
