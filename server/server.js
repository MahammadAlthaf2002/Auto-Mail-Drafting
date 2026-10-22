const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const schedulerService = require('./services/schedulerService');

const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contacts');
const aiRoutes = require('./routes/ai');
const emailRoutes = require('./routes/emails');
const attachmentRoutes = require('./routes/attachments');
const templateRoutes = require('./routes/templates');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/templates', templateRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'MailCraft AI Enterprise Email Assistant',
    outlookConnected: true,
    activeScheduler: true
  });
});

// Serve frontend static build if available
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

// Fallback for SPA routing (Express 5 compatible)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(clientDistPath, 'index.html'), err => {
    if (err) {
      res.send(`
        <html>
          <head><title>MailCraft AI</title></head>
          <body style="font-family:sans-serif;text-align:center;padding:50px;background:#0b0f19;color:#fff;">
            <h1>MailCraft AI Backend Server Running</h1>
            <p>API is active on port ${PORT}. Run frontend dev server or build the client.</p>
          </body>
        </html>
      `);
    }
  });
});

// Start scheduled queue worker
schedulerService.start();

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 MailCraft AI Assistant Server running on http://localhost:${PORT}`);
  console.log(`📬 Outlook Microsoft Graph Connector: Active`);
  console.log(`⏰ Background Timer Scheduler: Running (10s intervals)`);
  console.log(`=======================================================`);
});
