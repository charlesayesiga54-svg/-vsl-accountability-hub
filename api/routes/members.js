import express from 'express';
import { query } from '../config/database.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all members
router.get('/', protect, async (req, res) => {
  try {
    const { groupId } = req.query;
    let sql = `
      SELECT m.id, m.user_id, u.first_name, u.last_name, u.email, u.phone,
             m.national_id, m.date_of_birth, m.gender, m.address, m.occupation,
             m.emergency_contact_name, m.emergency_contact_phone, m.membership_status,
             m.membership_date, m.share_capital,
             COALESCE(SUM(s.amount), 0) as total_savings,
             COUNT(DISTINCT l.id) as active_loans
      FROM members m
      JOIN users u ON m.user_id = u.id
      LEFT JOIN savings s ON m.id = s.member_id
      LEFT JOIN loans l ON m.id = l.member_id AND l.status != 'repaid'
      WHERE m.group_id = $1
      GROUP BY m.id, u.id
      ORDER BY u.first_name, u.last_name
    `;

    const result = await query(sql, [groupId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// Get member by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const result = await query(`
      SELECT m.*, u.email, u.phone, u.first_name, u.last_name
      FROM members m
      JOIN users u ON m.user_id = u.id
      WHERE m.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get member error:', error);
    res.status(500).json({ error: 'Failed to fetch member' });
  }
});

// Create member
router.post('/', protect, authorize('secretary', 'developer', 'admin'), async (req, res) => {
  try {
    const {
      userId, groupId, nationalId, dateOfBirth, gender, address, occupation,
      emergencyContactName, emergencyContactPhone
    } = req.body;

    const result = await query(`
      INSERT INTO members (
        user_id, group_id, national_id, date_of_birth, gender, address,
        occupation, emergency_contact_name, emergency_contact_phone
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [userId, groupId, nationalId, dateOfBirth, gender, address, occupation, emergencyContactName, emergencyContactPhone]);

    res.status(201).json({
      message: 'Member created successfully',
      member: result.rows[0],
    });
  } catch (error) {
    console.error('Create member error:', error);
    res.status(500).json({ error: 'Failed to create member' });
  }
});

// Update member
router.put('/:id', protect, authorize('secretary', 'developer', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { nationalId, dateOfBirth, gender, address, occupation, emergencyContactName, emergencyContactPhone, membershipStatus } = req.body;

    const result = await query(`
      UPDATE members
      SET national_id = COALESCE($1, national_id),
          date_of_birth = COALESCE($2, date_of_birth),
          gender = COALESCE($3, gender),
          address = COALESCE($4, address),
          occupation = COALESCE($5, occupation),
          emergency_contact_name = COALESCE($6, emergency_contact_name),
          emergency_contact_phone = COALESCE($7, emergency_contact_phone),
          membership_status = COALESCE($8, membership_status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `, [nationalId, dateOfBirth, gender, address, occupation, emergencyContactName, emergencyContactPhone, membershipStatus, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({
      message: 'Member updated successfully',
      member: result.rows[0],
    });
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// Delete member
router.delete('/:id', protect, authorize('developer', 'admin'), async (req, res) => {
  try {
    const result = await query('DELETE FROM members WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

export default router;
