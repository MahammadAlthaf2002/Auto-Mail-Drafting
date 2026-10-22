const express = require('express');
const router = express.Router();
const outlookService = require('../services/outlookService');
const schedulerService = require('../services/schedulerService');
const inboxTaskSyncService = require('../services/inboxTaskSyncService');
const db = require('../database');

// Option 1: Save directly to Outlook Drafts
router.post('/draft', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr-althaf';
    const { subject, body, htmlBody, toRecipients, ccRecipients, bccRecipients, attachments } = req.body;

    if (!subject && !body) {
      return res.status(400).json({ success: false, error: 'Subject or body required for draft' });
    }

    const result = await outlookService.saveDraft({
      userId,
      subject: subject || '(No Subject)',
      body: body || '',
      htmlBody: htmlBody || null,
      toRecipients: toRecipients || [],
      ccRecipients: ccRecipients || [],
      bccRecipients: bccRecipients || [],
      attachments: attachments || []
    });

    res.json({ success: true, result });
  } catch (err) {
    console.error('Save draft error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Generate direct Chrome Outlook Web compose link
router.post('/web-outlook-link', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr-althaf';
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    const { toRecipients, ccRecipients, subject, body } = req.body;
    const url = outlookService.generateWebOutlookUrl({
      toRecipients: toRecipients || [],
      ccRecipients: ccRecipients || [],
      subject: subject || '',
      body: body || '',
      type: user?.outlook_type || 'work'
    });
    res.json({ success: true, url });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Download or Open draft as native Outlook .eml file (opens in Microsoft Outlook with rich table already rendered!)
router.post('/download-draft-eml', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr-althaf';
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    const { toRecipients, ccRecipients, subject, body, htmlBody } = req.body;

    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const defaultSubject = `Daily Status Report [${dd}-${mm}-${yyyy}]`;

    const emlContent = outlookService.generateEmlContent({
      user: user || { name: 'Syed Mahammad Althaf', email: 'althaf.syed@nybinfotech.com' },
      toRecipients: toRecipients || [],
      ccRecipients: ccRecipients || [],
      subject: subject || defaultSubject,
      body: body || '',
      htmlBody: htmlBody || null
    });

    res.setHeader('Content-Type', 'message/rfc822');
    res.setHeader('Content-Disposition', `attachment; filename="Outlook_Draft_EOD_${Date.now()}.eml"`);
    res.send(emlContent);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Option 2: Send directly via Outlook immediately
router.post('/send', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr-althaf';
    const { subject, body, htmlBody, toRecipients, ccRecipients, bccRecipients, attachments } = req.body;

    if (!toRecipients || toRecipients.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one TO recipient is required' });
    }
    if (!subject) {
      return res.status(400).json({ success: false, error: 'Subject line is required to send' });
    }

    const result = await outlookService.sendMail({
      userId,
      subject,
      body: body || '',
      htmlBody: htmlBody || null,
      toRecipients,
      ccRecipients: ccRecipients || [],
      bccRecipients: bccRecipients || [],
      attachments: attachments || []
    });

    res.json({ success: true, result });
  } catch (err) {
    console.error('Send mail error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Option 3: Schedule with timer (e.g., 6:30 PM)
router.post('/schedule', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr-althaf';
    const { subject, body, htmlBody, toRecipients, ccRecipients, bccRecipients, attachments, scheduledTime } = req.body;

    if (!scheduledTime) {
      return res.status(400).json({ success: false, error: 'Scheduled time is required' });
    }
    if (!toRecipients || toRecipients.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one TO recipient is required' });
    }

    const scheduledDate = new Date(scheduledTime);
    if (isNaN(scheduledDate.getTime())) {
      return res.status(400).json({ success: false, error: 'Invalid scheduled time format' });
    }

    const result = await outlookService.scheduleMail({
      userId,
      subject: subject || '(No Subject)',
      body: body || '',
      htmlBody: htmlBody || null,
      toRecipients,
      ccRecipients: ccRecipients || [],
      bccRecipients: bccRecipients || [],
      attachments: attachments || [],
      scheduledTime: scheduledDate.toISOString()
    });

    res.json({ success: true, result });
  } catch (err) {
    console.error('Schedule email error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get full weekly task chart (Day 1 to Day 5 with topics & tasks from Prasanna Gunji)
router.get('/weekly-chart', (req, res) => {
  try {
    const chart = inboxTaskSyncService.getAllDaysChart();
    res.json(chart);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Parse and sync raw weekly email text from Prasanna Gunji
router.post('/parse-weekly-email', (req, res) => {
  try {
    const { emailText, syncSource } = req.body;
    const result = inboxTaskSyncService.parseWeeklyEmailContent(emailText, syncSource || 'Pasted Email Text');
    res.json(result);
  } catch (err) {
    console.error('Parse weekly email error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});

// Update a specific day's topics, tasks, or holiday status
router.put('/weekly-day/:id', (req, res) => {
  try {
    const result = inboxTaskSyncService.updateDay(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Set active day override for EOD generation (1 to 5)
router.post('/set-active-eod-day', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr-althaf';
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    const { dayNumber } = req.body;
    inboxTaskSyncService.setActiveDayOverride(dayNumber);
    const schedule = inboxTaskSyncService.getTodaySchedule(dayNumber);
    const htmlTable = inboxTaskSyncService.generateHtmlTable(schedule);
    const body = inboxTaskSyncService.generateTextFormat(schedule, user);
    res.json({ success: true, activeDayNumber: dayNumber, schedule, htmlTable, body });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Sync weekly assigned tasks from Prasanna Gunji (Outlook inbox scan)
router.post('/sync-inbox-tasks', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr-althaf';
    const result = await inboxTaskSyncService.scanInboxForWeeklyEmail(userId);
    res.json(result);
  } catch (err) {
    console.error('Sync inbox tasks error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get current EOD schedule table (optional ?day=1..5 query)
router.get('/eod-schedule', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr-althaf';
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    const targetDay = req.query.day ? parseInt(req.query.day, 10) : null;
    const schedule = inboxTaskSyncService.getTodaySchedule(targetDay);
    const htmlTable = inboxTaskSyncService.generateHtmlTable(schedule);
    const body = inboxTaskSyncService.generateTextFormat(schedule, user);
    res.json({ success: true, schedule, htmlTable, body });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get user mailbox overview (Drafts, Sent, Scheduled with stats)
router.get('/mailbox', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr-althaf';
    const overview = outlookService.getMailboxOverview(userId);
    res.json({ success: true, ...overview });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Cancel a scheduled email
router.delete('/scheduled/:id', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr-althaf';
    const result = schedulerService.cancelScheduled(req.params.id, userId);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Force send a scheduled email immediately
router.post('/scheduled/:id/send-now', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr-althaf';
    const result = await schedulerService.triggerImmediateSend(req.params.id, userId);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete a draft
router.delete('/:id', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr-althaf';
    db.prepare('DELETE FROM emails WHERE id = ? AND user_id = ?').run(req.params.id, userId);
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
