# Taskpass Mobile

A React Native web app for intelligent task scheduling and calendar management with automatic time allocation.

## Features

- **Smart Task Scheduling**: Automatically schedules floating tasks around fixed events
- **Recurrence Patterns**: Support for daily, weekly, and monthly recurring tasks and events
- **Travel Time Management**: Add buffer time before/after events for travel
- **Priority-Based Scheduling**: Tasks are scheduled based on priority
- **Locked vs Floating Tasks**: Pin tasks to specific times or let the system auto-schedule
- **Cross-Platform**: Runs on iOS, Android, and web

## Tech Stack

- **React Native (Expo)**: Cross-platform mobile framework
- **date-fns**: Modern date manipulation library
- **lucide-react-native**: Beautiful icon library
- **AsyncStorage**: Local data persistence
- **react-native-svg**: SVG support for icons

## Getting Started

### Installation

```bash
npm install
```

### Running the App

**Web:**
```bash
npm run web
```

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

## Project Structure

```
src/
├── contexts/
│   └── DataContext.js       # Global state management for tasks/events
├── screens/
│   └── DailyScheduleScreen.js  # Main daily schedule view
└── utils/
    └── dateUtils.js         # Date manipulation and scheduling algorithms
```

## Key Concepts

### Task Types

- **Floating Tasks**: Auto-scheduled by the system to fit around events
- **Locked Tasks**: Fixed to a specific time slot

### Recurrence Types

- **None**: One-time occurrence
- **Daily**: Repeats every N days
- **Weekly**: Repeats on specific days of the week
- **Monthly**: Repeats on specific dates or relative positions (e.g., "2nd Tuesday")

### Scheduling Algorithm

The app uses a sophisticated scheduling algorithm that:
1. Places fixed events and locked tasks first
2. Adds travel time buffers around events
3. Auto-schedules floating tasks based on priority
4. Finds optimal 15-minute time slots
5. Respects existing commitments and conflicts

## Data Models

### Task
```javascript
{
  id: string,
  title: string,
  description?: string,
  duration: number,        // in minutes
  priority?: number,       // lower is higher priority
  status: 'pending' | 'completed',
  isLocked?: boolean,
  lockedStart?: Date,
  startDate?: Date,
  recurrence?: RecurrencePattern
}
```

### Event
```javascript
{
  id: string,
  title: string,
  description?: string,
  start: Date,
  end: Date,
  travelTimeBefore?: number,  // minutes
  travelTimeAfter?: number,   // minutes
  recurrence?: RecurrencePattern
}
```

### RecurrencePattern
```javascript
{
  type: 'none' | 'daily' | 'weekly' | 'monthly',
  interval?: number,
  days?: number[],           // for weekly (0=Sunday, 6=Saturday)
  monthType?: 'specific' | 'relative',
  specificDay?: number,
  specificOrdinals?: number[] | 'last'
}
```

## Development

The app is built with React Native Expo, which provides:
- Hot reloading for fast development
- Easy deployment to web, iOS, and Android
- Built-in development tools

## Future Enhancements

- Add task creation UI
- Event management interface
- Calendar view with multiple date navigation
- Task completion tracking and analytics
- Push notifications for upcoming tasks
- Sync across devices
- Drag-and-drop task rescheduling

## License

MIT
