"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Flag, AlertTriangle, CalendarClock, Layers, CheckCircle2, Circle, Check } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useTaskStore } from "@/store/useTaskStore";
import { useState } from "react";

export default function TimelineBlock({ block }) {
  const isBreak = block.type === "break";
  
  const toggleTaskStatus = useTaskStore((state) => state.toggleTaskStatus);
  const completeTaskWithActual = useTaskStore((state) => state.completeTaskWithActual);
  const tasks = useTaskStore((state) => state.tasks);
  
  const parentTask = !isBreak ? tasks.find(t => t.id === block.taskId) : null;
  const isCompleted = parentTask?.completed;

  const [showInput, setShowInput] = useState(false);
  const [actualMins, setActualMins] = useState(block.duration);

  const handleActionClick = () => {
    if (isCompleted) {
      // Allow rollback for mistakes
      toggleTaskStatus(block.taskId);
    } else {
      setShowInput(true);
    }
  };

  const handleSaveActual = () => {
    completeTaskWithActual(block.taskId, actualMins);
    setShowInput(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`relative flex flex-col p-2.5 sm:p-3 rounded-lg transition-all ${
        isCompleted ? "opacity-40 grayscale hover:grayscale-0" : ""
      } ${
        isBreak 
          ? "bg-slate-50 dark:bg-[#1c1c1e] border border-dashed border-slate-200 dark:border-[#2c2c2e]"
          : block.warning
            ? "glass-card border-l-[3px] border-l-red-500" 
            : `glass-card premium-glass-hover ${block.priority === 5 ? "border-l-[3px] border-l-purple-500" : block.priority === 4 ? "border-l-[3px] border-l-orange-500" : "border-l-[3px] border-l-blue-500"}`
      }`}
    >
      <div className="flex items-stretch gap-1.5">
        {/* Time column */}
          <div className="flex flex-col justify-between items-end w-11 flex-shrink-0 text-sm font-medium pr-0">
          <span className="text-foreground">{block.startTime}</span>
            <span className="text-muted text-[11px]">{block.duration}m</span>
          <span className="text-muted">{block.endTime}</span>
        </div>

        {/* Compact toggle placed between time and decorative line to avoid overlap */}
        <div className="flex items-center justify-center w-5 flex-shrink-0">
          {!isBreak && (
            <button
              onClick={handleActionClick}
              className="w-[18px] h-[18px] rounded-full text-muted hover:text-primary flex items-center justify-center bg-surface dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm z-10"
              aria-pressed={isCompleted}
              aria-label={isCompleted ? 'Mark undone' : 'Mark done'}
              disabled={showInput}
            >
              {isCompleted ? <CheckCircle2 className="text-primary" size={11} /> : <Circle size={11} />}
            </button>
          )}
        </div>

        {/* Decorative Line */}
        <div className={`w-1 rounded-full ${
          isBreak ? "muted-bg dark:bg-slate-700" :
          block.warning ? "bg-red-400" :
          "bg-primary/50"
        }`} />

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center min-w-0">
          <div className="flex items-center justify-between">
            <h4 className={`font-medium flex flex-wrap items-center gap-2 truncate ${isCompleted ? "line-through text-muted" : isBreak ? "text-muted italic" : "text-foreground"}`}>
              <span className="truncate">{block.title}</span>
              {block.totalChunks > 1 && (
                <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-bold uppercase tracking-wider relative top-px">
                  <Layers size={10} />
                  Part {block.chunkId}/{block.totalChunks}
                </span>
              )}
            </h4>
            
            {isBreak && <Coffee size={16} className="text-muted" />}
            {block.warning && (
              <span title="This block overflows your work window!" className="text-red-500 animate-pulse">
                <AlertTriangle size={16} />
              </span>
            )}
          </div>

          {!isBreak && (
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-muted font-medium">
              {block.priority && (
                <span className="flex items-center gap-1 muted-bg dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  <Flag size={12} className={block.priority >= 4 ? "text-orange-500" : "text-blue-500"} />
                  P{block.priority}
                </span>
              )}
              
              {block.deadline && (
                <span className="flex items-center gap-1 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 px-2 py-0.5 rounded-md">
                  <CalendarClock size={12} />
                  Due {format(parseISO(block.deadline), "MMM d, h:mm a")}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expandable Actual Mins Input (Phase 6) */}
      <AnimatePresence>
        {showInput && (
          <motion.div 
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: 12 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            className="overflow-hidden muted-bg dark:bg-slate-800/50 rounded-lg flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 sm:ml-16 ml-0"
          >
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-muted">Actual Mins:</label>
              <input 
                type="number"
                value={actualMins}
                onChange={e => setActualMins(e.target.value)}
                className="w-20 surface dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1 outline-none text-sm focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <button 
              onClick={handleSaveActual}
              className="bg-primary hover:bg-primary/90 text-primary-foreground p-1.5 rounded-md transition-colors flex items-center gap-1 text-sm font-medium pr-3"
            >
              <Check size={16} /> Save
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
