const db = require('../database');
const { ImapFlow } = require('imapflow');

/**
 * Inbox Task Sync Service
 * Connects to user's real Outlook to sync and parse weekly assigned task emails
 * sent by Senior Technical Lead Prasanna Gunji (prasanna.gunji@nybinfotech.com)
 * and reported to Delivery Lead Nafisa Khanam Pathan (nafisa.khanam@nybinfotech.com).
 * 
 * Rules:
 * 1. Planned Tasks (Today):
 *    - 1. React: Topics Covered as-is from Prasanna Mam (whatever number of points)
 *    - 2. Tasks: Assigned Tasks as-is from Prasanna Mam (whatever number of points)
 * 2. Completed Tasks (Today):
 *    - MUST have EXACTLY 5 points for React and 5 points for Tasks in simple words
 * 3. Planned Tasks (Next Day):
 *    - As-is from Prasanna Mam for the next scheduled working day
 *    - If today is Friday / Day 5 (or last working day of week), Next Day is N/A
 * 4. Pending Tasks & Challenges: Default to N/A
 * 5. Supports 3-day, 4-day, 5-day holiday weeks automatically
 */
class InboxTaskSyncService {
  constructor() {
    this.graphEndpoint = 'https://graph.microsoft.com/v1.0';
    this.prasannaEmail = 'prasanna.gunji@nybinfotech.com';
    this.nafisaEmail = 'nafisa.khanam@nybinfotech.com';
    this.activeDayOverride = null;
  }

  /**
   * Sets the active day for EOD generation (1 to 5).
   */
  setActiveDayOverride(dayNumber) {
    if (dayNumber >= 1 && dayNumber <= 5) {
      this.activeDayOverride = Number(dayNumber);
    } else {
      this.activeDayOverride = null;
    }
  }

  /**
   * Intelligently detects the topic/curriculum category name (e.g. JavaScript, React, Node.js, HTML/CSS).
   */
  detectTopicCategory(topics = [], defaultName = 'Topics Covered') {
    const combined = (Array.isArray(topics) ? topics.join(' ') : String(topics || '')).toLowerCase();
    if (combined.includes('javascript') || combined.includes('js ') || combined.includes('es6') || combined.includes('closure') || combined.includes('scope') || combined.includes('variable')) return 'JavaScript';
    if (combined.includes('react') || combined.includes('jsx') || combined.includes('hook') || combined.includes('redux')) return 'React';
    if (combined.includes('node') || combined.includes('express')) return 'Node.js';
    if (combined.includes('html') || combined.includes('css') || combined.includes('dom')) return 'HTML/CSS';
    if (combined.includes('python')) return 'Python';
    if (combined.includes('angular')) return 'Angular';
    if (combined.includes('vue')) return 'Vue';
    return defaultName;
  }

  /**
   * Synthesizes EXACTLY 5 completed points in simple words derived directly from user's planned points.
   */
  synthesizeFiveCompletedPoints(plannedPoints = [], type = 'topics', categoryName = 'General') {
    const list = Array.isArray(plannedPoints) ? plannedPoints.map(p => String(p).trim()).filter(Boolean) : [];
    const cat = categoryName !== 'General' ? categoryName : this.detectTopicCategory(list);
    
    // Helper to turn a planned bullet into a simple completed past-tense action
    const simplifyToAction = (text, prefix) => {
      let clean = text
        .replace(/^(learn|study|review|understand|explore|master|read)\s+/i, '')
        .replace(/^(build|create|develop|code|implement|setup|configure|design|write|construct|test)\s+/i, '')
        .replace(/^(practiced|learned|mastered|implemented|configured|built|designed|tested|verified)\s+/i, '');
      clean = clean.charAt(0).toLowerCase() + clean.slice(1);
      return `${prefix} ${clean}`;
    };

    const topicPrefixes = [
      'Understood and applied',
      'Implemented core workflow for',
      'Mastered syntax and usage for',
      'Practiced practical execution of',
      'Reviewed and validated implementation of'
    ];

    const taskPrefixes = [
      'Successfully developed',
      'Configured and verified',
      'Built and integrated',
      'Tested responsiveness and validation for',
      'Staged and pushed clean updates for'
    ];

    const prefixes = (type === 'topics' || type === 'react') ? topicPrefixes : taskPrefixes;
    const completed = [];

    // Use items directly from the planned list first
    for (let i = 0; i < Math.min(list.length, 5); i++) {
      const p = list[i];
      const prefix = prefixes[i % prefixes.length];
      completed.push(simplifyToAction(p, prefix));
    }

    // If fewer than 5 points were in the planned list, fill with variations of user's points
    while (completed.length < 5) {
      const idx = completed.length;
      if (list.length > 0) {
        const item = list[idx % list.length];
        const prefix = prefixes[idx % prefixes.length];
        completed.push(`${prefix} ${item.toLowerCase()}`);
      } else {
        completed.push(`Completed scheduled ${cat} practical exercises`);
      }
    }

    // Capitalize first letter of each completed bullet
    return completed.slice(0, 5).map(c => c.charAt(0).toUpperCase() + c.slice(1));
  }

