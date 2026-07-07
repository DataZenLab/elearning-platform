'use client';

import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizTimerProps {
  initialMinutes: number;
  onTimeUp: () => void;
}

export function QuizTimer({ initialMinutes, onTimeUp }: QuizTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const isWarning = timeLeft < 60; // Less than 1 minute left

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm font-semibold border",
      isWarning 
        ? "bg-destructive/10 text-destructive border-destructive/20 animate-pulse" 
        : "bg-muted text-foreground border-border"
    )}>
      <Timer className="w-4 h-4" />
      <span>
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
}
