'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Lock, Unlock, Plus, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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

interface InlineEventCardProps {
  event: Event;
  eventIndex: number;
  roles: RoleDefinition[];
  onAddVolunteer: (roleId: string, volunteer: VolunteerEntry) => void;
  onRemoveVolunteer: (roleId: string, volunteerId: string) => void;
  onUpdateEvent: (eventId: string, details: string) => void;
  onToggleLock: (eventId: string) => void;
}

interface AddFormState {
  roleId: string | null;
  name: string;
  phone: string;
  error: string;
}

export function InlineEventCard({
  event,
  eventIndex,
  roles,
  onAddVolunteer,
  onRemoveVolunteer,
  onUpdateEvent,
  onToggleLock,
}: InlineEventCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editedDetails, setEditedDetails] = useState(event.details);
  const [addForm, setAddForm] = useState<AddFormState>({
    roleId: null,
    name: '',
    phone: '',
    error: '',
  });

  const totalVolunteers = Object.values(event.roles).reduce(
    (sum, volunteers) => sum + volunteers.length,
    0
  );

  const openAddForm = (roleId: string) => {
    setAddForm({ roleId, name: '', phone: '', error: '' });
  };

  const closeAddForm = () => {
    setAddForm({ roleId: null, name: '', phone: '', error: '' });
  };

  const handlePhoneChange = (value: string) => {
    const masked = maskPhoneInput(value);
    setAddForm((prev) => ({ ...prev, phone: masked, error: '' }));
  };

  const handleAddVolunteer = () => {
    if (!addForm.roleId) return;

    const name = addForm.name.trim();
    const phone = addForm.phone;

    if (!name) {
      setAddForm((prev) => ({ ...prev, error: 'Name is required' }));
      return;
    }

    if (!isValidPhone(phone)) {
      setAddForm((prev) => ({ ...prev, error: 'Valid 10-digit phone required' }));
      return;
    }

    const existingVolunteers = event.roles[addForm.roleId] || [];
    if (isDuplicateVolunteer(existingVolunteers, name, phone)) {
      setAddForm((prev) => ({ ...prev, error: 'Already signed up for this role' }));
      return;
    }

    const volunteer: VolunteerEntry = {
      id: generateId(),
      name,
      phone: cleanPhone(phone),
    };

    onAddVolunteer(addForm.roleId, volunteer);
    closeAddForm();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddVolunteer();
    } else if (e.key === 'Escape') {
      closeAddForm();
    }
  };

  const handleToggleLock = () => {
    if (event.locked) {
      // Unlocking - start editing
      setEditedDetails(event.details);
      setIsEditingDetails(true);
    }
    onToggleLock(event.id);
  };

  const handleSaveDetails = () => {
    const trimmed = editedDetails.trim();
    if (trimmed && trimmed !== event.details) {
      onUpdateEvent(event.id, trimmed);
    }
    setIsEditingDetails(false);
  };

  const handleCancelEdit = () => {
    setEditedDetails(event.details);
    setIsEditingDetails(false);
  };

  // Get first line of event details for collapsed view
  const eventTitle = event.details.split('\n')[0] || `Event ${eventIndex + 1}`;

  return (
    <div className="border-2 rounded-lg overflow-hidden mb-2 border-[#E5E7EB] bg-white shadow-sm">
      {/* Event header with expand/collapse and lock/unlock buttons */}
      <div className="flex items-center">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 p-3 text-left hover:bg-[#EAF3ED] transition-colors flex items-center gap-2"
        >
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-4 h-4 text-[#1F5A2E] flex-shrink-0" />
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-[#1F5A2E] line-clamp-1">
                {eventTitle}
              </span>
              <Badge variant="secondary" className="text-xs flex-shrink-0">
                <Lock className="w-2.5 h-2.5 mr-1" />
                {event.locked ? 'Locked' : 'Unlocked'}
              </Badge>
              {totalVolunteers > 0 && (
                <Badge className="text-xs bg-[#1F5A2E] flex-shrink-0">
                  {totalVolunteers} {totalVolunteers === 1 ? 'volunteer' : 'volunteers'}
                </Badge>
              )}
            </div>
          </div>
        </button>

        {/* Lock/Unlock button - separate from expand button */}
        <button
          onClick={handleToggleLock}
          className="p-3 hover:bg-[#EAF3ED] rounded transition-colors flex-shrink-0"
          aria-label={event.locked ? 'Unlock event' : 'Lock event'}
        >
          {event.locked ? (
            <Unlock className="w-4 h-4 text-[#1F5A2E]" />
          ) : (
            <Lock className="w-4 h-4 text-[#1F5A2E]" />
          )}
        </button>
      </div>

      {/* Expandable content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t-2 border-[#E5E7EB] p-3 bg-[#FAFAFA]">
              {/* Event details - editable if unlocked */}
              {event.details && (
                <div className="mb-3 p-3 bg-white rounded-lg border border-[#E5E7EB]">
                  {!event.locked && isEditingDetails ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editedDetails}
                        onChange={(e) => setEditedDetails(e.target.value)}
                        className="min-h-[80px] text-xs focus:border-[#1F5A2E] focus:ring-[#1F5A2E]"
                        placeholder="Event details..."
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveDetails}
                          size="sm"
                          className="h-7 bg-[#1F5A2E] hover:bg-[#154021] text-xs"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs font-bold text-gray-800 whitespace-pre-wrap">
                      {event.details}
                    </div>
                  )}
                </div>
              )}

              {/* Role sections */}
              <div className="space-y-3">
                {roles.map((role) => {
                  const volunteers = event.roles[role.id] || [];
                  const isAddingToThisRole = addForm.roleId === role.id;

                  return (
                    <div
                      key={role.id}
                      className="border-2 rounded-lg p-3 bg-white border-[#E5E7EB]"
                    >
                      {/* Role name */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-semibold text-[#1F5A2E]">
                          {role.label}
                        </div>
                        {!isAddingToThisRole && (
                          <Button
                            onClick={() => openAddForm(role.id)}
                            size="sm"
                            className="h-7 bg-[#1F5A2E] hover:bg-[#154021] text-xs"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add
                          </Button>
                        )}
                      </div>

                      {/* Volunteer chips - all visible, wrapping */}
                      <div className="mb-2 max-h-[200px] overflow-y-auto">
                        <div className="flex flex-wrap gap-1.5">
                          <AnimatePresence>
                            {volunteers.map((volunteer) => (
                              <motion.div
                                key={volunteer.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.15 }}
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
                                  <span className="font-medium">{volunteer.name}</span>
                                  <span className="text-gray-600 group-hover:text-white shrink-0 text-[10px]">
                                    {formatPhone(volunteer.phone)}
                                  </span>
                                  <button
                                    onClick={() => onRemoveVolunteer(role.id, volunteer.id)}
                                    className="ml-0.5 hover:bg-red-500 rounded-full p-0.5"
                                    aria-label={`Remove ${volunteer.name}`}
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                </Badge>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                          {volunteers.length === 0 && !isAddingToThisRole && (
                            <span className="text-xs text-gray-400 italic py-1">
                              No volunteers yet
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Inline add form */}
                      <AnimatePresence>
                        {isAddingToThisRole && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-2 border-t border-[#E5E7EB]">
                              <div className="space-y-2">
                                <Input
                                  placeholder="Volunteer name"
                                  value={addForm.name}
                                  onChange={(e) =>
                                    setAddForm((prev) => ({
                                      ...prev,
                                      name: e.target.value,
                                      error: '',
                                    }))
                                  }
                                  onKeyPress={handleKeyPress}
                                  className="h-8 text-xs"
                                  autoFocus
                                />
                                <Input
                                  placeholder="(555) 123-4567"
                                  value={addForm.phone}
                                  onChange={(e) => handlePhoneChange(e.target.value)}
                                  onKeyPress={handleKeyPress}
                                  maxLength={14}
                                  className="h-8 text-xs"
                                />

                                {addForm.error && (
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-1 text-red-600 text-xs p-2 bg-red-50 rounded"
                                  >
                                    <AlertCircle className="w-3 h-3" />
                                    <span>{addForm.error}</span>
                                  </motion.div>
                                )}

                                <div className="flex gap-2">
                                  <Button
                                    onClick={handleAddVolunteer}
                                    size="sm"
                                    className="flex-1 h-8 bg-[#1F5A2E] hover:bg-[#154021] text-xs"
                                  >
                                    Add Volunteer
                                  </Button>
                                  <Button
                                    onClick={closeAddForm}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
