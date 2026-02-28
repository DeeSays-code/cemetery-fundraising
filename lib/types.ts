/**
 * Type definitions for Muslim Ummah Cemetery Fundraising Signup Calendar
 */

// Volunteer entry with name and phone (stored as 10-digit string)
export interface VolunteerEntry {
  id: string; // Unique identifier for the volunteer entry
  name: string;
  phone: string; // Stored as 10-digit string (e.g., "5551234567")
}

// Role definition
export interface RoleDefinition {
  id: string;
  label: string;
  isDefault?: boolean; // True for the 4 default roles
  minVolunteers: number; // Minimum volunteers needed for this role
}

// Single event with its own details and role signups
export interface Event {
  id: string; // Unique event identifier
  details: string; // Event description
  locked: boolean; // Lock status
  roles: Record<string, VolunteerEntry[]>; // roleId -> list of volunteers for this event
  createdAt: Date; // When event was created
}

// Coverage status for a role in an event
export interface CoverageStatus {
  current: number; // Current number of volunteers
  minimum: number; // Minimum needed
  isMet: boolean; // Whether minimum is met
}

// Data for a single day (now supports multiple events)
export interface DayState {
  events: Event[]; // Array of events for this day
}

// Complete week state
export interface WeekState {
  weekStart: Date; // Always a Monday
  days: Record<string, DayState>; // ISO date string -> day data
  roles: RoleDefinition[]; // List of all roles (default + custom)
}

// Navigation bounds
export interface NavigationBounds {
  minDate: Date; // Past 2 weeks from today
  maxDate: Date; // Future 3 months from today
}

// Info panel selection
export type InfoSelection =
  | { type: 'none' }
  | { type: 'role'; roleId: string; roleLabel: string }
  | { type: 'day'; date: string; dayLabel: string; eventCount: number };
