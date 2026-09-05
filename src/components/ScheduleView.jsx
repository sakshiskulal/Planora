"use client";

import { useTaskStore } from "@/store/useTaskStore";
import { Coffee, Settings, Play, Info, TimerReset } from "lucide-react";
import TimelineBlock from "./TimelineBlock";
import ScheduleSettings from "./ScheduleSettings";
import { useState } from "react";

export default function ScheduleView() {
  const { workWindow, updateWorkWindow, schedule, generateMySchedule, tasks, rescheduleFromNow } = useTaskStore();

  const handleGenerate = () => {
    generateMySchedule();
  };

  const hasTasks = tasks.some(t => !t.completed);

  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="h-full flex flex-col premium-glass rounded-2xl p-3 sm:p-4 md:p-5 lg:sticky lg:top-20 shadow-sm border border-slate-200 dark:border-slate-800 xl:max-h-[85vh] overflow-hidden">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-lg font-semibold text-foreground">Today&apos;s Schedule</h2>
        <button onClick={() => setShowSettings(true)} className="p-2 text-muted hover:text-primary transition-colors cursor-pointer">
          <Settings size={18} />
        </button>
        {showSettings && <ScheduleSettings onClose={() => setShowSettings(false)} />}
      </div>

      {/* Work Window Configuration */}
      <div className="flex items-center gap-2 text-sm mb-4 muted-bg dark:bg-[#2c2c2e] p-2 rounded-lg border border-slate-100 dark:border-slate-700 flex-shrink-0">
        <div className="flex flex-col flex-1">
          <label className="text-xs text-muted mb-1">Start Time</label>
          <input 
            type="time" 
            value={workWindow.start}
            onChange={(e) => updateWorkWindow('start', e.target.value)}
            className="bg-transparent font-medium text-foreground outline-none"
          />
        </div>
        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
        <div className="flex flex-col flex-1 pl-2">
          <label className="text-xs text-muted mb-1">End Time</label>
          <input 
            type="time" 
            value={workWindow.end}
            onChange={(e) => updateWorkWindow('end', e.target.value)}
            className="bg-transparent font-medium text-foreground outline-none"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pr-1 pb-2 -mr-1">
        {!schedule || schedule.blocks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <Coffee size={32} />
            </div>
            <h3 className="font-medium text-foreground mb-2">Ready to plan?</h3>
              <p className="text-sm text-center text-muted max-w-[250px] mb-6">
              You have {tasks.length} task{tasks.length !== 1 && 's'}. Configure your work window and generate an optimal schedule.
            </p>
            
            <button 
              onClick={handleGenerate}
              disabled={!hasTasks}
              className="w-full max-w-[200px] bg-primary text-white font-semibold py-3 rounded-xl shadow-[0_4px_14px_rgba(0,122,255,0.3)] hover:opacity-90 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              <Play size={16} />
              Generate Schedule
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {schedule.overflow && (
              <div className="mb-2 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-start gap-2 border border-red-100 dark:border-red-900/30">
                <Info size={16} className="mt-0.5 flex-shrink-0 relative top-px" />
                <p>Some of your tasks don&apos;t fit within your work window. Consider splitting them or adjusting your hours.</p>
              </div>
            )}
            
            {schedule.blocks.map((block) => (
              <TimelineBlock key={block.id} block={block} />
            ))}

            <div className="flex gap-2 mt-3">
              <button 
                onClick={handleGenerate}
                className="flex-1 surface dark:bg-slate-800 text-foreground font-medium py-3 rounded-xl hover:opacity-95 transition-colors shadow-sm"
              >
                Re-generate
              </button>
              <button 
                onClick={rescheduleFromNow}
                title="Shifts start time to right now and recalculates!"
                className="flex-[1.5] bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-medium py-3 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors border border-orange-200 dark:border-orange-900/30 flex items-center justify-center gap-2 shadow-sm"
              >
                <TimerReset size={18} />
                Shift to Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
