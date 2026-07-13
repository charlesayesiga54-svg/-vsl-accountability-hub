import express from 'express';
import { query } from '../config/database.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Record transaction
router.post('/', protect, authorize('secretary', 'developer', 'admin'), async (req, res) => {
  try {
    const { groupId, transactionType, amount, description, referenceNumber } = req.body;

    if (!groupId || !transactionType || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await query(`
      INSERT INTO transactions (group_id, transaction_type, amount, description, reference_number, recorded_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [groupId, transactionType, amount, description, referenceNumber, req.user.id]);

    res.status(201).json({
      message: 'Transaction recorded successfully',
      transaction: result.rows[0],
    });
  } catch (error) {
    console.error('Record transaction error:', error);
    res.status(500).json({ error: 'Failed to record transaction' });
  }
});

// Get transactions
router.get('/', protect, async (req, res) => {
  try {
    const { groupId, transactionType, startDate, endDate } = req.query;

    let sql = `
      SELECT * FROM transactions
      WHERE group_id = $1
    `;
    const params = [groupId];

    if (transactionType) {
      sql += ` AND transaction_type = $${params.length + 1}`;
      params.push(transactionType);
    }

    if (startDate) {
      sql += ` AND transaction_date >= $${params.length + 1}`;
      params.push(startDate);
    }

    if (endDate) {
      sql += ` AND transaction_date <= $${params.length + 1}`;
      params.push(endDate);
    }

    sql += ` ORDER BY transaction_date DESC`;

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get cashbook (all transactions)
router.get('/cashbook/view', protect, async (req, res) => {
  try {
    const { groupId } = req.query;

    const result = await query(`
      SELECT 
        transaction_date,
        transaction_type,
        description,
        amount,
        CASE WHEN transaction_type IN ('deposit', 'interest', 'dividend') THEN amount ELSE 0 END as debit,
        CASE WHEN transaction_type IN ('withdrawal', 'fine') THEN amount ELSE 0 END as credit
      FROM transactions
      WHERE group_id = $1
      ORDER BY transaction_date ASC
    `, [groupId]);

    // Calculate running balance
    let balance = 0;
    const cashbook = result.rows.map(row => {
      balance = balance + row.debit - row.credit;
      return { ...row, balance };
    });

    res.json({
      report: 'Cashbook',
      generatedAt: new Date().toISOString(),
      data: cashbook,
      summary: {
        totalDebit: cashbook.reduce((sum, row) => sum + row.debit, 0),
        totalCredit: cashbook.reduce((sum, row) => sum + row.credit, 0),
        closingBalance: balance,
      },
    });
  } catch (error) {
    console.error('Get cashbook error:', error);
    res.status(500).json({ error: 'Failed to fetch cashbook' });
  }
});

export default router;
