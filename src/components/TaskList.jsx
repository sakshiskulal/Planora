"use client";

import { useTaskStore } from "@/store/useTaskStore";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Clock, Trash2, Zap } from "lucide-react";

export default function TaskList() {
  const { tasks, toggleTaskStatus, deleteTask } = useTaskStore();

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 5: return "text-red-500 bg-red-50 dark:bg-red-500/10";
      case 4: return "text-orange-500 bg-orange-50 dark:bg-orange-500/10";
      case 3: return "text-yellow-600 bg-yellow-50 dark:bg-yellow-500/10";
      default: return "text-blue-500 bg-blue-50 dark:bg-blue-500/10";
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-foreground px-1">Your Tasks</h2>
      
      {tasks.length === 0 ? (
        <div className="premium-glass rounded-3xl p-6 md:p-8 text-center text-muted border-dashed">
          <p>No tasks yet. Add one above to get started!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                layout
                className={`premium-glass p-3 rounded-2xl flex items-center gap-3 transition-all hover:shadow-lg ${
                  task.completed ? "opacity-50 grayscale hover:grayscale-0" : ""
                }`}
              >
                <button 
                  onClick={() => toggleTaskStatus(task.id)}
                  className="mt-0.5 text-muted hover:text-primary transition-colors flex-shrink-0"
                >
                  {task.completed ? (
                    <CheckCircle2 className="text-primary" size={24} />
                  ) : (
                    <Circle size={24} />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium truncate ${task.completed ? "line-through text-muted" : "text-foreground"}`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted mt-1">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {task.durationMinutes}m
                    </span>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                      <Zap size={12} />
                      P{task.priority}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-2 text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors opacity-60 hover:opacity-100 flex-shrink-0"
                  aria-label="Delete task"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
