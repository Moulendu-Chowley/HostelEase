# Component Organization & Feature Pages

## 📁 Component Folder Structure

The HostelEase application now follows a well-organized component architecture:

```
components/
├── index.ts                 # Central export file for all components
├── ui/                      # Base UI components
│   ├── Badge.tsx
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── StatCard.tsx
│   └── Table.tsx
├── features/                # Feature-specific components
│   ├── AttendanceLogTable.tsx
│   ├── BudgetCharts.tsx
│   ├── CameraFeed.tsx
│   ├── EventManagement.tsx
│   ├── FacialRecognition.tsx
│   ├── MessManagement.tsx
│   └── RoomCard.tsx
├── layout/                  # Layout components
│   ├── FilterBar.tsx
│   ├── Header.tsx
│   ├── PageContainer.tsx
│   ├── PageHeader.tsx
│   └── Sidebar.tsx
└── shared/                  # Shared utility components
    ├── DataControls.tsx
    └── Utilities.tsx
```

## 🎯 Component Categories

### 1. UI Components (`components/ui/`)

Reusable base UI components used throughout the application:

- **Button** - Primary, secondary, success, danger, warning variants
- **Card** - Content container with gradient support
- **StatCard** - Statistics display card with icons and trends
- **Input** - Form input with label and validation support
- **Modal** - Dialog overlay for forms and confirmations
- **Badge** - Status indicators and tags
- **Table** - Data table with sorting and filtering

### 2. Feature Components (`components/features/`)

Domain-specific components for each feature:

#### Facial Recognition

- **CameraFeed** - Live camera feed component with recognition controls
- **RecognitionStats** - Statistics dashboard for recognition accuracy

#### Attendance

- **AttendanceLogTable** - Entry/exit log with filtering capabilities

#### Room Allocation

- **RoomCard** - Visual room card showing occupancy and student details

#### Mess Management

- **MessSchedule** - Weekly rotation schedule display
- **MessCommittee** - Committee member list and auto-generation

#### Budget Tracking

- **ElectricityChart** - Line chart for electricity usage trends
- **GroceryChart** - Bar chart for grocery expenses
- **BudgetStatBox** - Budget statistics display

#### Event Management

- **PointsTable** - Sports league standings table
- **CaptainSelection** - AI captain selection interface

### 3. Layout Components (`components/layout/`)

Application structure components:

- **Sidebar** - Navigation sidebar with collapsible menu
- **Header** - Top navigation bar with search and profile
- **PageContainer** - Page wrapper with gradient backgrounds
- **PageHeader** - Page title and breadcrumb component
- **FilterBar** - Data filtering controls

### 4. Shared Components (`components/shared/`)

Common utilities used across features:

#### Utilities

- **EmptyState** - No data placeholder
- **LoadingSpinner** - Loading indicator
- **Toast** - Notification messages

#### Data Controls

- **ExportButton** - CSV/PDF export functionality
- **DateRangePicker** - Date range selection

## 🌐 Feature Pages

### Created Standalone Feature Pages:

1. **`/features/facial-recognition`**

   - Full facial recognition interface
   - Live camera feed with AI recognition
   - Attendance log with entry/exit tracking
   - Recognition statistics and accuracy metrics

2. **`/features/room-allocation`**

   - Room allocation dashboard
   - Visual room cards with occupancy status
   - Auto-allocation algorithm controls
   - Floor-wise filtering

3. **`/features/mess-system`**

   - Weekly mess rotation schedule
   - Committee management (5 members)
   - Menu planning interface
   - Rotation history

4. **`/features/budget-tracker`**

   - Electricity and grocery expense charts
   - AI-powered budget predictions
   - 6-month historical comparison
   - Per-student cost breakdown

5. **`/features/sports-events`**

   - Football and Cricket league tables
   - AI captain selection
   - Match scheduling
   - Team formation

6. **`/features/leave-portal`**
   - Leave application form
   - Application status tracking
   - Approval/rejection workflow
   - Leave guidelines

## 🔗 Navigation Integration

### Landing Page (`app/page.tsx`)

Updated with clickable feature cards:

- Each feature card links to its dedicated page
- Hover animations and visual feedback
- "Explore feature" call-to-action

### Dashboard (`app/dashboard/page.tsx`)

Main hub with navigation to:

- All 11 feature sections
- Quick stats overview
- Menu-based navigation

## 📦 Import System

### Centralized Exports (`components/index.ts`)

All components can now be imported from a single location:

```typescript
// ✅ Clean imports
import { Button, Card, StatCard, Modal } from "@/components";
import { CameraFeed, AttendanceLogTable, RoomCard } from "@/components";
import { MessSchedule, PointsTable, ElectricityChart } from "@/components";

// ❌ No need for multiple imports
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
// ...etc
```

## 🎨 Design Patterns

### Consistent Styling

- Gradient backgrounds for visual appeal
- Tailwind CSS utility classes
- Framer Motion animations
- Responsive grid layouts

### Component Props

- TypeScript interfaces for type safety
- Optional props with defaults
- Event handlers for interactivity
- Flexible styling options

### Animation System

- Entrance animations with Framer Motion
- Staggered delays for lists
- Hover effects on interactive elements
- Smooth transitions

## 🚀 Usage Examples

### Using UI Components

```typescript
<Button variant="primary" icon={<FiSave />} onClick={handleSave}>
  Save Changes
</Button>

<StatCard
  title="Total Students"
  value="160"
  change="+12"
  icon={FiUsers}
  color="from-blue-500 to-indigo-600"
/>
```

### Using Feature Components

```typescript
<CameraFeed
  isActive={cameraActive}
  onToggle={() => setCameraActive(!cameraActive)}
  onRecognition={(name) => setRecognizedPerson(name)}
/>

<AttendanceLogTable
  filter={selectedFilter}
  onFilterChange={setSelectedFilter}
/>
```

### Using Layout Components

```typescript
<PageContainer gradient="from-blue-50 to-indigo-50">
  <PageHeader
    title="Attendance System"
    subtitle="AI-powered tracking"
    icon="📸"
  />
  {/* Page content */}
</PageContainer>
```

## 🔄 Migration Progress

### ✅ Completed

- Created component folder structure
- Built all UI components
- Created feature-specific components
- Set up layout components
- Built shared utilities
- Created 6 dedicated feature pages
- Updated landing page with feature links
- Created central export file

### 🔄 In Progress

- Fixing TypeScript prop errors in new pages
- Refactoring dashboard pages to use components

### 📋 Next Steps

1. Fix component prop interfaces
2. Refactor existing dashboard pages
3. Add more shared components as needed
4. Create component documentation
5. Add unit tests for components

## 📊 Component Reusability

Components are designed to be highly reusable:

- **StatCard** - Used in all feature pages for metrics
- **Button** - Consistent CTA across application
- **Modal** - Reused for forms and confirmations
- **FilterBar** - Common filtering interface
- **PageHeader** - Standard page titles

## 🎯 Benefits

1. **Code Organization** - Clear separation of concerns
2. **Reusability** - Write once, use everywhere
3. **Maintainability** - Easy to update and debug
4. **Type Safety** - TypeScript interfaces prevent errors
5. **Consistency** - Uniform UI/UX across features
6. **Scalability** - Easy to add new components
7. **Developer Experience** - Clean imports, better DX

## 🔧 Technology Stack

- **React 18** - Component library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **Lucide React** - Icon library
- **Next.js 14** - Framework with App Router

---

This component organization provides a solid foundation for building and maintaining the HostelEase application with maximum efficiency and minimal code duplication.
