/**
 * PDF Export utility for the fundraising calendar
 * Generates a clean, printable PDF of the current week view with multiple events per day
 *
 * FUNCTIONALITY:
 * - Exports current week view with all events and data
 * - Multiple events per day with bold locked event details
 * - Phone numbers formatted as (XXX) XXX-XXXX in output
 * - Landscape A4 format for optimal viewing
 * - Title includes week date range
 * - Color scheme matches mucemetery.com branding (#1F5A2E green)
 * - Uses html2pdf.js library for PDF generation
 *
 * PDF LAYOUT:
 * - Header: Title and week date range
 * - For each day: All events with their volunteer signups
 * - Locked event details shown in bold
 * - Role-wise volunteer grouping per event
 * - Footer: Generation timestamp
 */

import { format } from 'date-fns';
import { formatWeekRange, formatDayHeader, formatPhone } from './utils-calendar';
import type { DayState, RoleDefinition } from './types';

interface PDFExportData {
  weekStart: Date;
  weekDays: Date[];
  daysData: Record<string, DayState>;
  roles: RoleDefinition[];
}

/**
 * Generate HTML content for PDF export
 */
function generatePDFHTML(data: PDFExportData): string {
  const { weekStart, weekDays, daysData, roles } = data;
  const weekTitle = formatWeekRange(weekStart);

  // Build HTML structure
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          background: white;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #1F5A2E;
          padding-bottom: 15px;
        }
        .header h1 {
          color: #1F5A2E;
          font-size: 24px;
          margin-bottom: 8px;
        }
        .header h2 {
          color: #666;
          font-size: 16px;
          font-weight: normal;
        }
        .day-section {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }
        .day-header {
          background-color: #1F5A2E;
          color: white;
          padding: 10px 15px;
          font-size: 16px;
          font-weight: bold;
          border-radius: 5px 5px 0 0;
        }
        .event-container {
          border: 2px solid #E5E7EB;
          border-top: none;
          padding: 15px;
          background-color: #FAFAFA;
        }
        .event {
          background-color: white;
          border: 1px solid #E5E7EB;
          border-radius: 5px;
          padding: 12px;
          margin-bottom: 15px;
        }
        .event:last-child {
          margin-bottom: 0;
        }
        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 1px solid #E5E7EB;
        }
        .event-title {
          font-size: 14px;
          font-weight: bold;
          color: #1F5A2E;
        }
        .locked-badge {
          display: inline-block;
          background-color: #666;
          color: white;
          padding: 2px 8px;
          border-radius: 3px;
          font-size: 10px;
        }
        .event-details {
          background-color: #EAF3ED;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 12px;
          font-size: 12px;
          white-space: pre-wrap;
        }
        .event-details.locked {
          font-weight: bold;
          background-color: #D3E5D8;
        }
        .role-section {
          margin-bottom: 10px;
        }
        .role-label {
          font-size: 12px;
          font-weight: bold;
          color: #1F5A2E;
          margin-bottom: 6px;
        }
        .volunteers {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .volunteer {
          background-color: #EAF3ED;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 11px;
          display: inline-block;
        }
        .volunteer-name {
          font-weight: bold;
          color: #1F5A2E;
        }
        .volunteer-phone {
          color: #666;
          margin-left: 5px;
        }
        .no-events {
          text-align: center;
          padding: 20px;
          color: #999;
          font-style: italic;
          font-size: 12px;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 10px;
          color: #666;
          border-top: 1px solid #E5E7EB;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Muslim Ummah Cemetery Fundraising Signup</h1>
        <h2>${weekTitle}</h2>
      </div>
  `;

  // Generate content for each day
  weekDays.forEach((day) => {
    const date = day.toISOString().split('T')[0];
    const { dayName, dateStr } = formatDayHeader(day);
    const dayState = daysData[date];
    const events = dayState?.events || [];

    html += `
      <div class="day-section">
        <div class="day-header">${dayName}, ${dateStr}</div>
        <div class="event-container">
    `;

    if (events.length === 0) {
      html += '<div class="no-events">No events scheduled</div>';
    } else {
      events.forEach((event, index) => {
        html += `
          <div class="event">
            <div class="event-header">
              <span class="event-title">Event ${index + 1}</span>
              ${event.locked ? '<span class="locked-badge">🔒 Locked</span>' : ''}
            </div>
        `;

        // Event details
        if (event.details.trim()) {
          html += `
            <div class="event-details ${event.locked ? 'locked' : ''}">
              ${event.details || '<em>No details provided</em>'}
            </div>
          `;
        }

        // Volunteer signups by role
        let hasVolunteers = false;
        roles.forEach((role) => {
          const volunteers = event.roles[role.id] || [];
          if (volunteers.length > 0) {
            hasVolunteers = true;
            html += `
              <div class="role-section">
                <div class="role-label">${role.label}</div>
                <div class="volunteers">
            `;

            volunteers.forEach((volunteer) => {
              html += `
                <div class="volunteer">
                  <span class="volunteer-name">${volunteer.name}</span>
                  <span class="volunteer-phone">${formatPhone(volunteer.phone)}</span>
                </div>
              `;
            });

            html += `
                </div>
              </div>
            `;
          }
        });

        if (!hasVolunteers && !event.details.trim()) {
          html += '<div style="color: #999; font-size: 11px; font-style: italic;">No details or volunteers yet</div>';
        }

        html += '</div>'; // Close event
      });
    }

    html += `
        </div>
      </div>
    `; // Close day-section
  });

  html += `
      <div class="footer">
        Generated on ${format(new Date(), 'MMMM d, yyyy \'at\' h:mm a')}
      </div>
    </body>
    </html>
  `;

  return html;
}

/**
 * Export calendar as PDF
 */
export async function exportCalendarToPDF(data: PDFExportData): Promise<void> {
  try {
    // Dynamically import html2pdf (client-side only)
    const html2pdf = (await import('html2pdf.js')).default;

    // Generate HTML content
    const htmlContent = generatePDFHTML(data);

    // Create a temporary div to hold the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);

    // PDF options
    const options = {
      margin: [10, 10, 10, 10],
      filename: `cemetery-fundraising-${format(data.weekStart, 'yyyy-MM-dd')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    // Generate PDF
    await html2pdf().set(options).from(tempDiv).save();

    // Clean up
    document.body.removeChild(tempDiv);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
}
