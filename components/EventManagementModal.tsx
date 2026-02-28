'use client';

import React, { useState } from 'react';
import { Lock, Unlock, Trash2, Plus, ChevronDown, ChevronUp, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import {
  maskPhoneInput,
  isValidPhone,
  formatPhone,
  isDuplicateVolunteer,
  generateId,
  cleanPhone,
} from '@/lib/utils-calendar';
import type { Event, RoleDefinition, VolunteerEntry } from '@/lib/types';

interface EventManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  dayLabel: string;
  events: Event[];
  roles: RoleDefinition[];
  onUpdateEvent: (eventId: string, details: string) => void;
  onToggleLock: (eventId: string) => void;
  onDeleteEvent: (eventId: string) => void;
  onAddEvent: () => void;
  onAddVolunteer: (eventId: string, roleId: string, volunteer: VolunteerEntry) => void;
  onRemoveVolunteer: (eventId: string, roleId: string, volunteerId: string) => void;
}

interface ExpandedState {
  [eventId: string]: boolean;
}

interface InputState {
  name: string;
  phone: string;
  error: string;
}

export function EventManagementModal({
  open,
  onOpenChange,
  date,
  dayLabel,
  events,
  roles,
  onUpdateEvent,
  onToggleLock,
  onDeleteEvent,
  onAddEvent,
  onAddVolunteer,
  onRemoveVolunteer,
}: EventManagementModalProps) {
  const [expandedEvents, setExpandedEvents] = useState<ExpandedState>({});
  const [showUnlockModal, setShowUnlockModal] = useState<string | null>(null);
  const [inputs, setInputs] = useState<Record<string, Record<string, InputState>>>({});

  const toggleExpand = (eventId: string) => {
    setExpandedEvents((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  const handleLockClick = (eventId: string, isLocked: boolean) => {
    if (isLocked) {
      setShowUnlockModal(eventId);
    } else {
      onToggleLock(eventId);
    }
  };

  const handleConfirmUnlock = () => {
    if (showUnlockModal) {
      onToggleLock(showUnlockModal);
      setShowUnlockModal(null);
    }
  };

  const getInputState = (eventId: string, roleId: string): InputState => {
    return inputs[eventId]?.[roleId] || { name: '', phone: '', error: '' };
  };

  const updateInput = (eventId: string, roleId: string, updates: Partial<InputState>) => {
    setInputs((prev) => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        [roleId]: { ...getInputState(eventId, roleId), ...updates },
      },
    }));
  };

  const handlePhoneChange = (eventId: string, roleId: string, value: string) => {
    const masked = maskPhoneInput(value);
    updateInput(eventId, roleId, { phone: masked, error: '' });
  };

  const handleAddVolunteer = (eventId: string, roleId: string, existingVolunteers: VolunteerEntry[]) => {
    const state = getInputState(eventId, roleId);
    const name = state.name.trim();
    const phone = state.phone;

    if (!name) {
      updateInput(eventId, roleId, { error: 'Name is required' });
      return;
    }

    if (!isValidPhone(phone)) {
      updateInput(eventId, roleId, { error: 'Please enter a valid 10-digit phone number' });
      return;
    }

    if (isDuplicateVolunteer(existingVolunteers, name, phone)) {
      updateInput(eventId, roleId, { error: 'This volunteer is already signed up for this event' });
      return;
    }

    const volunteer: VolunteerEntry = {
      id: generateId(),
      name,
      phone: cleanPhone(phone),
    };

    onAddVolunteer(eventId, roleId, volunteer);
    updateInput(eventId, roleId, { name: '', phone: '', error: '' });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#1F5A2E] text-2xl">
              Manage Events - {dayLabel}
            </DialogTitle>
            <DialogDescription>
              Add, edit, or delete events for this day. Each event has its own volunteer signups.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Events list */}
            <AnimatePresence>
              {events.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 text-gray-500"
                >
                  No events yet. Click "Add New Event" to get started.
                </motion.div>
              ) : (
                events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                      border-2 rounded-lg p-4
                      ${event.locked ? 'border-gray-300 bg-gray-50' : 'border-[#E5E7EB] bg-white'}
                    `}
                  >
                    {/* Event header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-[#1F5A2E]">Event {index + 1}</span>
                          {event.locked && (
                            <Badge variant="secondary" className="text-xs">
                              <Lock className="w-3 h-3 mr-1" />
                              Locked
                            </Badge>
                          )}
                        </div>
                        <Textarea
                          value={event.details}
                          onChange={(e) => onUpdateEvent(event.id, e.target.value)}
                          disabled={event.locked}
                          placeholder="Event name, location, time, notes..."
                          className={`
                            resize-none min-h-[60px] text-sm
                            ${event.locked ? 'cursor-not-allowed bg-gray-100 font-bold' : ''}
                            focus:border-[#1F5A2E] focus:ring-[#1F5A2E]
                          `}
                        />
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          onClick={() => handleLockClick(event.id, event.locked)}
                          variant="ghost"
                          size="sm"
                          className="hover:bg-[#EAF3ED]"
                          aria-label={event.locked ? 'Unlock event' : 'Lock event'}
                        >
                          {event.locked ? (
                            <Unlock className="w-4 h-4 text-[#1F5A2E]" />
                          ) : (
                            <Lock className="w-4 h-4 text-gray-500" />
                          )}
                        </Button>
                        <Button
                          onClick={() => onDeleteEvent(event.id)}
                          variant="ghost"
                          size="sm"
                          className="hover:bg-red-50 hover:text-red-600"
                          aria-label="Delete event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Expandable role sections */}
                    <div className="border-t pt-3">
                      <Button
                        onClick={() => toggleExpand(event.id)}
                        variant="outline"
                        size="sm"
                        className="w-full justify-between hover:bg-[#EAF3ED]"
                      >
                        <span className="font-medium">Role Signups</span>
                        {expandedEvents[event.id] ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>

                      <AnimatePresence>
                        {expandedEvents[event.id] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-3 mt-3">
                              {roles.map((role) => {
                                const volunteers = event.roles[role.id] || [];
                                const inputState = getInputState(event.id, role.id);

                                return (
                                  <div
                                    key={role.id}
                                    className="border rounded-lg p-3 bg-[#EAF3ED]"
                                  >
                                    <div className="font-medium text-sm text-[#1F5A2E] mb-2">
                                      {role.label}
                                    </div>

                                    {/* Input section */}
                                    <div className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2">
                                      <Input
                                        placeholder="Name"
                                        value={inputState.name}
                                        onChange={(e) =>
                                          updateInput(event.id, role.id, {
                                            name: e.target.value,
                                            error: '',
                                          })
                                        }
                                        className="h-8 text-sm"
                                      />
                                      <Input
                                        placeholder="(555) 123-4567"
                                        value={inputState.phone}
                                        onChange={(e) =>
                                          handlePhoneChange(event.id, role.id, e.target.value)
                                        }
                                        maxLength={14}
                                        className="h-8 text-sm"
                                      />
                                      <Button
                                        onClick={() =>
                                          handleAddVolunteer(event.id, role.id, volunteers)
                                        }
                                        size="sm"
                                        className="h-8 bg-[#1F5A2E] hover:bg-[#154021]"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </Button>
                                    </div>

                                    {inputState.error && (
                                      <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-1 text-red-600 text-xs mb-2"
                                      >
                                        <AlertCircle className="w-3 h-3" />
                                        <span>{inputState.error}</span>
                                      </motion.div>
                                    )}

                                    {/* Volunteers chips */}
                                    <div className="flex flex-wrap gap-2">
                                      <AnimatePresence>
                                        {volunteers.map((volunteer) => (
                                          <motion.div
                                            key={volunteer.id}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            transition={{ duration: 0.2 }}
                                            layout
                                          >
                                            <Badge
                                              variant="secondary"
                                              className="
                                                flex items-center gap-1 px-2 py-1
                                                bg-white hover:bg-[#1F5A2E] hover:text-white
                                                transition-colors cursor-pointer group
                                                text-xs
                                              "
                                            >
                                              <span className="font-medium truncate">
                                                {volunteer.name}
                                              </span>
                                              <span className="text-gray-600 group-hover:text-white shrink-0">
                                                {formatPhone(volunteer.phone)}
                                              </span>
                                              <button
                                                onClick={() =>
                                                  onRemoveVolunteer(event.id, role.id, volunteer.id)
                                                }
                                                className="ml-1 hover:bg-red-500 rounded-full p-0.5"
                                                aria-label={`Remove ${volunteer.name}`}
                                              >
                                                <X className="w-3 h-3" />
                                              </button>
                                            </Badge>
                                          </motion.div>
                                        ))}
                                      </AnimatePresence>
                                      {volunteers.length === 0 && (
                                        <span className="text-xs text-gray-500 italic">
                                          No volunteers yet
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>

            {/* Add new event button */}
            <Button
              onClick={onAddEvent}
              variant="outline"
              className="w-full hover:bg-[#EAF3ED] hover:text-[#1F5A2E] hover:border-[#1F5A2E]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unlock confirmation modal */}
      <Dialog open={showUnlockModal !== null} onOpenChange={() => setShowUnlockModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlock Event Details?</DialogTitle>
            <DialogDescription>
              The event has been locked. Are you sure you want to edit it?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowUnlockModal(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmUnlock}
              className="bg-[#1F5A2E] hover:bg-[#154021] text-white"
            >
              Yes, unlock
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
