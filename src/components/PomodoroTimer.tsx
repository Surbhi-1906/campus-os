import React, { useEffect, useRef, useState } from 'react';

const FOCUS_DURATION_MS = 25 * 60 * 1000;
const BREAK_DURATION_MS = 5 * 60 * 1000;

type TimerMode = 'focus' | 'break';

const PomodoroTimer: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [remainingMs, setRemainingMs] = useState(FOCUS_DURATION_MS);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const deadlineRef = useRef<number | null>(null);

  const durationMs = mode === 'focus' ? FOCUS_DURATION_MS : BREAK_DURATION_MS;
  const remainingSeconds = Math.ceil(remainingMs / 1000);
  const formattedTime = `${Math.floor(remainingSeconds / 60)
    .toString()
    .padStart(2, '0')}:${(remainingSeconds % 60).toString().padStart(2, '0')}`;
  const progress = ((durationMs - remainingMs) / durationMs) * 100;

  useEffect(() => {
    if (!isRunning) return;

    const updateRemainingTime = () => {
      const deadline = deadlineRef.current;
      if (deadline === null) return;

      const nextRemainingMs = Math.max(0, deadline - Date.now());
      setRemainingMs(nextRemainingMs);

      if (nextRemainingMs === 0) {
        deadlineRef.current = null;
        setIsRunning(false);
        setIsComplete(true);
      }
    };

    updateRemainingTime();
    const intervalId = window.setInterval(updateRemainingTime, 250);

    return () => window.clearInterval(intervalId);
  }, [isRunning]);

  const handleStart = () => {
    if (remainingMs === 0) return;

    deadlineRef.current = Date.now() + remainingMs;
    setIsRunning(true);
  };

  const handlePause = () => {
    if (deadlineRef.current !== null) {
      setRemainingMs(Math.max(0, deadlineRef.current - Date.now()));
    }
    deadlineRef.current = null;
    setIsRunning(false);
  };

  const handleReset = () => {
    deadlineRef.current = null;
    setMode('focus');
    setRemainingMs(FOCUS_DURATION_MS);
    setIsRunning(false);
    setIsComplete(false);
  };

  const handleStartNextSession = () => {
    const nextMode: TimerMode = mode === 'focus' ? 'break' : 'focus';
    const nextDurationMs = nextMode === 'focus' ? FOCUS_DURATION_MS : BREAK_DURATION_MS;

    setMode(nextMode);
    setRemainingMs(nextDurationMs);
    setIsComplete(false);
    deadlineRef.current = Date.now() + nextDurationMs;
    setIsRunning(true);
  };

  return (
    <section
      aria-label="Pomodoro timer"
      className="rounded-2xl border border-butter/20 bg-gradient-to-br from-white/[0.035] to-transparent p-5 text-center shadow-[0_0_50px_rgba(200,241,105,0.035)] sm:p-8"
    >
      <div className="mb-3 inline-flex items-center rounded-full border border-butter/20 bg-butter/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-butter">
        {mode === 'focus' ? 'Focus session · 25 min' : 'Short break · 5 min'}
      </div>

      <div
        aria-label={`${remainingSeconds} seconds remaining`}
        aria-live="off"
        className="number-display my-3 font-display text-6xl font-bold tabular-nums tracking-tight text-cream sm:my-4 sm:text-8xl"
        role="timer"
      >
        {formattedTime}
      </div>

      <div
        aria-hidden="true"
        className="mx-auto mb-5 h-1.5 max-w-md overflow-hidden rounded-full bg-chocolate/80"
      >
        <div
          className="h-full rounded-full bg-butter shadow-[0_0_14px_rgba(200,241,105,0.4)] transition-[width] duration-500"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>

      {isComplete ? (
        <div aria-live="polite" className="space-y-4">
          <p className="font-display text-lg font-bold tracking-[0.18em] text-butter sm:text-xl">
            {mode === 'focus' ? 'SESSION COMPLETE' : 'BREAK COMPLETE'}
          </p>
          <button
            className="accent-button w-full sm:w-auto"
            onClick={handleStartNextSession}
            type="button"
          >
            {mode === 'focus' ? 'START 5-MINUTE BREAK' : 'START 25-MINUTE SESSION'}
          </button>
        </div>
      ) : (
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <button
            className="accent-button min-w-36"
            disabled={isRunning}
            onClick={handleStart}
            type="button"
          >
            START
          </button>
          <button
            className="accent-button-outline min-w-36"
            disabled={!isRunning}
            onClick={handlePause}
            type="button"
          >
            PAUSE
          </button>
          <button
            className="accent-button-outline min-w-36"
            onClick={handleReset}
            type="button"
          >
            RESET
          </button>
        </div>
      )}
    </section>
  );
};

export default PomodoroTimer;
