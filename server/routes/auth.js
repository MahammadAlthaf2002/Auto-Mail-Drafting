const express = require('express');
const router = express.Router();
const db = require('../database');
const outlookService = require('../services/outlookService');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

// Get all company users
router.get('/users', (req, res) => {
  try {
    const users = db.prepare('SELECT id, name, email, outlook_email, department, role, avatar, outlook_connected, outlook_type FROM users').all();
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get currently active user profile
router.get('/me', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr-althaf';
    let user = db.prepare("SELECT id, name, email, outlook_email, outlook_type, department, role, avatar, outlook_connected, outlook_tenant_id, outlook_client_id, (outlook_password != '') as has_password, (outlook_access_token != '') as has_token FROM users WHERE id = ?").get(userId);
    if (!user) {
      user = db.prepare("SELECT id, name, email, outlook_email, outlook_type, department, role, avatar, outlook_connected, outlook_tenant_id, outlook_client_id, (outlook_password != '') as has_password, (outlook_access_token != '') as has_token FROM users LIMIT 1").get();
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 1. Send OTP to User's Email
router.post('/send-otp', async (req, res) => {
  try {
    const { email, purpose = 'login' } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, error: 'Email address is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const id = 'otp-' + uuidv4().substring(0, 8);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins expiry

    // Delete any previous pending OTPs for this email
    db.prepare('DELETE FROM otp_codes WHERE email = ?').run(cleanEmail);

    // Insert new OTP
    db.prepare(`
      INSERT INTO otp_codes (id, email, code, purpose, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, cleanEmail, otpCode, purpose, expiresAt);

    // Try sending email via real Outlook SMTP if configured
    let emailSentToInbox = false;
    try {
      const activeUser = db.prepare("SELECT * FROM users WHERE outlook_email != '' AND outlook_password != '' LIMIT 1").get();
      if (activeUser) {
        const smtpHost = activeUser.outlook_type === 'personal' ? 'smtp-mail.outlook.com' : 'smtp.office365.com';
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: 587,
          secure: false,
          auth: { user: activeUser.outlook_email, pass: activeUser.outlook_password },
          tls: { ciphers: 'SSLv3' }
        });

        await transporter.sendMail({
          from: `"MailCraft Outlook Security" <${activeUser.outlook_email}>`,
          to: cleanEmail,
          subject: `Your Outlook Login Verification Code: ${otpCode}`,
          text: `Your MailCraft AI Outlook verification code is: ${otpCode}. It expires in 10 minutes.`,
          html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; padding: 24px; border: 1px solid #edebe9; border-radius: 8px;">
              <h2 style="color: #0078d4; margin-top: 0;">Microsoft Outlook Security Code</h2>
              <p style="font-size: 14px; color: #323130;">Use the following code to sign in to your MailCraft AI Outlook assistant:</p>
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0078d4; background: #eff6fc; padding: 16px; text-align: center; border-radius: 6px; margin: 20px 0;">
                ${otpCode}
              </div>
              <p style="font-size: 12px; color: #605e5c;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
            </div>
          `
        });
        emailSentToInbox = true;
      }
    } catch (mailErr) {
      console.warn('Could not dispatch OTP via SMTP:', mailErr.message);
    }

    res.json({
      success: true,
      message: emailSentToInbox 
        ? `Verification code dispatched to ${cleanEmail}.` 
        : `Verification code generated for ${cleanEmail}.`,
      otpCode: otpCode, // Provided so the user can easily copy and log in right away!
      emailSentToInbox
    });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Verify OTP & Log In
router.post('/verify-otp', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr-althaf';
    const { email, code, type = 'work' } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, error: 'Email and 6-digit OTP code are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    // Verify OTP record
    const otpRecord = db.prepare(`
      SELECT * FROM otp_codes 
      WHERE email = ? AND code = ? AND expires_at > CURRENT_TIMESTAMP
    `).get(cleanEmail, cleanCode);

    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid or expired verification code. Please request a new code.' 
      });
    }

    // Delete used OTP
    db.prepare('DELETE FROM otp_codes WHERE id = ?').run(otpRecord.id);

    // Find or create user for this email
    let user = db.prepare('SELECT * FROM users WHERE email = ? OR outlook_email = ?').get(cleanEmail, cleanEmail);
    if (!user) {
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    }

    if (user) {
      db.prepare(`
        UPDATE users 
        SET outlook_email = ?,
            outlook_type = ?,
            outlook_connected = 1
        WHERE id = ?
      `).run(cleanEmail, type, user.id);
    } else {
      const newId = 'usr-' + uuidv4().substring(0, 8);
      const name = cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

      db.prepare(`
        INSERT INTO users (id, name, email, outlook_email, outlook_type, department, role, avatar, outlook_connected)
        VALUES (?, ?, ?, ?, ?, 'Operations', 'Team Member', ?, 1)
      `).run(newId, name, cleanEmail, cleanEmail, type, avatar);

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(newId);
    }

    const updatedUser = db.prepare('SELECT id, name, email, outlook_email, outlook_type, department, role, avatar, outlook_connected FROM users WHERE id = ?').get(user.id);

    res.json({
      success: true,
      user: updatedUser,
      message: `Successfully verified and logged in as ${cleanEmail}!`
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Reset Password with OTP
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ success: false, error: 'Email, OTP code, and new password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    const otpRecord = db.prepare(`
      SELECT * FROM otp_codes 
      WHERE email = ? AND code = ? AND expires_at > CURRENT_TIMESTAMP
    `).get(cleanEmail, cleanCode);

    if (!otpRecord) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP code' });
    }

    db.prepare('DELETE FROM otp_codes WHERE id = ?').run(otpRecord.id);

    // Update password for user
    db.prepare(`
      UPDATE users 
      SET outlook_password = ?
      WHERE email = ? OR outlook_email = ?
    `).run(newPassword, cleanEmail, cleanEmail);

    res.json({
      success: true,
      message: 'Outlook password updated successfully! You can now log in.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Connect with Password / App Password
router.post('/connect-outlook', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr-althaf';
    const { email, password, accessToken, type = 'work' } = req.body;

    if (!email && !accessToken) {
      return res.status(400).json({ success: false, error: 'Outlook email address or access token is required' });
    }

    const testResult = await outlookService.testRealConnection({
      email,
      password,
      accessToken,
      type
    });

    if (testResult.success) {
      db.prepare(`
        UPDATE users 
        SET outlook_email = ?,
            outlook_password = ?,
            outlook_access_token = ?,
            outlook_type = ?,
            outlook_connected = 1
        WHERE id = ?
      `).run(email || '', password || '', accessToken || '', type, userId);

      const updated = db.prepare('SELECT id, name, email, outlook_email, outlook_type, department, role, avatar, outlook_connected FROM users WHERE id = ?').get(userId);
      return res.json({
        success: true,
        user: updated,
        testResult
      });
    } else {
      return res.status(400).json({
        success: false,
        error: testResult.message
      });
    }
  } catch (err) {
    console.error('Connect outlook error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Disconnect / Log Out
router.post('/disconnect-outlook', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr-althaf';
    db.prepare(`
      UPDATE users 
      SET outlook_email = '',
          outlook_password = '',
          outlook_access_token = '',
          outlook_connected = 0
      WHERE id = ?
    `).run(userId);

    const updated = db.prepare('SELECT id, name, email, outlook_email, outlook_type, department, role, avatar, outlook_connected FROM users WHERE id = ?').get(userId);
    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Microsoft Official Device Login: Request verification code from Microsoft
router.post('/ms-device-code', async (req, res) => {
  try {
    const clientId = '04b07795-8ddb-461a-bbee-02f9e1bf7b46';
    const scope = 'https://graph.microsoft.com/Mail.ReadWrite https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/User.Read offline_access';

    const msRes = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/devicecode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `client_id=${clientId}&scope=${encodeURIComponent(scope)}`
    });

    const data = await msRes.json();
    if (data.device_code) {
      res.json({
        success: true,
        userCode: data.user_code,
        deviceCode: data.device_code,
        verificationUri: data.verification_uri || 'https://login.microsoft.com/device',
        expiresIn: data.expires_in,
        interval: data.interval || 5,
        message: data.message
      });
    } else {
      res.status(400).json({
        success: false,
        error: data.error_description || 'Could not initiate Microsoft Device Code authorization.'
      });
    }
  } catch (err) {
    console.error('Microsoft Device Code error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Microsoft Official Device Login: Poll Microsoft token endpoint
router.post('/ms-poll-token', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr-althaf';
    const { deviceCode } = req.body;

    if (!deviceCode) {
      return res.status(400).json({ success: false, error: 'deviceCode is required' });
    }

    const clientId = '04b07795-8ddb-461a-bbee-02f9e1bf7b46';
    const msRes = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ietf:params:oauth:grant-type:device_code&client_id=${clientId}&device_code=${encodeURIComponent(deviceCode)}`
    });

    const tokenData = await msRes.json();

    if (tokenData.error === 'authorization_pending') {
      return res.json({
        success: false,
        pending: true,
        message: 'Waiting for authorization at microsoft.com/device...'
      });
    }

    if (tokenData.error) {
      return res.status(400).json({
        success: false,
        error: tokenData.error_description || tokenData.error
      });
    }

    if (tokenData.access_token) {
      // Fetch Microsoft Graph Profile for authenticated user
      let msEmail = 'authenticated.user@outlook.com';
      let msName = 'Outlook User';

      try {
        const meRes = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
        });
        if (meRes.ok) {
          const profile = await meRes.json();
          msEmail = profile.mail || profile.userPrincipalName || msEmail;
          msName = profile.displayName || msName;
        }
      } catch (graphErr) {
        console.warn('Could not retrieve Graph user profile:', graphErr.message);
      }

      // Persist access token in database
      db.prepare(`
        UPDATE users 
        SET outlook_email = ?,
            name = COALESCE(NULLIF(name, ''), ?),
            outlook_access_token = ?,
            outlook_connected = 1
        WHERE id = ?
      `).run(msEmail, msName, tokenData.access_token, userId);

      const updated = db.prepare('SELECT id, name, email, outlook_email, outlook_type, department, role, avatar, outlook_connected FROM users WHERE id = ?').get(userId);

      return res.json({
        success: true,
        connected: true,
        user: updated,
        message: `Successfully connected to Microsoft 365 as ${msEmail}!`
      });
    }

    res.status(400).json({ success: false, error: 'Unexpected response from Microsoft authentication server' });
  } catch (err) {
    console.error('Microsoft token polling error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
