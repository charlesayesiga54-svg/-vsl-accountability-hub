import express from 'express';
import { query } from '../config/database.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', protect, async (req, res) => {
  try {
    const { groupId } = req.query;

    if (!groupId) {
      return res.status(400).json({ error: 'Group ID is required' });
    }

    // Total Members
    const membersResult = await query(
      'SELECT COUNT(*) as count FROM members WHERE group_id = $1 AND membership_status = \'active\'',
      [groupId]
    );

    // Total Savings
    const savingsResult = await query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM savings WHERE group_id = $1',
      [groupId]
    );

    // Active Loans
    const loansResult = await query(
      'SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total_amount FROM loans WHERE group_id = $1 AND status = \'active\'',
      [groupId]
    );

    // Loan Repayments (this month)
    const repaymentsResult = await query(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM loan_repayments
      WHERE loan_id IN (SELECT id FROM loans WHERE group_id = $1)
        AND payment_date >= date_trunc('month', CURRENT_DATE)
    `, [groupId]);

    // Cash Balance
    const incomeResult = await query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE group_id = $1 AND transaction_type = \'deposit\'',
      [groupId]
    );

    const expenseResult = await query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE group_id = $1 AND transaction_type = \'withdrawal\'',
      [groupId]
    );

    const cashBalance = parseFloat(incomeResult.rows[0].total) - parseFloat(expenseResult.rows[0].total);

    // Monthly Income (current month)
    const monthlyIncomeResult = await query(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE group_id = $1
        AND transaction_type = 'deposit'
        AND transaction_date >= date_trunc('month', CURRENT_DATE)
    `, [groupId]);

    // Monthly Expenses (current month)
    const monthlyExpenseResult = await query(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE group_id = $1
        AND transaction_type = 'withdrawal'
        AND transaction_date >= date_trunc('month', CURRENT_DATE)
    `, [groupId]);

    // Recent Transactions
    const recentTransactionsResult = await query(`
      SELECT id, transaction_type, amount, description, transaction_date
      FROM transactions
      WHERE group_id = $1
      ORDER BY transaction_date DESC
      LIMIT 10
    `, [groupId]);

    // Upcoming Meetings
    const upcomingMeetingsResult = await query(`
      SELECT id, meeting_date, agenda
      FROM meetings
      WHERE group_id = $1 AND meeting_date >= CURRENT_TIMESTAMP
      ORDER BY meeting_date ASC
      LIMIT 5
    `, [groupId]);

    res.json({
      totalMembers: parseInt(membersResult.rows[0].count),
      totalSavings: parseFloat(savingsResult.rows[0].total),
      activeLoans: parseInt(loansResult.rows[0].count),
      activeLoanAmount: parseFloat(loansResult.rows[0].total_amount),
      loanRepayments: parseFloat(repaymentsResult.rows[0].total),
      cashBalance,
      monthlyIncome: parseFloat(monthlyIncomeResult.rows[0].total),
      monthlyExpenses: parseFloat(monthlyExpenseResult.rows[0].total),
      recentTransactions: recentTransactionsResult.rows,
      upcomingMeetings: upcomingMeetingsResult.rows,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

export default router;
