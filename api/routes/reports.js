import express from 'express';
import { query } from '../config/database.js';
import { protect, authorize } from '../middleware/auth.js';
import PDFDocument from 'pdfkit';
import { Response } from 'express';

const router = express.Router();

// Generate Savings Report
router.get('/savings', protect, authorize('secretary', 'developer', 'admin'), async (req, res) => {
  try {
    const { groupId, memberId, startDate, endDate } = req.query;

    let sql = `
      SELECT s.*, m.id as member_id, u.first_name, u.last_name
      FROM savings s
      JOIN members m ON s.member_id = m.id
      JOIN users u ON m.user_id = u.id
      WHERE s.group_id = $1
    `;
    const params = [groupId];

    if (memberId) {
      sql += ` AND s.member_id = $${params.length + 1}`;
      params.push(memberId);
    }

    if (startDate) {
      sql += ` AND s.transaction_date >= $${params.length + 1}`;
      params.push(startDate);
    }

    if (endDate) {
      sql += ` AND s.transaction_date <= $${params.length + 1}`;
      params.push(endDate);
    }

    sql += ` ORDER BY s.transaction_date DESC`;

    const result = await query(sql, params);

    res.json({
      report: 'Savings Report',
      generatedAt: new Date().toISOString(),
      totalRecords: result.rows.length,
      totalAmount: result.rows.reduce((sum, row) => sum + parseFloat(row.amount), 0),
      data: result.rows,
    });
  } catch (error) {
    console.error('Savings report error:', error);
    res.status(500).json({ error: 'Failed to generate savings report' });
  }
});

// Generate Loans Report
router.get('/loans', protect, authorize('secretary', 'developer', 'admin'), async (req, res) => {
  try {
    const { groupId, status, startDate, endDate } = req.query;

    let sql = `
      SELECT l.*, m.id as member_id, u.first_name, u.last_name
      FROM loans l
      JOIN members m ON l.member_id = m.id
      JOIN users u ON m.user_id = u.id
      WHERE l.group_id = $1
    `;
    const params = [groupId];

    if (status) {
      sql += ` AND l.status = $${params.length + 1}`;
      params.push(status);
    }

    if (startDate) {
      sql += ` AND l.created_at >= $${params.length + 1}`;
      params.push(startDate);
    }

    if (endDate) {
      sql += ` AND l.created_at <= $${params.length + 1}`;
      params.push(endDate);
    }

    sql += ` ORDER BY l.created_at DESC`;

    const result = await query(sql, params);

    res.json({
      report: 'Loans Report',
      generatedAt: new Date().toISOString(),
      totalLoans: result.rows.length,
      totalAmount: result.rows.reduce((sum, row) => sum + parseFloat(row.amount), 0),
      byStatus: result.rows.reduce((acc, loan) => {
        acc[loan.status] = (acc[loan.status] || 0) + 1;
        return acc;
      }, {}),
      data: result.rows,
    });
  } catch (error) {
    console.error('Loans report error:', error);
    res.status(500).json({ error: 'Failed to generate loans report' });
  }
});

// Generate Financial Statement
router.get('/financial', protect, authorize('secretary', 'developer', 'admin'), async (req, res) => {
  try {
    const { groupId, startDate, endDate } = req.query;

    // Income
    const incomeResult = await query(`
      SELECT transaction_type, COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE group_id = $1 AND transaction_type IN ('deposit', 'interest', 'dividend')
      ${startDate ? `AND transaction_date >= $${2}` : ''}
      ${endDate ? `AND transaction_date <= $${startDate ? 3 : 2}` : ''}
      GROUP BY transaction_type
    `, startDate && endDate ? [groupId, startDate, endDate] : startDate ? [groupId, startDate] : [groupId]);

    // Expenses
    const expenseResult = await query(`
      SELECT transaction_type, COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE group_id = $1 AND transaction_type IN ('withdrawal', 'fine')
      ${startDate ? `AND transaction_date >= $${2}` : ''}
      ${endDate ? `AND transaction_date <= $${startDate ? 3 : 2}` : ''}
      GROUP BY transaction_type
    `, startDate && endDate ? [groupId, startDate, endDate] : startDate ? [groupId, startDate] : [groupId]);

    const totalIncome = incomeResult.rows.reduce((sum, row) => sum + parseFloat(row.total), 0);
    const totalExpense = expenseResult.rows.reduce((sum, row) => sum + parseFloat(row.total), 0);

    res.json({
      report: 'Financial Statement',
      period: { startDate, endDate },
      generatedAt: new Date().toISOString(),
      income: {
        breakdown: incomeResult.rows,
        total: totalIncome,
      },
      expenses: {
        breakdown: expenseResult.rows,
        total: totalExpense,
      },
      netIncome: totalIncome - totalExpense,
    });
  } catch (error) {
    console.error('Financial report error:', error);
    res.status(500).json({ error: 'Failed to generate financial statement' });
  }
});

