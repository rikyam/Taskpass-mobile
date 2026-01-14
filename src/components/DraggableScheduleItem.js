import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { format, addMinutes, setHours, setMinutes, startOfDay } from 'date-fns';
import { MapPin, Lock, Repeat } from 'lucide-react-native';

const HOUR_HEIGHT = 180; // 3px per minute

export const DraggableScheduleItem = ({
  item,
  onUpdateTime,
  currentDate,
  top: initialTop,
  height,
  onPress
}) => {
  const translateY = useSharedValue(0);
  const startY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const calculateNewTime = (yOffset) => {
    // Calculate total offset from original position
    const totalTop = initialTop + yOffset;

    // Convert pixels back to minutes (3px per minute)
    const totalMinutes = Math.round(totalTop / 3);

    // Round to nearest 15 minutes
    const roundedMinutes = Math.round(totalMinutes / 15) * 15;

    // Create new start time
    const dayStart = startOfDay(currentDate);
    const hours = Math.floor(roundedMinutes / 60);
    const mins = roundedMinutes % 60;

    return setMinutes(setHours(dayStart, hours), mins);
  };

  const pan = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      // Only allow vertical dragging
      translateY.value = startY.value + event.translationY;
    })
    .onEnd(() => {
      isDragging.value = false;

      // Calculate new time and update
      const newStartTime = calculateNewTime(translateY.value);
      const duration = (item.end - item.start) / (1000 * 60); // minutes
      const newEndTime = addMinutes(newStartTime, duration);

      // Call the update function
      runOnJS(onUpdateTime)(item, newStartTime, newEndTime);

      // Reset position with spring animation
      translateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    zIndex: isDragging.value ? 1000 : 1,
    opacity: isDragging.value ? 0.8 : 1,
  }));

  // Determine styles based on type
  let bgStyle = styles.bgTask;
  if (item.type === 'travel') bgStyle = styles.bgTravel;
  else if (item.isLocked || item.type === 'event') bgStyle = styles.bgEvent;

  // Don't allow dragging travel time blocks
  const isDraggable = item.type !== 'travel';

  const content = (
    <View style={[styles.itemBase, bgStyle, { height }]}>
      <View style={styles.itemHeader}>
        <Text numberOfLines={1} style={styles.itemTitle}>
          {item.isLocked && <Lock size={10} color="#0f172a" />} {item.title}
        </Text>
        {item.recurrence && item.recurrence.type !== 'none' && (
          <Repeat size={12} color="#475569" />
        )}
      </View>
      <Text style={styles.itemTime}>
        {format(item.start, 'h:mm a')} - {format(item.end, 'h:mm a')}
      </Text>
      {item.location && (
        <View style={styles.locRow}>
          <MapPin size={10} color="#64748b" />
          <Text style={styles.locText}>{item.location}</Text>
        </View>
      )}
      {isDraggable && (
        <View style={styles.dragHandle}>
          <View style={styles.dragLine} />
          <View style={styles.dragLine} />
          <View style={styles.dragLine} />
        </View>
      )}
    </View>
  );

  if (!isDraggable) {
    return content;
  }

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[{ position: 'absolute', left: 60, right: 10, top: initialTop }, animatedStyle]}>
        {content}
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  itemBase: {
    borderRadius: 10,
    padding: 8,
    overflow: 'hidden',
    borderLeftWidth: 4,
    justifyContent: 'center',
  },
  bgEvent: {
    backgroundColor: '#e0f2fe',
    borderLeftColor: '#0ea5e9',
    borderTopWidth: 1,
    borderTopColor: '#e0f2fe',
  },
  bgTask: {
    backgroundColor: 'white',
    borderLeftColor: '#6366f1',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  bgTravel: {
    backgroundColor: '#f1f5f9',
    borderLeftColor: '#94a3b8',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
  },
  itemTime: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locText: {
    fontSize: 10,
    color: '#64748b',
    marginLeft: 4,
  },
  dragHandle: {
    position: 'absolute',
    right: 8,
    top: '50%',
    marginTop: -6,
    gap: 2,
  },
  dragLine: {
    width: 16,
    height: 2,
    backgroundColor: '#cbd5e1',
    borderRadius: 1,
  },
});
