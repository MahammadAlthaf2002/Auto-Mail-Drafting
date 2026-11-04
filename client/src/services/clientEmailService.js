/**
 * Client-Side Autonomous Fallback Service
 * Ensures 100% full feature availability on static platforms (like Vercel, Netlify, GitHub Pages)
 * even when the local backend server is not running or disconnected.
 */

export const defaultUser = {
  id: 'usr-althaf',
  name: 'Syed Mahammad Althaf',
  email: 'althaf.syed@nybinfotech.com',
  department: 'Web Development',
  role: 'Associate software Engineer',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  outlook_connected: 1,
  outlook_email: 'althaf.syed@nybinfotech.com',
  outlook_type: 'work'
};

export const defaultContacts = [
  {
    id: 'c-prasanna',
    name: 'Prasanna Gunji',
    email: 'prasanna.gunji@nybinfotech.com',
    department: 'Web Development',
    role: 'Senior Technical Lead & Mentor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    is_favorite: 1,
    tags: 'Lead, Mentor, Daily EOD TO, Weekly Tasks'
  },
  {
    id: 'c-nafisa',
    name: 'Nafisa Khanam Pathan',
    email: 'nafisa.khanam@nybinfotech.com',
    department: 'Operations & Management',
    role: 'Project Manager & Delivery Lead',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    is_favorite: 1,
    tags: 'Management, Daily EOD TO, Operations'
  },
  {
    id: 'c-fatima',
    name: 'Fatima Zahra',
    email: 'fatima.z@nexusenterprise.com',
    department: 'People & HR',
    role: 'Senior HR Business Partner',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    is_favorite: 1,
    tags: 'HR, Leaves, PTO, Approvals'
  },
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
  }
];

export const defaultPresetGroups = [
  {
    id: 'grp-evening',
    name: 'Daily Evening EOD Status Group',
    description: 'Direct report to Prasanna Gunji and Nafisa Khanam Pathan',
    to_contacts: [defaultContacts[0], defaultContacts[1]],
    cc_contacts: [defaultContacts[3], defaultContacts[4]]
  },
  {
    id: 'grp-leave',
    name: 'Leave Application Group',
    description: 'Direct report to Delivery Lead Nafisa Khanam and HR',
    to_contacts: [defaultContacts[1], defaultContacts[2]],
    cc_contacts: [defaultContacts[3]]
  },
  {
    id: 'grp-eng',
    name: 'Core Engineering Squad',
    description: 'Engineering Squad and QA team members',
    to_contacts: [defaultContacts[4], defaultContacts[6]],
    cc_contacts: [defaultContacts[0], defaultContacts[3]]
  }
];

