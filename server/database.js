const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'mailcraft.db');
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for high performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      department TEXT NOT NULL,
      role TEXT NOT NULL,
      avatar TEXT,
      outlook_connected INTEGER DEFAULT 0,
      outlook_email TEXT DEFAULT '',
      outlook_type TEXT DEFAULT 'work', -- 'work' (office.com) or 'personal' (live.com)
      outlook_password TEXT DEFAULT '',
      outlook_tenant_id TEXT DEFAULT 'common',
      outlook_client_id TEXT DEFAULT '',
      outlook_access_token TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      department TEXT NOT NULL,
      role TEXT NOT NULL,
      avatar TEXT,
      is_favorite INTEGER DEFAULT 0,
      tags TEXT
    );

    CREATE TABLE IF NOT EXISTS recipient_groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      to_contact_ids TEXT NOT NULL, -- JSON array of contact IDs
      cc_contact_ids TEXT NOT NULL  -- JSON array of contact IDs
    );

    CREATE TABLE IF NOT EXISTS emails (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      to_recipients TEXT NOT NULL, -- JSON array of email objects [{name, email}]
      cc_recipients TEXT DEFAULT '[]', -- JSON array of email objects
      bcc_recipients TEXT DEFAULT '[]',
      attachments TEXT DEFAULT '[]', -- JSON array of attachment objects
      status TEXT NOT NULL, -- 'draft', 'scheduled', 'sent', 'cancelled', 'failed'
      scheduled_time DATETIME,
      sent_at DATETIME,
      outlook_message_id TEXT,
      sync_status TEXT DEFAULT 'synced',
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS attachments (
      id TEXT PRIMARY KEY,
      original_name TEXT NOT NULL,
      filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      path TEXT NOT NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      prompt TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      suggested_to_dept TEXT,
      suggested_cc_dept TEXT
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL, -- 'user' or 'assistant'
      content TEXT NOT NULL,
      draft_snapshot TEXT, -- JSON containing subject, body, to, cc
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS otp_codes (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      purpose TEXT DEFAULT 'login',
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Safe schema migrations
  const userColumns = db.prepare(`PRAGMA table_info(users)`).all().map(c => c.name);
  if (!userColumns.includes('outlook_email')) {
    db.exec(`ALTER TABLE users ADD COLUMN outlook_email TEXT DEFAULT ''`);
  }
  if (!userColumns.includes('outlook_type')) {
    db.exec(`ALTER TABLE users ADD COLUMN outlook_type TEXT DEFAULT 'work'`);
  }
  if (!userColumns.includes('outlook_password')) {
    db.exec(`ALTER TABLE users ADD COLUMN outlook_password TEXT DEFAULT ''`);
  }

  // Create inbox_tasks and weekly task sheet tables for tracking weekly assigned tasks from Prasanna Gunji
  db.exec(`
    CREATE TABLE IF NOT EXISTS inbox_tasks (
      id TEXT PRIMARY KEY,
      sender_email TEXT NOT NULL,
      day_of_week INTEGER NOT NULL,
      day_name TEXT NOT NULL,
      technology TEXT DEFAULT 'Web Development',
      react_points TEXT NOT NULL,
      task_points TEXT NOT NULL,
      raw_subject TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS weekly_task_sheets (
      id TEXT PRIMARY KEY,
      sheet_name TEXT NOT NULL,
      sender_email TEXT NOT NULL,
      recipient_lead TEXT NOT NULL,
      technology TEXT DEFAULT 'Web Development',
      raw_email_text TEXT,
      sync_source TEXT DEFAULT 'Prasanna Gunji Outlook Sync',
      total_days INTEGER DEFAULT 5,
      holiday_info TEXT DEFAULT '[]',
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS weekly_task_days (
      id TEXT PRIMARY KEY,
      sheet_id TEXT NOT NULL,
      day_number INTEGER NOT NULL,
      day_name TEXT NOT NULL,
      is_holiday INTEGER DEFAULT 0,
      holiday_reason TEXT DEFAULT '',
      topics_covered TEXT NOT NULL,
      assigned_tasks TEXT NOT NULL,
      completed_react TEXT NOT NULL,
      completed_tasks TEXT NOT NULL,
      pending_tasks TEXT DEFAULT '[]',
      challenges TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed initial weekly task sheet from Prasanna Gunji if none exists
  const sheetCount = db.prepare('SELECT COUNT(*) as count FROM weekly_task_sheets').get();
  if (sheetCount.count === 0) {
    const sheetId = 'sheet-active-w42';
    db.prepare(`
      INSERT INTO weekly_task_sheets (id, sheet_name, sender_email, recipient_lead, technology, raw_email_text, sync_source, total_days, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
      sheetId,
      'Web Development Weekly Curriculum (React) - Curated by Prasanna Gunji',
      'prasanna.gunji@nybinfotech.com',
      'nafisa.khanam@nybinfotech.com',
      'Web Development',
      'Weekly task sheet received from Prasanna Gunji (Senior Technical Lead) via Outlook inbox.',
      'Outlook Inbox Sync (prasanna.gunji@nybinfotech.com)',
      5
    );

    const insertDay = db.prepare(`
      INSERT INTO weekly_task_days (id, sheet_id, day_number, day_name, is_holiday, holiday_reason, topics_covered, assigned_tasks, completed_react, completed_tasks)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Day 1 (Monday)
    insertDay.run(
      'day-w42-d1', sheetId, 1, 'Monday', 0, '',
      JSON.stringify([
        'React core library architecture, virtual DOM reconciliation, and JSX syntax rules',
        'Functional components structure and unidirectional props data passing',
        'State initialization and dynamic state updates using useState hook',
        'Component modularity, directory hierarchy, and CSS modules configuration'
      ]),
      JSON.stringify([
        'Initialized modern React application environment using Vite and npm',
        'Created modular UI layout containing Header, Navbar, and Content container',
        'Built reusable navigation bar component with interactive hover states',
        'Committed Day 1 code structure to team Git repository and pushed branch'
      ]),
      JSON.stringify([
        'Understood React virtual DOM reconciliation and modern JSX compilation rules',
        'Built functional components and established props communication pipeline',
        'Implemented useState hook to manage dynamic component-level state changes',
        'Structured modular folder architecture with isolated CSS styling rules',
        'Verified component hierarchy and eliminated browser console warnings'
      ]),
      JSON.stringify([
        'Setup clean React project boilerplate with Vite and configured npm scripts',
        'Constructed modular layout architecture with Header, Navbar, and Content area',
        'Developed reusable navigation components with responsive styling',
        'Tested props passing and verified UI responsiveness on various resolutions',
        'Pushed Day 1 clean code commit to NYBinfotech team repository'
      ])
    );

    // Day 2 (Tuesday)
    insertDay.run(
      'day-w42-d2', sheetId, 2, 'Tuesday', 0, '',
      JSON.stringify([
        'Synthetic event handling system (onClick, onChange, onSubmit) in React',
        'Controlled vs uncontrolled components pattern for form inputs management',
        'Multi-field form state aggregation using single state object and computed keys',
        'Real-time client-side form validation rules and interactive error rendering'
      ]),
      JSON.stringify([
        'Constructed responsive user onboarding and profile registration form',
        'Implemented real-time input validation with red alert error indicators',
        'Configured custom form submit pipeline with structured payload logging',
        'Tested form state reset workflow and pushed clean updates to GitHub'
      ]),
      JSON.stringify([
        'Mastered React synthetic event handling for buttons, forms, and keyboard events',
        'Implemented controlled form pattern with state synchronization across inputs',
        'Managed multi-input state cleanly using computed object property names',
        'Added real-time input validation with conditional alert indicators',
        'Practiced callback function propagation from parent to child form controls'
      ]),
      JSON.stringify([
        'Developed complete user registration form interface with responsive grid',
        'Applied email regex validation and mandatory field error banners',
        'Configured submit event interceptor with formatted payload display',
        'Styled form components using responsive CSS flexbox layout rules',
        'Verified form validation logic and pushed Tuesday updates to Git'
      ])
    );

    // Day 3 (Wednesday)
    insertDay.run(
      'day-w42-d3', sheetId, 3, 'Wednesday', 0, '',
      JSON.stringify([
        'Component lifecycle mechanisms and useEffect hook execution phases',
        'Managing dependency arrays (mount-only vs reactive state dependencies)',
        'Asynchronous data fetching from REST API endpoints using async/await',
        'Managing loading indicators, error catch boundaries, and empty state views',
        'Cleanup functions in useEffect to unmount timers and event listeners'
      ]),
      JSON.stringify([
        'Integrated live REST API endpoint for retrieving dynamic records list',
        'Added animated loading skeleton loader during asynchronous fetch requests',
        'Implemented network error catch block with user-friendly retry button',
        'Built instant search filter to filter retrieved records in real-time',
        'Documented API response interface and reviewed data flow with mentor'
      ]),
      JSON.stringify([
        'Understood useEffect lifecycle phases for initial mount, update, and unmount',
        'Mastered dependency array controls to prevent unnecessary re-fetching',
        'Handled asynchronous API communication using modern async/await syntax',
        'Structured three-state data fetching pattern: loading, success, and error',
        'Implemented cleanup functions to safely cancel active subscriptions and timers'
      ]),
      JSON.stringify([
        'Connected React frontend to REST API endpoint for live records retrieval',
        'Designed animated skeleton placeholder during network loading latency',
        'Added error boundary and alert banners for server downtime recovery',
        'Created real-time search input that filters table rows instantaneously',
        'Documented API schema and pushed Wednesday code updates to team branch'
      ])
    );

    // Day 4 (Thursday)
    insertDay.run(
      'day-w42-d4', sheetId, 4, 'Thursday', 0, '',
      JSON.stringify([
        'Performance optimization with useMemo hook for expensive array calculations',
        'useCallback hook to preserve function references across component renders',
        'useRef hook for direct DOM access, input focus, and mutable state storage',
        'React Context API setup (createContext, Provider) to eliminate props drilling',
        'Architecting custom React hooks to isolate reusable business logic'
      ]),
      JSON.stringify([
        'Constructed global AuthContext provider to distribute session state',
        'Authored custom useFetch hook to standardize all project API calls',
        'Memoized filtered data calculations using useMemo to reduce re-renders',
        'Profiled component render counts using React Developer Tools in Chrome'
      ]),
      JSON.stringify([
        'Learned memoization patterns with useMemo to cache expensive computations',
        'Mastered useCallback to maintain referential stability for function props',
        'Understood useRef for persisting mutable values without triggering re-renders',
        'Eliminated props drilling across nested components using React Context API',
        'Architected custom reusable React hooks to encapsulate business logic'
      ]),
      JSON.stringify([
        'Constructed global AuthContext provider to distribute session credentials',
        'Authored custom useFetch hook to standardize HTTP calls across the project',
        'Memoized filtered data calculations using useMemo to optimize render time',
        'Profiled component render counts using React Developer Tools in Chrome',
        'Refactored deeply nested components and pushed Thursday commit to Git'
      ])
    );

    // Day 5 (Friday)
    insertDay.run(
      'day-w42-d5', sheetId, 5, 'Friday', 0, '',
      JSON.stringify([
        'React Router v6 implementation: BrowserRouter, Routes, and Route tags',
        'Configuring dynamic URL path parameters with useParams and useSearchParams',
        'Programmatic view navigation and redirects using useNavigate hook',
        'Nested sub-routes, Outlet placeholder views, and 404 fallback routing',
        'Production asset build optimization, tree-shaking, and staging deployment'
      ]),
      JSON.stringify([
        'Configured multi-page router with protected dashboard route guards',
        'Designed active navigation link indicators and breadcrumbs navigation bar',
        'Executed production build test (npm run build) and audited bundle size',
        'Deployed build candidate to cloud staging server for QA verification',
        'Compiled weekly progress documentation and staged reference progress files'
      ]),
      JSON.stringify([
        'Learned single-page application client-side routing with React Router v6',
        'Mastered dynamic route matching and reading URL query parameters',
        'Implemented protected route wrappers to guard authenticated view access',
        'Structured nested layouts with Outlet placeholders for shared headers',
        'Understood production build compilation, chunk splitting, and tree-shaking'
      ]),
      JSON.stringify([
        'Configured multi-page router with protected dashboard route guards',
        'Designed active navigation link indicators and breadcrumbs navigation bar',
        'Executed production build test (npm run build) and audited bundle size',
        'Deployed build candidate to cloud staging server for QA verification',
        'Compiled weekly progress documentation and staged reference progress files'
      ])
    );
  }

  // Ensure Syed Mahammad Althaf profile details are up to date
  db.prepare(`
    UPDATE users 
    SET name = 'Syed Mahammad Althaf',
        role = 'Associate software Engineer',
        department = 'Web Development',
        email = 'althaf.syed@nybinfotech.com',
        outlook_email = 'althaf.syed@nybinfotech.com'
    WHERE id = 'usr-althaf'
  `).run();

  // Upsert Senior Leads: Prasanna Gunji and Nafisa Khanam Pathan into contacts
  const upsertLead = db.prepare(`
    INSERT INTO contacts (id, name, email, department, role, avatar, is_favorite, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      email = excluded.email,
      department = excluded.department,
      role = excluded.role,
      avatar = excluded.avatar,
      is_favorite = excluded.is_favorite,
      tags = excluded.tags
  `);

  upsertLead.run(
    'c-prasanna',
    'Prasanna Gunji',
    'prasanna.gunji@nybinfotech.com',
    'Web Development',
    'Senior Technical Lead & Mentor',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    1,
    'Lead, Mentor, Daily EOD TO, Weekly Tasks'
  );

  upsertLead.run(
    'c-nafisa',
    'Nafisa Khanam Pathan',
    'nafisa.khanam@nybinfotech.com',
    'Operations & Management',
    'Project Manager & Delivery Lead',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    1,
    'Management, Daily EOD TO, Operations'
  );

  // Update Daily Evening EOD Group to have Prasanna Gunji and Nafisa Khanam Pathan
  db.prepare(`
    UPDATE recipient_groups
    SET name = 'Daily Evening EOD Status Group',
        description = 'Direct report to Prasanna Gunji and Nafisa Khanam Pathan with Web Development leads',
        to_contact_ids = ?,
        cc_contact_ids = ?
    WHERE id = 'grp-evening'
  `).run(JSON.stringify(['c-prasanna', 'c-nafisa']), JSON.stringify(['c-1', 'c-2']));

  // Seed default company users if empty
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (id, name, email, department, role, avatar, outlook_connected)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertUser.run(
      'usr-althaf',
      'Syed Mahammad Althaf',
      'althaf.syed@nybinfotech.com',
      'Web Development',
      'Associate software Engineer',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      1
    );

    insertUser.run(
      'usr-sarah',
      'Sarah Jenkins',
      'sarah.j@nexusenterprise.com',
      'Operations',
      'VP of Operations',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      1
    );

    insertUser.run(
      'usr-rajesh',
      'Rajesh Sharma',
      'rajesh.s@nexusenterprise.com',
      'Leadership',
      'Engineering Director',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      1
    );

    insertUser.run(
      'usr-priya',
      'Priya Nair',
      'priya.n@nexusenterprise.com',
      'Quality Assurance',
      'Lead QA Engineer',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      1
    );
  }

  // Seed company directory contacts (15+ people)
  const contactCount = db.prepare('SELECT COUNT(*) as count FROM contacts').get();
  if (contactCount.count === 0) {
    const insertContact = db.prepare(`
      INSERT INTO contacts (id, name, email, department, role, avatar, is_favorite, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const directory = [
      {
        id: 'c-1',
        name: 'Rajesh Sharma',
        email: 'rajesh.s@nexusenterprise.com',
        department: 'Leadership',
        role: 'Engineering Director',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        is_favorite: 1,
        tags: 'Management, Director, Daily CC'
      },
      {
        id: 'c-2',
        name: 'Priya Nair',
        email: 'priya.n@nexusenterprise.com',
        department: 'Quality Assurance',
        role: 'Lead QA Engineer',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
        is_favorite: 1,
        tags: 'QA, Testing, Daily CC'
      },
      {
        id: 'c-3',
        name: 'Vikram Patel',
        email: 'vikram.p@nexusenterprise.com',
        department: 'Product',
        role: 'Principal Product Manager',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
        is_favorite: 1,
        tags: 'Product, Roadmap, Daily TO'
      },
      {
        id: 'c-4',
        name: 'Michael Chen',
        email: 'michael.c@nexusenterprise.com',
        department: 'Engineering',
        role: 'Senior Fullstack Engineer',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
        is_favorite: 1,
        tags: 'Engineering, Frontend, Daily TO'
      },
      {
        id: 'c-5',
        name: 'Sarah Jenkins',
        email: 'sarah.j@nexusenterprise.com',
        department: 'Operations',
        role: 'VP of Operations & Delivery',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
        is_favorite: 1,
        tags: 'Management, Operations, Daily CC'
      },
      {
        id: 'c-6',
        name: 'Elena Rostova',
        email: 'elena.r@nexusenterprise.com',
        department: 'Engineering',
        role: 'Cloud Architect & DevOps Lead',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        is_favorite: 0,
        tags: 'DevOps, Infrastructure, AWS, Azure'
      },
      {
        id: 'c-7',
        name: 'Kevin Brooks',
        email: 'kevin.b@nexusenterprise.com',
        department: 'Engineering',
        role: 'Backend Systems Lead',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
        is_favorite: 1,
        tags: 'Engineering, Backend, API, DB'
      },
      {
        id: 'c-8',
        name: 'Ananya Deshmukh',
        email: 'ananya.d@nexusenterprise.com',
        department: 'Engineering',
        role: 'Frontend UI/UX Specialist',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
        is_favorite: 0,
        tags: 'Engineering, React, Tailwind'
      },
      {
        id: 'c-9',
        name: 'Sneha Reddy',
        email: 'sneha.r@nexusenterprise.com',
        department: 'Quality Assurance',
        role: 'SDET & Automation Engineer',
        avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=120&auto=format&fit=crop&q=80',
        is_favorite: 0,
        tags: 'QA, Automation, Cypress, Playwright'
      },
      {
        id: 'c-10',
        name: 'David Miller',
        email: 'david.m@nexusenterprise.com',
        department: 'Client Services',
        role: 'Director of Client Relations',
        avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80',
        is_favorite: 0,
        tags: 'Clients, Deliverables, External'
      },
      {
        id: 'c-11',
        name: 'Marcus Vance',
        email: 'marcus.v@nexusenterprise.com',
        department: 'Leadership',
        role: 'Executive Managing Director',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&auto=format&fit=crop&q=80',
        is_favorite: 1,
        tags: 'Executive, Board, Strategic'
      },
      {
        id: 'c-12',
        name: 'James O’Connor',
        email: 'james.o@nexusenterprise.com',
        department: 'Security & Compliance',
        role: 'Chief Information Security Officer',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
        is_favorite: 0,
        tags: 'Security, Compliance, SOC2'
      },
      {
        id: 'c-13',
        name: 'Aarti Verma',
        email: 'aarti.v@nexusenterprise.com',
        department: 'Product',
        role: 'Agile Coach & Scrum Master',
        avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&auto=format&fit=crop&q=80',
        is_favorite: 0,
        tags: 'Scrum, Sprints, Standup'
      },
      {
        id: 'c-14',
        name: 'Fatima Zahra',
        email: 'fatima.z@nexusenterprise.com',
        department: 'People & HR',
        role: 'HR & Talent Operations Manager',
        avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&auto=format&fit=crop&q=80',
        is_favorite: 0,
        tags: 'HR, Leaves, Administration'
      },
      {
        id: 'c-15',
        name: 'Lucas Dupont',
        email: 'lucas.d@nexusenterprise.com',
        department: 'Design',
        role: 'Lead Product Designer',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
        is_favorite: 0,
        tags: 'Design, Figma, UX'
      }
    ];

    for (const c of directory) {
      insertContact.run(c.id, c.name, c.email, c.department, c.role, c.avatar, c.is_favorite, c.tags);
    }
  }

  // Seed default recipient preset groups
  const groupCount = db.prepare('SELECT COUNT(*) as count FROM recipient_groups').get();
  if (groupCount.count === 0) {
    const insertGroup = db.prepare(`
      INSERT INTO recipient_groups (id, name, description, to_contact_ids, cc_contact_ids)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertGroup.run(
      'grp-evening',
      'Daily Evening EOD Status Group',
      'Standard end-of-day daily report group (Product + Engineering Leads with Management CC)',
      JSON.stringify(['c-3', 'c-4', 'c-7']), // TO: Vikram, Michael, Kevin
      JSON.stringify(['c-1', 'c-2', 'c-5'])  // CC: Rajesh, Priya, Sarah
    );

    insertGroup.run(
      'grp-dev-qa',
      'Core Engineering & QA Squad',
      'Direct sprint delivery team and QA verification leads',
      JSON.stringify(['c-4', 'c-7', 'c-8']), // TO: Michael, Kevin, Ananya
      JSON.stringify(['c-2', 'c-9', 'c-6'])  // CC: Priya, Sneha, Elena
    );

    insertGroup.run(
      'grp-exec',
      'Executive Leadership Briefing',
      'Weekly summaries and executive escalation group',
      JSON.stringify(['c-11', 'c-5']),       // TO: Marcus, Sarah
      JSON.stringify(['c-1', 'c-10'])        // CC: Rajesh, David
    );

    insertGroup.run(
      'grp-client',
      'Client Milestone Delivery Group',
      'External sprint release and client communication',
      JSON.stringify(['c-10', 'c-3']),       // TO: David, Vikram
      JSON.stringify(['c-5', 'c-1'])         // CC: Sarah, Rajesh
    );
  }

  // Seed templates
  const templateCount = db.prepare('SELECT COUNT(*) as count FROM templates').get();
  if (templateCount.count === 0) {
    const insertTemplate = db.prepare(`
      INSERT INTO templates (id, title, category, prompt, subject, body, suggested_to_dept, suggested_cc_dept)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertTemplate.run(
      'tpl-1',
      'Daily Evening Status Report (EOD)',
      'Daily Operations',
      'Draft an end-of-day update summarizing completed tasks, blockers resolved, and priorities planned for tomorrow morning.',
      '[Daily EOD Update] Progress Report & Tomorrow Plan - {{Date}}',
      `Dear Team,

Please find the summary of key deliverables and accomplishments completed today:

1. Key Accomplishments:
• Completed core API integrations and validated payloads with staging backend.
• Resolved pending authentication edge cases and fixed 3 UI responsiveness issues.
• Deployed build v2.4 to the staging environment for verification.

2. Next Steps (Tomorrow's Agenda):
• Finalize automated QA test suites with QA squad.
• Execute performance profiling on bulk data queries.
• Conduct client preview walkthrough at 11:30 AM.

3. Blockers / Dependencies:
• None currently pending. All pipelines are operational.

Please review the attached notes or feel free to reply if any items require immediate sync.

Best regards,
{{SenderName}}
{{SenderRole}} | Nexus Enterprise Solutions`,
      'Product',
      'Leadership, Quality Assurance'
    );

    insertTemplate.run(
      'tpl-2',
      'Sprint Release & QA Sign-Off',
      'Engineering',
      'Draft a sprint release notification announcing staging/production deployment ready for QA validation.',
      '[Sprint Release Ready] Build {{Version}} Deployed for QA Sign-Off',
      `Hi QA and Product Teams,

We have successfully deployed the candidate build for Sprint cycle 42 to the Staging server.

Deployment Overview:
• Build Version: v2.4.0-rc3
• Environment: Staging (https://staging.internal.nexus.com)
• Key Inclusions: New interactive filter controls, high-speed export engine, and security patch updates.

Testing Priorities:
• Verify role-based permissions across admin and standard tiers.
• Validate scheduled email trigger accuracy.
• Confirm attachment size thresholds.

Kindly run your regression sweeps and provide sign-off by 12:00 PM tomorrow.

Warm regards,
{{SenderName}}`,
      'Quality Assurance',
      'Engineering, Leadership'
    );

    insertTemplate.run(
      'tpl-3',
      'Urgent Production Incident Alert',
      'Operations & Critical',
      'Draft an urgent incident notification regarding transient system latency, mitigation steps taken, and resolution ETA.',
      '[INCIDENT ADVISORY - P2] Transient Latency Observed on Primary API Gateway',
      `Attention Leadership & Ops Teams,

This is a proactive advisory regarding an operational incident detected today.

Incident Summary:
• Severity: P2 (Degraded Performance)
• Affected Service: Primary Outbound Mail & Sync Gateway
• Root Cause: Temporary connection pool exhaustion during peak scheduled sync window.

Actions Taken:
• Auto-scaling cluster nodes increased by 50%.
• Connection pooling timeouts adjusted to prevent thread locking.
• Traffic normalized; latency metrics returned to sub-120ms baseline.

Current Status: Monitoring closely. A comprehensive root-cause analysis (RCA) document will be circulated by end of week.

Regards,
{{SenderName}}`,
      'Leadership',
      'Operations, Engineering'
    );
  }

  // Pre-seed an initial sample sent and draft email so Outlook viewer is rich immediately
  const emailCount = db.prepare('SELECT COUNT(*) as count FROM emails').get();
  if (emailCount.count === 0) {
    const insertEmail = db.prepare(`
      INSERT INTO emails (id, user_id, subject, body, to_recipients, cc_recipients, attachments, status, scheduled_time, sent_at, outlook_message_id, sync_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertEmail.run(
      'msg-seed-1',
      'usr-althaf',
      '[EOD Update] Daily Sprint Progress & Backend API Handover',
      `Hi Team,\n\nHere is our daily evening report:\n\n- Completed Microsoft Graph API draft and send webhooks.\n- Integrated recipient checklist selector with instant TO & CC allocation.\n- Setup timer-based cron scheduler for scheduled email dispatches.\n\nTomorrow we will review final QA checks.\n\nBest regards,\nAlthaf Syed`,
      JSON.stringify([
        { name: 'Vikram Patel', email: 'vikram.p@nexusenterprise.com' },
        { name: 'Michael Chen', email: 'michael.c@nexusenterprise.com' }
      ]),
      JSON.stringify([
        { name: 'Rajesh Sharma', email: 'rajesh.s@nexusenterprise.com' },
        { name: 'Priya Nair', email: 'priya.n@nexusenterprise.com' },
        { name: 'Sarah Jenkins', email: 'sarah.j@nexusenterprise.com' }
      ]),
      '[]',
      'sent',
      null,
      new Date(Date.now() - 3600000 * 2).toISOString(),
      'AAMkAGUyZjQ4M2FiLTA2NGItNDg5NS04YmFmLTNmOWM4ODU5NzE0OQBGAAAAAAB',
      'synced'
    );

    insertEmail.run(
      'msg-seed-2',
      'usr-althaf',
      '[Draft] Q4 Infrastructure Optimization & Cost Review',
      `Dear Sarah & Rajesh,\n\nI have drafted the cost review for our Q4 cloud instances. Preliminary findings show a 24% reduction in idle staging resources.\n\nPlease review when convenient.\n\nRegards,\nAlthaf`,
      JSON.stringify([
        { name: 'Sarah Jenkins', email: 'sarah.j@nexusenterprise.com' }
      ]),
      JSON.stringify([
        { name: 'Rajesh Sharma', email: 'rajesh.s@nexusenterprise.com' }
      ]),
      '[]',
      'draft',
      null,
      null,
      'AAMkAGUyZjQ4M2FiLTA2NGItNDg5NS04YmFmLTNmOWM4ODU5NzE1MEBGAAAAAAC',
      'synced'
    );
  }
}

initDatabase();

module.exports = db;
