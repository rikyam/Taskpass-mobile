import React, { useRef, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { format, isSameDay, differenceInMinutes, startOfDay } from 'date-fns';
import { MapPin, Lock, Repeat, Edit2 } from 'lucide-react-native';
import { usePomoStore } from '../contexts/PomoContext';
import { calculateSchedule } from '../utils/dateUtils';

const HOUR_HEIGHT = 180; // 3px per minute * 60

export default function ScheduleScreen({ currentDate, onEditItem }) {
  const { tasks, events } = usePomoStore();
  const scrollViewRef = useRef(null);

  const viewItems = useMemo(() => calculateSchedule(tasks, events, currentDate), [tasks, events, currentDate]);

  const renderTimeGrid = () => {
    return Array.from({ length: 24 }).map((_, i) => (
      <View key={i} style={[styles.hourRow, { top: i * HOUR_HEIGHT }]}>
        <Text style={styles.hourLabel}>{i === 0 ? '12 AM' : i === 12 ? '12 PM' : i > 12 ? `${i-12} PM` : `${i} AM`}</Text>
        <View style={styles.hourLine} />
      </View>
    ));
  };

  const renderItem = (item) => {
    const startMins = item.start.getHours() * 60 + item.start.getMinutes();
    const duration = Math.max(15, differenceInMinutes(item.end, item.start));
    const top = startMins * 3;
    const height = duration * 3;

    // Styles based on type
    let itemStyle = styles.itemBase;
    let bgStyle = styles.bgTask;

    if (item.type === 'travel') bgStyle = styles.bgTravel;
    else if (item.isLocked || item.type === 'event') bgStyle = styles.bgEvent;

    return (
      <TouchableOpacity
        key={item.id || `travel-${item.parentId}-${item.start}`}
        style={[itemStyle, bgStyle, { top, height }]}
        onPress={() => item.type !== 'travel' && onEditItem(item)}
        activeOpacity={0.8}
      >
        <View style={styles.itemHeader}>
           <Text numberOfLines={1} style={styles.itemTitle}>
             {item.isLocked && <Lock size={10} color="#0f172a" />} {item.title}
           </Text>
           {item.recurrence && item.recurrence.type !== 'none' && <Repeat size={12} color="#475569" />}
        </View>
        <Text style={styles.itemTime}>{format(item.start, 'h:mm a')} - {format(item.end, 'h:mm a')}</Text>
        {item.location && <View style={styles.locRow}><MapPin size={10} color="#64748b" /><Text style={styles.locText}>{item.location}</Text></View>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
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
        {viewItems.map(renderItem)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  hourRow: { position: 'absolute', width: '100%', flexDirection: 'row', alignItems: 'center', height: 1 },
  hourLabel: { width: 50, textAlign: 'right', fontSize: 10, color: '#94a3b8', paddingRight: 8 },
  hourLine: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  currentTimeLine: { position: 'absolute', width: '100%', left: 50, height: 2, backgroundColor: '#ef4444', zIndex: 50 },

  itemBase: {
    position: 'absolute', left: 60, right: 10, borderRadius: 10, padding: 8, overflow: 'hidden',
    borderLeftWidth: 4, justifyContent: 'center'
  },
  bgEvent: { backgroundColor: '#e0f2fe', borderLeftColor: '#0ea5e9', borderTopWidth: 1, borderTopColor: '#e0f2fe' },
  bgTask: { backgroundColor: 'white', borderLeftColor: '#6366f1', borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  bgTravel: { backgroundColor: '#f1f5f9', borderLeftColor: '#94a3b8', borderStyle: 'dashed', borderWidth: 1, borderColor: '#cbd5e1' },

  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  itemTitle: { fontSize: 12, fontWeight: '700', color: '#0f172a', flex: 1 },
  itemTime: { fontSize: 10, color: '#64748b', fontWeight: '600' },
  locRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  locText: { fontSize: 10, color: '#64748b', marginLeft: 4 }
});
