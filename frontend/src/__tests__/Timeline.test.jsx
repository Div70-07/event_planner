import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import Timeline from '../components/Timeline.jsx';

const MOCK_TIMELINE = [
  {
    label: 'Initial Planning',
    dueDate: '2027-01-01',
    relativeLabel: '12 weeks before',
    tasks: ['Book venue', 'Shortlist caterers', 'Send save-the-dates'],
  },
  {
    label: 'Final Confirmations',
    dueDate: '2027-03-01',
    relativeLabel: '2 weeks before',
    tasks: ['Confirm guest list', 'Final payment to vendors'],
  },
];

const NO_PANIC = { enabled: false, bookToday: [], doThisWeek: [], canSkip: [] };
const WITH_PANIC = {
  enabled: true,
  bookToday: ['Book venue'],
  doThisWeek: ['Shortlist caterers'],
  canSkip: ['Send save-the-dates'],
};

describe('Timeline', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders all milestone labels', () => {
    render(<Timeline timeline={MOCK_TIMELINE} panicMode={NO_PANIC} isCompressed={false} />);
    expect(screen.getByText('Initial Planning')).toBeTruthy();
    expect(screen.getByText('Final Confirmations')).toBeTruthy();
  });

  it('renders tasks inside milestones', () => {
    render(<Timeline timeline={MOCK_TIMELINE} panicMode={NO_PANIC} isCompressed={false} />);
    expect(screen.getByLabelText('Book venue')).toBeTruthy();
    expect(screen.getByLabelText('Confirm guest list')).toBeTruthy();
  });

  it('shows compressed badge when isCompressed is true', () => {
    render(<Timeline timeline={MOCK_TIMELINE} panicMode={NO_PANIC} isCompressed={true} />);
    expect(screen.getByText(/Compressed/i)).toBeTruthy();
  });

  it('does not show compressed badge when false', () => {
    render(<Timeline timeline={MOCK_TIMELINE} panicMode={NO_PANIC} isCompressed={false} />);
    expect(screen.queryByText(/Compressed/i)).toBeNull();
  });

  it('shows panic mode banner when panic is enabled', () => {
    render(<Timeline timeline={MOCK_TIMELINE} panicMode={WITH_PANIC} isCompressed={false} />);
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText(/Panic Mode Active/i)).toBeTruthy();
  });

  it('shows bookToday items in panic banner', () => {
    render(<Timeline timeline={MOCK_TIMELINE} panicMode={WITH_PANIC} isCompressed={false} />);
    expect(screen.getAllByText('Book venue').length).toBeGreaterThan(0);
  });

  it('checking a task persists to localStorage', () => {
    render(<Timeline timeline={MOCK_TIMELINE} panicMode={NO_PANIC} isCompressed={false} />);
    const checkbox = screen.getByLabelText('Confirm guest list');
    fireEvent.click(checkbox);
    const stored = JSON.parse(localStorage.getItem('event_planner_checklist_tasks'));
    expect(stored['Final Confirmations::Confirm guest list']).toBe(true);
  });

  it('shows progress counter', () => {
    render(<Timeline timeline={MOCK_TIMELINE} panicMode={NO_PANIC} isCompressed={false} />);
    expect(screen.getByText(/0\/5 tasks done/i)).toBeTruthy();
  });

  it('progress updates after checking tasks', () => {
    render(<Timeline timeline={MOCK_TIMELINE} panicMode={NO_PANIC} isCompressed={false} />);
    fireEvent.click(screen.getByLabelText('Book venue'));
    expect(screen.getByText(/1\/5 tasks done/i)).toBeTruthy();
  });
});