export const defaultWeeklyDays = [
  {
    id: 'day-w-1',
    dayNumber: 1,
    dayName: 'Monday',
    isHoliday: 0,
    holidayReason: '',
    topicsCovered: [
      'React core architecture, virtual DOM reconciliation, and JSX syntax rules',
      'Functional components structure and unidirectional props data passing',
      'useState hook fundamentals, state immutability, and state setter dispatchers',
      'Conditional rendering patterns (ternary operators, short-circuit evaluation)',
      'List rendering with dynamic map and mandatory unique key assignments'
    ],
    assignedTasks: [
      'Initialized Vite React application workspace and organized component structure',
      'Created modular Header, Sidebar, and Content dashboard layout components',
      'Implemented dynamic counter and toggle visibility controls with useState',
      'Structured dynamic product catalog list rendering from mock JSON data',
      'Committed Day 1 milestones to Git repository and verified clean build'
    ],
    completedReact: [
      'Understood React virtual DOM diffing algorithm and component rendering lifecycle',
      'Built reusable functional components with structured prop types and destructuring',
      'Mastered useState hook for component-level local state management',
      'Implemented clean conditional rendering using logical AND and ternary checks',
      'Learned best practices for unique key props during dynamic list mapping'
    ],
    completedTasks: [
      'Configured modern React project with Vite development server and Tailwind CSS',
      'Built multi-section dashboard layout including header and navigation sidebar',
      'Implemented interactive state counter with increment, decrement, and reset controls',
      'Rendered responsive data cards list dynamically with array map operations',
      'Pushed clean Monday development milestones and verified build outputs'
    ]
  },
  {
    id: 'day-w-2',
    dayNumber: 2,
    dayName: 'Tuesday',
    isHoliday: 0,
    holidayReason: '',
    topicsCovered: [
      'Synthetic event handling system (onClick, onChange, onSubmit) in React',
      'Controlled vs uncontrolled components pattern for form inputs management',
      'Multi-field form state aggregation using single state object and computed keys',
      'Real-time client-side form validation rules and interactive error rendering'
    ],
    assignedTasks: [
      'Constructed responsive user onboarding and profile registration form',
      'Implemented real-time input validation with red alert error indicators',
      'Configured custom form submit pipeline with structured payload logging',
      'Tested form state reset workflow and pushed clean updates to GitHub'
    ],
    completedReact: [
      'Mastered React synthetic event handling for buttons, forms, and keyboard events',
      'Implemented controlled form pattern with state synchronization across inputs',
      'Managed multi-input state cleanly using computed object property names',
      'Added real-time input validation with conditional alert indicators',
      'Practiced callback function propagation from parent to child form controls'
    ],
    completedTasks: [
      'Developed complete user registration form interface with responsive grid',
      'Applied email regex validation and mandatory field error banners',
      'Configured submit event interceptor with formatted payload display',
      'Styled form components using responsive CSS flexbox layout rules',
      'Verified form validation logic and pushed Tuesday updates to Git'
    ]
  },
  {
    id: 'day-w-3',
    dayNumber: 3,
    dayName: 'Wednesday',
    isHoliday: 0,
    holidayReason: '',
    topicsCovered: [
      'Component lifecycle mechanisms and useEffect hook execution phases',
      'Managing dependency arrays (mount-only vs reactive state dependencies)',
      'Asynchronous data fetching from REST API endpoints using async/await',
      'Managing loading indicators, error catch boundaries, and empty state views',
      'Cleanup functions in useEffect to unmount timers and event listeners'
    ],
    assignedTasks: [
      'Integrated live REST API endpoint for retrieving dynamic records list',
      'Added animated loading skeleton loader during asynchronous fetch requests',
      'Implemented network error catch block with user-friendly retry button',
      'Built instant search filter to filter retrieved records in real-time',
      'Documented API response interface and reviewed data flow with mentor'
    ],
    completedReact: [
      'Understood useEffect lifecycle phases for initial mount, update, and unmount',
      'Mastered dependency array controls to prevent unnecessary re-fetching',
      'Handled asynchronous API communication using modern async/await syntax',
      'Structured three-state data fetching pattern: loading, success, and error',
      'Implemented cleanup functions to safely cancel active subscriptions and timers'
    ],
    completedTasks: [
      'Connected React frontend to REST API endpoint for live records retrieval',
      'Designed animated skeleton placeholder during network loading latency',
      'Added error boundary and alert banners for server downtime recovery',
      'Created real-time search input that filters table rows instantaneously',
      'Documented API schema and pushed Wednesday code updates to team branch'
    ]
  },
  {
    id: 'day-w-4',
    dayNumber: 4,
    dayName: 'Thursday',
    isHoliday: 0,
    holidayReason: '',
    topicsCovered: [
      'Performance optimization with useMemo hook for expensive array calculations',
      'useCallback hook to preserve function references across component renders',
      'useRef hook for direct DOM access, input focus, and mutable state storage',
      'React Context API setup (createContext, Provider) to eliminate props drilling',
      'Architecting custom React hooks to isolate reusable business logic'
    ],
    assignedTasks: [
      'Implemented multi-theme switcher (Light/Dark mode) powered by React Context API',
      'Created custom useLocalStorage hook to persist active user theme preferences',
      'Applied useMemo to optimize heavy search filtering across 500+ mock records',
      'Used useRef to auto-focus primary input field on component load',
      'Staged clean Thursday commits and reviewed architecture with senior lead'
    ],
    completedReact: [
      'Applied useMemo hook to avoid recalculating filtered datasets on unrelated renders',
      'Preserved handler function references across renders using useCallback',
      'Accessed underlying DOM elements and stored mutable instances with useRef',
      'Established global application state with React Context API and Providers',
      'Engineered custom reusable hooks for persistent browser localStorage syncing'
    ],
    completedTasks: [
      'Integrated global ThemeContext supporting seamless Light and Dark mode toggling',
      'Persisted user preferences across browser sessions with custom storage hook',
      'Optimized table search performance eliminating redundant component re-renders',
      'Implemented auto-focus accessibility feature on search inputs using useRef',
      'Verified performance metrics and synchronized Thursday branch updates'
    ]
  },
  {
    id: 'day-w-5',
    dayNumber: 5,
    dayName: 'Friday',
    isHoliday: 0,
    holidayReason: '',
    topicsCovered: [
      'React Router DOM v6 multi-page navigation architecture (BrowserRouter, Routes, Route)',
      'Configuring dynamic route parameters (:id) and accessing them via useParams hook',
      'Programmatic navigation using useNavigate hook and active link highlighting with NavLink',
      'Nested routing patterns and Outlet rendering for shared dashboard shell layouts',
      'Production Vite build optimization, asset chunking, and deployment verification'
    ],
    assignedTasks: [
      'Constructed complete multi-page web application featuring 4 distinct client routes',
      'Configured dynamic detail views for user profiles using route parameter IDs',
      'Built protected route component wrapper verifying user authentication state',
      'Implemented 404 Not Found fallback view with one-click return home action',
      'Generated production build with Vite and verified clean bundle outputs for review'
    ],
    completedReact: [
      'Architected client-side routing hierarchy with React Router DOM v6',
      'Extracted dynamic route parameters cleanly using useParams hook for detail pages',
      'Programmed conditional user redirection flows using useNavigate hook',
      'Organized nested routes with shared layout headers via Outlet component',
      'Optimized asset bundling and minification during production compilation'
    ],
    completedTasks: [
      'Developed 4-page application interface (Dashboard, Reports, Settings, Profile)',
      'Connected dynamic profile view rendering specific details based on URL parameters',
      'Implemented route protection guard redirecting unauthenticated users to login',
      'Designed custom 404 error page with navigation shortcuts back to main screen',
      'Ran production build, tested cross-browser compatibility, and staged final code'
    ]
  }
];

