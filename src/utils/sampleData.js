import { setHours, setMinutes, addDays } from 'date-fns';

export const getSampleTasks = () => {
  const today = new Date();

  return [
    {
      id: 't-1',
      title: 'Morning Workout',
      description: 'Gym session',
      duration: 60,
      priority: 1,
      status: 'pending',
      startDate: today.toISOString(),
      isLocked: false,
    },
    {
      id: 't-2',
      title: 'Review Code PR',
      description: 'Check pull requests',
      duration: 45,
      priority: 2,
      status: 'pending',
      startDate: today.toISOString(),
      isLocked: false,
    },
    {
      id: 't-3',
      title: 'Lunch Break',
      description: 'Prepare and eat lunch',
      duration: 60,
      priority: 3,
      status: 'pending',
      startDate: today.toISOString(),
      isLocked: true,
      lockedStart: setMinutes(setHours(today, 12), 0).toISOString(),
    },
    {
      id: 't-4',
      title: 'Write Documentation',
      description: 'Update API docs',
      duration: 90,
      priority: 2,
      status: 'pending',
      startDate: today.toISOString(),
      isLocked: false,
    },
  ];
};

export const getSampleEvents = () => {
  const today = new Date();

  return [
    {
      id: 'ev-1',
      title: 'Team Standup',
      description: 'Daily sync meeting',
      start: setMinutes(setHours(today, 9), 0).toISOString(),
      end: setMinutes(setHours(today, 9), 30).toISOString(),
      location: 'Zoom',
      travelTimeBefore: 0,
      travelTimeAfter: 0,
    },
    {
      id: 'ev-2',
      title: 'Client Meeting',
      description: 'Project review with client',
      start: setMinutes(setHours(today, 14), 0).toISOString(),
      end: setMinutes(setHours(today, 15), 0).toISOString(),
      location: 'Office Building A',
      travelTimeBefore: 15,
      travelTimeAfter: 15,
    },
    {
      id: 'ev-3',
      title: 'Design Review',
      description: 'Review new UI mockups',
      start: setMinutes(setHours(today, 16), 30).toISOString(),
      end: setMinutes(setHours(today, 17), 30).toISOString(),
      location: 'Conference Room',
      travelTimeBefore: 0,
      travelTimeAfter: 0,
    },
  ];
};
