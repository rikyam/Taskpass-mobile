import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { format } from 'date-fns';
import { Calendar, Clock, CheckCircle } from 'lucide-react-native';
import { useData } from '../contexts/DataContext';
import { calculateSchedule } from '../utils/dateUtils';

export const DailyScheduleScreen = () => {
  const { tasks, events, updateTask } = useData();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const schedule = useMemo(() => {
    return calculateSchedule(tasks, events, selectedDate);
  }, [tasks, events, selectedDate]);

  const handleCompleteTask = async (taskId) => {
    await updateTask(taskId, { status: 'completed' });
  };

  const getItemColor = (item) => {
    if (item.type === 'event') return '#4A90E2';
    if (item.type === 'travel') return '#F39C12';
    if (item.isLocked) return '#9B59B6';
    return '#2ECC71';
  };

  const getItemIcon = (item) => {
    if (item.type === 'event') return Calendar;
    if (item.type === 'travel') return Clock;
    return CheckCircle;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daily Schedule</Text>
        <Text style={styles.headerDate}>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</Text>
      </View>

      {/* Schedule List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {schedule.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No items scheduled for today</Text>
          </View>
        ) : (
          schedule.map((item, index) => {
            const ItemIcon = getItemIcon(item);
            const color = getItemColor(item);

            return (
              <View key={`${item.id}-${index}`} style={styles.scheduleItem}>
                <View style={[styles.itemIndicator, { backgroundColor: color }]} />

                <View style={styles.itemTime}>
                  <Text style={styles.timeText}>{format(item.start, 'h:mm a')}</Text>
                  <Text style={styles.timeSubtext}>{format(item.end, 'h:mm a')}</Text>
                </View>

                <View style={styles.itemContent}>
                  <View style={styles.itemHeader}>
                    <ItemIcon size={18} color={color} style={styles.itemIcon} />
                    <Text style={styles.itemTitle}>{item.title}</Text>
                  </View>

                  {item.description && (
                    <Text style={styles.itemDescription}>{item.description}</Text>
                  )}

                  <View style={styles.itemTags}>
                    {item.type === 'task' && item.isLocked && (
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>Locked</Text>
                      </View>
                    )}
                    {item.type === 'task' && item.isFloating && (
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>Auto-scheduled</Text>
                      </View>
                    )}
                    {item.type === 'travel' && (
                      <View style={[styles.tag, styles.travelTag]}>
                        <Text style={styles.tagText}>Travel Time</Text>
                      </View>
                    )}
                    {item.priority && (
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>P{item.priority}</Text>
                      </View>
                    )}
                  </View>

                  {item.type === 'task' && item.status === 'pending' && (
                    <TouchableOpacity
                      style={styles.completeButton}
                      onPress={() => handleCompleteTask(item.id)}
                    >
                      <Text style={styles.completeButtonText}>Mark Complete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Stats Footer */}
      <View style={styles.footer}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{schedule.filter(i => i.type === 'task').length}</Text>
          <Text style={styles.statLabel}>Tasks</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{schedule.filter(i => i.type === 'event').length}</Text>
          <Text style={styles.statLabel}>Events</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>
            {schedule.filter(i => i.type === 'task' && i.isFloating).length}
          </Text>
          <Text style={styles.statLabel}>Auto-scheduled</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerDate: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  scheduleItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  itemIndicator: {
    width: 4,
  },
  itemTime: {
    padding: 16,
    minWidth: 90,
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  timeSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  itemContent: {
    flex: 1,
    padding: 16,
    paddingLeft: 0,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemIcon: {
    marginRight: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  itemTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#E8E8E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  travelTag: {
    backgroundColor: '#FFF3E0',
  },
  tagText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  completeButton: {
    backgroundColor: '#2ECC71',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});
