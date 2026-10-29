import { TIMELINE_MILESTONES, FUNCTION_ADDON_CONFIG } from '../../config/eventConfig.js';

/**
 * Standard phase tasks by event type and milestone
 */
const MILESTONE_TASKS = {
  wedding: {
    24: [
      'Finalize total budget and draft initial guest list',
      'Shortlist and book primary ceremony / reception venue',
      'Start researching caterers and wedding photographers',
    ],
    16: [
      'Confirm caterer and lock tentative menu choices',
      'Book photographer and videographer team',
      'Select and book decorator / event stylist',
    ],
    12: [
      'Design digital and physical wedding invitations',
      'Book DJ / sound equipment and entertainment artists',
      'Shortlist bridal and family attire designers',
    ],
    8: [
      'Send formal save-the-date / invitations to outstation guests',
      'Book hair, makeup, and mehndi artists',
      'Reserve guest accommodation and block hotel rooms',
    ],
    4: [
      'Send digital RSVP reminders and track confirmations',
      'Schedule catering tasting session and finalize menu',
      'Review stage backdrop, lighting, and floral decor plan',
    ],
    2: [
      'Finalize confirmed guest count with catering team',
      'Create day-of run of show / detailed schedule',
      'Confirm transportation and guest airport/station pickups',
    ],
    1: [
      'Distribute timeline and contact sheet to core family and vendors',
      'Pack wedding emergency kit (safety pins, medicines, chargers)',
      'Prepare vendor final payments and gratuities in sealed envelopes',
    ],
    0.5: [
      'Venue walkthrough and sound/mic check',
      'Confirm delivery times for garlands, flowers, and favors',
      'Conduct final rehearsal for entrance and key ceremonies',
    ],
    0: [
      'Coordinate vendor arrivals and morning decor setup',
      'Ensure catering staff ready with welcome refreshments',
      'Celebrate your wedding day and cherish every moment!',
    ],
    '-0.5': [
      'Settle remaining vendor balances',
      'Collect lost-and-found items and personal decor pieces from venue',
      'Send thank-you messages to guests and request photo gallery preview',
    ],
  },
  birthday: {
    8: [
      'Choose party theme and set total budget',
      'Shortlist and book party venue / banquet hall',
    ],
    4: [
      'Send party invitations and track RSVPs',
      'Order customized birthday cake and dessert bar',
      'Book DJ or entertainer (magician, face painter, host)',
    ],
    2: [
      'Purchase theme decor, banners, and return gifts / party favors',
      'Confirm catering headcount and finger food / buffet menu',
    ],
    1: [
      'Confirm cake delivery timing and party playlist',
      'Assemble favor bags and prepare party games prizes',
    ],
    0: [
      'Set up party backdrop, balloons, and cake table',
      'Welcome guests, cut cake, and enjoy the celebration!',
    ],
  },
  community: {
    12: [
      'Form organizing committee and assign team leads',
      'Secure venue permissions, licenses, and sound permits',
    ],
    8: [
      'Launch event registration / ticket sales and promotional campaign',
      'Book stage, sound, lighting, and audiovisual vendors',
    ],
    4: [
      'Confirm vendor contracts (catering, security, sanitization)',
      'Recruit and train event day volunteers',
    ],
    2: [
      'Send reminder broadcast to registered attendees',
      'Finalize crowd management, parking, and first-aid plan',
    ],
    1: [
      'Conduct full equipment soundcheck and technical rehearsal',
      'Distribute volunteer shifts and emergency protocol sheet',
    ],
    0: [
      'Oversee attendee entry, registrations, and stage proceedings',
      'Coordinate program flow and ensure attendee safety',
    ],
    '-0.5': [
      'Oversee venue tear-down and post-event cleanup',
      'Send appreciation notes to sponsors, performers, and volunteers',
    ],
  },
};

/**
 * Calculates date string offset by days from a target date.
 */
function offsetDateString(baseDateStr, daysOffset) {
  const [year, month, day] = baseDateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + daysOffset);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Calculates days remaining between two YYYY-MM-DD date strings.
 */
