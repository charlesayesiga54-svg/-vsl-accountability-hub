import express from 'express';
import { query } from '../config/database.js';
import { protect, authorize } from '../middleware/auth.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// Configure email transporter (update with your email service)
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_HOST || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send loan due reminder
router.post('/loan-reminder/:loanId', protect, authorize('secretary', 'developer', 'admin'), async (req, res) => {
  try {
    const { method = 'email' } = req.body; // email, sms, whatsapp

    const loanResult = await query(`
      SELECT l.*, m.id as member_id, u.email, u.first_name, u.last_name, u.phone
      FROM loans l
      JOIN members m ON l.member_id = m.id
      JOIN users u ON m.user_id = u.id
      WHERE l.id = $1
    `, [req.params.loanId]);

    if (loanResult.rows.length === 0) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    const loan = loanResult.rows[0];

    if (method === 'email') {
      await transporter.sendMail({
        to: loan.email,
        subject: 'Loan Repayment Reminder',
        html: `
          <h2>Loan Repayment Reminder</h2>
          <p>Dear ${loan.first_name},</p>
          <p>This is a reminder that your loan of UGX ${loan.amount.toLocaleString()} is due on ${loan.due_date}.</p>
          <p><strong>Outstanding Balance:</strong> UGX ${loan.outstanding_balance.toLocaleString()}</p>
          <p>Please arrange to make your payment.</p>
        `,
      });
    }

    // Log notification
    await query(
      `INSERT INTO notifications (user_id, notification_type, title, message, sent_via)
       VALUES ($1, $2, $3, $4, $5)`,
      [loan.user_id, 'loan_reminder', 'Loan Repayment Due', `Your loan of UGX ${loan.amount} is due on ${loan.due_date}`, method]
    );

    res.json({ message: `Reminder sent via ${method}` });
  } catch (error) {
    console.error('Send reminder error:', error);
    res.status(500).json({ error: 'Failed to send reminder' });
  }
});

// Send meeting reminder
router.post('/meeting-reminder/:meetingId', protect, authorize('secretary', 'developer', 'admin'), async (req, res) => {
  try {
    const { method = 'email' } = req.body;

    const meetingResult = await query(`
      SELECT * FROM meetings WHERE id = $1
    `, [req.params.meetingId]);

    if (meetingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const meeting = meetingResult.rows[0];

    // Get all members
    const membersResult = await query(`
      SELECT u.id, u.email, u.first_name, u.phone
      FROM members m
      JOIN users u ON m.user_id = u.id
      WHERE m.group_id = $1 AND m.membership_status = 'active'
    `, [meeting.group_id]);

    // Send reminders to all members
    for (const member of membersResult.rows) {
      if (method === 'email') {
        await transporter.sendMail({
          to: member.email,
          subject: 'Meeting Reminder',
          html: `
            <h2>Meeting Reminder</h2>
            <p>Dear ${member.first_name},</p>
            <p>You are invited to our meeting on ${new Date(meeting.meeting_date).toDateString()}.</p>
            <p><strong>Agenda:</strong> ${meeting.agenda}</p>
            <p>Please mark your attendance.</p>
          `,
        });
      }

      // Log notification
      await query(
        `INSERT INTO notifications (user_id, notification_type, title, message, sent_via)
         VALUES ($1, $2, $3, $4, $5)`,
        [member.id, 'meeting_reminder', 'Meeting Reminder', `Upcoming meeting on ${meeting.meeting_date}`, method]
      );
    }

    res.json({ message: `Reminder sent to ${membersResult.rows.length} members via ${method}` });
  } catch (error) {
    console.error('Send meeting reminder error:', error);
    res.status(500).json({ error: 'Failed to send meeting reminder' });
  }
});

// Get member notifications
router.get('/my-notifications', protect, async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 20
    `, [req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', protect, async (req, res) => {
  try {
    await query(
      'UPDATE notifications SET read = true WHERE id = $1',
      [req.params.id]
    );

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification error:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

export default router;
