"use client";

import { useState } from "react";
import { useTaskStore } from "@/store/useTaskStore";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Lightbulb, Sparkles, X } from "lucide-react";

export default function TaskForm() {
  const addTask = useTaskStore((state) => state.addTask);
  const learningStats = useTaskStore((state) => state.learningStats);
  
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(30);
  const [priority, setPriority] = useState(3);
  const [deadline, setDeadline] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      durationMinutes: parseInt(duration),
      priority: parseInt(priority),
      deadline: deadline || null
    });

    setTitle("");
    setDuration(30);
    setPriority(3);
    setDeadline("");
  };

  const [nlText, setNlText] = useState("");
  const [isParsingRemote, setIsParsingRemote] = useState(false);
  const [nlError, setNlError] = useState("");
  const [nlSuccess, setNlSuccess] = useState("");
  const [pendingAiTasks, setPendingAiTasks] = useState([]);
  const validPendingCount = pendingAiTasks.filter((task) => String(task?.title || '').trim().length > 0).length;

  const updatePendingTask = (index, field, value) => {
    setPendingAiTasks((prev) => prev.map((task, i) => {
      if (i !== index) return task;
      return { ...task, [field]: value };
    }));
  };

  const addPendingTasks = () => {
    if (pendingAiTasks.length === 0) return;

    const validTasks = pendingAiTasks.filter((task) => String(task.title || '').trim().length > 0);
    const invalidTasks = pendingAiTasks.filter((task) => String(task.title || '').trim().length === 0);

    if (validTasks.length === 0) {
      setNlError('No valid AI tasks to add. Please add a title to at least one suggestion.');
      setTimeout(() => {
        const firstInvalid = document.getElementById('ai-title-0');
        firstInvalid?.focus();
      }, 0);
      return;
    }

    validTasks.forEach((task) => {
      addTask({
        title: String(task.title || '').trim(),
        durationMinutes: Math.max(5, Number.parseInt(task.durationMinutes, 10) || 30),
        priority: Math.min(5, Math.max(1, Number.parseInt(task.priority, 10) || 3)),
        deadline: task.deadline || null,
      });
    });
    setNlError("");
    if (invalidTasks.length > 0) {
      setPendingAiTasks(invalidTasks);
      setNlError(`Skipped ${invalidTasks.length} suggestion${invalidTasks.length > 1 ? 's' : ''} with missing title.`);
      setNlSuccess(`Added ${validTasks.length} AI task${validTasks.length > 1 ? 's' : ''}.`);
      setTimeout(() => {
        const firstInvalid = document.getElementById('ai-title-0');
        firstInvalid?.focus();
      }, 0);
      return;
    }

    setNlSuccess(`Added ${validTasks.length} AI task${validTasks.length > 1 ? 's' : ''}.`);
    setPendingAiTasks([]);
    setNlText('');
  };

  const removePendingTask = (index) => {
    setPendingAiTasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGeminiParse = async () => {
    if (!nlText.trim()) return;
    setNlError("");
    setNlSuccess("");
    setIsParsingRemote(true);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: nlText })
      });
      const body = await res.json();
      if (res.ok && body.tasks && Array.isArray(body.tasks)) {
        setPendingAiTasks(body.tasks);
        setNlSuccess(`Generated ${body.tasks.length} suggestion${body.tasks.length > 1 ? 's' : ''}.`);
        return;
      }

      console.warn('Gemini parse failed', body);
      setNlError('AI parsing failed. Please try again or enter task fields manually.');
    } catch (e) {
      console.warn('Gemini parse error', e);
      setNlError('Could not reach Gemini. Please check your API setup and retry.');
    } finally {
      setIsParsingRemote(false);
    }
  };

  // Learning Engine Math
  let errorRatio = 1;
  if (learningStats.totalEstimatedMinutes > 0 && learningStats.totalActualMinutes > 0) {
    errorRatio = learningStats.totalActualMinutes / learningStats.totalEstimatedMinutes;
  }
  
  // If the user underestimates by more than 10%, fire a suggestion!
  const suggestedMins = Math.round(duration * errorRatio);
  const needsSuggestion = errorRatio > 1.1 && duration > 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="premium-glass rounded-3xl p-5 sm:p-7 md:p-8 shadow-sm mb-8"
    >
      <h2 className="text-lg font-semibold mb-4 text-foreground">Add New Task</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Stage 7: Natural language quick-add */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted">Quick Add with Gemini</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. study math for 2 hours and finish assignment"
              value={nlText}
              onChange={(e) => setNlText(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault();
                  handleGeminiParse();
                }
              }}
              className="w-full muted-bg dark:bg-[#2c2c2e] border-transparent rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted"
            />
            <button
              type="button"
              onClick={handleGeminiParse}
              disabled={isParsingRemote}
              className="px-4 py-3 bg-primary text-primary-foreground rounded-xl font-medium inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Sparkles size={16} className="text-primary-foreground/90" />
              {isParsingRemote ? 'Parsing...' : 'Parse'}
            </button>
          </div>
          <p className="text-xs text-muted">Tip: Press Ctrl/Cmd + Enter to parse quickly.</p>
          {nlError && (
            <p className="text-xs text-red-600 dark:text-red-400">{nlError}</p>
          )}
          {nlSuccess && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400">{nlSuccess}</p>
          )}

          {pendingAiTasks.length > 0 && (
            <div className="mt-2 space-y-2 rounded-xl border border-slate-200 dark:border-slate-700 p-3 muted-bg dark:bg-[#1c1c1e]">
              <p className="text-xs font-medium text-muted">Review AI suggestions before adding:</p>
              {pendingAiTasks.map((task, index) => (
                <div key={`pending-ai-task-${index}`} className="grid grid-cols-1 md:grid-cols-6 gap-2">
                  <input
                    id={`ai-title-${index}`}
                    value={task.title || ''}
                    onChange={(e) => updatePendingTask(index, 'title', e.target.value)}
                    aria-invalid={String(task.title || '').trim().length === 0}
                    className={`sm:col-span-3 surface dark:bg-[#2c2c2e] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 min-w-0 ${String(task.title || '').trim().length === 0 ? 'border border-red-300 dark:border-red-800 bg-red-50/60 dark:bg-red-500/10' : ''}`}
                    placeholder="Task title"
                  />
                  {String(task.title || '').trim().length === 0 && (
                    <p className="md:col-span-6 text-xs text-red-600 dark:text-red-400">Title required</p>
                  )}
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={task.durationMinutes ?? 30}
                    onChange={(e) => updatePendingTask(index, 'durationMinutes', e.target.value)}
                    className="md:col-span-1 surface dark:bg-[#2c2c2e] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 min-w-0"
                  />
                  <select
                    value={task.priority ?? 3}
                    onChange={(e) => updatePendingTask(index, 'priority', e.target.value)}
                    className="md:col-span-1 surface dark:bg-[#2c2c2e] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 min-w-0"
                  >
                    <option value={1}>P1</option>
                    <option value={2}>P2</option>
                    <option value={3}>P3</option>
                    <option value={4}>P4</option>
                    <option value={5}>P5</option>
                  </select>
                  <input
                    type="datetime-local"
                    value={task.deadline ? String(task.deadline).slice(0, 16) : ''}
                    onChange={(e) => updatePendingTask(index, 'deadline', e.target.value || null)}
                    className="md:col-span-1 surface dark:bg-[#2c2c2e] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 min-w-0"
                  />
                  <button
                    type="button"
                    onClick={() => removePendingTask(index)}
                    className="md:col-span-6 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <X size={14} /> Remove
                  </button>
                </div>
              ))}

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleGeminiParse}
                  disabled={isParsingRemote || !nlText.trim()}
                  className="px-4 py-2 surface dark:bg-[#2c2c2e] text-foreground rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isParsingRemote ? 'Regenerating...' : 'Regenerate'}
                </button>
                <button
                  type="button"
                  onClick={addPendingTasks}
                  disabled={validPendingCount === 0}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add All ({validPendingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setPendingAiTasks([])}
                  className="px-4 py-2 surface dark:bg-[#2c2c2e] text-foreground rounded-lg text-sm font-medium"
                >
                  Discard
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted">Task Name</label>
          <input 
            type="text" 
            placeholder="What do you need to do?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full muted-bg dark:bg-[#2c2c2e] border-transparent rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground placeholder:text-muted"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-sm font-medium text-muted">Duration (mins)</label>
            <input 
              type="number" 
              min="5"
              step="5"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full muted-bg dark:bg-[#2c2c2e] border-transparent rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
            />
            
            {/* Predictive Learning Suggestion UI */}
            <AnimatePresence>
              {needsSuggestion && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-1 flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 p-2 rounded-lg border border-amber-200 dark:border-amber-900/30"
                >
                  <Lightbulb size={12} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div className="flex flex-col gap-1 w-full">
                    <span>Given past delays, this might take <strong>{suggestedMins}m</strong>.</span>
                    <button 
                      type="button"
                      onClick={() => setDuration(suggestedMins)}
                      className="text-left font-semibold underline hover:text-amber-700 dark:hover:text-amber-300 w-fit"
                    >
                      Apply suggestion?
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-sm font-medium text-muted">Priority</label>
            <select 
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full muted-bg dark:bg-[#2c2c2e] border-transparent rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground appearance-none"
            >
              <option value={1}>1 - Low</option>
              <option value={2}>2 - Medium Low</option>
              <option value={3}>3 - Medium</option>
              <option value={4}>4 - High</option>
              <option value={5}>5 - Top Priority</option>
            </select>
          </div>
          
          <div className="flex flex-col gap-1.5 flex-[1.5]">
            <label className="text-sm font-medium text-muted">Deadline (Optional)</label>
            <input 
              type="datetime-local" 
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full muted-bg dark:bg-[#2c2c2e] border-transparent rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground placeholder:text-muted"
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="mt-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm shadow-primary/20"
        >
          <PlusCircle size={20} className="text-primary-foreground/95" />
          <span>Add Task</span>
        </motion.button>
      </form>
    </motion.div>
  );
}
