const db = require('../database');
const inboxTaskSyncService = require('./inboxTaskSyncService');

/**
 * AI Email Assistant Service
 * Provides advanced Natural Language processing to turn casual, brief notes
 * into polished, executive-ready emails with auto-subject, body, tone styling,
 * attachment recognition, and smart recipient matching from the company directory.
 */
class AIService {
  /**
   * Generates a complete email draft based on a prompt and context.
   */
  async generateEmail({ prompt, userId, tone = 'professional', attachments = [] }) {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) || {
      name: 'Syed Mahammad Althaf',
      role: 'Associate software Engineer',
      department: 'Web Development',
      email: 'althaf.syed@nybinfotech.com'
    };

    const allContacts = db.prepare('SELECT * FROM contacts').all();
    const lower = (prompt || '').toLowerCase();
    const isEOD = lower.includes('eod') || lower.includes('evening') || lower.includes('task summary') || lower.includes('daily') || lower.includes('task') || lower.includes('react');

    // 1. Smart Recipient Matching from Directory based on Prompt Analysis
    const suggestedRecipients = this.detectSuggestedRecipients(prompt, allContacts);

    // 2. Generate Context-Aware Subject Line
    const subject = this.generateSubject(prompt, tone, user);

    // 3. Generate Polished Email Body & HTML Table
    const schedule = isEOD ? inboxTaskSyncService.getTodaySchedule() : null;
    const body = isEOD ? inboxTaskSyncService.generateTextFormat(schedule, user) : this.generateBody(prompt, user, tone, attachments);
    const htmlBody = isEOD ? inboxTaskSyncService.generateHtmlTable(schedule) : null;

    // 4. Summarize AI rationale for UI feedback
    const reasoning = isEOD 
      ? `Generated standardized Web Development Daily EOD Task Table with 5 React points and 5 Task points. Auto-addressed to Senior Leads Prasanna Gunji and Nafisa Khanam Pathan.`
      : this.generateReasoning(prompt, suggestedRecipients, tone);

