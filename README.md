# 📬 Auto Mail Drafting - Enterprise Outlook Assistant & Scheduled Dispatcher

**Auto Mail Drafting** is a production-ready, full-stack AI-assisted email productivity system designed to eliminate the daily fatigue of drafting repetitive evening status reports, manually finding and ticking TO/CC recipients, crafting subject lines, and timing email dispatches.

---

## 🌟 Key Highlights & Features

### 1. 🤖 Conversational AI Email Assistant
- **One-Prompt Generation**: Provide raw notes or bullet points (e.g., *"Completed auth module, resolved 3 payment bugs, staging deployed. Tomorrow starting export feature. Need CC to QA leads."*).
- **Intelligent Subject Synthesis**: Automatically synthesizes a crisp, executive-grade subject line based on the prompt's content.
- **Smart Recipient Auto-Mapping**: Automatically detects mentioned roles and departments (*QA*, *Engineering*, *Management*, *Leadership*) and maps them from your company directory into TO and CC.
- **Tone Switcher**: Easily toggle between **Professional**, **Concise Bullets**, **Executive C-Suite**, and **Warm/Friendly**.
- **Chat Refinement**: Ask the assistant to *"Make it shorter"*, *"Add 10 AM sync reminder"*, or *"Elevate to executive tone"*.

### 2. ✅ Company Directory with Tick-Mark Selection (TO & CC)
- Dedicated interactive modal with clear checkboxes/tick marks.
- Pre-populated with **15+ team members** across Leadership, Engineering, QA, Product, Operations, Security, and HR.
- **Department Filters** (Engineering, QA, Leadership, Product, Operations, etc.).
- **1-Click Preset Groups**:
  - *Daily Evening EOD Status Group* (Prasanna Gunji & Nafisa Khanam Pathan)
  - *Core Engineering & QA Squad*
  - *Executive Leadership Briefing*
  - *Client Milestone Delivery*
- Quick *"Select All Visible"* and *"Clear"* controls.

### 3. ⚡ The 5 Core Action Modes
1. **📝 Add to Outlook Draft**:
   - Saves directly to your Outlook **Drafts** folder (via Microsoft Graph `POST /me/messages`).
   - Syncs with a verified Outlook Message ID so you can open Outlook and review it anytime.
2. **⏰ Schedule Timer (e.g., 6:30 PM)**:
   - Sets a timed send (with 1-click presets: *Today at 6:30 PM*, *7:00 PM*, *In 1 Hour*, or custom datetime).
   - Autonomous background worker checks the queue every 10 seconds and automatically dispatches via Outlook at the exact scheduled time—even if you are offline or away from your desk!
3. **⚡ Send Directly via Outlook**:
   - Dispatches immediately from your Outlook email address (`POST /me/sendMail`).
   - Records delivery timestamps and synchronizes to your Outlook Sent Items folder.
4. **🌐 Open in Chrome Outlook**:
   - One-click launch into Chrome Outlook with full pre-filled recipients, subject, and copies table directly to your clipboard for instant Ctrl+V.
5. **📥 Open in Native Outlook (.eml)**:
   - Downloads a rich `.eml` draft file with the 2-column corporate table already rendered inside Outlook.

---

## 🚀 Running Locally

The application is running and accessible at:
👉 **`http://localhost:5000`**

### Command to Start Server
```bash
npm start
```

### Command to Rebuild Frontend
```bash
npm run build
```

---

## ☁️ Deployment Instructions

### Option 1: Deploy on Render.com (Recommended for Full-Stack)
1. Fork or push this repository to your GitHub account (`mahammadalthaf/Auto-Mail-Drafting`).
2. Log in to [Render.com](https://render.com/) and click **New > Web Service**.
3. Select your repository `Auto-Mail-Drafting`.
4. Configure the service:
   - **Environment**: `Node`
   - **Build Command**: `npm run render-build` (or `npm install && npm install --prefix client && npm run build --prefix client`)
   - **Start Command**: `npm start` (or `node server/server.js`)
5. Click **Deploy Web Service**. Render will automatically build the client and start the backend Express server serving the full application!

### Option 2: Deploy on Railway.app
1. Go to [Railway.app](https://railway.app/) and create a new project from GitHub repo `Auto-Mail-Drafting`.
2. Railway detects Node.js automatically.
3. Set the start command to `node server/server.js`.
4. Add environment variable `PORT=5000` (or let Railway assign its dynamic port).

---

## 🛠️ Technology Stack
- **Frontend**: React 19, Tailwind CSS, Lucide Icons, Vite
- **Backend**: Node.js, Express 5, Multer (file uploads)
- **Database**: SQLite (`better-sqlite3`) with WAL journal mode
- **Scheduler**: Autonomous heartbeat background scheduler service
- **Integration**: Microsoft Graph API v1.0 specifications + Connected Outlook Gateway sandbox
