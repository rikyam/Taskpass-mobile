import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { PomoProvider } from './src/contexts/PomoContext';
import ScheduleScreen from './src/screens/ScheduleScreen';

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleEditItem = (item) => {
    console.log('Edit item:', item);
    // TODO: Add edit modal
  };

  return (
    <PomoProvider>
      <ScheduleScreen
        currentDate={currentDate}
        onEditItem={handleEditItem}
      />
      <StatusBar style="auto" />
    </PomoProvider>
  );
}
