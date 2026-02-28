# Muslim Ummah Cemetery Fundraising Signup Calendar

A production-ready weekly calendar signup system for coordinating cemetery fundraising volunteers, built with Next.js, TypeScript, and modern UI components.

![Version](https://img.shields.io/badge/version-1.0.0-green)
![Next.js](https://img.shields.io/badge/Next.js-16.1.6-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## 🌟 Features

### Calendar View
- **Weekly Layout**: Monday-Sunday view with accurate date computation
- **Smart Navigation**:
  - Previous/Next week arrows
  - "Today" button to jump to current week
  - Navigation bounds: Past 2 weeks to future 3 months
- **Smooth Animations**: Slide transitions when changing weeks (powered by Framer Motion)

### Event Management
- **Event Details Row**: Add event information for each day
- **Lock/Unlock System**:
  - Lock event details to prevent accidental changes
  - Confirmation modal required to unlock
  - Visual indicators (lock icon and badge)

### Role Management
- **4 Default Roles**:
  1. Fundraising appeal coordinator
  2. Men's volunteer lead
  3. Sisters' volunteer lead
  4. Volunteers list
- **Custom Roles**: Add unlimited custom roles via "+ Add role" button
- **Role Guidelines**: Click any role label to view specific guidelines in the information panel

### Volunteer Signup
- **Easy Registration**: Name and phone number inputs for each day/role
- **Phone Formatting**: Automatic formatting as (XXX) XXX-XXXX while typing
- **Validation**: Requires 10-digit phone numbers
- **Duplicate Prevention**: Blocks identical name+phone combinations within same role/day
- **Visual Chips**: Volunteers displayed as removable chips/tags
- **Unlimited Entries**:
  - Chips wrap naturally within cells
  - Dynamic cell height expansion
  - Internal scroll for very tall cells (10+ volunteers)

### Export & Sharing
- **PDF Export**: Generate clean, printable PDFs with:
  - All week data (events, volunteers, phone numbers)
  - Professional layout matching brand colors
  - Filename: `cemetery-fundraising-YYYY-MM-DD.pdf`

### Design & UX
- **Brand Colors** (matching mucemetery.com):
  - Primary green: `#1F5A2E`
  - Hover: `#154021`
  - Highlight: `#EAF3ED`
- **Responsive Design**:
  - Desktop: Full grid view
  - Mobile: Horizontal scroll with sticky role column
- **Accessibility**:
  - Keyboard navigation support
  - ARIA labels on interactive elements
  - High contrast text
  - Focus management in modals

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000 in your browser
```

## 🏗️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Date Utilities**: date-fns
- **PDF Generation**: html2pdf.js
- **Icons**: Lucide React

## 📦 Project Structure

```
cemetery-fundraising/
├── app/
│   ├── page.tsx              # Main page component
│   └── globals.css           # Global styles
├── components/
│   ├── CalendarGrid.tsx      # Main calendar component with state management
│   ├── WeekHeader.tsx        # Navigation and day headers
│   ├── EventDetailsCell.tsx  # Event details with lock/unlock
│   ├── RoleRow.tsx           # Role signup rows with volunteer chips
│   ├── AddRoleDialog.tsx     # Modal for adding custom roles
│   ├── ImportantInfoPanel.tsx # Role and day guidelines display
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── types.ts              # TypeScript interfaces
│   ├── utils-calendar.ts     # Date and phone utilities
│   ├── pdf-export.ts         # PDF generation logic
│   └── utils.ts              # General utilities
└── README.md
```

## 🔑 Key Components

### CalendarGrid
Main component managing:
- Week navigation and bounds
- Event details for all days
- Volunteer signups across all roles
- PDF export coordination
- Animated transitions

### RoleRow
Handles volunteer signup for each role:
- Phone number auto-formatting
- Duplicate validation
- Chip display with wrapping
- Remove functionality

### EventDetailsCell
Manages event details:
- Textarea for event information
- Lock/unlock toggle
- Confirmation modal
- Visual status indicators

## 📱 Responsive Behavior

### Desktop (≥768px)
- Full grid layout visible
- All 7 days displayed side-by-side
- Fixed role column on left

### Mobile (<768px)
- Horizontal scroll enabled
- Sticky role column
- Minimum width enforced for usability
- Touch-friendly controls

## 🎨 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Green | `#1F5A2E` | Buttons, headers, accents |
| Dark Green | `#154021` | Hover states |
| Light Green | `#EAF3ED` | Highlights, backgrounds |
| Border | `#E5E7EB` | Cell borders |
| Background | `#FFFFFF` | Page background |

## 🔧 Configuration

### Navigation Bounds
Edit in `lib/utils-calendar.ts`:
```typescript
export function getNavigationBounds(): NavigationBounds {
  const today = new Date();
  const minDate = getWeekStart(subWeeks(today, 2));  // Past 2 weeks
  const maxDate = addWeeks(today, 12);                // Future 3 months
  return { minDate, maxDate };
}
```

### Default Roles
Edit in `lib/utils-calendar.ts`:
```typescript
export function getDefaultRoles(): RoleDefinition[] {
  return [
    { id: 'role-1', label: 'Fundraising appeal coordinator', isDefault: true },
    { id: 'role-2', label: 'Men\'s volunteer lead', isDefault: true },
    { id: 'role-3', label: 'Sisters\' volunteer lead', isDefault: true },
    { id: 'role-4', label: 'Volunteers list', isDefault: true },
  ];
}
```

### Role Guidelines
Edit in `components/ImportantInfoPanel.tsx`:
```typescript
const ROLE_INFO: Record<string, { description: string; guidelines: string[] }> = {
  'Role Name': {
    description: 'Role description',
    guidelines: ['Guideline 1', 'Guideline 2', ...],
  },
};
```

## 💾 Data Persistence

Currently, all data is stored in local component state. For production use, consider adding:

### Option 1: Local Storage
```typescript
// Save to localStorage
useEffect(() => {
  localStorage.setItem('calendar-data', JSON.stringify({ daysData, roles }));
}, [daysData, roles]);
```

### Option 2: Backend API
- Add POST/GET endpoints for saving/loading data
- Use React Query or SWR for data fetching
- Implement user authentication

### Option 3: Database
- Supabase for PostgreSQL + real-time updates
- Firebase for NoSQL + authentication
- MongoDB for flexible schema

## 🧪 Scripts

```bash
# Development
npm run dev          # Start dev server at localhost:3000

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npx tsc --noEmit    # Type check
```

## 📝 Usage Guide

1. **Navigate Weeks**: Use Previous/Next arrows or "Today" button
2. **Add Event Details**: Type event info in the top row for each day
3. **Lock Events**: Click lock icon to prevent changes (unlock requires confirmation)
4. **Sign Up Volunteers**: Enter name and phone, click "Add"
5. **Remove Volunteers**: Click × on any volunteer chip
6. **Add Custom Roles**: Click "+ Add role" button below the grid
7. **View Guidelines**: Click any role label to see role-specific information
8. **Export PDF**: Click "Export PDF" button in top-right corner

## 🎯 Future Enhancements

- [ ] Data persistence (localStorage/backend)
- [ ] User authentication
- [ ] Email notifications to volunteers
- [ ] SMS reminders
- [ ] Multi-organization support
- [ ] Historical data view
- [ ] Analytics dashboard
- [ ] Export to Excel/CSV
- [ ] Print view optimization
- [ ] Dark mode support

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Design inspired by mucemetery.com
- Built with shadcn/ui components
- Icons by Lucide React

---

**Built with ❤️ for the Muslim Ummah Cemetery**