export function detectTopicCategory(topics = [], defaultName = 'Topics Covered') {
  const combined = (Array.isArray(topics) ? topics.join(' ') : String(topics || '')).toLowerCase();
  if (combined.includes('javascript') || combined.includes('js ') || combined.includes('es6') || combined.includes('closure') || combined.includes('scope') || combined.includes('variable') || combined.includes('hoisting') || combined.includes('operator') || combined.includes('dom') || combined.includes('event loop') || combined.includes('callback') || combined.includes('promise')) return 'JavaScript';
  if (combined.includes('react') || combined.includes('jsx') || combined.includes('hook') || combined.includes('redux') || combined.includes('router') || combined.includes('usestate') || combined.includes('useeffect')) return 'React';
  if (combined.includes('node') || combined.includes('express') || combined.includes('mongodb') || combined.includes('backend')) return 'Node.js';
  if (combined.includes('html') || combined.includes('css') || combined.includes('flexbox') || combined.includes('tailwind')) return 'HTML/CSS';
  if (combined.includes('python') || combined.includes('django') || combined.includes('flask')) return 'Python';
  if (combined.includes('angular')) return 'Angular';
  if (combined.includes('vue')) return 'Vue';
  return defaultName;
}

export function synthesizeClientCompletedPoints(plannedPoints = [], type = 'topics', categoryName = 'General') {
  const list = Array.isArray(plannedPoints) ? plannedPoints.map(p => String(p).trim()).filter(Boolean) : [];
  const cat = categoryName !== 'General' ? categoryName : detectTopicCategory(list);
  
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

  for (let i = 0; i < Math.min(list.length, 5); i++) {
    const p = list[i];
    const prefix = prefixes[i % prefixes.length];
    completed.push(simplifyToAction(p, prefix));
  }

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

  return completed.slice(0, 5).map(c => c.charAt(0).toUpperCase() + c.slice(1));
}