export function getDaysRemaining(eventDateStr, currentDateStr) {
  const [ey, em, ed] = eventDateStr.split('-').map(Number);
  const [cy, cm, cd] = currentDateStr.split('-').map(Number);
  const eventDate = new Date(ey, em - 1, ed);
  const currentDate = new Date(cy, cm - 1, cd);
  const diffMs = eventDate.getTime() - currentDate.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Generates an adaptive timeline based on the event date and days remaining.
 * Drops past milestones, carries forward critical tasks into earliest milestone,
 * and adds wedding add-on ceremonies (Haldi, Mehndi, Sangeet).
 *
 * @param {Object} params
 * @param {string} params.eventType - 'wedding' | 'birthday' | 'community'
 * @param {string} params.eventDate - YYYY-MM-DD
 * @param {string} params.currentDate - YYYY-MM-DD
 * @param {string[]} [params.functionAddons] - Optional wedding add-ons
 * @returns {{ timeline: Array<{ label: string, dueDate: string, relativeLabel: string, tasks: string[] }>, isCompressed: boolean }}
 */
export function generateTimeline({
  eventType = 'wedding',
  eventDate,
  currentDate,
  functionAddons = [],
}) {
  const daysRemaining = getDaysRemaining(eventDate, currentDate);
  const isCompressed = daysRemaining < 30;

  const milestonesConfig = TIMELINE_MILESTONES[eventType] || TIMELINE_MILESTONES.wedding;
  const taskMap = MILESTONE_TASKS[eventType] || MILESTONE_TASKS.wedding;

  const timeline = [];
  const carriedForwardTasks = [];

  for (const milestone of milestonesConfig) {
    const daysOffset = Math.round(milestone.weeksBefore * 7);
    const dueDate = offsetDateString(eventDate, -daysOffset);
    const tasks = [...(taskMap[milestone.weeksBefore] || [])];

    // If milestone is already in the past
    if (dueDate < currentDate && milestone.weeksBefore > 0) {
      // Collect critical tasks from past milestones that must still be completed
      for (const task of tasks) {
        if (/book|confirm|finalize|reserve/i.test(task)) {
          carriedForwardTasks.push(`[Immediate] ${task}`);
        }
      }
      continue; // Drop past milestone from timeline
    }

    // Relative label text
    let relativeLabel = '';
    if (milestone.weeksBefore > 0) {
      relativeLabel = `${milestone.weeksBefore} week${milestone.weeksBefore > 1 ? 's' : ''} before`;
    } else if (milestone.weeksBefore === 0) {
      relativeLabel = 'Day of the event';
    } else {
      relativeLabel = 'Post-event wrap-up';
    }

    timeline.push({
      label: milestone.label,
      dueDate,
      relativeLabel,
      tasks,
    });
  }

  // Prepend carried forward critical tasks to the earliest upcoming milestone
  if (carriedForwardTasks.length > 0 && timeline.length > 0) {
    timeline[0].tasks = [...carriedForwardTasks, ...timeline[0].tasks];
  }

  // Inject wedding function add-ons (Haldi, Mehndi, Sangeet) into timeline
  if (eventType === 'wedding' && Array.isArray(functionAddons)) {
    for (const addon of functionAddons) {
      const addonConfig = FUNCTION_ADDON_CONFIG[addon];
      if (!addonConfig) {
        continue;
      }

      const addonDueDate = offsetDateString(eventDate, addonConfig.daysOffsetFromMain);
      const daysFromMain = Math.abs(addonConfig.daysOffsetFromMain);

      timeline.push({
        label: `${addonConfig.label} Setup & Rituals`,
        dueDate: addonDueDate,
        relativeLabel: `${daysFromMain} day${daysFromMain > 1 ? 's' : ''} before wedding`,
        tasks: [...addonConfig.defaultTasks],
      });
    }

    // Sort timeline by dueDate
    timeline.sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0));
  }

  return {
    timeline,
    isCompressed,
  };
}
