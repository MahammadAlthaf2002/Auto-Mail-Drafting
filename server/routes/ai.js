const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const db = require('../database');
const { v4: uuidv4 } = require('uuid');

// Generate complete email draft from natural language prompt
router.post('/generate', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr-althaf';
    const { prompt, tone = 'professional', attachments = [] } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    const generated = await aiService.generateEmail({
      prompt,
      userId,
      tone,
      attachments
    });

    // Save prompt & assistant response to chat history
    const userMsgId = 'msg-' + uuidv4().substring(0, 8);
    const botMsgId = 'msg-' + uuidv4().substring(0, 8);

    db.prepare(`
      INSERT INTO chat_messages (id, user_id, role, content, draft_snapshot)
      VALUES (?, ?, 'user', ?, null)
    `).run(userMsgId, userId, prompt);

    const snapshot = JSON.stringify({
      subject: generated.subject,
      body: generated.body,
      suggestedTo: generated.suggestedTo,
      suggestedCc: generated.suggestedCc
    });

    db.prepare(`
      INSERT INTO chat_messages (id, user_id, role, content, draft_snapshot)
      VALUES (?, ?, 'assistant', ?, ?)
    `).run(botMsgId, userId, `I've prepared your draft with subject "${generated.subject}". Automatically mapped ${generated.suggestedTo.length} TO and ${generated.suggestedCc.length} CC recipients from your team directory.`, snapshot);

    res.json({
      success: true,
      draft: generated
    });
  } catch (err) {
    console.error('AI generate error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Refine existing draft through conversational prompt
router.post('/refine', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr-althaf';
    const { currentDraft, instruction } = req.body;

    if (!instruction || !instruction.trim()) {
      return res.status(400).json({ success: false, error: 'Refinement instruction is required' });
    }

    const refined = await aiService.refineEmail({
      currentDraft,
      instruction,
      userId
    });

    // Record interaction in chat history
    const userMsgId = 'msg-' + uuidv4().substring(0, 8);
    const botMsgId = 'msg-' + uuidv4().substring(0, 8);

    db.prepare(`
      INSERT INTO chat_messages (id, user_id, role, content, draft_snapshot)
      VALUES (?, ?, 'user', ?, null)
    `).run(userMsgId, userId, instruction);

    const snapshot = JSON.stringify({
      subject: refined.subject,
      body: refined.body
    });

    db.prepare(`
      INSERT INTO chat_messages (id, user_id, role, content, draft_snapshot)
      VALUES (?, ?, 'assistant', ?, ?)
    `).run(botMsgId, userId, refined.explanation, snapshot);

    res.json({
      success: true,
      refined
    });
  } catch (err) {
    console.error('AI refine error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get user's chat message history
router.get('/chat', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr-althaf';
    const messages = db.prepare(`
      SELECT * FROM chat_messages 
      WHERE user_id = ? 
      ORDER BY created_at ASC 
      LIMIT 50
    `).all(userId);

    const formatted = messages.map(m => ({
      ...m,
      draft_snapshot: m.draft_snapshot ? JSON.parse(m.draft_snapshot) : null
    }));

    res.json({ success: true, messages: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Clear chat history
router.delete('/chat', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr-althaf';
    db.prepare('DELETE FROM chat_messages WHERE user_id = ?').run(userId);
    res.json({ success: true, message: 'Chat history cleared' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
