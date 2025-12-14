# Create Event Page

This directory contains the refactored event creation flow, broken down into modular, reusable components.

## Directory Structure

```
create-event/
├── index.tsx                    # Main orchestrator component
├── README.md                    # This file
├── components/                  # Shared UI components
│   ├── index.ts                # Component exports
│   ├── event-creation-stepper.tsx  # Progress stepper
│   ├── step-navigation.tsx     # Previous/Next navigation
│   ├── poll-question-input.tsx # Poll question input field
│   └── poll-options-list.tsx   # Dynamic poll options list
└── steps/                       # Individual step components
    ├── index.ts                # Step exports
    ├── basic-info-step.tsx     # Step 1: Title & Description
    ├── date-time-step.tsx      # Step 2: Start & End dates
    ├── location-step.tsx       # Step 3: Event location
    ├── poll-step.tsx           # Step 4: Optional poll
    └── review-step.tsx         # Step 5: Review & Submit
```

## Component Breakdown

### Main Component (`index.tsx`)
- **Lines**: ~190 (reduced from 767)
- **Responsibilities**:
  - State management (form, poll, navigation)
  - Step validation logic
  - Form submission handler
  - Step rendering orchestration

### Step Components (`steps/`)

#### 1. BasicInfoStep
- Event title (required)
- Event description (optional)
- Uses: Input, Textarea components

#### 2. DateTimeStep
- Start date & time (required)
- End date & time (optional)
- Uses: Calendar, Popover, Input components
- Features: Time preservation when changing dates

#### 3. LocationStep
- Location input (optional)
- Supports physical addresses or virtual events
- Uses: Input component

#### 4. PollStep
- Toggle to include/exclude poll
- Poll question input
- Dynamic poll options (2-10)
- Poll settings (multiple choice, anonymous)
- Uses: Switch, PollQuestionInput, PollOptionsList
- Exports: `PollData` type

#### 5. ReviewStep
- Read-only summary of all entered data
- Displays formatted dates
- Shows poll summary if included
- Uses: Badge component for poll options

### Shared Components (`components/`)

#### EventCreationStepper
- Visual progress indicator
- Shows current step, completed steps
- Progress bar
- Responsive design

#### StepNavigation
- Previous/Next buttons
- Submit button on final step
- Disabled states for boundary conditions
- Loading state during submission

#### PollQuestionInput
- Simple wrapper for poll question input
- Reusable across poll-related features

#### PollOptionsList
- Dynamic list of poll options
- Add/remove option functionality
- Drag handle visual indicator
- Hover effects for remove button
- Enforces min (2) and max (10) options

## Data Flow

### Form State
Managed by `react-hook-form` with Zod validation:
```typescript
interface CreateEventInput {
  title: string
  description?: string
  location?: string
  startDate: Date
  endDate?: Date
}
```

### Poll State
Managed by React `useState`:
```typescript
interface PollData {
  question: string
  options: string[]
  allowMultiple: boolean
  isAnonymous: boolean
}
```

### Step Validation

Each step validates specific fields:
- **Step 1**: `title`, `description`
- **Step 2**: `startDate`, `endDate`
- **Step 3**: `location`
- **Step 4**: Poll validation (if enabled)
- **Step 5**: No validation (review only)

## Usage

```typescript
import { CreateEventPage } from "@/app-pages/create-event"

<CreateEventPage tribeId={tribeId} />
```

## Benefits of This Structure

✅ **Maintainability**: Each component has a single responsibility
✅ **Reusability**: Stepper and poll components can be reused elsewhere
✅ **Testability**: Easier to unit test individual components
✅ **Readability**: 190 lines vs 767 lines in main component
✅ **Scalability**: Easy to add new steps or modify existing ones
✅ **Type Safety**: Proper TypeScript types throughout

## Future Improvements

- [ ] Implement API endpoint for event creation
- [ ] Add form auto-save to localStorage
- [ ] Add support for recurring events
- [ ] Add event cover image upload
- [ ] Add attendee limit setting
- [ ] Extract poll components to shared location for reuse in posts
