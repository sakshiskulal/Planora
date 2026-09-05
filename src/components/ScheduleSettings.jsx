"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTaskStore } from "@/store/useTaskStore";
import { CalendarClock, Clock, Clock3, Hourglass, Plus, Tag, Trash2, X, AlertCircle, Save } from "lucide-react";

export default function ScheduleSettings({ onClose }) {
  const breakSettings = useTaskStore((s) => s.breakSettings);
  const workWindow = useTaskStore((s) => s.workWindow);
  const setBreakSettings = useTaskStore((s) => s.setBreakSettings);
  const generateMySchedule = useTaskStore((s) => s.generateMySchedule);

  const [breakLength, setBreakLength] = useState(breakSettings.breakLength ?? 10);
  const [breakAfter, setBreakAfter] = useState(breakSettings.breakAfterMinutes ?? 90);
  const [fixedBreaks, setFixedBreaks] = useState(breakSettings.fixedBreaks ?? []);
  const [newFixedTitle, setNewFixedTitle] = useState("Focus break");
  const [newFixedStart, setNewFixedStart] = useState("12:00");
  const [newFixedDuration, setNewFixedDuration] = useState(30);
  const [error, setError] = useState("");

  const toMinutes = (time) => {
    const [h, m] = String(time || "00:00").split(":").map(Number);
    return h * 60 + m;
  };

  const isInWindow = (start, duration) => {
    const startMin = toMinutes(start);
    const endMin = startMin + Number(duration || 0);
    const windowStart = toMinutes(workWindow.start);
    const windowEnd = toMinutes(workWindow.end);
    return startMin >= windowStart && endMin <= windowEnd;
  };

  const toTimeString = (mins) => {
    const safe = ((Number(mins) % 1440) + 1440) % 1440;
    const h = Math.floor(safe / 60);
    const m = safe % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const endTimeFrom = (start, duration) => toTimeString(toMinutes(start) + Number(duration || 0));

  const save = () => {
    const hasInvalid = fixedBreaks.some(
      (fb) => !fb.start || Number(fb.duration) <= 0
    );

    if (hasInvalid) {
      setError("Every fixed break must have a valid time and duration.");
      return;
    }

    setBreakSettings({
      breakLength: Number(breakLength),
      breakAfterMinutes: Number(breakAfter),
      fixedBreaks,
    });
    generateMySchedule?.();
    onClose?.();
  };

  const addFixedBreak = () => {
    if (!newFixedStart || !newFixedDuration) {
      setError("Please set both time and duration.");
      return;
    }

    setFixedBreaks((cur) => {
      const next = [
        ...cur,
        {
          title: String(newFixedTitle || "").trim() || "Scheduled break",
          start: newFixedStart,
          duration: Number(newFixedDuration),
        },
      ];
      next.sort((a, b) => (a.start > b.start ? 1 : -1));
      return next;
    });
    setError("");
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Schedule settings"
        className="relative w-full max-w-lg premium-glass rounded-[2rem] p-6 sm:p-8 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6 shrink-0 relative z-10">
          <div>
            <h3 className="text-2xl font-bold text-foreground tracking-tight">Schedule Options</h3>
            <p className="text-sm text-muted mt-1.5 font-medium">Configure active hours and break preferences.</p>
          </div>
          <button onClick={onClose} aria-label="Close settings" className="text-muted hover:text-foreground bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto pr-2 -mr-2 overflow-x-hidden pb-4 space-y-8 flex-1 scrollbar-hide relative z-10">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-900/30 flex gap-3 items-start text-red-600 dark:text-red-400 text-sm font-medium animate-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p className="leading-tight">{error}</p>
            </div>
          )}

          {/* Auto Breaks Section */}
          <section className="space-y-4">
            <h4 className="text-xs font-bold tracking-widest text-muted uppercase">Auto Breaks</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="surface border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <label className="text-sm text-foreground font-semibold mb-3 flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg">
                    <Hourglass size={16} />
                  </div>
                  Break Length
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={breakLength}
                    onChange={(e) => setBreakLength(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-foreground text-sm font-medium"
                  />
                  <span className="text-sm font-medium text-muted">min</span>
                </div>
              </div>

              <div className="surface border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <label className="text-sm text-foreground font-semibold mb-3 flex items-center gap-2">
                  <div className="p-1.5 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg">
                    <CalendarClock size={16} />
                  </div>
                  Break After
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={breakAfter}
                    onChange={(e) => setBreakAfter(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-foreground text-sm font-medium"
                  />
                  <span className="text-sm font-medium text-muted">min</span>
                </div>
              </div>
            </div>
          </section>

          {/* Fixed Breaks Section */}
          <section className="space-y-4 relative">
            <h4 className="text-xs font-bold tracking-widest text-muted uppercase mb-3">Fixed Breaks</h4>

            <div className="space-y-4">
              {fixedBreaks.length === 0 && (
                <div className="text-center py-8 surface border border-dashed border-slate-300 dark:border-slate-700/70 rounded-2xl">
                  <div className="bg-slate-100 dark:bg-slate-800 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock3 size={24} className="text-muted" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">No scheduled breaks</p>
                  <p className="text-sm text-muted mt-1 font-medium">Add lunch or specific blocks below.</p>
                </div>
              )}

              {fixedBreaks.map((fb, idx) => (
                <div key={idx} className="surface border border-slate-200 dark:border-slate-800 rounded-[1.25rem] p-4 shadow-sm group hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Tag size={16} className="text-muted shrink-0" />
                        <input
                          type="text"
                          value={fb.title || ""}
                          onChange={(e) => {
                            const nextTitle = e.target.value;
                            setFixedBreaks((cur) => cur.map((item, i) => (i === idx ? { ...item, title: nextTitle } : item)));
                            setError("");
                          }}
                          className="flex-1 min-w-0 w-full bg-transparent border-b-2 border-transparent focus:border-primary outline-none transition-colors text-[15px] font-semibold text-foreground placeholder:text-muted/50 py-0.5"
                          placeholder="Break title (e.g. Lunch)"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setFixedBreaks((cur) => cur.filter((_, i) => i !== idx));
                        setError("");
                      }}
                      className="text-muted hover:text-red-500 bg-slate-100 dark:bg-slate-800/80 hover:bg-red-50 dark:hover:bg-red-500/20 p-2 rounded-xl transition-all cursor-pointer shrink-0"
                      aria-label="Delete break"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:flex-wrap md:flex-nowrap items-stretch sm:items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
                    <div className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/30 transition-all flex-1 min-w-0">
                      <Clock size={16} className="text-primary hidden sm:block" />
                      <input
                        type="time"
                        value={fb.start}
                        onChange={(e) => {
                          const nextStart = e.target.value;
                          setFixedBreaks((cur) => cur.map((item, i) => (i === idx ? { ...item, start: nextStart } : item)));
                          setError("");
                        }}
                        className="bg-transparent outline-none text-sm font-semibold w-full text-foreground text-center sm:text-left"
                      />
                    </div>

                    <span className="text-muted text-[11px] font-bold tracking-wider text-center hidden sm:block">TO</span>

                    <div className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/30 transition-all flex-1 sm:w-[100px] sm:flex-none">
                      <input
                        type="number"
                        min="1"
                        value={fb.duration}
                        onChange={(e) => {
                          const nextDuration = Number(e.target.value);
                          setFixedBreaks((cur) => cur.map((item, i) => (i === idx ? { ...item, duration: nextDuration } : item)));
                          setError("");
                        }}
                        className="bg-transparent outline-none text-sm font-semibold w-full text-center text-foreground"
                      />
                      <span className="text-[11px] font-bold text-muted">MIN</span>
                    </div>

                    <div className="text-xs font-bold text-muted bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg text-center sm:ml-auto w-full sm:w-auto">
                      Ends {endTimeFrom(fb.start, fb.duration)}
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-5">
                <div className="bg-primary/5 dark:bg-primary/10 border-2 border-dashed border-primary/20 dark:border-primary/20 rounded-[1.25rem] p-4 transition-colors focus-within:border-primary/40 focus-within:bg-primary/10">
                  <h5 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                    <div className="p-1 bg-primary text-primary-foreground rounded-md shadow-sm">
                      <Plus size={14} strokeWidth={3} />
                    </div>
                    Draft New Break
                  </h5>

                  <div className="flex items-center gap-2 mb-4">
                    <Tag size={16} className="text-primary" />
                    <input
                      type="text"
                      value={newFixedTitle}
                      onChange={(e) => setNewFixedTitle(e.target.value)}
                      className="flex-1 bg-transparent border-b-2 border-primary/20 focus:border-primary outline-none transition-colors text-[15px] font-semibold text-foreground placeholder:text-primary/50 py-0.5"
                      placeholder="Special break title..."
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
                    <div className="flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-primary/30 transition-all shadow-sm flex-1 min-w-0">
                      <Clock size={16} className="text-primary hidden sm:block" />
                      <input
                        type="time"
                        value={newFixedStart}
                        onChange={(e) => setNewFixedStart(e.target.value)}
                        className="bg-transparent outline-none text-sm font-semibold text-foreground text-center sm:text-left w-full"
                      />
                    </div>

                    <div className="flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-primary/30 transition-all shadow-sm flex-1 sm:w-auto">
                      <Hourglass size={16} className="text-primary hidden sm:block" />
                      <input
                        type="number"
                        min="1"
                        value={newFixedDuration}
                        onChange={(e) => setNewFixedDuration(Number(e.target.value))}
                        className="bg-transparent outline-none text-sm font-semibold flex-1 text-center text-foreground"
                      />
                      <span className="text-[11px] font-bold text-muted">MIN</span>
                    </div>

                    <button
                      onClick={addFixedBreak}
                      className="sm:ml-auto w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(0,122,255,0.3)] hover:scale-[1.02] active:scale-95 cursor-pointer"
                    >
                      <Plus size={16} strokeWidth={3} /> <span>Add Break</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 shrink-0 relative z-10">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-foreground bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm transition-all shadow-[0_4px_14px_rgba(0,122,255,0.3)] hover:opacity-90 hover:scale-[1.02] active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
