/**
 * CalendarGrid Component
 *
 * Production-ready calendar with event management and volunteer signup
 *
 * KEY FEATURES:
 * - Weekly calendar view with DayCard components showing up to 3 events
 * - EventCard mini-dashboards with real-time coverage indicators
 * - Modal-based event detail view for volunteer signups
 * - Admin: Create, edit, delete events with confirmation dialogs
 * - Volunteers: View events and sign up for roles
 * - Coverage indicators: Green (met) / Red (not met) with X/Y counts
 * - Smooth animations for all interactions
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { addWeeks, subWeeks } from 'date-fns';
import { WeekHeader } from './WeekHeader';
import { DayCard } from './DayCard';
import { EventDetailModal } from './EventDetailModal';
import { AddEventModal } from './AddEventModal';
import { ConfirmationDialog } from './ConfirmationDialog';
import { AddRoleDialog } from './AddRoleDialog';
import { ImportantInfoPanel } from './ImportantInfoPanel';
import {
  getWeekStart,
  getWeekDays,
  getNavigationBounds,
  canNavigateToWeek,
  toISODate,
  getDefaultRoles,
  createEmptyDayState,
  createEmptyEvent,
  generateId,
} from '@/lib/utils-calendar';
import type {
  DayState,
  RoleDefinition,
  VolunteerEntry,
  InfoSelection,
  Event,
} from '@/lib/types';

export function CalendarGrid() {
  // Core state
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(new Date()));
  const [daysData, setDaysData] = useState<Record<string, DayState>>({});
  const [roles, setRoles] = useState<RoleDefinition[]>(getDefaultRoles());
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [infoSelection, setInfoSelection] = useState<InfoSelection>({ type: 'none' });

  // Modal state
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedEventDate, setSelectedEventDate] = useState<string>('');
  const [addEventDate, setAddEventDate] = useState<string>('');
  const [addEventDayLabel, setAddEventDayLabel] = useState<string>('');
  const [showAddRoleDialog, setShowAddRoleDialog] = useState(false);

  // Confirmation dialogs
  const [showUnlockConfirm, setShowUnlockConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Compute week days
  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const bounds = useMemo(() => getNavigationBounds(), []);

  // Check navigation availability
  const canGoPrev = useMemo(() => {
    const prevWeek = subWeeks(weekStart, 1);
    return canNavigateToWeek(prevWeek, bounds);
  }, [weekStart, bounds]);

  const canGoNext = useMemo(() => {
    const nextWeek = addWeeks(weekStart, 1);
    return canNavigateToWeek(nextWeek, bounds);
  }, [weekStart, bounds]);

  // Navigation handlers
  const handlePrevWeek = () => {
    if (canGoPrev) {
      setSlideDirection('right');
      setWeekStart(subWeeks(weekStart, 1));
    }
  };

  const handleNextWeek = () => {
    if (canGoNext) {
      setSlideDirection('left');
      setWeekStart(addWeeks(weekStart, 1));
    }
  };

  const handleToday = () => {
    const today = new Date();
    const todayWeekStart = getWeekStart(today);
    if (todayWeekStart.getTime() !== weekStart.getTime()) {
      setSlideDirection(todayWeekStart > weekStart ? 'left' : 'right');
      setWeekStart(todayWeekStart);
    }
  };

  // Event handlers
  const handleEventClick = (date: string, event: Event) => {
    setSelectedEvent(event);
    setSelectedEventDate(date);
  };

  const handleAddEventClick = (date: string, dayLabel: string) => {
    setAddEventDate(date);
    setAddEventDayLabel(dayLabel);
  };

  const handleSaveNewEvent = (details: string) => {
    const newEvent: Event = {
      ...createEmptyEvent(),
      details,
      locked: true, // Auto-lock on creation
    };

    setDaysData((prev) => {
      const dayState = prev[addEventDate] || createEmptyDayState();
      return {
        ...prev,
        [addEventDate]: {
          ...dayState,
          events: [...dayState.events, newEvent],
        },
      };
    });
  };

  const handleUpdateEvent = (eventId: string, details: string) => {
    setDaysData((prev) => {
      const dayState = prev[selectedEventDate];
      if (!dayState) return prev;

      return {
        ...prev,
        [selectedEventDate]: {
          ...dayState,
          events: dayState.events.map((e) =>
            e.id === eventId ? { ...e, details } : e
          ),
        },
      };
    });

    // Update selected event in modal
    if (selectedEvent && selectedEvent.id === eventId) {
      setSelectedEvent({ ...selectedEvent, details });
    }
  };

  const handleToggleLock = (eventId: string) => {
    setDaysData((prev) => {
      const dayState = prev[selectedEventDate];
      if (!dayState) return prev;

      const updatedEvents = dayState.events.map((e) =>
        e.id === eventId ? { ...e, locked: !e.locked } : e
      );

      // Update selected event
      const updatedEvent = updatedEvents.find((e) => e.id === eventId);
      if (updatedEvent) {
        setSelectedEvent(updatedEvent);
      }

      return {
        ...prev,
        [selectedEventDate]: {
          ...dayState,
          events: updatedEvents,
        },
      };
    });
  };

  const handleConfirmUnlock = () => {
    if (selectedEvent) {
      handleToggleLock(selectedEvent.id);
    }
  };

  const handleDeleteEvent = () => {
    if (!selectedEvent) return;

    setDaysData((prev) => {
      const dayState = prev[selectedEventDate];
      if (!dayState) return prev;

      return {
        ...prev,
        [selectedEventDate]: {
          ...dayState,
          events: dayState.events.filter((e) => e.id !== selectedEvent.id),
        },
      };
    });

    setSelectedEvent(null);
  };

  const handleAddVolunteer = (
    eventId: string,
    roleId: string,
    volunteer: VolunteerEntry
  ) => {
    setDaysData((prev) => {
      const dayState = prev[selectedEventDate];
      if (!dayState) return prev;

      const updatedEvents = dayState.events.map((e) =>
        e.id === eventId
          ? {
              ...e,
              roles: {
                ...e.roles,
                [roleId]: [...(e.roles[roleId] || []), volunteer],
              },
            }
          : e
      );

      // Update selected event
      const updatedEvent = updatedEvents.find((e) => e.id === eventId);
      if (updatedEvent) {
        setSelectedEvent(updatedEvent);
      }

      return {
        ...prev,
        [selectedEventDate]: {
          ...dayState,
          events: updatedEvents,
        },
      };
    });
  };

  const handleRemoveVolunteer = (
    eventId: string,
    roleId: string,
    volunteerId: string
  ) => {
    setDaysData((prev) => {
      const dayState = prev[selectedEventDate];
      if (!dayState) return prev;

      const updatedEvents = dayState.events.map((e) =>
        e.id === eventId
          ? {
              ...e,
              roles: {
                ...e.roles,
                [roleId]: (e.roles[roleId] || []).filter((v) => v.id !== volunteerId),
              },
            }
          : e
      );

      // Update selected event
      const updatedEvent = updatedEvents.find((e) => e.id === eventId);
      if (updatedEvent) {
        setSelectedEvent(updatedEvent);
      }

      return {
        ...prev,
        [selectedEventDate]: {
          ...dayState,
          events: updatedEvents,
        },
      };
    });
  };

  // Role management
  const handleAddRole = (roleName: string) => {
    const newRole: RoleDefinition = {
      id: generateId(),
      label: roleName,
      isDefault: false,
      minVolunteers: 1,
    };
    setRoles((prev) => [...prev, newRole]);
  };

  const handleRoleLabelClick = (roleId: string, roleLabel: string) => {
    setSelectedRole(roleId);
    setInfoSelection({ type: 'role', roleId, roleLabel });
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6">
      {/* Week header with navigation */}
      <WeekHeader
        weekDays={weekDays}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onToday={handleToday}
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
      />

      {/* Responsive wrapper: horizontal scroll on mobile */}
      <div className="overflow-x-auto -mx-4 md:mx-0">
        <div className="min-w-[900px] px-4 md:px-0">
          {/* Main calendar grid with slide animation */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={weekStart.toISOString()}
              initial={{ opacity: 0, x: slideDirection === 'left' ? 100 : -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: slideDirection === 'left' ? -100 : 100 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {/* Calendar grid with day cards */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {weekDays.map((day) => {
                  const date = toISODate(day);
                  const dayState = daysData[date] || createEmptyDayState();

                  return (
                    <DayCard
                      key={date}
                      day={day}
                      events={dayState.events}
                      roles={roles}
                      onEventClick={(event) => handleEventClick(date, event)}
                      onAddEventClick={handleAddEventClick}
                    />
                  );
                })}
              </div>

              {/* Role guidelines section */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleLabelClick(role.id, role.label)}
                    className={`
                      flex flex-col items-center justify-center px-3 py-2 rounded-lg
                      font-semibold text-xs text-white
                      transition-all cursor-pointer
                      ${
                        selectedRole === role.id
                          ? 'bg-[#154021] ring-2 ring-[#1F5A2E]'
                          : 'bg-[#1F5A2E] hover:bg-[#154021]'
                      }
                    `}
                  >
                    <span className="text-center">{role.label}</span>
                    <span className="text-[10px] opacity-75 mt-1">ℹ️ Guidelines</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Important Information Panel */}
      <ImportantInfoPanel selection={infoSelection} selectedRole={selectedRole} />

      {/* Event Detail Modal */}
      <EventDetailModal
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent}
        roles={roles}
        onUpdateEvent={handleUpdateEvent}
        onToggleLock={handleToggleLock}
        onDeleteEvent={handleDeleteEvent}
        onAddVolunteer={handleAddVolunteer}
        onRemoveVolunteer={handleRemoveVolunteer}
        onRequestUnlock={() => setShowUnlockConfirm(true)}
        onRequestDelete={() => setShowDeleteConfirm(true)}
      />

      {/* Add Event Modal */}
      <AddEventModal
        open={!!addEventDate}
        onOpenChange={(open) => !open && setAddEventDate('')}
        date={addEventDate}
        dayLabel={addEventDayLabel}
        onSave={handleSaveNewEvent}
      />

      {/* Unlock Confirmation Dialog */}
      <ConfirmationDialog
        open={showUnlockConfirm}
        onOpenChange={setShowUnlockConfirm}
        title="Unlock Event?"
        description="The event has been locked. Are you sure you want to edit it?"
        confirmLabel="Yes, Unlock"
        onConfirm={handleConfirmUnlock}
        variant="default"
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Event?"
        description="Delete this event? All volunteer signups will be removed. This action cannot be undone."
        confirmLabel="Yes, Delete"
        onConfirm={handleDeleteEvent}
        variant="destructive"
      />

      {/* Add Role Dialog */}
      <AddRoleDialog
        open={showAddRoleDialog}
        onOpenChange={setShowAddRoleDialog}
        onAddRole={handleAddRole}
      />

      {/* Footer */}
      <div className="mt-12 mb-6 text-center space-y-1">
        <p className="text-xs text-gray-400 font-light tracking-wide">
          Powered by{' '}
          <span className="font-semibold text-[#1F5A2E] bg-gradient-to-r from-[#1F5A2E] to-[#2a7a42] bg-clip-text text-transparent">
            AGIENT
          </span>
        </p>
        <p className="text-xs">
          <a
            href="https://www.agient.us"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-[#1F5A2E] transition-colors underline decoration-dotted"
          >
            www.agient.us
          </a>
        </p>
      </div>
    </div>
  );
}
