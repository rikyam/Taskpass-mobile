import {
  addMinutes, startOfDay, isBefore, isSameDay, differenceInDays,
  differenceInWeeks, getDay, startOfWeek, differenceInMonths,
  getDate, startOfMonth, parseISO, isValid, setHours, setMinutes,
  differenceInMinutes, isAfter, areIntervalsOverlapping
} from 'date-fns';

export const safeParseDate = (date) => {
  if (!date) return new Date();
  if (date instanceof Date) return date;
  const parsed = parseISO(date);
  return isValid(parsed) ? parsed : new Date();
};

export const getNext15MinuteSlot = (date) => {
  const minutes = date.getMinutes();
  const remainder = 15 - (minutes % 15);
  const minutesToAdd = remainder === 15 ? 0 : remainder;
  return addMinutes(date, minutesToAdd);
};

// --- Recurrence Logic ---
export const isOccurrence = (item, viewDate) => {
  const start = safeParseDate(item.start || item.startDate);
  const viewStart = startOfDay(viewDate);
  const itemStartDay = startOfDay(start);

  if (isBefore(viewStart, itemStartDay)) return false;

  const recurrence = item.recurrence || { type: 'none' };

  if (recurrence.type === 'none') return isSameDay(viewStart, itemStartDay);

  const interval = recurrence.interval || 1;

  if (recurrence.type === 'daily') {
    const diff = differenceInDays(viewStart, itemStartDay);
    return diff % interval === 0;
  }

  if (recurrence.type === 'weekly') {
    const weekDiff = differenceInWeeks(startOfWeek(viewStart), startOfWeek(itemStartDay));
    if (weekDiff % interval !== 0) return false;
    const currentDayOfWeek = getDay(viewDate);
    return recurrence.days?.includes(currentDayOfWeek);
  }

  if (recurrence.type === 'monthly') {
    const monthDiff = differenceInMonths(viewStart, itemStartDay);
    if (monthDiff % interval !== 0) return false;

    if (recurrence.monthType === 'specific') {
        const currentDay = getDay(viewDate);
        const targetDay = recurrence.specificDay !== undefined ? recurrence.specificDay : getDay(start);
        if (currentDay !== targetDay) return false;

        const dayOfMonth = getDate(viewDate);
        const weekIndex = Math.ceil(dayOfMonth / 7);
        const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
        const isLast = (dayOfMonth + 7) > daysInMonth;
        const ordinals = recurrence.specificOrdinals || [];
        return ordinals.includes(weekIndex) || (ordinals.includes('last') && isLast);
    }

    if (recurrence.monthType === 'relative') {
        const startWeekIndex = Math.ceil(getDate(start) / 7);
        const currentWeekIndex = Math.ceil(getDate(viewDate) / 7);
        return getDay(viewDate) === getDay(start) && currentWeekIndex === startWeekIndex;
    }
    return getDate(viewDate) === getDate(start);
  }
  return false;
};

// --- Scheduler Logic ---
export const calculateSchedule = (tasks, events, simulatedTime) => {
    const safeTime = safeParseDate(simulatedTime);
    const dayStart = startOfDay(safeTime);

    // 1. Process Fixed Events
    const blockers = events.filter(e => isOccurrence(e, safeTime)).map(e => {
        const start = safeParseDate(e.start);
        const end = safeParseDate(e.end);

        // Normalize to current view day
        const currentDayStart = setHours(setMinutes(dayStart, start.getMinutes()), start.getHours());
        const duration = differenceInMinutes(end, start);
        const currentDayEnd = addMinutes(currentDayStart, duration);

        return {
            ...e,
            start: currentDayStart,
            end: currentDayEnd,
            type: 'event',
            isTravel: false
        };
    });

    // 2. Add Travel Time
    const travelItems = [];
    blockers.forEach(e => {
      // Find original event to get travel data
      const original = events.find(ev => ev.id === e.id);
      if (!original) return;

      if (original.travelTimeBefore) {
        const tStart = addMinutes(e.start, -original.travelTimeBefore);
        travelItems.push({
            start: tStart, end: e.start, type: 'travel', title: 'Travel', parentId: e.id, isTravel: true
        });
      }
      if (original.travelTimeAfter) {
        const tEnd = addMinutes(e.end, original.travelTimeAfter);
        travelItems.push({
            start: e.end, end: tEnd, type: 'travel', title: 'Travel', parentId: e.id, isTravel: true
        });
      }
    });

    // Combine for collision detection
    const allBlockers = [...blockers, ...travelItems].sort((a, b) => a.start - b.start);

    // 3. Schedule Floating Tasks
    const pendingTasks = tasks.filter(t =>
        t.status === 'pending' &&
        (isOccurrence(t, safeTime) || (t.startDate && isBefore(safeParseDate(t.startDate), dayStart) && !t.recurrence))
    );

    // Filter locked vs floating
    const lockedTasks = pendingTasks.filter(t => t.isLocked).map(t => {
         const start = safeParseDate(t.lockedStart);
         const s = setHours(setMinutes(dayStart, start.getMinutes()), start.getHours());
         return { ...t, start: s, end: addMinutes(s, t.duration), type: 'task', isLocked: true };
    });

    allBlockers.push(...lockedTasks);
    allBlockers.sort((a, b) => a.start - b.start);

    const scheduled = [];
    let flowTasks = pendingTasks.filter(t => !t.isLocked).sort((a, b) => (a.priority || 999) - (b.priority || 999));

    let cursor = isSameDay(new Date(), safeTime) ? getNext15MinuteSlot(new Date()) : setMinutes(setHours(dayStart, 9), 0);
    if (isBefore(cursor, setMinutes(setHours(dayStart, 0), 0))) cursor = setMinutes(setHours(dayStart, 9), 0);

    let safety = 0;
    while (flowTasks.length > 0 && safety < 100) {
      safety++;
      const nextBlocker = allBlockers.find(b => isAfter(b.start, cursor) || areIntervalsOverlapping({start: cursor, end: addMinutes(cursor, 1)}, {start: b.start, end: b.end}));

      if (nextBlocker && areIntervalsOverlapping({start: cursor, end: addMinutes(cursor, 1)}, {start: nextBlocker.start, end: nextBlocker.end})) {
        cursor = getNext15MinuteSlot(nextBlocker.end);
        continue;
      }

      const timeUntilBlocker = nextBlocker ? differenceInMinutes(nextBlocker.start, cursor) : 9999;
      const fitIndex = flowTasks.findIndex(t => t.duration <= timeUntilBlocker);

      if (fitIndex >= 0) {
        const task = flowTasks[fitIndex];
        const start = cursor;
        const end = addMinutes(cursor, task.duration);
        scheduled.push({ ...task, start, end, isFloating: true, type: 'task' });
        flowTasks.splice(fitIndex, 1);
        cursor = end;
      } else {
        if (nextBlocker) cursor = nextBlocker.end;
        else break;
      }
    }

    return [...allBlockers, ...scheduled].sort((a,b) => a.start - b.start);
};
