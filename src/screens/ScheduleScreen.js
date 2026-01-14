import React, { useRef, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { format, isSameDay, differenceInMinutes } from 'date-fns';
import { usePomoStore } from '../contexts/PomoContext';
import { calculateSchedule } from '../utils/dateUtils';
import { DraggableScheduleItem } from '../components/DraggableScheduleItem';

const HOUR_HEIGHT = 180; // 3px per minute * 60

export default function ScheduleScreen({ currentDate, onEditItem }) {
  const { tasks, events, updateTask, updateEvent, loading } = usePomoStore();
  const scrollViewRef = useRef(null);

  const viewItems = useMemo(() => {
    if (loading) return [];
    return calculateSchedule(tasks, events, currentDate);
  }, [tasks, events, currentDate, loading]);

  const handleUpdateTime = (item, newStart, newEnd) => {
    // Don't allow rescheduling travel time or locked items
    if (item.type === 'travel' || item.isLocked) return;

    const updates = {
      start: newStart.toISOString(),
      end: newEnd.toISOString(),
    };

    // For floating tasks, convert to locked task with new time
    if (item.type === 'task' && !item.isLocked) {
      updates.isLocked = true;
      updates.lockedStart = newStart.toISOString();
    }

    if (item.type === 'event') {
      updateEvent(item.id, updates);
    } else if (item.type === 'task') {
      // Update the locked start time for tasks
      updateTask(item.id, { ...updates, lockedStart: newStart.toISOString(), isLocked: true });
    }
  };

  const renderTimeGrid = () => {
    return Array.from({ length: 24 }).map((_, i) => (
      <View key={i} style={[styles.hourRow, { top: i * HOUR_HEIGHT }]}>
        <Text style={styles.hourLabel}>{i === 0 ? '12 AM' : i === 12 ? '12 PM' : i > 12 ? `${i-12} PM` : `${i} AM`}</Text>
        <View style={styles.hourLine} />
      </View>
    ));
  };

  const renderItem = (item, index) => {
    const startMins = item.start.getHours() * 60 + item.start.getMinutes();
    const duration = Math.max(15, differenceInMinutes(item.end, item.start));
    const top = startMins * 3;
    const height = duration * 3;

    return (
      <DraggableScheduleItem
        key={item.id || `travel-${item.parentId}-${index}`}
        item={item}
        onUpdateTime={handleUpdateTime}
        currentDate={currentDate}
        top={top}
        height={height}
        onPress={onEditItem}
      />
    );
  };

  if (loading) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading schedule...</Text>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ height: 24 * HOUR_HEIGHT }}
        showsVerticalScrollIndicator={false}
      >
        {renderTimeGrid()}
        {/* Current Time Line */}
        {isSameDay(currentDate, new Date()) && (
           <View style={[styles.currentTimeLine, { top: (new Date().getHours() * 60 + new Date().getMinutes()) * 3 }]} />
        )}
        {viewItems.map((item, index) => renderItem(item, index))}
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  hourRow: { position: 'absolute', width: '100%', flexDirection: 'row', alignItems: 'center', height: 1 },
  hourLabel: { width: 50, textAlign: 'right', fontSize: 10, color: '#94a3b8', paddingRight: 8 },
  hourLine: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  currentTimeLine: { position: 'absolute', width: '100%', left: 50, height: 2, backgroundColor: '#ef4444', zIndex: 50 },
});
