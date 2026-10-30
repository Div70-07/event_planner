import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  escapeIcsText,
  formatIcsDate,
  generateIcsCalendar,
  generatePlanSummaryText,
  buildVendorWhatsappLink,
  copyPlanToClipboard,
} from '../utils/exportUtils.js';

describe('Export Utilities (exportUtils.js)', () => {
  const mockPlan = {
    budget: [
      { category: 'Venue', amount: 300000, percent: 30, rationale: 'Heritage stay' },
      { category: 'Catering', amount: 250000, percent: 25, rationale: 'Buffet thali' },
    ],
    timeline: [
      {
        dueDate: '2027-02-14',
        label: 'Wedding Ceremony',
        relativeLabel: 'Day of Celebration',
        tasks: ['Baraat entry', 'Pheras at mandap'],
      },
    ],
    vendors: [
      {
        type: 'Photography',
        budgetShare: 15,
        checklist: ['Candid shots', 'Drone video'],
      },
    ],
    warnings: ['Book haveli 3 months in advance'],
    tradeoffs: [
      { fromCategory: 'Decor', toCategory: 'Catering', amount: 20000, reason: 'Food priority' },
    ],
    budgetHealth: { status: 'comfortable', message: 'Healthy budget for Jaipur' },
    ai: {
      summary: 'Royal Rajputana celebration',
      themeIdeas: ['Crimson & Gold'],
      personalisedTips: ['Schedule sunset photography'],
    },
  };

  const mockMeta = {
    eventName: 'Royal Heritage Wedding',
    eventType: 'wedding',
    city: 'Jaipur',
    eventDate: '2027-02-14',
    guestCount: 250,
  };

  describe('escapeIcsText', () => {
    it('escapes special characters (backslash, semicolon, comma, newline)', () => {
      const input = 'Hello, World; this is a \\ test\nNew line';
      const escaped = escapeIcsText(input);
      expect(escaped).toBe('Hello\\, World\\; this is a \\\\ test\\nNew line');
    });
  });

  describe('formatIcsDate', () => {
    it('formats YYYY-MM-DD into YYYYMMDD format', () => {
      expect(formatIcsDate('2027-02-14')).toBe('20270214');
    });
  });

  describe('generateIcsCalendar', () => {
    it('produces valid RFC 5545 VCALENDAR and VEVENT string', () => {
      const ics = generateIcsCalendar(mockPlan, mockMeta);

      expect(ics).toContain('BEGIN:VCALENDAR');
      expect(ics).toContain('VERSION:2.0');
      expect(ics).toContain('BEGIN:VEVENT');
      expect(ics).toContain('DTSTART;VALUE=DATE:20270214');
      expect(ics).toContain('SUMMARY:Royal Heritage Wedding: Wedding Ceremony');
      expect(ics).toContain('LOCATION:Jaipur');
      expect(ics).toContain('END:VEVENT');
      expect(ics).toContain('END:VCALENDAR');
    });
  });

  describe('generatePlanSummaryText', () => {
    it('generates structured human-readable text including all major sections', () => {
      const text = generatePlanSummaryText(mockPlan, mockMeta);

      expect(text).toContain('CELEBRATION EVENT PLAN: ROYAL HERITAGE WEDDING');
      expect(text).toContain('City: Jaipur');
      expect(text).toContain('Guests: 250');
      expect(text).toContain('--- BUDGET ALLOCATION ---');
      expect(text).toContain('• Venue:');
      expect(text).toContain('--- PLANNING TIMELINE ---');
      expect(text).toContain('[2027-02-14] Wedding Ceremony');
      expect(text).toContain('--- VENDOR CHECKLISTS ---');
      expect(text).toContain('--- ALERTS & ADVISORIES ---');
      expect(text).toContain('--- AI CURATED HIGHLIGHTS ---');
    });
  });

  describe('buildVendorWhatsappLink', () => {
    it('encodes city, date, guests, and vendor category into wa.me URL', () => {
      const url = buildVendorWhatsappLink(mockPlan.vendors[0], mockMeta);

      expect(url.startsWith('https://wa.me/?text=')).toBe(true);
      const decoded = decodeURIComponent(url.replace('https://wa.me/?text=', ''));
      expect(decoded).toContain('Photography');
      expect(decoded).toContain('in Jaipur');
      expect(decoded).toContain('on 2027-02-14');
      expect(decoded).toContain('250 guests');
      expect(decoded).toContain('15%');
    });

    it('does not include private user notes in whatsapp link', () => {
      const metaWithSecret = { ...mockMeta, notes: 'Secret family budget details' };
      const url = buildVendorWhatsappLink(mockPlan.vendors[0], metaWithSecret);
      expect(url).not.toContain('Secret');
    });
  });

  describe('copyPlanToClipboard', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('copies to navigator.clipboard if available', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });

      const res = await copyPlanToClipboard(mockPlan, mockMeta);
      expect(res).toBe(true);
      expect(writeText).toHaveBeenCalled();
    });
  });
});
