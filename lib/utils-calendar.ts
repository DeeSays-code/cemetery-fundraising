/**
 * Utility functions for calendar computation and data manipulation
 */

import { startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, format, isBefore, isAfter, isSameDay } from 'date-fns';
import type { NavigationBounds, DayState, RoleDefinition, VolunteerEntry, Event, CoverageStatus } from './types';

/**
 * Get the Monday of the week containing the given date
 */
export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 }); // Monday = 1
}

/**
 * Get the Sunday of the week containing the given date
 */
export function getWeekEnd(date: Date): Date {
  return endOfWeek(date, { weekStartsOn: 1 });
}

/**
 * Generate array of 7 dates (Mon-Sun) for a given week start
 */
export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

/**
 * Calculate navigation bounds: past 2 weeks, future 3 months from today
 */
export function getNavigationBounds(): NavigationBounds {
  const today = new Date();
  const minDate = getWeekStart(subWeeks(today, 2));
  const maxDate = addWeeks(today, 12); // ~3 months

  return { minDate, maxDate };
}

/**
 * Check if navigation to a given week is allowed
 */
export function canNavigateToWeek(weekStart: Date, bounds: NavigationBounds): boolean {
  return !isBefore(weekStart, bounds.minDate) && !isAfter(weekStart, bounds.maxDate);
}

/**
 * Format date as ISO string (YYYY-MM-DD) for use as keys
 */
export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Format date for display in header (e.g., "Mon, Feb 23")
 */
export function formatDayHeader(date: Date): { dayName: string; dateStr: string } {
  return {
    dayName: format(date, 'EEE'),
    dateStr: format(date, 'MMM d'),
  };
}

/**
 * Format date for week range display (e.g., "Week of Feb 23, 2026")
 */
export function formatWeekRange(weekStart: Date): string {
  return `Week of ${format(weekStart, 'MMM d, yyyy')}`;
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Phone number formatting utilities
 */

/**
 * Format phone number as (XXX) XXX-XXXX
 * Input: 10-digit string or formatted string
 * Output: Formatted string
 */
export function formatPhone(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // Return formatted if we have 10 digits
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  // Return as-is if not 10 digits (for partial input)
  return phone;
}

/**
 * Clean phone number to 10-digit string for storage
 * Input: Any string with digits
 * Output: 10-digit string or empty if invalid
 */
export function cleanPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 ? digits : '';
}

/**
 * Format phone input as user types
 * Automatically adds formatting: (XXX) XXX-XXXX
 */
export function maskPhoneInput(value: string): string {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');

  // Build formatted string progressively
  let formatted = '';

  if (digits.length > 0) {
    formatted = '(' + digits.slice(0, 3);
  }
  if (digits.length >= 3) {
    formatted += ') ' + digits.slice(3, 6);
  }
  if (digits.length >= 6) {
    formatted += '-' + digits.slice(6, 10);
  }

  return formatted;
}

/**
 * Validate phone number (must be exactly 10 digits)
 */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10;
}

/**
 * Check if volunteer already exists in the same role/day (exact match)
 */
export function isDuplicateVolunteer(
  volunteers: VolunteerEntry[],
  name: string,
  phone: string
): boolean {
  const cleanedPhone = cleanPhone(phone);
  return volunteers.some(
    (v) => v.name.trim().toLowerCase() === name.trim().toLowerCase() &&
           v.phone === cleanedPhone
  );
}

/**
 * Check if volunteer exists in other days of the same role (helpful warning)
 */
export function findVolunteerInOtherDays(
  allDays: Record<string, DayState>,
  roleId: string,
  currentDate: string,
  name: string,
  phone: string
): string[] {
  const cleanedPhone = cleanPhone(phone);
  const matchingDates: string[] = [];

  Object.entries(allDays).forEach(([date, dayState]) => {
    if (date === currentDate) return; // Skip current day

    const volunteers = dayState.roles[roleId] || [];
    const hasMatch = volunteers.some(
      (v) => v.name.trim().toLowerCase() === name.trim().toLowerCase() &&
             v.phone === cleanedPhone
    );

    if (hasMatch) {
      matchingDates.push(date);
    }
  });

  return matchingDates;
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Initialize empty event
 */
export function createEmptyEvent(): Event {
  return {
    id: generateId(),
    details: '',
    locked: false,
    roles: {},
    createdAt: new Date(),
  };
}

/**
 * Initialize empty day state (with no events)
 */
export function createEmptyDayState(): DayState {
  return {
    events: [],
  };
}

/**
 * Default role definitions with minimum volunteer requirements
 */
export function getDefaultRoles(): RoleDefinition[] {
  return [
    { id: 'role-1', label: 'Fundraising appeal coordinator', isDefault: true, minVolunteers: 1 },
    { id: 'role-2', label: 'Men\'s volunteer lead', isDefault: true, minVolunteers: 1 },
    { id: 'role-3', label: 'Sisters\' volunteer lead', isDefault: true, minVolunteers: 1 },
    { id: 'role-4', label: 'Volunteers list', isDefault: true, minVolunteers: 8 },
  ];
}

/**
 * Calculate coverage status for a role in an event
 */
export function getCoverageStatus(
  event: Event,
  role: RoleDefinition
): { current: number; minimum: number; isMet: boolean } {
  const volunteers = event.roles[role.id] || [];
  const current = volunteers.length;
  const minimum = role.minVolunteers;
  const isMet = current >= minimum;

  return { current, minimum, isMet };
}
