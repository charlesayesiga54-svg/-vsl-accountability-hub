import express from 'express';
import { query } from '../config/database.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Record fine
router.post('/', protect, authorize('secretary', 'developer', 'admin'), async (req, res) => {
  try {
    const { memberId, groupId, reason, amount } = req.body;

    if (!memberId || !groupId || !reason || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await query(`
      INSERT INTO fines (member_id, group_id, reason, amount, recorded_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [memberId, groupId, reason, amount, req.user.id]);

    res.status(201).json({
      message: 'Fine recorded successfully',
      fine: result.rows[0],
    });
  } catch (error) {
    console.error('Record fine error:', error);
    res.status(500).json({ error: 'Failed to record fine' });
  }
});

// Get fines
router.get('/', protect, async (req, res) => {
  try {
    const { groupId, memberId, paid } = req.query;

    let sql = `
      SELECT f.*, m.id as member_id, u.first_name, u.last_name
      FROM fines f
      JOIN members m ON f.member_id = m.id
      JOIN users u ON m.user_id = u.id
      WHERE f.group_id = $1
    `;
    const params = [groupId];

    if (memberId) {
      sql += ` AND f.member_id = $${params.length + 1}`;
      params.push(memberId);
    }

    if (paid !== undefined) {
      sql += ` AND f.paid = $${params.length + 1}`;
      params.push(paid === 'true');
    }

    sql += ` ORDER BY f.fine_date DESC`;

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get fines error:', error);
    res.status(500).json({ error: 'Failed to fetch fines' });
  }
});

// Mark fine as paid
router.put('/:id/pay', protect, authorize('secretary', 'developer', 'admin'), async (req, res) => {
  try {
    const result = await query(`
      UPDATE fines
      SET paid = true, paid_date = CURRENT_DATE
      WHERE id = $1
      RETURNING *
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fine not found' });
    }

    res.json({
      message: 'Fine marked as paid',
      fine: result.rows[0],
    });
  } catch (error) {
    console.error('Mark fine paid error:', error);
    res.status(500).json({ error: 'Failed to mark fine as paid' });
  }
});

export default router;
