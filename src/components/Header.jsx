"use client";

import { CalendarClock, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function Header() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Persistent theme logic mapped correctly to localStorage
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="fixed top-3 md:top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <header className="pointer-events-auto premium-glass rounded-full px-4 sm:px-6 h-14 md:h-16 flex items-center justify-between w-full max-w-4xl transition-all duration-300">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-primary transition-transform">
            <CalendarClock size={22} className="opacity-90" />
          </div>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">
            Planora
          </h1>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="p-2 sm:p-2.5 rounded-full surface dark:bg-[#2c2c2e] hover:opacity-95 transition-colors text-foreground shadow-sm"
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>
    </div>
  );
}
