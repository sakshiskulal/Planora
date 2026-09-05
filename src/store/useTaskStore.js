import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { generateSchedule } from '@/utils/scheduler';
import { format } from 'date-fns';

export const useTaskStore = create(persist((set) => ({
  tasks: [],
  learningStats: {
    totalEstimatedMinutes: 0,
    totalActualMinutes: 0,
  },
  workWindow: {
    start: '09:00',
    end: '17:00'
  },
  schedule: null,
  breakSettings: {
    breakLength: 10,
    breakAfterMinutes: 90,
    fixedBreaks: [] // array of { start: 'HH:mm', duration: minutes }
  },

  setBreakSettings: (settings) => set((state) => ({ breakSettings: { ...state.breakSettings, ...settings } })),
  
  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, {
      ...task,
      id: Math.random().toString(36).substring(2, 9),
      completed: false,
      createdAt: new Date().toISOString()
    }]
  })),

  completeTaskWithActual: (taskId, actualMinutes) => set((state) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || task.completed) return state;

    const newStats = {
      totalEstimatedMinutes: state.learningStats.totalEstimatedMinutes + task.durationMinutes,
      totalActualMinutes: state.learningStats.totalActualMinutes + parseInt(actualMinutes)
    };

    return {
      learningStats: newStats,
      tasks: state.tasks.map(t => 
        t.id === taskId ? { ...t, completed: true, actualMinutes: parseInt(actualMinutes) } : t
      )
    };
  }),

  // Optional rollback if needed
  toggleTaskStatus: (taskId) => set((state) => ({
    tasks: state.tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    )
  })),

  deleteTask: (taskId) => set((state) => ({
    tasks: state.tasks.filter(t => t.id !== taskId)
  })),

  setWorkWindow: (window) => set({ workWindow: window }),

  updateWorkWindow: (field, value) => set((state) => ({
    workWindow: { ...state.workWindow, [field]: value }
  })),

  generateMySchedule: () => set((state) => {
    const result = generateSchedule(state.tasks, state.workWindow, state.breakSettings);
    return { schedule: result };
  }),

  rescheduleFromNow: () => set((state) => {
    const now = new Date();
    const coeff = 1000 * 60 * 5; // Round to nearest 5 mins
    const rounded = new Date(Math.round(now.getTime() / coeff) * coeff);
    const newStart = format(rounded, 'HH:mm');

    const newWindow = { ...state.workWindow, start: newStart };
    const result = generateSchedule(state.tasks, newWindow, state.breakSettings);
    
    return {
      workWindow: newWindow,
      schedule: result
    };
  })
}), {
  name: 'smart-scheduler-store',
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({
    tasks: state.tasks,
    learningStats: state.learningStats,
    workWindow: state.workWindow,
    breakSettings: state.breakSettings,
  }),
}));
