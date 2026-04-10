/**
 * MoodBook — MoodSelector
 * Pixel-art mood selection with emoji and custom input
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMoodBookStore, MoodOption } from '../store/useMoodBookStore';
import { sounds } from '../lib/sounds';

interface MoodConfig {
  label: MoodOption;
  emoji: string;
  color: string;
  description: string;
}

export const MOODS: MoodConfig[] = [
  { label: 'Happy', emoji: '😄', color: '#F5D6A8', description: 'Joyful & bright!' },
  { label: 'Sad', emoji: '😢', color: '#A7C7E7', description: 'Blue & gloomy...' },
  { label: 'Angry', emoji: '😠', color: '#E8A0A0', description: 'Fire within!' },
  { label: 'Love', emoji: '🥰', color: '#D8A7B1', description: 'Heart full of love' },
  { label: 'Tired', emoji: '😴', color: '#C8A7D8', description: 'Sleepy & drained' },
  { label: 'Surprised', emoji: '😲', color: '#A8D5BA', description: 'Whoa! No way!' },
];

interface MoodSelectorProps {
  onSelect?: (mood: MoodOption) => void;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({ onSelect }) => {
  const { selectedMood, setSelectedMood, setCustomMood } = useMoodBookStore();
  const [showCustom, setShowCustom] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const handleSelect = (mood: MoodOption) => {
    sounds.click();
    setSelectedMood(mood);
    setShowCustom(false);
    onSelect?.(mood);
  };

  const handleCustomSubmit = () => {
    if (customInput.trim()) {
      const mood = customInput.trim();
      sounds.click();
      setCustomMood(mood);
      setSelectedMood(mood);
      setShowCustom(false);
      onSelect?.(mood);
    }
  };

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto pb-4">
      <div className="flex justify-between items-center bg-(--color-bg) sticky top-0 py-2 z-10">
        <p style={{
          fontFamily: "'Pixelify Sans', monospace",
          fontSize: '12px',
          color: '#3A2E2A',
          fontWeight: 600,
        }}>
          🎭 Choose your mood to draw:
        </p>
        <button 
          onClick={() => useMoodBookStore.getState().setPhase('home')}
          className="pixel-button pixel-button-sm pixel-button-blue"
        >
          ← Back
        </button>
      </div>

      {/* Mood Grid */}
      <div className="grid grid-cols-3 gap-2">
        {MOODS.map((mood, idx) => {
          const isSelected = selectedMood === mood.label;
          return (
            <motion.button
              key={mood.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleSelect(mood.label)}
              className="mood-chip"
              style={{
                backgroundColor: mood.color,
                borderColor: '#3A2E2A',
                borderWidth: isSelected ? '3px' : '2px',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '8px 4px',
                gap: '4px',
                transform: isSelected ? 'translate(2px, 2px)' : 'none',
                boxShadow: isSelected ? '0 0 0 #3A2E2A' : '2px 2px 0 #3A2E2A',
              }}
            >
              <span style={{ fontSize: '22px' }}>{mood.emoji}</span>
              <span style={{ fontSize: '10px', fontWeight: 700 }}>{mood.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Custom Mood */}
      <div>
        {!showCustom ? (
          <button
            onClick={() => { setShowCustom(true); sounds.click(); }}
            style={{
              fontFamily: "'Pixelify Sans', monospace",
              fontSize: '11px',
              color: '#8B6348',
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px 0',
            }}
          >
            ✏️ Custom mood...
          </button>
        ) : (
          <div className="flex gap-2">
            <input
              className="pixel-input"
              placeholder="Type your mood..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
              autoFocus
              maxLength={20}
              style={{ fontSize: '12px' }}
            />
            <button
              onClick={handleCustomSubmit}
              className="pixel-button pixel-button-sm"
              style={{ whiteSpace: 'nowrap' }}
            >
              ✓
            </button>
          </div>
        )}

        {/* Show selected custom mood */}
        {selectedMood && !MOODS.find(m => m.label === selectedMood) && (
          <div
            style={{
              marginTop: '6px',
              padding: '4px 8px',
              border: '2px solid #3A2E2A',
              backgroundColor: '#F5E6DA',
              fontSize: '11px',
              fontFamily: "'Pixelify Sans', monospace",
              display: 'inline-block',
            }}
          >
            Selected: <strong>{selectedMood}</strong>
          </div>
        )}
      </div>
    </div>
  );
};