  /**
   * Retrieves the full weekly task sheet from database including all days.
   */
  getActiveWeeklySheet() {
    let sheet = db.prepare('SELECT * FROM weekly_task_sheets WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1').get();
    if (!sheet) {
      sheet = db.prepare('SELECT * FROM weekly_task_sheets ORDER BY created_at DESC LIMIT 1').get();
    }
    return sheet;
  }

  /**
   * Retrieves all days of the active week for the visual Chart.
   */
  getAllDaysChart() {
    const sheet = this.getActiveWeeklySheet();
    if (!sheet) return { success: false, error: 'No weekly sheet found' };

    const todayDate = new Date();
    let currentDayOfWeek = todayDate.getDay(); // 0 Sun, 1 Mon ... 5 Fri, 6 Sat
    if (currentDayOfWeek === 0 || currentDayOfWeek === 6) currentDayOfWeek = 5; // Default weekend to Friday

    const effectiveToday = this.activeDayOverride || currentDayOfWeek;

    const daysRows = db.prepare('SELECT * FROM weekly_task_days WHERE sheet_id = ? ORDER BY day_number ASC').all(sheet.id);

    const days = daysRows.map(row => {
      const isToday = row.day_number === effectiveToday;
      let status = 'upcoming';
      if (row.is_holiday) status = 'holiday';
      else if (isToday) status = 'today';
      else if (row.day_number < effectiveToday) status = 'completed';

      return {
        id: row.id,
        dayNumber: row.day_number,
        dayName: row.day_name,
        isHoliday: Boolean(row.is_holiday),
        holidayReason: row.holiday_reason || '',
        topicsCovered: JSON.parse(row.topics_covered || '[]'),
        assignedTasks: JSON.parse(row.assigned_tasks || '[]'),
        completedReact: JSON.parse(row.completed_react || '[]'),
        completedTasks: JSON.parse(row.completed_tasks || '[]'),
        isToday,
        status
      };
    });

    return {
      success: true,
      sheet: {
        id: sheet.id,
        title: sheet.sheet_name,
        sender: sheet.sender_email,
        recipient: sheet.recipient_lead,
        technology: sheet.technology,
        syncSource: sheet.sync_source,
        totalDays: sheet.total_days,
        activeDayNumber: effectiveToday,
        activeDayName: days.find(d => d.dayNumber === effectiveToday)?.dayName || 'Today',
        updatedAt: sheet.updated_at
      },
      days
    };
  }

  /**
   * Retrieves today's EOD schedule matching the user's exact requirements:
   * - Planned Tasks (Today): Topics & Tasks as-is from Prasanna Mam (variable points)
   * - Completed Tasks (Today): EXACTLY 5 points for React and 5 points for Tasks (simple words)
   * - Planned Tasks (Next Day): As-is for next working day (or N/A if today is Friday / last day)
   * - Pending Tasks & Challenges: N/A
   */
  getTodaySchedule(targetDayOverride = null) {
    const sheet = this.getActiveWeeklySheet();
    const todayDate = new Date();
    let dayNumber = targetDayOverride || this.activeDayOverride || todayDate.getDay();
    if (dayNumber === 0 || dayNumber === 6) dayNumber = 5; // Weekend defaults to Friday

    const daysRows = db.prepare('SELECT * FROM weekly_task_days WHERE sheet_id = ? ORDER BY day_number ASC').all(sheet.id);

    // Find current day row
    let currentDayRow = daysRows.find(d => d.day_number === dayNumber);
    if (!currentDayRow && daysRows.length > 0) {
      currentDayRow = daysRows[daysRows.length - 1]; // Fallback to last available day
      dayNumber = currentDayRow.day_number;
    }

    // Find next working day row
    let nextWorkingDayRow = null;
    for (const d of daysRows) {
      if (d.day_number > dayNumber && !d.is_holiday) {
        nextWorkingDayRow = d;
        break;
      }
    }

    const plannedTodayTopics = currentDayRow ? JSON.parse(currentDayRow.topics_covered || '[]') : [];
    const plannedTodayTasks = currentDayRow ? JSON.parse(currentDayRow.assigned_tasks || '[]') : [];

    const topicCategory = this.detectTopicCategory(plannedTodayTopics);

    // Ensure 5-point completed tasks in simple words derived directly from user's planned points
    let completedTodayTopics = currentDayRow ? JSON.parse(currentDayRow.completed_react || '[]') : [];
    let completedTodayTasks = currentDayRow ? JSON.parse(currentDayRow.completed_tasks || '[]') : [];

    if (completedTodayTopics.length !== 5) {
      completedTodayTopics = this.synthesizeFiveCompletedPoints(plannedTodayTopics, 'topics', topicCategory);
    }
    if (completedTodayTasks.length !== 5) {
      completedTodayTasks = this.synthesizeFiveCompletedPoints(plannedTodayTasks, 'tasks', topicCategory);
    }

    // Planned next day logic:
    // If next day exists, take topics and tasks as-is.
    // If today is Friday / last working day (nextWorkingDayRow is null), Next Day is N/A!
    const isNextDayNA = !nextWorkingDayRow;
    const plannedNextDayTopics = nextWorkingDayRow ? JSON.parse(nextWorkingDayRow.topics_covered || '[]') : [];
    const plannedNextDayTasks = nextWorkingDayRow ? JSON.parse(nextWorkingDayRow.assigned_tasks || '[]') : [];
    const nextDayTopicCategory = nextWorkingDayRow ? this.detectTopicCategory(plannedNextDayTopics) : topicCategory;

    return {
      sheetId: sheet.id,
      dayNumber: currentDayRow ? currentDayRow.day_number : dayNumber,
      dayName: currentDayRow ? currentDayRow.day_name : 'Today',
      isHoliday: currentDayRow ? Boolean(currentDayRow.is_holiday) : false,
      holidayReason: currentDayRow?.holiday_reason || '',
      syncSource: sheet.sync_source,
      senderEmail: sheet.sender_email,
      recipientLead: sheet.recipient_lead,
      technology: 'Web Development',
      topicCategory,
      nextDayTopicCategory,
      plannedToday: {
        topics: plannedTodayTopics,
        tasks: plannedTodayTasks,
        react: plannedTodayTopics
      },
      completedToday: {
        topics: completedTodayTopics,
        tasks: completedTodayTasks,
        react: completedTodayTopics
      },
      pending: 'N/A',
      plannedNextDay: {
        isNA: isNextDayNA,
        nextDayName: nextWorkingDayRow ? nextWorkingDayRow.day_name : null,
        topicCategory: nextDayTopicCategory,
        topics: plannedNextDayTopics,
        tasks: plannedNextDayTasks,
        react: plannedNextDayTopics
      },
      challenges: 'N/A'
    };
  }

