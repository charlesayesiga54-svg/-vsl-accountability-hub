import express from 'express';
import { query } from '../config/database.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all meetings
router.get('/', protect, async (req, res) => {
  try {
    const { groupId } = req.query;

    const result = await query(`
      SELECT m.*, u.first_name, u.last_name
      FROM meetings m
      JOIN users u ON m.created_by = u.id
      WHERE m.group_id = $1
      ORDER BY m.meeting_date DESC
    `, [groupId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

// Create meeting
router.post('/', protect, authorize('secretary', 'developer', 'admin'), async (req, res) => {
  try {\n    const { groupId, meetingDate, agenda } = req.body;

    if (!groupId || !meetingDate) {
      return res.status(400).json({ error: 'Group ID and meeting date required' });
    }

    const result = await query(`
      INSERT INTO meetings (group_id, meeting_date, agenda, created_by)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [groupId, meetingDate, agenda, req.user.id]);

    res.status(201).json({
      message: 'Meeting created successfully',
      meeting: result.rows[0],
    });
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({ error: 'Failed to create meeting' });
  }
});

// Record attendance
router.post('/:meetingId/attendance', protect, authorize('secretary', 'developer', 'admin'), async (req, res) => {
  try {
    const { memberId, attended, contribution } = req.body;
    const { meetingId } = req.params;

    const result = await query(`
      INSERT INTO meeting_attendance (meeting_id, member_id, attended, contribution_amount)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (meeting_id, member_id) DO UPDATE
      SET attended = $3, contribution_amount = $4
      RETURNING *
    `, [meetingId, memberId, attended, contribution]);

    res.status(201).json({
      message: 'Attendance recorded',
      attendance: result.rows[0],
    });
  } catch (error) {
    console.error('Record attendance error:', error);
    res.status(500).json({ error: 'Failed to record attendance' });
  }
});

// Update meeting minutes
router.put('/:id/minutes', protect, authorize('secretary', 'developer', 'admin'), async (req, res) => {
  try {
    const { minutes } = req.body;

    const result = await query(`
      UPDATE meetings
      SET meeting_minutes = $1
      WHERE id = $2
      RETURNING *
    `, [minutes, req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json({
      message: 'Meeting minutes updated',
      meeting: result.rows[0],
    });
  } catch (error) {
    console.error('Update minutes error:', error);
    res.status(500).json({ error: 'Failed to update meeting minutes' });
  }
});

export default router;
