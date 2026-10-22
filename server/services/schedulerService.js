const db = require('../database');
const outlookService = require('./outlookService');

/**
 * Background Scheduler Service
 * Periodically monitors the scheduled email queue and automatically dispatches
 * emails when their scheduled timer arrives (e.g. at 6:30 PM).
 */
class SchedulerService {
  constructor() {
    this.timer = null;
    this.intervalMs = 10000; // Check every 10 seconds
    this.isProcessing = false;
  }

  start() {
    if (this.timer) return;
    console.log('[SchedulerService] Background email timer scheduler started. Checking queue every 10s...');
    
    // Initial check
    this.checkAndDispatchQueue();

    this.timer = setInterval(() => {
      this.checkAndDispatchQueue();
    }, this.intervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async checkAndDispatchQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const nowIso = new Date().toISOString();

      // Find all scheduled emails whose scheduled_time is in the past or now
      const pending = db.prepare(`
        SELECT * FROM emails 
        WHERE status = 'scheduled' AND scheduled_time <= ?
      `).all(nowIso);

      if (pending.length > 0) {
        console.log(`[SchedulerService] Found ${pending.length} scheduled email(s) ready for automatic dispatch.`);

        for (const item of pending) {
          try {
            console.log(`[SchedulerService] Auto-dispatching scheduled email '${item.subject}' (ID: ${item.id}) scheduled for ${item.scheduled_time}`);

            const to = JSON.parse(item.to_recipients || '[]');
            const cc = JSON.parse(item.cc_recipients || '[]');
            const bcc = JSON.parse(item.bcc_recipients || '[]');
            const attachments = JSON.parse(item.attachments || '[]');

            // Send via Outlook Service
            await outlookService.sendMail({
              userId: item.user_id,
              subject: item.subject,
              body: item.body,
              toRecipients: to,
              ccRecipients: cc,
              bccRecipients: bcc,
              attachments
            });

            // Mark this scheduled item as sent
            db.prepare(`
              UPDATE emails 
              SET status = 'sent', sent_at = ?, sync_status = 'dispatched_by_timer'
              WHERE id = ?
            `).run(new Date().toISOString(), item.id);

            console.log(`[SchedulerService] Successfully delivered scheduled email '${item.subject}' to ${to.length + cc.length} recipients.`);
          } catch (err) {
            console.error(`[SchedulerService] Failed to dispatch scheduled email ${item.id}:`, err);
            db.prepare(`
              UPDATE emails 
              SET error_message = ?
              WHERE id = ?
            `).run(err.message, item.id);
          }
        }
      }
    } catch (err) {
      console.error('[SchedulerService] Queue check error:', err);
    } finally {
      this.isProcessing = false;
    }
  }

  cancelScheduled(emailId, userId) {
    const email = db.prepare('SELECT * FROM emails WHERE id = ? AND user_id = ?').get(emailId, userId);
    if (!email) throw new Error('Scheduled email not found');
    if (email.status !== 'scheduled') throw new Error(`Cannot cancel email with status: ${email.status}`);

    db.prepare('DELETE FROM emails WHERE id = ?').run(emailId);
    return { success: true, message: 'Scheduled email cancelled successfully' };
  }

  async triggerImmediateSend(emailId, userId) {
    const item = db.prepare('SELECT * FROM emails WHERE id = ? AND user_id = ?').get(emailId, userId);
    if (!item) throw new Error('Email not found');

    const to = JSON.parse(item.to_recipients || '[]');
    const cc = JSON.parse(item.cc_recipients || '[]');
    const bcc = JSON.parse(item.bcc_recipients || '[]');
    const attachments = JSON.parse(item.attachments || '[]');

    const res = await outlookService.sendMail({
      userId: item.user_id,
      subject: item.subject,
      body: item.body,
      toRecipients: to,
      ccRecipients: cc,
      bccRecipients: bcc,
      attachments
    });

    db.prepare(`
      UPDATE emails 
      SET status = 'sent', sent_at = ?, sync_status = 'manually_triggered_early'
      WHERE id = ?
    `).run(new Date().toISOString(), emailId);

    return res;
  }
}

module.exports = new SchedulerService();
