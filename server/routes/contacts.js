const express = require('express');
const router = express.Router();
const db = require('../database');
const { v4: uuidv4 } = require('uuid');

// Get all directory contacts
router.get('/', (req, res) => {
  try {
    const { search, department } = req.query;
    let query = 'SELECT * FROM contacts WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR role LIKE ? OR tags LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    if (department && department !== 'All') {
      query += ' AND department = ?';
      params.push(department);
    }

    query += ' ORDER BY is_favorite DESC, name ASC';

    const contacts = db.prepare(query).all(...params);

    // Get unique departments
    const departments = db.prepare('SELECT DISTINCT department FROM contacts ORDER BY department ASC').all().map(d => d.department);

    res.json({ success: true, contacts, departments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get recipient preset groups
router.get('/groups', (req, res) => {
  try {
    const groups = db.prepare('SELECT * FROM recipient_groups').all();
    const allContacts = db.prepare('SELECT * FROM contacts').all();
    const contactMap = new Map(allContacts.map(c => [c.id, c]));

    const enrichedGroups = groups.map(g => {
      const toIds = JSON.parse(g.to_contact_ids || '[]');
      const ccIds = JSON.parse(g.cc_contact_ids || '[]');

      return {
        ...g,
        to_contacts: toIds.map(id => contactMap.get(id)).filter(Boolean),
        cc_contacts: ccIds.map(id => contactMap.get(id)).filter(Boolean)
      };
    });

    res.json({ success: true, groups: enrichedGroups });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Add new contact to directory
router.post('/', (req, res) => {
  try {
    const { name, email, department, role, tags } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Name and email are required' });
    }

    const id = 'c-' + uuidv4().substring(0, 8);
    const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

    db.prepare(`
      INSERT INTO contacts (id, name, email, department, role, avatar, is_favorite, tags)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?)
    `).run(id, name, email, department || 'General', role || 'Team Member', avatar, tags || '');

    const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(id);
    res.json({ success: true, contact });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