// Generate Member Statement
router.get('/member/:memberId', protect, async (req, res) => {
  try {
    const { memberId } = req.params;

    // Member info
    const memberResult = await query(`
      SELECT m.*, u.first_name, u.last_name, u.email, u.phone
      FROM members m
      JOIN users u ON m.user_id = u.id
      WHERE m.id = $1
    `, [memberId]);

    if (memberResult.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const member = memberResult.rows[0];

    // Savings
    const savingsResult = await query(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM savings
      WHERE member_id = $1
    `, [memberId]);

    // Active loans
    const loansResult = await query(`
      SELECT COALESCE(SUM(outstanding_balance), 0) as total
      FROM loans
      WHERE member_id = $1 AND status != 'repaid'
    `, [memberId]);

    // Repayment history
    const repaymentsResult = await query(`
      SELECT * FROM loan_repayments
      WHERE member_id = $1
      ORDER BY payment_date DESC
      LIMIT 10
    `, [memberId]);

    res.json({
      report: 'Member Account Statement',
      generatedAt: new Date().toISOString(),
      member: {
        id: member.id,
        name: `${member.first_name} ${member.last_name}`,
        email: member.email,
        phone: member.phone,
        membershipDate: member.membership_date,
        status: member.membership_status,
      },
      summary: {
        totalSavings: parseFloat(savingsResult.rows[0].total),
        outstandingLoans: parseFloat(loansResult.rows[0].total),
        recentRepayments: repaymentsResult.rows,
      },
    });
  } catch (error) {
    console.error('Member statement error:', error);
    res.status(500).json({ error: 'Failed to generate member statement' });
  }
});

// Generate Attendance Report
router.get('/attendance', protect, authorize('secretary', 'developer', 'admin'), async (req, res) => {
  try {
    const { groupId, meetingId } = req.query;

    let sql = `
      SELECT ma.*, m.id as member_id, u.first_name, u.last_name, mt.meeting_date, mt.agenda
      FROM meeting_attendance ma
      JOIN meetings mt ON ma.meeting_id = mt.id
      JOIN members m ON ma.member_id = m.id
      JOIN users u ON m.user_id = u.id
      WHERE mt.group_id = $1
    `;
    const params = [groupId];

    if (meetingId) {
      sql += ` AND ma.meeting_id = $${params.length + 1}`;
      params.push(meetingId);
    }

    sql += ` ORDER BY mt.meeting_date DESC, u.first_name`;

    const result = await query(sql, params);

    const attendance = result.rows.reduce((acc, row) => {
      const meeting = acc.find(m => m.meetingId === row.meeting_id);
      if (!meeting) {
        acc.push({
          meetingId: row.meeting_id,
          date: row.meeting_date,
          agenda: row.agenda,
          attendees: [],
        });
      }
      acc[acc.length - 1].attendees.push({
        memberId: row.member_id,
        name: `${row.first_name} ${row.last_name}`,
        attended: row.attended,
        contribution: row.contribution_amount,
      });
      return acc;
    }, []);

    res.json({
      report: 'Attendance Report',
      generatedAt: new Date().toISOString(),
      data: attendance,
    });
  } catch (error) {
    console.error('Attendance report error:', error);
    res.status(500).json({ error: 'Failed to generate attendance report' });
  }
});

export default router;
