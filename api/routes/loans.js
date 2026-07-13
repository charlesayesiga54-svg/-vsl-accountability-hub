import express from 'express';
import { query } from '../config/database.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all loans
router.get('/', protect, async (req, res) => {
  try {
    const { groupId, status } = req.query;
    let sql = `
      SELECT l.*, m.id as member_id, u.first_name, u.last_name
      FROM loans l
      JOIN members m ON l.member_id = m.id
      JOIN users u ON m.user_id = u.id
      WHERE l.group_id = $1
    `;
    const params = [groupId];

    if (status) {
      sql += ` AND l.status = $2`;
      params.push(status);
    }

    sql += ` ORDER BY l.created_at DESC`;

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({ error: 'Failed to fetch loans' });
  }
});

// Apply for loan
router.post('/', protect, async (req, res) => {
  try {
    const { memberId, groupId, amount, purpose, guarantor1Id, guarantor2Id, durationMonths } = req.body;

    if (!memberId || !groupId || !amount || !durationMonths) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get group interest rate
    const groupResult = await query('SELECT interest_rate FROM groups WHERE id = $1', [groupId]);
    const interestRate = groupResult.rows[0].interest_rate;

    // Calculate due date
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + durationMonths);

    const result = await query(`
      INSERT INTO loans (
        member_id, group_id, amount, purpose, interest_rate,
        duration_months, guarantor1_id, guarantor2_id, due_date, outstanding_balance
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [memberId, groupId, amount, purpose, interestRate, durationMonths, guarantor1Id, guarantor2Id, dueDate, amount]);

    res.status(201).json({
      message: 'Loan application submitted',
      loan: result.rows[0],
    });
  } catch (error) {
    console.error('Apply loan error:', error);
    res.status(500).json({ error: 'Failed to apply for loan' });
  }
});

// Approve loan
router.put('/:id/approve', protect, authorize('secretary', 'developer', 'admin'), async (req, res) => {
  try {
    const result = await query(`
      UPDATE loans
      SET status = 'approved',
          approved_by = $1,
          approval_date = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [req.user.id, req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    res.json({
      message: 'Loan approved successfully',
      loan: result.rows[0],
    });
  } catch (error) {
    console.error('Approve loan error:', error);
    res.status(500).json({ error: 'Failed to approve loan' });
  }
});

// Record repayment
router.post('/:loanId/repayment', protect, authorize('secretary', 'developer', 'admin'), async (req, res) => {
  try {
    const { amount, interestPaid, penaltiesPaid, receiptNumber, notes } = req.body;
    const { loanId } = req.params;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    // Get loan details
    const loanResult = await query('SELECT member_id FROM loans WHERE id = $1', [loanId]);
    if (loanResult.rows.length === 0) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    // Record repayment
    const result = await query(`
      INSERT INTO loan_repayments (
        loan_id, member_id, amount, interest_paid, penalties_paid,
        receipt_number, recorded_by, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [loanId, loanResult.rows[0].member_id, amount, interestPaid || 0, penaltiesPaid || 0, receiptNumber, req.user.id, notes]);

    // Update outstanding balance
    await query(`
      UPDATE loans
      SET outstanding_balance = outstanding_balance - $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [amount, loanId]);

    res.status(201).json({
      message: 'Repayment recorded successfully',
      repayment: result.rows[0],
    });
  } catch (error) {
    console.error('Record repayment error:', error);
    res.status(500).json({ error: 'Failed to record repayment' });
  }
});

export default router;
