import express from 'express';
import { query } from '../config/database.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all savings records
router.get('/', protect, async (req, res) => {
  try {
    const { groupId, memberId } = req.query;
    let sql = `
      SELECT s.*, m.id as member_id, u.first_name, u.last_name
      FROM savings s
      JOIN members m ON s.member_id = m.id
      JOIN users u ON m.user_id = u.id
      WHERE s.group_id = $1
    `;
    const params = [groupId];

    if (memberId) {
      sql += ` AND s.member_id = $2`;
      params.push(memberId);
    }

    sql += ` ORDER BY s.transaction_date DESC`;

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get savings error:', error);
    res.status(500).json({ error: 'Failed to fetch savings' });
  }
});

// Get member savings summary
router.get('/member/:memberId/summary', protect, async (req, res) => {
  try {
    const result = await query(`
      SELECT
        member_id,
        COUNT(*) as total_transactions,
        SUM(amount) as total_savings,
        MAX(transaction_date) as last_transaction,
        COALESCE(opening_balance, 0) as opening_balance
      FROM savings
      WHERE member_id = $1
      GROUP BY member_id, opening_balance
    `, [req.params.memberId]);

    if (result.rows.length === 0) {
      return res.json({ total_savings: 0, total_transactions: 0 });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get savings summary error:', error);
    res.status(500).json({ error: 'Failed to fetch savings summary' });
  }
});

// Record savings
router.post('/', protect, authorize('secretary', 'developer', 'admin'), async (req, res) => {
  try {
    const { memberId, groupId, savingsType, amount, openingBalance, notes } = req.body;

    if (!memberId || !groupId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await query(`
      INSERT INTO savings (member_id, group_id, savings_type, amount, opening_balance, recorded_by, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [memberId, groupId, savingsType, amount, openingBalance, req.user.id, notes]);

    res.status(201).json({
      message: 'Savings recorded successfully',
      savings: result.rows[0],
    });
  } catch (error) {
    console.error('Record savings error:', error);
    res.status(500).json({ error: 'Failed to record savings' });
  }
});

// Update savings record
router.put('/:id', protect, authorize('secretary', 'developer', 'admin'), async (req, res) => {
  try {
    const { amount, savingsType, notes } = req.body;

    const result = await query(`
      UPDATE savings
      SET amount = COALESCE($1, amount),
          savings_type = COALESCE($2, savings_type),
          notes = COALESCE($3, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `, [amount, savingsType, notes, req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Savings record not found' });
    }

    res.json({
      message: 'Savings updated successfully',
      savings: result.rows[0],
    });
  } catch (error) {
    console.error('Update savings error:', error);
    res.status(500).json({ error: 'Failed to update savings' });
  }
});

export default router;
