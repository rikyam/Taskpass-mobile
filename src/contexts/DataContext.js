import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksData, eventsData] = await Promise.all([
        AsyncStorage.getItem('tasks'),
        AsyncStorage.getItem('events')
      ]);

      if (tasksData) setTasks(JSON.parse(tasksData));
      if (eventsData) setEvents(JSON.parse(eventsData));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTasks = async (newTasks) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(newTasks));
      setTasks(newTasks);
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const saveEvents = async (newEvents) => {
    try {
      await AsyncStorage.setItem('events', JSON.stringify(newEvents));
      setEvents(newEvents);
    } catch (error) {
      console.error('Error saving events:', error);
    }
  };

  const addTask = async (task) => {
    const newTask = {
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...task
    };
    await saveTasks([...tasks, newTask]);
  };

  const updateTask = async (id, updates) => {
    const updated = tasks.map(t => t.id === id ? { ...t, ...updates } : t);
    await saveTasks(updated);
  };

  const deleteTask = async (id) => {
    await saveTasks(tasks.filter(t => t.id !== id));
  };

  const addEvent = async (event) => {
    const newEvent = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...event
    };
    await saveEvents([...events, newEvent]);
  };

  const updateEvent = async (id, updates) => {
    const updated = events.map(e => e.id === id ? { ...e, ...updates } : e);
    await saveEvents(updated);
  };

  const deleteEvent = async (id) => {
    await saveEvents(events.filter(e => e.id !== id));
  };

  const value = {
    tasks,
    events,
    loading,
    addTask,
    updateTask,
    deleteTask,
    addEvent,
    updateEvent,
    deleteEvent
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