  /**
   * Intelligently parses raw weekly email content received from Prasanna Gunji.
   * Handles:
   * - Day 1 to Day 5 or Monday to Friday
   * - Topics Covered / React list (as-is)
   * - Assigned Tasks / Work list (as-is)
   * - Automatic holiday detection (3-day, 4-day, 5-day working weeks)
   * - Synthesizes 5 concise completed points for each day
   */
  parseWeeklyEmailContent(rawText, syncSource = 'Email Text Paste') {
    if (!rawText || !rawText.trim()) {
      throw new Error('Email text cannot be empty');
    }

    const text = rawText.replace(/\r\n/g, '\n');
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    // Split into Day blocks using regex
    const dayPattern = /(?:(?:Day\s*(\d+))|(Monday|Tuesday|Wednesday|Thursday|Friday))[:\s\-\(–]*([^\n]*)/gi;
    const matches = [];
    let match;

    while ((match = dayPattern.exec(text)) !== null) {
      matches.push({
        index: match.index,
        dayNumText: match[1],
        dayNameText: match[2],
        subHeader: match[3] || ''
      });
    }

    const parsedDays = [];

    if (matches.length > 0) {
      for (let i = 0; i < matches.length; i++) {
        const curr = matches[i];
        const nextIndex = i + 1 < matches.length ? matches[i + 1].index : text.length;
        const blockText = text.substring(curr.index, nextIndex);

        let dayNumber = curr.dayNumText ? parseInt(curr.dayNumText, 10) : (i + 1);
        let explicitName = curr.dayNameText;
        if (!explicitName && curr.subHeader) {
          const matchWeekday = curr.subHeader.match(/\b(Monday|Tuesday|Wednesday|Thursday|Friday)\b/i);
          if (matchWeekday) explicitName = matchWeekday[1];
        }
        let dayName = explicitName || dayNames[dayNumber - 1] || `Day ${dayNumber}`;

        if (!curr.dayNumText && curr.dayNameText) {
          const foundIdx = dayNames.findIndex(d => d.toLowerCase() === curr.dayNameText.toLowerCase());
          if (foundIdx !== -1) dayNumber = foundIdx + 1;
        }

        // Check for holiday indicators
        const isHoliday = /(holiday|closed|off\s*day|festival|leave)/i.test(curr.subHeader) || /(holiday|closed|off\s*day|festival)/i.test(blockText.substring(0, 80));
        let holidayReason = '';
        if (isHoliday) {
          const reasonMatch = curr.subHeader.match(/(?:holiday|festival|off)[\s\-:]*([^\n\(\)]+)/i);
          holidayReason = reasonMatch ? reasonMatch[1].trim() : 'Public / Company Holiday';
        }

        // Extract Topics vs Tasks
        const { topics, tasks } = this.extractTopicsAndTasksFromBlock(blockText);
        const topicCat = this.detectTopicCategory(topics);

        const completedReact = this.synthesizeFiveCompletedPoints(topics, 'topics', topicCat);
        const completedTasks = this.synthesizeFiveCompletedPoints(tasks, 'tasks', topicCat);

        parsedDays.push({
          dayNumber,
          dayName,
          isHoliday,
          holidayReason,
          topicsCovered: topics,
          assignedTasks: tasks,
          completedReact,
          completedTasks
        });
      }
    } else {
      // Check if text is a single day's block without explicit "Day X" header
      const singleDay = this.extractTopicsAndTasksFromBlock(text);
      if (singleDay.topics.length > 0 || singleDay.tasks.length > 0) {
        parsedDays.push({
          dayNumber: this.activeDayOverride || 1,
          dayName: dayNames[(this.activeDayOverride || 1) - 1] || 'Monday',
          isHoliday: false,
          holidayReason: '',
          topicsCovered: singleDay.topics,
          assignedTasks: singleDay.tasks,
          completedReact: this.synthesizeFiveCompletedPoints(singleDay.topics, 'react'),
          completedTasks: this.synthesizeFiveCompletedPoints(singleDay.tasks, 'tasks')
        });
      } else {
        // Fallback: If no clear Day headers, split into 5 standard workdays
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        const half = Math.ceil(lines.length / 5);
        for (let d = 1; d <= 5; d++) {
          const dayLines = lines.slice((d - 1) * half, d * half);
          const topics = dayLines.slice(0, Math.ceil(dayLines.length / 2));
          const tasks = dayLines.slice(Math.ceil(dayLines.length / 2));

          parsedDays.push({
            dayNumber: d,
            dayName: dayNames[d - 1],
            isHoliday: false,
            holidayReason: '',
            topicsCovered: topics.length > 0 ? topics : [`Web Development React curriculum module ${d}`],
            assignedTasks: tasks.length > 0 ? tasks : [`Develop and stage milestone task deliverables for Day ${d}`],
            completedReact: this.synthesizeFiveCompletedPoints(topics, 'react'),
            completedTasks: this.synthesizeFiveCompletedPoints(tasks, 'tasks')
          });
        }
      }
    }

    // Ensure all 5 days exist: merge parsed days with the existing 5-day curriculum
    const existingDays = db.prepare(`
      SELECT * FROM weekly_task_days 
      WHERE sheet_id = (SELECT id FROM weekly_task_sheets WHERE is_active = 1 LIMIT 1)
      ORDER BY day_number ASC
    `).all();

    const finalDays = [];
    for (let d = 1; d <= 5; d++) {
      const parsedMatch = parsedDays.find(p => p.dayNumber === d);
      if (parsedMatch) {
        finalDays.push(parsedMatch);
      } else {
        const existingMatch = existingDays.find(e => e.day_number === d);
        if (existingMatch) {
          finalDays.push({
            dayNumber: d,
            dayName: existingMatch.day_name,
            isHoliday: Boolean(existingMatch.is_holiday),
            holidayReason: existingMatch.holiday_reason || '',
            topicsCovered: JSON.parse(existingMatch.topics_covered || '[]'),
            assignedTasks: JSON.parse(existingMatch.assigned_tasks || '[]'),
            completedReact: JSON.parse(existingMatch.completed_react || '[]'),
            completedTasks: JSON.parse(existingMatch.completed_tasks || '[]')
          });
        } else {
          finalDays.push({
            dayNumber: d,
            dayName: dayNames[d - 1],
            isHoliday: false,
            holidayReason: '',
            topicsCovered: [`Web Development React curriculum module ${d}`],
            assignedTasks: [`Develop and stage milestone task deliverables for Day ${d}`],
            completedReact: this.synthesizeFiveCompletedPoints([`Module ${d}`], 'react'),
            completedTasks: this.synthesizeFiveCompletedPoints([`Task ${d}`], 'tasks')
          });
        }
      }
    }

    // Persist parsed weekly schedule to SQLite
    const sheetId = `sheet-sync-${Date.now()}`;
    const sheetName = `Web Development Weekly Tasks - Synced ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

    db.prepare('UPDATE weekly_task_sheets SET is_active = 0 WHERE is_active = 1').run();

    db.prepare(`
      INSERT INTO weekly_task_sheets (id, sheet_name, sender_email, recipient_lead, technology, raw_email_text, sync_source, total_days, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
      sheetId,
      sheetName,
      this.prasannaEmail,
      this.nafisaEmail,
      'Web Development',
      rawText,
      syncSource,
      finalDays.length
    );

    const insertDay = db.prepare(`
      INSERT INTO weekly_task_days (id, sheet_id, day_number, day_name, is_holiday, holiday_reason, topics_covered, assigned_tasks, completed_react, completed_tasks)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const d of finalDays) {
      insertDay.run(
        `day-${sheetId}-${d.dayNumber}`,
        sheetId,
        d.dayNumber,
        d.dayName,
        d.isHoliday ? 1 : 0,
        d.holidayReason || '',
        JSON.stringify(d.topicsCovered),
        JSON.stringify(d.assignedTasks),
        JSON.stringify(d.completedReact),
        JSON.stringify(d.completedTasks)
      );
    }

    return this.getAllDaysChart();
  }

  /**
   * Helper to parse bullet points inside a single day's text block.
   * Accurately extracts ALL lines under Topics Covered (React) and Assigned Tasks (Tasks)
   * without dropping any items containing 'React', 'task', etc.
   */
  extractTopicsAndTasksFromBlock(blockText) {
    const rawLines = blockText.split('\n').map(l => l.trim()).filter(Boolean);
    const topics = [];
    const tasks = [];
    let currentMode = 'topics'; // Default to topics/react first

    for (const line of rawLines) {
      // Strip outer markdown bolding if present: **Topics Covered:** -> Topics Covered:
      const unbolded = line.replace(/^\*\*|\*\*$/g, '').trim();
      const lower = unbolded.toLowerCase();

      // Skip the Day header line itself (e.g. "Day 1:", "Day 1 (Monday)", "Monday:")
      if (/^(?:day\s*[-–]?\s*\d+|monday|tuesday|wednesday|thursday|friday)[\s:\-\(]*[^\n]*$/i.test(unbolded) &&
          !lower.includes('topic') && !lower.includes('task') && !lower.includes('react')) {
        continue;
      }

      // 0. STOP reading this day's block as soon as Mini Assessment or Mini Task section is reached!
      // As requested: ignore mini assessment and mini task, discarding everything from that point downward for the day.
      const cleanedForHeader = unbolded.replace(/^[#*\-•\s]+/, '').trim();
      const isMiniAssessmentOrTask = /^(?:\d+[\.\)]\s*)?(?:mini\s*[-–]?\s*(?:assignment|assessment|task|project|quiz)s?|assessment\s*questions?|assessments?|quiz(?:zes)?|evaluation|self\s*assessment|final\s*practical\s*assignment|recommended\s*project)\b/i.test(cleanedForHeader);
      if (isMiniAssessmentOrTask) {
        break; // Stop parsing this day completely, ignore mini assessment and everything below it
      }

      // 1. Check for combined header + content on same line (e.g. "Topics Covered: Introduction to React, React features")
      const combinedTopicsMatch = unbolded.match(/^(?:(?:\d+[\.\)]\s*)?(?:topics?\s*covered|react\s*topics?)\s*[:\-])\s*(.+)$/i);
      if (combinedTopicsMatch) {
        currentMode = 'topics';
        const rest = combinedTopicsMatch[1].trim();
        if (rest && rest.length > 2) {
          if (rest.includes(';') || (rest.includes(',') && !rest.includes('('))) {
            const parts = rest.split(/[,;]/).map(p => p.trim()).filter(p => p.length > 2);
            topics.push(...parts);
          } else {
            topics.push(rest);
          }
        }
        continue;
      }

      const combinedTasksMatch = unbolded.match(/^(?:(?:\d+[\.\)]\s*)?(?:assigned?\s*tasks?|tasks?\s*assigned|tasks?|assignments?)\s*[:\-])\s*(.+)$/i);
      if (combinedTasksMatch) {
        currentMode = 'tasks';
        const rest = combinedTasksMatch[1].trim();
        if (rest && rest.length > 2) {
          if (rest.includes(';') || (rest.includes(',') && !rest.includes('('))) {
            const parts = rest.split(/[,;]/).map(p => p.trim()).filter(p => p.length > 2);
            tasks.push(...parts);
          } else {
            tasks.push(rest);
          }
        }
        continue;
      }

      // 2. Check for pure section headers (switches mode and consumes the header line)
      if (/^(?:\d+[\.\)]\s*)?(?:topics?\s*covered|react\s*topics?|javascript\s*topics?|react|javascript|syllabus|curriculum|learning\s*objectives?)[:\s\-]*$/i.test(unbolded)) {
        currentMode = 'topics';
        continue;
      }

      if (/^(?:\d+[\.\)]\s*)?(?:assigned?\s*tasks?|tasks?\s*assigned|tasks?|(?:daily\s*|weekly\s*)?assignments?|work\s*assigned|deliverables?|practical\s*tasks?)[:\s\-]*$/i.test(unbolded)) {
        currentMode = 'tasks';
        continue;
      }

      // Clean leading bullets, numbers, dashes, asterisks
      const cleanLine = unbolded
        .replace(/^[\d+.)\-•*#\s]+/, '')
        .trim();

      if (cleanLine.length < 2) continue;

      // If line explicitly indicates a numbered task (e.g. "Task 1:", "Assignment 2:"), ensure it switches to tasks
      if (/^(?:task\s*\d+|assignment\s*\d+|work\s*\d+)[:\s\-]/i.test(cleanLine)) {
        currentMode = 'tasks';
      }

      if (currentMode === 'topics') {
        topics.push(cleanLine);
      } else {
        tasks.push(cleanLine);
      }
    }

    // Ensure at least one item per category if totally empty
    return {
      topics: topics.length > 0 ? topics : ['React core concepts and component implementation'],
      tasks: tasks.length > 0 ? tasks : ['Complete assigned development tasks and stage files for review']
    };
  }

  /**
   * Updates a specific day's topics, tasks, or holiday status in SQLite.
   */
  updateDay(dayId, updates) {
    const existing = db.prepare('SELECT * FROM weekly_task_days WHERE id = ?').get(dayId);
    if (!existing) throw new Error('Day not found');

    const topicsCovered = updates.topicsCovered ? JSON.stringify(updates.topicsCovered) : existing.topics_covered;
    const assignedTasks = updates.assignedTasks ? JSON.stringify(updates.assignedTasks) : existing.assigned_tasks;
    const isHoliday = updates.isHoliday !== undefined ? (updates.isHoliday ? 1 : 0) : existing.is_holiday;
    const holidayReason = updates.holidayReason !== undefined ? updates.holidayReason : existing.holiday_reason;

    // Recalculate 5-point completed tasks
    const parsedTopics = JSON.parse(topicsCovered);
    const parsedTasks = JSON.parse(assignedTasks);
    const completedReact = JSON.stringify(this.synthesizeFiveCompletedPoints(parsedTopics, 'react'));
    const completedTasks = JSON.stringify(this.synthesizeFiveCompletedPoints(parsedTasks, 'tasks'));

    db.prepare(`
      UPDATE weekly_task_days 
      SET topics_covered = ?,
          assigned_tasks = ?,
          completed_react = ?,
          completed_tasks = ?,
          is_holiday = ?,
          holiday_reason = ?
      WHERE id = ?
    `).run(topicsCovered, assignedTasks, completedReact, completedTasks, isHoliday, holidayReason, dayId);

    return this.getAllDaysChart();
  }

  /**
   * Formats the exact 2-column HTML Table matching user's two screenshots.
   */
  generateHtmlTable(data) {
    const formatList = (items) => {
      if (!Array.isArray(items) || items.length === 0) return 'N/A';
      return `<ul style="margin: 4px 0 0 18px; padding: 0; list-style-type: disc;">${items.map(it => `<li style="margin-bottom: 4px;">${it}</li>`).join('')}</ul>`;
    };

    const pendingDisplay = data.pending === 'N/A' || !Array.isArray(data.pending) || data.pending.length === 0
      ? '<div style="text-align: center; font-weight: 500;">N/A</div>'
      : formatList(data.pending);

    const challengesDisplay = data.challenges === 'N/A' || !Array.isArray(data.challenges) || data.challenges.length === 0
      ? '<div style="text-align: center; font-weight: 500;">N/A</div>'
      : formatList(data.challenges);

    const plannedTodayTopics = data.plannedToday?.topics || data.plannedToday?.react || [];
    const plannedTodayTasks = data.plannedToday?.tasks || [];
    const topicTitle = data.topicCategory || this.detectTopicCategory(plannedTodayTopics) || 'Topics Covered';

    const completedTodayTopics = data.completedToday?.topics || data.completedToday?.react || [];
    const completedTodayTasks = data.completedToday?.tasks || [];

    const isNextDayNA = data.plannedNextDay?.isNA || (!data.plannedNextDay?.topics?.length && !data.plannedNextDay?.react?.length);
    const nextDayTopics = data.plannedNextDay?.topics || data.plannedNextDay?.react || [];
    const nextDayTasks = data.plannedNextDay?.tasks || [];
    const nextDayTopicTitle = data.plannedNextDay?.topicCategory || this.detectTopicCategory(nextDayTopics) || topicTitle;

    // Planned Next Day: If isNA or empty, render clean N/A
    const nextDayDisplay = isNextDayNA
      ? '<div style="text-align: center; font-weight: 500;">N/A</div>'
      : `
      <div style="font-weight: bold; margin-bottom: 2px; color: #000000;">1. ${nextDayTopicTitle}:</div>
      ${formatList(nextDayTopics)}
      <div style="font-weight: bold; margin-top: 10px; margin-bottom: 2px; color: #000000;">2.Tasks:</div>
      ${formatList(nextDayTasks)}
      `;

    return `
<div style="font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #000000; line-height: 1.5;">
  <p style="margin: 0 0 4px 0; font-size: 14px; color: #000000;"><strong>Hi Nafisa Khanam Pathan mam and Prasanna Gunji Mam,</strong></p>
  <p style="margin: 0 0 4px 0; font-size: 14px; color: #000000;">Good evening,</p>
  <p style="margin: 0 0 16px 0; color: #000000; font-size: 14px;">Please find below the task summary for today</p>

  <table border="1" bordercolor="#000000" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 800px; border: 1.5px solid #000000; font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #000000; line-height: 1.5;">
    <tr>
      <td style="font-weight: bold; width: 32%; text-align: center; border: 1.5px solid #000000; background-color: #f2f2f2; color: #000000; vertical-align: middle;">Technology</td>
      <td style="font-weight: bold; width: 68%; text-align: center; border: 1.5px solid #000000; background-color: #ffffff; color: #000000; vertical-align: middle;">${data.technology || 'Web Development'}</td>
    </tr>
    <tr>
      <td style="font-weight: bold; text-align: center; border: 1.5px solid #000000; background-color: #f2f2f2; color: #000000; vertical-align: middle;">Planned Tasks (Today)</td>
      <td style="border: 1.5px solid #000000; background-color: #ffffff; color: #000000; padding: 12px;">
        <div style="font-weight: bold; margin-bottom: 2px; color: #000000;">1. ${topicTitle}:</div>
        ${formatList(plannedTodayTopics)}
        <div style="font-weight: bold; margin-top: 10px; margin-bottom: 2px; color: #000000;">2.Tasks:</div>
        ${formatList(plannedTodayTasks)}
      </td>
    </tr>
    <tr>
      <td style="font-weight: bold; text-align: center; border: 1.5px solid #000000; background-color: #f2f2f2; color: #000000; vertical-align: middle;">Completed Tasks (Today)</td>
      <td style="border: 1.5px solid #000000; background-color: #ffffff; color: #000000; padding: 12px;">
        <div style="font-weight: bold; margin-bottom: 2px; color: #000000;">1. ${topicTitle}:</div>
        ${formatList(completedTodayTopics)}
        <div style="font-weight: bold; margin-top: 10px; margin-bottom: 2px; color: #000000;">2.Tasks:</div>
        ${formatList(completedTodayTasks)}
      </td>
    </tr>
    <tr>
      <td style="font-weight: bold; text-align: center; border: 1.5px solid #000000; background-color: #f2f2f2; color: #000000; vertical-align: middle;">Pending Tasks</td>
      <td style="border: 1.5px solid #000000; background-color: #ffffff; color: #000000; padding: 12px; vertical-align: middle; text-align: center;">
        ${pendingDisplay}
      </td>
    </tr>
    <tr>
      <td style="font-weight: bold; text-align: center; border: 1.5px solid #000000; background-color: #f2f2f2; color: #000000; vertical-align: middle;">Planned Tasks (Next Day)</td>
      <td style="border: 1.5px solid #000000; background-color: #ffffff; color: #000000; padding: 12px; vertical-align: middle;">
        ${nextDayDisplay}
      </td>
    </tr>
    <tr>
      <td style="font-weight: bold; text-align: center; border: 1.5px solid #000000; background-color: #f2f2f2; color: #000000; vertical-align: middle;">Challenges / Blockers if any</td>
      <td style="border: 1.5px solid #000000; background-color: #ffffff; color: #000000; padding: 12px; vertical-align: middle; text-align: center;">
        ${challengesDisplay}
      </td>
    </tr>
  </table>
</div>`.trim();
  }

  /**
   * Formats the exact Text Representation for browser deep-links & plain text editors.
   */
  generateTextFormat(data, user) {
    const renderBullets = (arr) => Array.isArray(arr) && arr.length > 0 ? arr.map(i => `  • ${i}`).join('\n') : '  • N/A';
    const pendingText = data.pending === 'N/A' || !Array.isArray(data.pending) || data.pending.length === 0
      ? 'N/A'
      : data.pending.map(i => `  • ${i}`).join('\n');
    const challengesText = data.challenges === 'N/A' || !Array.isArray(data.challenges) || data.challenges.length === 0
      ? 'N/A'
      : data.challenges.map(i => `  • ${i}`).join('\n');

    const plannedTodayTopics = data.plannedToday?.topics || data.plannedToday?.react || [];
    const plannedTodayTasks = data.plannedToday?.tasks || [];
    const topicTitle = data.topicCategory || this.detectTopicCategory(plannedTodayTopics) || 'Topics Covered';

    const completedTodayTopics = data.completedToday?.topics || data.completedToday?.react || [];
    const completedTodayTasks = data.completedToday?.tasks || [];

    const isNextDayNA = data.plannedNextDay?.isNA || (!data.plannedNextDay?.topics?.length && !data.plannedNextDay?.react?.length);
    const nextDayTopics = data.plannedNextDay?.topics || data.plannedNextDay?.react || [];
    const nextDayTasks = data.plannedNextDay?.tasks || [];
    const nextDayTopicTitle = data.plannedNextDay?.topicCategory || this.detectTopicCategory(nextDayTopics) || topicTitle;

    const nextDayText = isNextDayNA
      ? '  N/A'
      : `| 1. ${nextDayTopicTitle}:                                                                                         |\n${renderBullets(nextDayTopics)}\n| 2.Tasks:                                                                                          |\n${renderBullets(nextDayTasks)}`;

    return `Hi Nafisa Khanam Pathan mam and Prasanna Gunji Mam,

Good evening,

Please find below the task summary for today

+---------------------------------------------------------------------------------------------------+
| Technology: ${data.technology || 'Web Development'}                                                                       |
+---------------------------------------------------------------------------------------------------+
| Planned Tasks (Today):                                                                            |
| 1. ${topicTitle}:                                                                                         |
${renderBullets(plannedTodayTopics)}
| 2.Tasks:                                                                                          |
${renderBullets(plannedTodayTasks)}
+---------------------------------------------------------------------------------------------------+
| Completed Tasks (Today):                                                                          |
| 1. ${topicTitle}:                                                                                         |
${renderBullets(completedTodayTopics)}
| 2.Tasks:                                                                                          |
${renderBullets(completedTodayTasks)}
+---------------------------------------------------------------------------------------------------+
| Pending Tasks:                                                                                    |
  ${pendingText}
+---------------------------------------------------------------------------------------------------+
| Planned Tasks (Next Day):                                                                         |
${nextDayText}
+---------------------------------------------------------------------------------------------------+
| Challenges / Blockers if any:                                                                     |
  ${challengesText}
+---------------------------------------------------------------------------------------------------+`;
  }

  /**
   * Scans the user's real Outlook Inbox for emails sent by Prasanna Gunji.
   */
  async scanInboxForWeeklyEmail(userId) {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) throw new Error('User not found');

    let scannedEmailText = null;
    let methodUsed = 'none';

    // 1. Try Microsoft Graph API if token available
    if (user.outlook_access_token) {
      try {
        const url = `${this.graphEndpoint}/me/mailFolders/inbox/messages?$top=25&$orderby=receivedDateTime desc`;
        
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${user.outlook_access_token}` }
        });

