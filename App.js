import { StatusBar } from 'expo-status-bar';
import { DataProvider } from './src/contexts/DataContext';
import { DailyScheduleScreen } from './src/screens/DailyScheduleScreen';

export default function App() {
  return (
    <DataProvider>
      <DailyScheduleScreen />
      <StatusBar style="auto" />
    </DataProvider>
  );
}