export function getClientTodaySchedule(dayNumber = 5, customDaysList = null) {
  let days = customDaysList;
  if (!days || !Array.isArray(days) || days.length === 0) {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('mailcraft_weekly_schedule') : null;
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          days = parsed;
        }
      }
    } catch (e) {}
  }
  if (!days || !Array.isArray(days) || days.length === 0) {
    days = defaultWeeklyDays;
  }

  const currentDay = days.find(d => d.dayNumber === dayNumber) || days[Math.min(dayNumber - 1, days.length - 1)] || days[0];
  const nextDay = days.find(d => d.dayNumber === dayNumber + 1);

  const plannedTodayTopics = currentDay.topicsCovered || [];
  const plannedTodayTasks = currentDay.assignedTasks || [];
  const topicCategory = currentDay.topicCategory || detectTopicCategory(plannedTodayTopics);

  const completedTodayTopics = currentDay.completedReact && currentDay.completedReact.length === 5
    ? currentDay.completedReact
    : synthesizeClientCompletedPoints(plannedTodayTopics, 'topics', topicCategory);

  const completedTodayTasks = currentDay.completedTasks && currentDay.completedTasks.length === 5
    ? currentDay.completedTasks
    : synthesizeClientCompletedPoints(plannedTodayTasks, 'tasks', topicCategory);

  const isNextDayNA = dayNumber >= days.length || !nextDay || !nextDay.topicsCovered || nextDay.topicsCovered.length === 0;
  const nextDayTopics = nextDay ? (nextDay.topicsCovered || []) : [];
  const nextDayTasks = nextDay ? (nextDay.assignedTasks || []) : [];
  const nextDayTopicCategory = nextDay ? (nextDay.topicCategory || detectTopicCategory(nextDayTopics) || topicCategory) : topicCategory;

  return {
    technology: 'Web Development',
    activeDayNumber: dayNumber,
    activeDayName: currentDay.dayName || `Day ${dayNumber}`,
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
    plannedNextDay: nextDay ? {
      isNA: isNextDayNA,
      nextDayName: nextDay.dayName,
      topicCategory: nextDayTopicCategory,
      topics: nextDayTopics,
      tasks: nextDayTasks,
      react: nextDayTopics
    } : {
      isNA: true,
      nextDayName: 'Next Week',
      topicCategory,
      topics: [],
      tasks: [],
      react: []
    },
    challenges: 'N/A'
  };
}