        if (res.ok) {
          const json = await res.json();
          const messages = json.value || [];
          const prasannaMail = messages.find(m => {
            const fromAddr = m.from?.emailAddress?.address?.toLowerCase() || '';
            const fromName = m.from?.emailAddress?.name?.toLowerCase() || '';
            const senderAddr = m.sender?.emailAddress?.address?.toLowerCase() || '';
            const subj = m.subject?.toLowerCase() || '';
            return fromAddr.includes('prasanna') || 
                   fromName.includes('prasanna') || 
                   senderAddr.includes('prasanna') ||
                   subj.includes('weekly') || 
                   subj.includes('task') || 
                   subj.includes('react');
          });

          if (prasannaMail && prasannaMail.body?.content) {
            scannedEmailText = prasannaMail.body.content.replace(/<[^>]+>/g, ' ');
            methodUsed = 'Real Microsoft Graph API';
          }
        }
      } catch (graphErr) {
        console.warn('Graph inbox scan warning:', graphErr.message);
      }
    }

    // 2. Try IMAP if credentials available
    if (!scannedEmailText && user.outlook_email && user.outlook_password) {
      try {
        const imapClient = new ImapFlow({
          host: 'outlook.office365.com',
          port: 993,
          secure: true,
          auth: { user: user.outlook_email, pass: user.outlook_password },
          logger: false
        });

        await imapClient.connect();
        const lock = await imapClient.getMailboxLock('INBOX');
        try {
          const messages = await imapClient.search({ or: [{ from: this.prasannaEmail }, { body: 'React' }] });
          if (messages && messages.length > 0) {
            const lastUid = messages[messages.length - 1];
            const msg = await imapClient.fetchOne(lastUid, { source: true, bodyStructure: true });
            if (msg && msg.source) {
              scannedEmailText = msg.source.toString('utf8');
              methodUsed = 'Real Outlook IMAP';
            }
          }
        } finally {
          lock.release();
          await imapClient.logout();
        }
      } catch (imapErr) {
        console.warn('IMAP inbox scan warning:', imapErr.message);
      }
    }

    // If a new email was found from Prasanna Mam, parse and update schedule
    if (scannedEmailText) {
      return this.parseWeeklyEmailContent(scannedEmailText, methodUsed);
    }

    // Return the active chart with helpful sync message
    const chart = this.getAllDaysChart();
    return {
      ...chart,
      syncSource: methodUsed !== 'none' ? `Real Outlook Inbox (${methodUsed})` : chart.sheet.syncSource,
      message: methodUsed !== 'none' 
        ? 'Latest email extracted from Prasanna Gunji and parsed into weekly chart!'
        : 'Active weekly curriculum loaded. Connect your Outlook credentials or paste Prasanna Mam\'s email directly to update.'
    };
  }
}

module.exports = new InboxTaskSyncService();
