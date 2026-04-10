/**
 * MoodBook — Timer Component
 * 30-second countdown with pixel progress bar and auto-submit
 */

import React, { useEffect, useRef } from 'react';
import { useMoodBookStore } from '../store/useMoodBookStore';
import { sounds } from '../lib/sounds';

interface TimerProps {
  totalSeconds?: number;
  onTimeUp?: () => void;
}

export const Timer: React.FC<TimerProps> = ({ totalSeconds = 30, onTimeUp }) => {
  const { timeLeft, setTimeLeft, timerActive, soundEnabled } = useMoodBookStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasCalledTimeUp = useRef(false);

  useEffect(() => {
    if (!timerActive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    hasCalledTimeUp.current = false;

    intervalRef.current = setInterval(() => {
      setTimeLeft(Math.max(0, useMoodBookStore.getState().timeLeft - 1));

      const current = useMoodBookStore.getState().timeLeft;

      // Tick sound in last 5 seconds
      if (current <= 5 && current > 0 && soundEnabled) {
        sounds.timerTick();
      }

      if (current <= 0 && !hasCalledTimeUp.current) {
        hasCalledTimeUp.current = true;
        if (soundEnabled) sounds.timerEnd();
        if (intervalRef.current) clearInterval(intervalRef.current);
        onTimeUp?.();
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerActive, soundEnabled]);

  const pct = (timeLeft / totalSeconds) * 100;

  const barColor =
    timeLeft > 15 ? '#A8D5BA' : timeLeft > 7 ? '#F5D6A8' : '#E8A0A0';

  const isUrgent = timeLeft <= 5 && timerActive;

  return (
    <div className="flex flex-col gap-1">
      {/* Time display */}
      <div
        className="flex items-center justify-between"
        style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '10px' }}
      >
        <span style={{ color: '#3A2E2A' }}>⏱ TIME</span>
        <span
          style={{
            color: isUrgent ? '#E8A0A0' : '#3A2E2A',
            animation: isUrgent ? 'shimmer 0.5s ease-in-out infinite' : 'none',
          }}
        >
          {String(timeLeft).padStart(2, '0')}s
        </span>
      </div>

      {/* Progress bar */}
      <div className="timer-bar">
        <div
          className="timer-bar-fill"
          style={{
            width: `${pct}%`,
            backgroundColor: barColor,
            transition: 'width 1s linear, background-color 0.5s ease',
          }}
        />
        {/* Tick marks */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            pointerEvents: 'none',
          }}
        >
          {Array.from({ length: totalSeconds - 1 }, (_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                borderRight: i < totalSeconds - 2 ? '1px solid rgba(58,46,42,0.2)' : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* Pixel segments visual */}
      <div
        style={{
          display: 'flex',
          gap: '2px',
          height: '4px',
        }}
      >
        {Array.from({ length: totalSeconds }, (_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              backgroundColor: i < timeLeft ? barColor : 'rgba(58,46,42,0.15)',
              transition: 'background-color 0.3s',
            }}
          />
        ))}
      </div>
    </div>
  );
};
