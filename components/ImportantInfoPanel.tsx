'use client';

import React from 'react';
import { Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { InfoSelection } from '@/lib/types';

interface ImportantInfoPanelProps {
  selection: InfoSelection;
  selectedRole?: string | null;
}

// General guidelines that apply to ALL volunteers
const GENERAL_GUIDELINES = {
  title: 'General Guidelines for All Volunteers',
  sections: [
    {
      header: 'Understanding the Project',
      points: [
        'All volunteers must understand what Muslim Ummah Cemetery is',
        'Know why fundraising is needed',
        'Learn and be able to explain basic key talking points',
        'Be prepared to explain the project clearly if someone asks',
      ],
    },
    {
      header: 'Payment App Access',
      points: [
        'Volunteers may be required to log into the Square app on their phones',
        'Confirm login before the appeal begins',
        'If phone issues occur, coordinate with the Team Lead',
        'Have backup device/physical Square reader available when needed',
      ],
    },
    {
      header: 'Professional Conduct',
      points: [
        'Be polite, respectful, and professional at all times',
        'Do not pressure anyone for donations',
        'Answer questions honestly and directly',
        'If unsure about an answer, refer the person to the Team Lead',
        'Represent Muslim Ummah Cemetery with integrity',
      ],
    },
    {
      header: 'Event Arrival & Setup',
      points: [
        'Arrive at least 30 minutes before prayer time',
        'This ensures: adequate parking, proper table setup, coordination with masjid management',
        'Set up materials neatly and visibly',
        'Be ready to assist with any last-minute preparations',
      ],
    },
    {
      header: 'Consistency Across Events',
      points: [
        'These guidelines apply to all events',
        'Roles and responsibilities remain the same across all masjids and locations',
        'Maintain the same standards every time',
      ],
    },
    {
      header: 'Escalation Protocol',
      points: [
        'Volunteers → Report issues to Team Lead',
        'Team Lead → Coordinate with Event Organizer',
        'Handle problems professionally and promptly',
      ],
    },
  ],
};

// Role-specific detailed information
const ROLE_GUIDELINES: Record<string, any> = {
  'Fundraising appeal coordinator': {
    summary: 'The Fundraising Appeal Coordinator is responsible for delivering the official fundraising message clearly, confidently, and within the allotted time.',
    sections: [
      {
        header: 'Script Preparation',
        points: [
          'Thoroughly review and understand the approved fundraising script',
          'Be able to explain the appeal naturally while staying aligned with the script',
          'Do not add, remove, or modify key messaging beyond the approved script',
          'Keep the tone sincere, natural, and engaging',
        ],
      },
      {
        header: 'Timing of Appeal',
        points: [
          'Typically delivered after 4 rakats of Taraweeh OR before/after Friday prayer (Jumu\'ah)',
          'You will usually have 2–5 minutes maximum to deliver the message',
          'Be concise and impactful',
        ],
      },
      {
        header: 'Script Source & Support',
        points: [
          'The script was written by Matin Bhai',
          'Contact Matin Bhai directly for clarification or additional information',
          'The script link will be provided separately as the official reference',
        ],
      },
      {
        header: 'Coordination',
        points: [
          'Coordinate with the Volunteer Lead before the event',
          'Confirm appeal timing, setup readiness, and donation collection readiness',
        ],
      },
    ],
  },
  'Men\'s volunteer lead': {
    summary: 'The Men\'s Volunteer Lead is responsible for operational setup, donation collection readiness, and team coordination on the men\'s side.',
    sections: [
      {
        header: 'Required Materials to Bring & Set Up',
        points: [
          '1 Donation Box',
          '1 Muslim Ummah Cemetery Table Cover',
          '1 Muslim Ummah Cemetery Banner',
          'Flyers',
          'Donation Cards',
        ],
      },
      {
        header: 'Payment Setup',
        points: [
          'Log into the Square app on your phone',
          'Login credentials will be provided by Anwar Sultan',
          'Log in before fundraising begins and confirm it is working',
          'Test the system if possible',
        ],
      },
      {
        header: 'Physical Payment Backup',
        points: [
          'At least one person per event should have a Square physical card reader/device available',
          'This is important in case: phone issues occur, internet connection is weak, or technical issues arise',
        ],
      },
      {
        header: 'Onsite Responsibilities',
        points: [
          'Arrive at least 30 minutes before prayer time (especially important at Naperville masjids)',
          'Secure parking early',
          'Coordinate with masjid management for table placement and setup location',
          'Set up: table cover, banner, donation box, flyers & cards neatly displayed',
          'Guide volunteers during donation collection',
          'Ensure all materials are organized and accessible',
        ],
      },
      {
        header: 'Escalations',
        points: [
          'Handle operational issues promptly',
          'If necessary, escalate to event organizers',
          'Keep communication open with team',
        ],
      },
    ],
  },
  'Sisters\' volunteer lead': {
    summary: 'The Sisters\' Volunteer Lead has the same operational responsibilities as the Men\'s Lead but on the sisters\' side.',
    sections: [
      {
        header: 'Required Materials',
        points: [
          '1 Donation Box',
          '1 Muslim Ummah Cemetery Banner',
          '1 Table Cover',
          'Flyers',
          'Donation Cards',
        ],
      },
      {
        header: 'Payment Setup',
        points: [
          'Log into the Square app before fundraising begins',
          'Credentials will be provided by Anwar Sultan',
          'Confirm the account is functioning properly',
        ],
      },
      {
        header: 'Backup Device',
        points: [
          'Ensure at least one person has a physical Square device available',
          'Test functionality before the event begins',
        ],
      },
      {
        header: 'Onsite Setup',
        points: [
          'Arrive at least 30 minutes before prayer time',
          'Coordinate with masjid management for table space and setup location',
          'Set up banner, table cover, and donation materials neatly',
          'Ensure smooth donation flow during appeal',
          'Prepare volunteers with clear instructions',
        ],
      },
      {
        header: 'Escalations',
        points: [
          'Volunteers should report to you first for any issues',
          'Address issues professionally and promptly',
          'Escalate to Event Organizer only if necessary',
        ],
      },
    ],
  },
  'Volunteers list': {
    summary: 'General volunteers support the event across all operations under the guidance of the Team Leads.',
    sections: [
      {
        header: 'Your Core Responsibilities',
        points: [
          'Support the Team Leads in all operational tasks',
          'Assist with donation collection and payment processing',
          'Help with setup and teardown of materials',
          'Be available throughout the event duration',
          'Respond to donor questions professionally',
        ],
      },
      {
        header: 'Understanding the Project (Critical)',
        points: [
          'Understand what Muslim Ummah Cemetery is',
          'Know why fundraising is needed',
          'Learn and memorize basic key talking points',
          'Be prepared to explain the project clearly if someone asks',
        ],
      },
      {
        header: 'Payment App Access',
        points: [
          'You may be required to log into the Square app on your phone',
          'Confirm login before the appeal begins',
          'If phone issues occur, coordinate with the Team Lead',
          'Ask questions if unsure about processing a donation',
        ],
      },
      {
        header: 'Professional Conduct',
        points: [
          'Be polite, respectful, and professional at all times',
          'Do not pressure anyone for donations',
          'Make donors feel welcomed and appreciated',
          'Answer questions honestly',
          'If unsure, refer the person to the Team Lead',
        ],
      },
      {
        header: 'Event Arrival & Setup',
        points: [
          'Arrive at least 30 minutes before prayer time',
          'Help with setup: table covers, banners, donation boxes, flyers',
          'Set up materials neatly and visibly',
          'Be ready to assist as directed by Team Lead',
        ],
      },
      {
        header: 'During the Appeal',
        points: [
          'Be present and attentive during the fundraising appeal',
          'Be ready to assist donors immediately after the appeal',
          'Process donations quickly and efficiently',
          'Thank each donor personally',
        ],
      },
      {
        header: 'Escalation Protocol',
        points: [
          'Report any issues to your Team Lead immediately',
          'Team Lead will coordinate with Event Organizer if needed',
          'Work together to resolve problems promptly',
        ],
      },
    ],
  },
};

export function ImportantInfoPanel({ selection }: ImportantInfoPanelProps) {
  const showRoleContent = selection.type === 'role';
  const roleLabel = showRoleContent ? selection.roleLabel : '';
  const roleGuidelines = showRoleContent ? ROLE_GUIDELINES[roleLabel] : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 p-6"
    >
      <div className="flex items-start gap-3 mb-6">
        <div className="p-2 bg-[#EAF3ED] rounded-lg">
          <Info className="w-5 h-5 text-[#1F5A2E]" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-[#1F5A2E] mb-1">
            {showRoleContent ? roleLabel : 'Important Information'}
          </h3>
          <p className="text-sm text-gray-600">
            {showRoleContent
              ? 'Role Guidelines and Responsibilities'
              : 'Click a role label below to view guidelines and responsibilities for that role.'}
          </p>
        </div>
      </div>

      {/* Role Summary - Only show when role is selected */}
      {showRoleContent && roleGuidelines && (
        <div className="p-4 bg-[#EAF3ED] rounded-lg mb-6">
          <h4 className="text-sm font-bold text-[#1F5A2E] mb-2">Role Summary</h4>
          <p className="text-sm text-gray-700">{roleGuidelines.summary}</p>
        </div>
      )}

      {/* Two-column layout - Always visible */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Guidelines - Left Column (Always Visible) */}
        <div className="border-2 border-[#1F5A2E] rounded-lg p-4 bg-[#FAFAFA]">
          <h4 className="text-base font-bold text-[#1F5A2E] mb-4 pb-2 border-b-2 border-[#E5E7EB]">
            {GENERAL_GUIDELINES.title}
          </h4>
          <div className="space-y-4">
            {GENERAL_GUIDELINES.sections.map((section, idx) => (
              <div key={idx}>
                <h5 className="text-sm font-bold text-gray-800 mb-2">{section.header}</h5>
                <ul className="space-y-1.5 ml-4">
                  {section.points.map((point, pidx) => (
                    <li key={pidx} className="text-sm text-gray-700 list-disc">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Primary Responsibilities - Right Column (Conditional) */}
        <div className="border-2 border-[#1F5A2E] rounded-lg p-4 bg-[#FAFAFA]">
          <h4 className="text-base font-bold text-[#1F5A2E] mb-4 pb-2 border-b-2 border-[#E5E7EB]">
            Primary Responsibilities
          </h4>

          <AnimatePresence mode="wait">
            {showRoleContent && roleGuidelines ? (
              <motion.div
                key={roleLabel}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {roleGuidelines.sections.map((section: any, idx: number) => (
                  <div key={idx}>
                    <h5 className="text-sm font-bold text-gray-800 mb-2">{section.header}</h5>
                    <ul className="space-y-1.5 ml-4">
                      {section.points.map((point: string, pidx: number) => (
                        <li key={pidx} className="text-sm text-gray-700 list-disc">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="default"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center h-[300px]"
              >
                <p className="text-gray-500 italic text-center">
                  Select a role above to view role-specific guidelines
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