export function generateClientHtmlTable(data) {
  const formatList = (items) => {
    if (!Array.isArray(items) || items.length === 0) return 'N/A';
    return `<ul style="margin: 4px 0 0 18px; padding: 0; list-style-type: disc;">${items.map(it => `<li style="margin-bottom: 4px;">${it}</li>`).join('')}</ul>`;
  };

  const pendingDisplay = '<div style="text-align: center; font-weight: 500;">N/A</div>';
  const challengesDisplay = '<div style="text-align: center; font-weight: 500;">N/A</div>';

  const plannedTodayTopics = data.plannedToday?.topics || data.plannedToday?.react || [];
  const plannedTodayTasks = data.plannedToday?.tasks || [];
  const topicTitle = data.topicCategory || detectTopicCategory(plannedTodayTopics) || 'Topics Covered';

  const completedTodayTopics = data.completedToday?.topics || data.completedToday?.react || [];
  const completedTodayTasks = data.completedToday?.tasks || [];

  const isNextDayNA = data.plannedNextDay?.isNA || (!data.plannedNextDay?.topics?.length && !data.plannedNextDay?.react?.length);
  const nextDayTopics = data.plannedNextDay?.topics || data.plannedNextDay?.react || [];
  const nextDayTasks = data.plannedNextDay?.tasks || [];
  const nextDayTopicTitle = data.plannedNextDay?.topicCategory || detectTopicCategory(nextDayTopics) || topicTitle;

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

export function generateClientTextFormat(data) {
  const renderBullets = (arr) => Array.isArray(arr) && arr.length > 0 ? arr.map(i => `  • ${i}`).join('\n') : '  • N/A';
  const plannedTodayTopics = data.plannedToday?.topics || data.plannedToday?.react || [];
  const plannedTodayTasks = data.plannedToday?.tasks || [];
  const topicTitle = data.topicCategory || detectTopicCategory(plannedTodayTopics) || 'Topics Covered';

  const completedTodayTopics = data.completedToday?.topics || data.completedToday?.react || [];
  const completedTodayTasks = data.completedToday?.tasks || [];

  const isNextDayNA = data.plannedNextDay?.isNA || (!data.plannedNextDay?.topics?.length && !data.plannedNextDay?.react?.length);
  const nextDayTopics = data.plannedNextDay?.topics || data.plannedNextDay?.react || [];
  const nextDayTasks = data.plannedNextDay?.tasks || [];
  const nextDayTopicTitle = data.plannedNextDay?.topicCategory || detectTopicCategory(nextDayTopics) || topicTitle;

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
  N/A
+---------------------------------------------------------------------------------------------------+
| Planned Tasks (Next Day):                                                                         |
${nextDayText}
+---------------------------------------------------------------------------------------------------+
| Challenges / Blockers if any:                                                                     |
  N/A
+---------------------------------------------------------------------------------------------------+`.trim();
}

export function generateClientDraft(promptText, tone = 'professional', activeDay = 5, customDays = null) {
  const lower = (promptText || '').toLowerCase();
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();

  const isPastedCurriculum = (lower.includes('topics covered') || lower.includes('topics') || lower.includes('syllabus') || lower.includes('day 1') || lower.includes('day 2')) && (lower.includes('assigned') || lower.includes('task') || lower.includes('assignment'));
  const isEOD = isPastedCurriculum || lower.includes('eod') || lower.includes('evening') || lower.includes('task summary') || lower.includes('daily') || lower.includes('status report') || lower.includes('task') || lower.includes('react') || lower.includes('javascript');
  const isLeave = !isPastedCurriculum && (lower.includes('leave') || lower.includes('vacation') || lower.includes('sick') || lower.includes('casual') || lower.includes('pto') || lower.includes('off'));

  if (isPastedCurriculum) {
    const parsedDays = parseWeeklyEmailClient(promptText);
    const schedule = getClientTodaySchedule(activeDay, parsedDays);
    const subject = `Daily Status Report [${dd}-${mm}-${yyyy}]`;
    const htmlBody = generateClientHtmlTable(schedule);
    const body = generateClientTextFormat(schedule);

    return {
      success: true,
      draft: {
        subject,
        body,
        htmlBody,
        isEODTable: true,
        scheduleData: schedule,
        suggestedTo: [defaultContacts[0], defaultContacts[1]],
        suggestedCc: [defaultContacts[3], defaultContacts[4]],
        detectedTone: tone
      }
    };
  }

  if (isEOD) {
    const schedule = getClientTodaySchedule(activeDay, customDays);
    const subject = `Daily Status Report [${dd}-${mm}-${yyyy}]`;
    const htmlBody = generateClientHtmlTable(schedule);
    const body = generateClientTextFormat(schedule);

    return {
      success: true,
      draft: {
        subject,
        body,
        htmlBody,
        isEODTable: true,
        scheduleData: schedule,
        suggestedTo: [defaultContacts[0], defaultContacts[1]],
        suggestedCc: [defaultContacts[3], defaultContacts[4]],
        detectedTone: tone
      }
    };
  }

  if (isLeave) {
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomDD = String(tomorrow.getDate()).padStart(2, '0');
    const tomMM = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const tomYYYY = tomorrow.getFullYear();
    const tomorrowDateStr = `${tomDD}-${tomMM}-${tomYYYY}`;

    let reason = 'personal issue';
    if (lower.includes('fever') || lower.includes('cold') || lower.includes('headache') || lower.includes('sick') || lower.includes('health') || lower.includes('medical') || lower.includes('doctor')) {
      reason = lower.includes('fever') ? 'fever' : 'health issue';
    } else if (lower.includes('family') || lower.includes('function') || lower.includes('marriage')) {
      reason = 'family commitments';
    } else if (lower.includes('urgent')) {
      reason = 'urgent personal work';
    } else if (lower.includes('personal')) {
      reason = 'personal matters';
    } else {
      const reasonMatch = promptText.match(/(?:due to|because of|regarding|for)\s+([a-zA-Z\s]+?)(?:\.|$|,|please)/i);
      if (reasonMatch && reasonMatch[1] && reasonMatch[1].trim().length > 2 && !reasonMatch[1].toLowerCase().includes('tomorrow') && !reasonMatch[1].toLowerCase().includes('leave')) {
        reason = reasonMatch[1].trim();
      }
    }

    const isTomorrow = lower.includes('tomorrow') || !promptText.match(/\d+\s*(?:days?|weeks?)/i);
    let durationPhrase = 'for tomorrow';
    let grantPhrase = 'Please grant me leave for one day.';

    const durationMatch = promptText.match(/(\d+)\s*(?:business days?|days?)/i);
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
    const dateTag = isTomorrow ? tomorrowDateStr : `${dd}-${mm}-${yyyy}`;

    const subject = `Leave Request [${dateTag}] - ${defaultUser.name}`;
    const body = `Hi Nafisa Khanam Pathan mam,

Good morning,

I am writing to request leave ${timeFrame} due to ${reason}.

${grantPhrase}

Thank you.`;

    return {
      success: true,
      draft: {
        subject,
        body,
        htmlBody: null,
        isEODTable: false,
        scheduleData: null,
        suggestedTo: [defaultContacts[1], defaultContacts[2]],
        suggestedCc: [defaultContacts[3]],
        detectedTone: tone
      }
    };
  }

  // Generic / Project / QA Draft
  const isProj = lower.includes('project') || lower.includes('recommendation') || lower.includes('proposal');
  const subject = isProj 
    ? `[Project Recommendation] Architectural Proposal & Delivery Plan - Q4`
    : `Sprint QA Sign-Off & Candidate Release - ${dd}-${mm}-${yyyy}`;

  const body = isProj
    ? `Hi Team,\n\nFollowing up on our recent sprint reviews, here is my project recommendation:\n\n• Objective: Upgrade system architecture and optimize key delivery pipelines.\n• Scope: Core service optimizations, staging regression tests, and latency reduction.\n• Next Steps: Open for review and alignment on execution timelines.\n\nBest regards,\n${defaultUser.name}`
    : `Hi QA Team,\n\nPlease find the sprint staging build deployed for final regression sign-off.\n\n• Scope: Core bug fixes and milestone deliverables.\n• Sign-off requested by noon tomorrow.\n\nThanks,\n${defaultUser.name}`;

  return {
    success: true,
    draft: {
      subject,
      body,
      htmlBody: null,
      isEODTable: false,
      scheduleData: null,
      suggestedTo: isProj ? [defaultContacts[5], defaultContacts[6]] : [defaultContacts[4], defaultContacts[6]],
      suggestedCc: [defaultContacts[3]],
      detectedTone: tone
    }
  };
}

export function parseWeeklyEmailClient(rawText) {
  const text = (rawText || '').replace(/\r\n/g, '\n');
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
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

      const isHoliday = /(holiday|closed|off\s*day|festival|leave)/i.test(curr.subHeader) || /(holiday|closed|off\s*day|festival)/i.test(blockText.substring(0, 80));
      let holidayReason = '';
      if (isHoliday) {
        const reasonMatch = curr.subHeader.match(/(?:holiday|festival|off)[\s\-:]*([^\n\(\)]+)/i);
        holidayReason = reasonMatch ? reasonMatch[1].trim() : 'Public / Company Holiday';
      }

      const rawLines = blockText.split('\n').map(l => l.trim()).filter(Boolean);
      const topics = [];
      const tasks = [];
      let currentMode = 'topics';

      for (const line of rawLines) {
        const unbolded = line.replace(/^\*\*|\*\*$/g, '').trim();
        const lower = unbolded.toLowerCase();

        // Skip the Day header line itself
        if (/^(?:day\s*[-–]?\s*\d+|monday|tuesday|wednesday|thursday|friday)[\s:\-\(]*[^\n]*$/i.test(unbolded) &&
            !lower.includes('topic') && !lower.includes('task')) {
          continue;
        }

        // Stop at Mini Assignment / Mini Assessment / Final Practical Assignment
        const cleanedForHeader = unbolded.replace(/^[#*\-•\s]+/, '').trim();
        const isMini = /^(?:\d+[\.\)]\s*)?(?:mini\s*[-–]?\s*(?:assignment|assessment|task|project|quiz)s?|assessment\s*questions?|assessments?|quiz(?:zes)?|evaluation|self\s*assessment|final\s*practical\s*assignment|recommended\s*project|project\s*requirements)\b/i.test(cleanedForHeader);
        if (isMini) break;

        // Header toggle (strictly anchor end to prevent mid-text matches like "Assignment Operators")
        if (/^(?:\d+[\.\)]\s*)?(?:topics?\s*covered|react\s*topics?|javascript\s*topics?|react|javascript|topics?|syllabus)\s*[:\-]?\s*$/i.test(unbolded)) {
          currentMode = 'topics';
          continue;
        }
        if (/^(?:\d+[\.\)]\s*)?(?:assigned?\s*tasks?|tasks?\s*assigned|tasks?|(?:daily\s*|weekly\s*)?assignments?)\s*[:\-]?\s*$/i.test(unbolded)) {
          currentMode = 'tasks';
          continue;
        }

        // Inline combined check (e.g. "Topics Covered: Intro to React")
        const inlineTopicMatch = unbolded.match(/^(?:(?:\d+[\.\)]\s*)?(?:topics?\s*covered|react\s*topics?)\s*[:\-])\s*(.+)$/i);
        if (inlineTopicMatch) {
          currentMode = 'topics';
          const rest = inlineTopicMatch[1].trim();
          if (rest && rest.length > 2) topics.push(rest);
          continue;
        }

        const inlineTaskMatch = unbolded.match(/^(?:(?:\d+[\.\)]\s*)?(?:assigned?\s*tasks?|tasks?\s*assigned)\s*[:\-])\s*(.+)$/i);
        if (inlineTaskMatch) {
          currentMode = 'tasks';
          const rest = inlineTaskMatch[1].trim();
          if (rest && rest.length > 2) tasks.push(rest);
          continue;
        }

        const cleanLine = unbolded.replace(/^[\d+.)\-•*#\s]+/, '').trim();
        if (cleanLine.length < 2) continue;

        if (currentMode === 'topics') topics.push(cleanLine);
        else tasks.push(cleanLine);
      }

      const topicCat = detectTopicCategory(topics);
      const compTopics = synthesizeClientCompletedPoints(topics, 'topics', topicCat);
      const compTasks = synthesizeClientCompletedPoints(tasks, 'tasks', topicCat);

      parsedDays.push({
        id: `day-pasted-${dayNumber}`,
        dayNumber,
        dayName,
        topicCategory: topicCat,
        isHoliday: isHoliday ? 1 : 0,
        holidayReason,
        topicsCovered: topics.length > 0 ? topics : [`${topicCat} Module ${dayNumber}`],
        assignedTasks: tasks.length > 0 ? tasks : [`Assigned Practical Task ${dayNumber}`],
        completedReact: compTopics,
        completedTasks: compTasks
      });
    }
  } else {
    // If no Day headers, check if single day's topics & tasks pasted
    const rawLines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const topics = [];
    const tasks = [];
    let currentMode = 'topics';

    for (const line of rawLines) {
      const unbolded = line.replace(/^\*\*|\*\*$/g, '').trim();
      const cleanedForHeader = unbolded.replace(/^[#*\-•\s]+/, '').trim();
      const isMini = /^(?:\d+[\.\)]\s*)?(?:mini\s*[-–]?\s*(?:assignment|assessment|task|project|quiz)s?|assessment\s*questions?|assessments?|quiz(?:zes)?|evaluation|self\s*assessment|final\s*practical\s*assignment|recommended\s*project|project\s*requirements)\b/i.test(cleanedForHeader);
      if (isMini) break;

      if (/^(?:\d+[\.\)]\s*)?(?:topics?\s*covered|react\s*topics?|javascript\s*topics?|react|javascript|topics?|syllabus)\s*[:\-]?\s*$/i.test(unbolded)) {
        currentMode = 'topics';
        continue;
      }
      if (/^(?:\d+[\.\)]\s*)?(?:assigned?\s*tasks?|tasks?\s*assigned|tasks?|(?:daily\s*|weekly\s*)?assignments?)\s*[:\-]?\s*$/i.test(unbolded)) {
        currentMode = 'tasks';
        continue;
      }

      const cleanLine = unbolded.replace(/^[\d+.)\-•*#\s]+/, '').trim();
      if (cleanLine.length < 2) continue;

      if (currentMode === 'topics') topics.push(cleanLine);
      else tasks.push(cleanLine);
    }

    if (topics.length > 0 || tasks.length > 0) {
      const topicCat = detectTopicCategory(topics);
      parsedDays.push({
        id: 'day-pasted-1',
        dayNumber: 1,
        dayName: 'Monday',
        topicCategory: topicCat,
        isHoliday: 0,
        holidayReason: '',
        topicsCovered: topics.length > 0 ? topics : [`${topicCat} Module 1`],
        assignedTasks: tasks.length > 0 ? tasks : ['Assigned Practical Tasks'],
        completedReact: synthesizeClientCompletedPoints(topics, 'topics', topicCat),
        completedTasks: synthesizeClientCompletedPoints(tasks, 'tasks', topicCat)
      });
    }
  }

  // Always merge parsed days into a complete 5-day week so all days 1-5 remain accessible
  const finalDays = [];
  for (let d = 1; d <= 5; d++) {
    const match = parsedDays.find(p => p.dayNumber === d);
    if (match) {
      finalDays.push(match);
    } else {
      const defMatch = defaultWeeklyDays.find(def => def.dayNumber === d);
      finalDays.push(defMatch || {
        id: `day-default-${d}`,
        dayNumber: d,
        dayName: dayNames[d - 1] || `Day ${d}`,
        isHoliday: 0,
        holidayReason: '',
        topicCategory: 'Web Development',
        topicsCovered: [`Web Development Module ${d}`],
        assignedTasks: [`Practical Milestone ${d}`],
        completedReact: [`Understood and applied module ${d}`],
        completedTasks: [`Developed milestone ${d}`]
      });
    }
  }

  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mailcraft_weekly_schedule', JSON.stringify(finalDays));
    }
  } catch (e) {}

  return finalDays;
}

