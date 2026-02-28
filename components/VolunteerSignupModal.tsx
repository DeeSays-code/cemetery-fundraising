'use client';

import React, { useState } from 'react';
import { Plus, ChevronDown, ChevronUp, X, AlertCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

interface VolunteerSignupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  dayLabel: string;
  events: Event[];
  roles: RoleDefinition[];
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

export function VolunteerSignupModal({
  open,
  onOpenChange,
  date,
  dayLabel,
  events,
  roles,
  onAddVolunteer,
  onRemoveVolunteer,
}: VolunteerSignupModalProps) {
  const [expandedEvents, setExpandedEvents] = useState<ExpandedState>({});
  const [inputs, setInputs] = useState<Record<string, Record<string, InputState>>>({});

  const toggleExpand = (eventId: string) => {
    setExpandedEvents((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
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
      updateInput(eventId, roleId, { error: 'You are already signed up for this role' });
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#1F5A2E] text-2xl">
            Volunteer Signup - {dayLabel}
          </DialogTitle>
          <DialogDescription>
            Sign up for volunteer roles. Click an event to expand and see available roles.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Events list */}
          <AnimatePresence>
            {events.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-gray-500"
              >
                <p className="text-lg mb-2">No events scheduled yet</p>
                <p className="text-sm">Events will appear here once created by the admin</p>
              </motion.div>
            ) : (
              events.map((event, index) => {
                const isExpanded = expandedEvents[event.id];
                const totalVolunteers = Object.values(event.roles).reduce(
                  (sum, volunteers) => sum + volunteers.length,
                  0
                );

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-2 rounded-lg overflow-hidden border-[#E5E7EB] bg-white"
                  >
                    {/* Event card header - clickable to expand */}
                    <button
                      onClick={() => toggleExpand(event.id)}
                      className="w-full p-4 text-left hover:bg-[#EAF3ED] transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-[#1F5A2E] text-lg">
                              Event {index + 1}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              <Lock className="w-3 h-3 mr-1" />
                              Locked
                            </Badge>
                            <Badge className="text-xs bg-[#1F5A2E]">
                              {totalVolunteers} {totalVolunteers === 1 ? 'volunteer' : 'volunteers'}
                            </Badge>
                          </div>

                          {/* Event details - bold and locked */}
                          <div className="text-sm font-bold text-gray-800 whitespace-pre-wrap">
                            {event.details || 'No details provided'}
                          </div>
                        </div>

                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-4 flex-shrink-0"
                        >
                          <ChevronDown className="w-5 h-5 text-[#1F5A2E]" />
                        </motion.div>
                      </div>
                    </button>

                    {/* Expandable role signup section */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden border-t-2 border-[#E5E7EB]"
                        >
                          <div className="p-4 bg-[#FAFAFA] space-y-3">
                            {roles.map((role) => {
                              const volunteers = event.roles[role.id] || [];
                              const inputState = getInputState(event.id, role.id);

                              return (
                                <div
                                  key={role.id}
                                  className="border-2 rounded-lg p-4 bg-white border-[#E5E7EB]"
                                >
                                  <div className="font-semibold text-[#1F5A2E] mb-3">
                                    {role.label}
                                  </div>

                                  {/* Volunteer signup inputs */}
                                  <div className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-3">
                                    <Input
                                      placeholder="Your name"
                                      value={inputState.name}
                                      onChange={(e) =>
                                        updateInput(event.id, role.id, {
                                          name: e.target.value,
                                          error: '',
                                        })
                                      }
                                      className="h-9 text-sm"
                                    />
                                    <Input
                                      placeholder="(555) 123-4567"
                                      value={inputState.phone}
                                      onChange={(e) =>
                                        handlePhoneChange(event.id, role.id, e.target.value)
                                      }
                                      maxLength={14}
                                      className="h-9 text-sm"
                                    />
                                    <Button
                                      onClick={() =>
                                        handleAddVolunteer(event.id, role.id, volunteers)
                                      }
                                      size="sm"
                                      className="h-9 bg-[#1F5A2E] hover:bg-[#154021]"
                                    >
                                      <Plus className="w-4 h-4 mr-1" />
                                      Add
                                    </Button>
                                  </div>

                                  {inputState.error && (
                                    <motion.div
                                      initial={{ opacity: 0, y: -5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="flex items-center gap-1 text-red-600 text-xs mb-3 p-2 bg-red-50 rounded"
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
                                              bg-[#EAF3ED] hover:bg-[#1F5A2E] hover:text-white
                                              transition-colors group text-xs
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
                                        No volunteers yet - be the first to sign up!
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
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