    return {
      subject,
      body,
      htmlBody,
      isEODTable: Boolean(isEOD),
      scheduleData: schedule,
      suggestedTo: suggestedRecipients.to,
      suggestedCc: suggestedRecipients.cc,
      detectedTone: tone,
      reasoning,
      attachmentsNoted: attachments.map(a => a.original_name)
    };
  }

  /**
   * Refines an existing draft according to conversational instructions.
   */
  async refineEmail({ currentDraft, instruction, userId }) {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) || {
      name: 'Team Member',
      role: 'Project Lead'
    };

    let updatedSubject = currentDraft.subject;
    let updatedBody = currentDraft.body;
    let explanation = 'Draft updated based on your request.';

    const lower = instruction.toLowerCase();

    // Case 1: Make shorter / more concise
    if (lower.includes('shorter') || lower.includes('concise') || lower.includes('brief') || lower.includes('bullet')) {
      updatedBody = this.condenseBody(currentDraft.body);
      explanation = 'Condensed draft into punchy bullet points and removed extra verbiage.';
    }
    // Case 2: Make more formal / executive
    else if (lower.includes('formal') || lower.includes('executive') || lower.includes('professional') || lower.includes('management')) {
      updatedBody = this.elevateToneToExecutive(currentDraft.body, user);
      if (!updatedSubject.toLowerCase().includes('executive') && !updatedSubject.toLowerCase().includes('brief')) {
        updatedSubject = updatedSubject.replace('[Daily EOD Update]', '[Executive Briefing]').replace('[EOD Update]', '[Executive Summary]');
      }
      explanation = 'Elevated tone to executive standard, refined sign-off and structured business outcomes.';
    }
    // Case 3: Make friendly / casual
    else if (lower.includes('friendly') || lower.includes('casual') || lower.includes('warm')) {
      updatedBody = this.softenTone(currentDraft.body, user);
      explanation = 'Adjusted tone to be warm, approachable, and collaborative.';
    }
    // Case 4: Add specific content / reminders / notes
    else {
      updatedBody = this.appendCustomContent(currentDraft.body, instruction, user);
      explanation = `Incorporated the requested update: "${instruction}" into the draft.`;
    }

    // Check if prompt wants to modify the subject
    if (lower.includes('subject:') || lower.includes('change subject to')) {
      const match = instruction.match(/(?:subject:\s*|change subject to\s*)(.+)/i);
      if (match && match[1]) {
        updatedSubject = match[1].trim().replace(/^["']|["']$/g, '');
      }
    }

    return {
      subject: updatedSubject,
      body: updatedBody,
      explanation
    };
  }

  /**
   * Detects relevant contacts from the prompt text to recommend for TO and CC.
   */
  detectSuggestedRecipients(prompt, contacts) {
    const lower = prompt.toLowerCase();
    const to = [];
    const cc = [];

    // Specific Scenario 0: Daily Evening EOD Task Summary (NYBinfotech Leads: Prasanna Gunji & Nafisa Khanam Pathan)
    if (lower.includes('eod') || lower.includes('evening') || lower.includes('task summary') || lower.includes('daily') || lower.includes('react') || lower.includes('web development')) {
      const prasanna = contacts.find(c => c.name.toLowerCase().includes('prasanna') || c.email.includes('prasanna'));
      const nafisa = contacts.find(c => c.name.toLowerCase().includes('nafisa') || c.email.includes('nafisa'));
      const qa = contacts.find(c => c.department === 'Quality Assurance' || c.name === 'Priya Nair');
      const director = contacts.find(c => c.department === 'Leadership' || c.name === 'Rajesh Sharma');

      if (prasanna) to.push(prasanna);
      if (nafisa) to.push(nafisa);
      if (qa) cc.push(qa);
      if (director) cc.push(director);

      const unique = (arr) => arr.filter((c, i, a) => c && a.findIndex(x => x.id === c.id) === i);
      return { to: unique(to), cc: unique(cc) };
    }

    // Specific Scenario 1: Leave Application / Status
    if (lower.includes('leave') || lower.includes('vacation') || lower.includes('sick') || lower.includes('casual') || lower.includes('pto') || lower.includes('off')) {
      const nafisa = contacts.find(c => c.name.toLowerCase().includes('nafisa') || c.email.includes('nafisa'));
      const hr = contacts.find(c => c.department === 'People & HR' || c.name === 'Fatima Zahra');
      const director = contacts.find(c => c.department === 'Leadership' || c.name === 'Rajesh Sharma');

      if (nafisa) to.push(nafisa);
      if (hr) to.push(hr);
      if (director) cc.push(director);

      const unique = (arr) => arr.filter((c, i, a) => c && a.findIndex(x => x.id === c.id) === i);
      return { to: unique(to), cc: unique(cc) };
    }

    // Specific Scenario 2: Project Recommendation / Architecture
    if (lower.includes('project recommendation') || lower.includes('recommendation') || lower.includes('proposal') || lower.includes('architecture proposal')) {
      const clientDir = contacts.find(c => c.department === 'Client Services' || c.name === 'David Miller');
      const prodMgr = contacts.find(c => c.department === 'Product' || c.name === 'Vikram Patel');
      const director = contacts.find(c => c.department === 'Leadership' || c.name === 'Rajesh Sharma');
      const exec = contacts.find(c => c.name === 'Marcus Vance' || c.department === 'Leadership');
      const ops = contacts.find(c => c.name === 'Sarah Jenkins');

      if (prodMgr) to.push(prodMgr);
      if (clientDir) to.push(clientDir);
      if (director) cc.push(director);
      if (ops) cc.push(ops);
      if (exec) cc.push(exec);

      return { to, cc };
    }

    // Specific Scenario 3: QA & Sprint Sign-Off
    if (lower.includes('qa') || lower.includes('test') || lower.includes('sign-off') || lower.includes('release') || lower.includes('staging')) {
      const qa1 = contacts.find(c => c.name === 'Priya Nair' || c.department === 'Quality Assurance');
      const qa2 = contacts.find(c => c.name === 'Sneha Reddy');
      const eng1 = contacts.find(c => c.name === 'Michael Chen');
      const eng2 = contacts.find(c => c.name === 'Kevin Brooks');

      if (qa1) to.push(qa1);
      if (qa2) to.push(qa2);
      if (eng1) cc.push(eng1);
      if (eng2) cc.push(eng2);

      return { to, cc };
    }

    // Standard detection by matching names, roles, departments
    for (const c of contacts) {
      const nameFirst = c.name.split(' ')[0].toLowerCase();
      const nameFull = c.name.toLowerCase();
      const dept = c.department.toLowerCase();
      const role = c.role.toLowerCase();

      const mentionsCC = lower.includes(`cc ${nameFirst}`) || 
                         lower.includes(`cc ${nameFull}`) || 
                         (lower.includes('cc') && (lower.includes(dept) || lower.includes(role)));

      const mentionsGeneral = lower.includes(nameFirst) || lower.includes(nameFull) || lower.includes(dept);

      if (mentionsCC) {
        if (!cc.some(x => x.id === c.id)) cc.push(c);
      } else if (mentionsGeneral) {
        if (!to.some(x => x.id === c.id)) to.push(c);
      }
    }

    // Default Fallback: Daily Evening EOD Group (Prasanna Gunji & Nafisa Khanam Pathan)
    if (to.length === 0) {
      const p = contacts.find(c => c.email.includes('prasanna')) || contacts[0];
      const n = contacts.find(c => c.email.includes('nafisa')) || contacts[1];
      to.push(p);
      to.push(n);
    }
    if (cc.length === 0) {
      cc.push(contacts[0]);
      cc.push(contacts[1]);
    }

    const unique = (arr) => arr.filter((c, i, a) => c && a.findIndex(x => x.id === c.id) === i);
    return { to: unique(to), cc: unique(cc) };
  }

  generateSubject(prompt, tone, user) {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const todayStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const lower = prompt.toLowerCase();

    // 1. Daily EOD Task Summary / Status Report
    if (lower.includes('eod') || lower.includes('evening') || lower.includes('daily') || lower.includes('task summary') || lower.includes('react') || lower.includes('status report')) {
      return `Daily Status Report [${dd}-${mm}-${yyyy}]`;
    }

    // 2. Leave Application
    if (lower.includes('leave') || lower.includes('vacation') || lower.includes('sick') || lower.includes('casual') || lower.includes('pto') || lower.includes('off')) {
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const tomDD = String(tomorrow.getDate()).padStart(2, '0');
      const tomMM = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const tomYYYY = tomorrow.getFullYear();
      const dateTag = lower.includes('tomorrow') ? `${tomDD}-${tomMM}-${tomYYYY}` : `${dd}-${mm}-${yyyy}`;
      return `Leave Request [${dateTag}] - ${user?.name || 'Syed Mahammad Althaf'}`;
    }

    // 3. Project Recommendation
    if (lower.includes('project recommendation') || lower.includes('recommendation') || lower.includes('proposal')) {
      return `[Project Recommendation] Architectural Proposal & Delivery Plan - Q4`;
    }

    // 4. Incident Advisory
    if (lower.includes('incident') || lower.includes('urgent') || lower.includes('alert') || lower.includes('down')) {
      return `[URGENT INCIDENT] Service Advisory & Mitigation Updates`;
    }

    // Generic Clean Subject
    let cleanPrompt = prompt.split(/[.\n]/)[0].replace(/^(please|draft|send|create|write|need to)\s+/i, '').trim();
    if (cleanPrompt.length > 60) {
      const words = cleanPrompt.split(' ');
      cleanPrompt = '';
      for (const w of words) {
        if ((cleanPrompt + ' ' + w).length <= 55) {
          cleanPrompt += (cleanPrompt ? ' ' : '') + w;
        } else break;
      }
    }
    const cap = cleanPrompt.charAt(0).toUpperCase() + cleanPrompt.slice(1);
    return `${cap} - ${todayStr}`;
  }

  generateBody(prompt, user, tone, attachments) {
    const lower = prompt.toLowerCase();
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    let attachmentText = '';
    if (attachments && attachments.length > 0) {
      const fileNames = attachments.map(a => `• ${a.original_name}`).join('\n');
      attachmentText = `\n\nAttached Files:\n${fileNames}`;
    }

    // 1. Scenario: Leave Application
    if (lower.includes('leave') || lower.includes('vacation') || lower.includes('sick') || lower.includes('casual') || lower.includes('pto') || lower.includes('off')) {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const tomDD = String(tomorrow.getDate()).padStart(2, '0');
      const tomMM = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const tomYYYY = tomorrow.getFullYear();
      const tomorrowDateStr = `${tomDD}-${tomMM}-${tomYYYY}`;

      // Extract specific reason from user prompt
      let reason = 'personal issue';
      if (lower.includes('fever') || lower.includes('cold') || lower.includes('headache') || lower.includes('sick') || lower.includes('health') || lower.includes('medical') || lower.includes('not feeling well') || lower.includes('doctor')) {
        reason = lower.includes('fever') ? 'fever' : 'health issue';
      } else if (lower.includes('family') || lower.includes('function') || lower.includes('marriage') || lower.includes('wedding')) {
        reason = 'family commitments';
      } else if (lower.includes('urgent') || lower.includes('emergency')) {
        reason = 'urgent personal work';
      } else if (lower.includes('personal')) {
        reason = 'personal matters';
      } else {
        const reasonMatch = prompt.match(/(?:due to|because of|regarding|for)\s+([a-zA-Z\s]+?)(?:\.|$|,|please)/i);
        if (reasonMatch && reasonMatch[1] && reasonMatch[1].trim().length > 2 && !reasonMatch[1].toLowerCase().includes('tomorrow') && !reasonMatch[1].toLowerCase().includes('leave')) {
          reason = reasonMatch[1].trim();
        }
      }

      // Check duration
      const isTomorrow = lower.includes('tomorrow') || !prompt.match(/\d+\s*(?:days?|weeks?)/i);
      let durationPhrase = 'for tomorrow';
      let grantPhrase = 'Please grant me leave for one day.';

      const durationMatch = prompt.match(/(\d+)\s*(?:business days?|days?)/i);
      if (durationMatch) {
        const count = parseInt(durationMatch[1], 10);
        if (count > 1) {
          durationPhrase = `for ${count} days`;
          if (lower.includes('next week') || lower.includes('monday')) {
            durationPhrase += ' starting next week';
          }
          grantPhrase = `Please grant me leave for ${count} days.`;
        }
      }

      const timeFrame = isTomorrow ? `for tomorrow (${tomorrowDateStr})` : durationPhrase;

      return `Hi Nafisa Khanam Pathan mam,

Good morning,

I am writing to request leave ${timeFrame} due to ${reason}.

${grantPhrase}

Thank you.`;
    }

    // 2. Scenario: Project Recommendation
    if (lower.includes('project recommendation') || lower.includes('recommendation') || lower.includes('proposal')) {
      if (tone === 'concise') {
        return `Hi Team,

Following up on our recent reviews, here is my project recommendation:

• Objective: Upgrade system architecture and optimize key delivery pipelines.
• Scope: Core service optimizations, staging regression tests, and latency reduction.
• Next Steps: Open for review and alignment on execution timelines.${attachmentText}

Best,
${user.name}`;
      }

      return `Dear Project Stakeholders & Leadership,

I would like to formally submit the following project recommendation for your consideration:

1. Overview & Objective:
Based on our current roadmap and platform evaluations, I propose architectural enhancements and workflow optimizations to increase stability, minimize response latency, and support upcoming deliverables.

2. Planned Execution:
• Phase 1: Core service and configuration optimizations.
• Phase 2: Quality verification and staged deployment.
• Phase 3: Post-launch monitoring and performance review.

3. Next Steps:
Kindly review this recommendation. I am available at your convenience to discuss questions and align on scheduling.${attachmentText}

Sincerely,
${user.name}
${user.role}`;
    }

    // 3. Scenario: Daily EOD / Status Update
    if (lower.includes('eod') || lower.includes('evening') || lower.includes('status') || lower.includes('daily update') || lower.includes('today')) {
      const lines = prompt.split(/[\n,;.]/).map(l => l.trim()).filter(l => l.length > 3);
      const accomplishments = [];
      const nextSteps = [];

      for (const line of lines) {
        const low = line.toLowerCase();
        if (low.includes('tomorrow') || low.includes('next') || low.includes('will') || low.includes('plan')) {
          nextSteps.push(this.formatBullet(line));
        } else if (!low.includes('cc') && !low.includes('send') && !low.includes('draft') && !low.includes('eod')) {
          accomplishments.push(this.formatBullet(line));
        }
      }

      if (accomplishments.length === 0) accomplishments.push('Completed scheduled development deliverables and reviewed staging builds.');
      if (nextSteps.length === 0) nextSteps.push('Continue execution on sprint backlog and coordinate with team.');

      if (tone === 'concise') {
        return `Hi Team,

EOD Update for today:

Accomplished:
${accomplishments.map(a => `• ${a}`).join('\n')}

Tomorrow:
${nextSteps.map(s => `• ${s}`).join('\n')}${attachmentText}

Thanks,
${user.name}`;
      }

      return `Hi Team,

Please find the summary of today's progress and tomorrow's upcoming priorities:

Completed Today:
${accomplishments.map(a => `• ${a}`).join('\n')}

Planned for Tomorrow:
${nextSteps.map(s => `• ${s}`).join('\n')}${attachmentText}

Please let me know if you have any questions or require further details.

Best regards,
${user.name}
${user.role}`;
    }

    // 4. Scenario: General / Custom Prompt
    // Cleanly transforms user's rough prompt into a professional, cohesive email
    const sentences = prompt.split(/[.\n]/).map(s => s.trim()).filter(Boolean);
    const mainBody = sentences.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('. ');

    if (tone === 'concise') {
      return `Hi Team,

${mainBody}.${attachmentText}

Please let me know if you have any questions.

Thanks,
${user.name}`;
    }

    return `Dear Team,

I hope you are doing well.

${mainBody}.${attachmentText}

Please review and feel free to reach out if you need any additional information.

Best regards,
${user.name}
${user.role}`;
  }

  formatBullet(str) {
    let clean = str.replace(/^(completed|worked on|done with|fixed|resolved|draft|sending|cc to|cc)\s+/i, '');
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
    return clean;
  }

  condenseBody(body) {
    return body
      .replace(/I hope you're having a productive day\./gi, '')
      .replace(/Please feel free to reach out if you have any questions or require additional details\./gi, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  elevateToneToExecutive(body, user) {
    return `Dear Executive Leadership,

Please find below the operational and development status summary for your review:

${body.replace(/^Hi Team,/i, '').replace(/^Dear Team,/i, '').trim()}

Sincerely,
${user.name}
${user.role}`;
  }

  softenTone(body, user) {
    return `Hey everyone! 👋

Hope you all had a great day! Here is a quick snapshot of what got done and what's on deck next:

${body.replace(/^Hi Team,/i, '').replace(/^Dear Team,/i, '').trim()}

Cheers,
${user.name}`;
  }

  appendCustomContent(body, instruction, user) {
    return `${body}\n\nNote / Update: ${instruction}`;
  }

  generateReasoning(prompt, recipients, tone) {
    return `Synthesized prompt into structured ${tone} corporate email format. Selected ${recipients.to.length} TO and ${recipients.cc.length} CC recipients from directory.`;
  }
}

module.exports = new AIService();
