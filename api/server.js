import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.js';
import membersRoutes from './routes/members.js';
import savingsRoutes from './routes/savings.js';
import loansRoutes from './routes/loans.js';
import dashboardRoutes from './routes/dashboard.js';
import transactionsRoutes from './routes/transactions.js';
import finesRoutes from './routes/fines.js';
import meetingsRoutes from './routes/meetings.js';
import notificationsRoutes from './routes/notifications.js';
import reportsRoutes from './routes/reports.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/loans', loansRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/fines', finesRoutes);
app.use('/api/meetings', meetingsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/reports', reportsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 VSLA Accountability System API running on http://localhost:${PORT}`);
  console.log(`📝 API Health: http://localhost:${PORT}/api/health`);
  console.log(`📚 Database: ${process.env.DB_NAME || 'vsl_accountability'}`);
});
