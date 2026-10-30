/**
 * Utilities for exporting event plans:
 * 1. Formatted plain text export with clipboard fallback
 * 2. iCalendar (.ics) RFC 5545 generation without external dependencies
 * 3. WhatsApp pre-filled inquiry generator
 */

function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Escapes characters for iCalendar text values (RFC 5545).
 * Backslashes, newlines, commas, and semicolons must be escaped.
 */
export function escapeIcsText(text = '') {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * Formats a Date object or YYYY-MM-DD string into UTC / floating ICS date format: YYYYMMDD.
 */
export function formatIcsDate(dateStr) {
  if (!dateStr) {
    return '';
  }
  const clean = dateStr.split('T')[0].replace(/-/g, '');
  return clean;
}

/**
 * Generates an RFC 5545-compliant .ics string from timeline milestones.
 */
export function generateIcsCalendar(plan, eventMeta) {
  const eventName = eventMeta?.eventName || 'Celebration Event';
  const timeline = plan?.timeline || [];

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Celebration & Event Planner//IN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  timeline.forEach((milestone, idx) => {
    if (!milestone.dueDate) {
      return;
    }

    const dtStart = formatIcsDate(milestone.dueDate);
    // All-day event: DTEND is the next day
    const nextDate = new Date(milestone.dueDate + 'T00:00:00');
    nextDate.setDate(nextDate.getDate() + 1);
    const dtEnd = formatIcsDate(nextDate.toISOString().split('T')[0]);

    const summary = escapeIcsText(`${eventName}: ${milestone.label}`);
    const description = escapeIcsText(
      `Milestone: ${milestone.label} (${milestone.relativeLabel})\n\nTasks:\n- ${(milestone.tasks || []).join('\n- ')}`,
    );

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${Date.now()}-${idx}@eventplanner.local`);
    lines.push(`DTSTAMP:${dtStart}T090000Z`);
    lines.push(`DTSTART;VALUE=DATE:${dtStart}`);
    lines.push(`DTEND;VALUE=DATE:${dtEnd}`);
    lines.push(`SUMMARY:${summary}`);
    lines.push(`DESCRIPTION:${description}`);
    if (eventMeta?.city) {
      lines.push(`LOCATION:${escapeIcsText(eventMeta.city)}`);
    }
    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Triggers a browser download of the generated .ics file.
 */
export function downloadIcsFile(plan, eventMeta) {
  const icsContent = generateIcsCalendar(plan, eventMeta);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = (eventMeta?.eventName || 'event-plan')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  link.download = `${fileName}-timeline.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Builds a clean, human-readable plain text summary of the full plan.
 */
export function generatePlanSummaryText(plan, eventMeta) {
  const totalAmount = plan.budget.reduce((s, b) => s + b.amount, 0);

  const lines = [];
  lines.push('====================================================');
  lines.push(`CELEBRATION EVENT PLAN: ${(eventMeta?.eventName || 'My Celebration').toUpperCase()}`);
  lines.push('====================================================');
  lines.push(`Type: ${eventMeta?.eventType || 'Celebration'}`);
  lines.push(`City: ${eventMeta?.city || 'India'}`);
  lines.push(`Date: ${eventMeta?.eventDate || 'TBD'}`);
  lines.push(`Guests: ${eventMeta?.guestCount || 'N/A'}`);
  lines.push(`Total Budget: ${formatINR(totalAmount)}`);
  lines.push(`Budget Health: ${plan.budgetHealth?.status?.toUpperCase()} (${plan.budgetHealth?.message || ''})`);
  lines.push('');

  lines.push('--- BUDGET ALLOCATION ---');
  plan.budget.forEach((item) => {
    lines.push(`• ${item.category}: ${formatINR(item.amount)} (${item.percent}%)`);
    lines.push(`  Rationale: ${item.rationale}`);
  });
  lines.push('');

  if (plan.tradeoffs && plan.tradeoffs.length > 0) {
    lines.push('--- TRADE-OFF SUGGESTIONS ---');
    plan.tradeoffs.forEach((t) => {
      lines.push(`• Move from ${t.fromCategory} to ${t.toCategory} (${formatINR(t.amount)})`);
      lines.push(`  Reason: ${t.reason}`);
    });
    lines.push('');
  }

  lines.push('--- PLANNING TIMELINE ---');
  plan.timeline.forEach((m) => {
    lines.push(`[${m.dueDate}] ${m.label} (${m.relativeLabel})`);
    m.tasks.forEach((task) => lines.push(`  [ ] ${task}`));
  });
  lines.push('');

  lines.push('--- VENDOR CHECKLISTS ---');
  plan.vendors.forEach((v) => {
    lines.push(`[${v.type}] Share: ${v.budgetShare}%`);
    v.checklist.forEach((item) => lines.push(`  [ ] ${item}`));
  });
  lines.push('');

  if (plan.warnings && plan.warnings.length > 0) {
    lines.push('--- ALERTS & ADVISORIES ---');
    plan.warnings.forEach((w) => lines.push(`! ${w}`));
    lines.push('');
  }

  if (plan.ai?.summary) {
    lines.push('--- AI CURATED HIGHLIGHTS ---');
    lines.push(`Summary: ${plan.ai.summary}`);
    if (plan.ai.themeIdeas?.length > 0) {
      lines.push('Themes:');
      plan.ai.themeIdeas.forEach((t) => lines.push(`  • ${t}`));
    }
    if (plan.ai.personalisedTips?.length > 0) {
      lines.push('Tips:');
      plan.ai.personalisedTips.forEach((tip) => lines.push(`  • ${tip}`));
    }
  }

  lines.push('====================================================');
  lines.push('Generated with Celebration & Event Planner');
  lines.push('====================================================');

  return lines.join('\n');
}

/**
 * Copies the text to clipboard, falling back to a hidden textarea if navigator.clipboard is unavailable.
 */
export async function copyPlanToClipboard(plan, eventMeta) {
  const text = generatePlanSummaryText(plan, eventMeta);

  if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }

  // Fallback for older browsers or insecure contexts
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}

/**
 * Formats a WhatsApp inquiry link for a vendor without including private user notes.
 */
export function buildVendorWhatsappLink(vendor, eventMeta) {
  const vendorType = vendor.type || 'Services';
  const city = eventMeta?.city ? ` in ${eventMeta.city}` : '';
  const dateStr = eventMeta?.eventDate ? ` on ${eventMeta.eventDate}` : '';
  const guestStr = eventMeta?.guestCount ? ` for approx ${eventMeta.guestCount} guests` : '';
  const budgetShareStr = vendor.budgetShare > 0 ? ` (estimated budget allocation: ${vendor.budgetShare}%)` : '';

  const message = `Hello! I am planning an upcoming event${city}${dateStr}${guestStr} and would like to enquire about your ${vendorType} services${budgetShareStr}. Could you please share your availability and pricing packages? Thank you!`;

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
