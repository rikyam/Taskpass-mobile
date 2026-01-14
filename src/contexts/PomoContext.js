import React, { useState, useEffect, useContext, createContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PomoContext = createContext();

export const PomoProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [passedTasks, setPassedTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [t, e, p] = await Promise.all([
          AsyncStorage.getItem('ps_tasks'),
          AsyncStorage.getItem('ps_events'),
          AsyncStorage.getItem('ps_passed')
        ]);
        if (t) setTasks(JSON.parse(t));
        if (e) setEvents(JSON.parse(e));
        if (p) setPassedTasks(JSON.parse(p));
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Save Data
  useEffect(() => {
    if(!loading) AsyncStorage.setItem('ps_tasks', JSON.stringify(tasks));
  }, [tasks, loading]);

  useEffect(() => {
    if(!loading) AsyncStorage.setItem('ps_events', JSON.stringify(events));
  }, [events, loading]);

  useEffect(() => {
    if(!loading) AsyncStorage.setItem('ps_passed', JSON.stringify(passedTasks));
  }, [passedTasks, loading]);

  // Actions
  const addTask = (task) => setTasks(prev => [...prev, { ...task, id: `t-${Date.now()}`, priority: task.priority || 1 }]);
  const updateTask = (id, updates) => setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  const deleteTask = (id) => setTasks(prev => prev.filter(t => t.id !== id));

  const addEvent = (event) => setEvents(prev => [...prev, { ...event, id: `ev-${Date.now()}` }]);
  const updateEvent = (id, updates) => setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  const deleteEvent = (id) => setEvents(prev => prev.filter(e => e.id !== id));

  const passTask = (taskId, recipient) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const passed = { ...task, id: `pt-${Date.now()}`, recipient, datePassed: new Date(), status: 'Unopened', originalId: task.id };
    setPassedTasks(prev => [passed, ...prev]);
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const updatePassedTask = (id, updates) => setPassedTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));

  return (
    <PomoContext.Provider value={{
      tasks, events, passedTasks, loading,
      addTask, updateTask, deleteTask,
      addEvent, updateEvent, deleteEvent,
      passTask, updatePassedTask
    }}>
      {children}
    </PomoContext.Provider>
  );
};

export const usePomoStore = () => useContext(PomoContext);
