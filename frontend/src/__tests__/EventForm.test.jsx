import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EventForm, { INITIAL_FORM_STATE } from '../components/EventForm.jsx';
import Presets from '../components/Presets.jsx';
import { EVENT_PRESETS, getFutureDateString } from '../data/presets.js';

describe('Presets Component (Presets.jsx)', () => {
  it('renders all 3 presets with names and descriptions', () => {
    const handleSelect = vi.fn();
    render(<Presets onSelectPreset={handleSelect} selectedPresetId="" />);

    expect(screen.getByText('Royal Wedding')).toBeInTheDocument();
    expect(screen.getByText("Kids' Birthday")).toBeInTheDocument();
    expect(screen.getByText('Diwali Community Meet')).toBeInTheDocument();
  });

  it('calls onSelectPreset with correct preset data when clicked', () => {
    const handleSelect = vi.fn();
    render(<Presets onSelectPreset={handleSelect} selectedPresetId="" />);

    const royalWeddingBtn = screen.getByRole('button', { name: /Royal Wedding/i });
    fireEvent.click(royalWeddingBtn);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(EVENT_PRESETS[0]);
  });
});

describe('EventForm Component (EventForm.jsx)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders all semantic fieldsets and primary inputs', () => {
    render(<EventForm onSubmit={vi.fn()} />);

    expect(screen.getByRole('group', { name: 'Event Details' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Guests & Budget' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Priorities & Preferences' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Celebration Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Event Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Host City/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Expected Guest Count/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Total Budget/i)).toBeInTheDocument();
  });

  it('shows validation errors when submitting an empty form', async () => {
    const handleSubmit = vi.fn();
    render(<EventForm onSubmit={handleSubmit} initialData={{ ...INITIAL_FORM_STATE, eventName: '', eventDate: '', city: '' }} />);

    const submitBtn = screen.getByRole('button', { name: /Generate Event Plan/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Please enter an event name')).toBeInTheDocument();
    expect(await screen.findByText('Please select a date for your celebration')).toBeInTheDocument();
    expect(await screen.findByText('Please enter a host city')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('shows error when event date is in the past', () => {
    render(<EventForm onSubmit={vi.fn()} />);

    const dateInput = screen.getByLabelText(/Event Date/i);
    fireEvent.change(dateInput, { target: { value: '2020-01-01' } });
    fireEvent.blur(dateInput);

    expect(screen.getByText(/event date cannot be in the past/i)).toBeInTheDocument();
  });

  it('shows error when guest count is invalid (0 or > 2000)', () => {
    render(<EventForm onSubmit={vi.fn()} />);

    const guestInput = screen.getByLabelText(/Expected Guest Count/i);
    fireEvent.change(guestInput, { target: { value: '0' } });
    fireEvent.blur(guestInput);
    expect(screen.getByText(/guest count must be at least 1/i)).toBeInTheDocument();

    fireEvent.change(guestInput, { target: { value: '2500' } });
    fireEvent.blur(guestInput);
    expect(screen.getByText(/maximum guest count supported is 2000/i)).toBeInTheDocument();
  });

  it('shows wedding ceremony add-ons only when eventType is wedding', () => {
    const { rerender } = render(<EventForm onSubmit={vi.fn()} initialData={{ ...INITIAL_FORM_STATE, eventType: 'wedding' }} />);

    expect(screen.getByRole('group', { name: 'Wedding Ceremony Add-ons' })).toBeInTheDocument();
    expect(screen.getByText('Haldi Ceremony')).toBeInTheDocument();

    // Switch to Birthday
    rerender(<EventForm onSubmit={vi.fn()} initialData={{ ...INITIAL_FORM_STATE, eventType: 'birthday' }} />);
    expect(screen.queryByRole('group', { name: 'Wedding Ceremony Add-ons' })).not.toBeInTheDocument();
  });

  it('limits top priorities selection to a maximum of 3', () => {
    render(<EventForm onSubmit={vi.fn()} initialData={{ ...INITIAL_FORM_STATE, priorities: ['food', 'decor', 'photography'] }} />);

    // Try to click a 4th priority (Entertainment)
    const entertainmentBtn = screen.getByRole('button', { name: /Entertainment & DJ/i });
    fireEvent.click(entertainmentBtn);

    expect(screen.getByText(/You can choose up to 3 top priorities/i)).toBeInTheDocument();
  });

  it('updates live per-guest spend calculation accurately', () => {
    render(<EventForm onSubmit={vi.fn()} initialData={{ ...INITIAL_FORM_STATE, budget: 500000, guestCount: 100 }} />);

    // ₹5,00,000 / 100 = ₹5,000
    expect(screen.getByText('₹5,000')).toBeInTheDocument();
  });

  it('submits valid form data correctly', () => {
    const handleSubmit = vi.fn();
    const validData = {
      ...INITIAL_FORM_STATE,
      eventName: 'Kabir & Ananya Wedding',
      eventDate: getFutureDateString(45),
      city: 'Lucknow',
      guestCount: 200,
      budget: 1000000,
    };

    render(<EventForm onSubmit={handleSubmit} initialData={validData} />);

    const submitBtn = screen.getByRole('button', { name: /Generate Event Plan/i });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({
      eventName: 'Kabir & Ananya Wedding',
      city: 'Lucknow',
      guestCount: 200,
      budget: 1000000,
    }));
  });
});
