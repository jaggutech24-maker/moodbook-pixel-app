/**
 * MoodBook — GuessPanel
 * Right page: partner guesses the mood from the drawing
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMoodBookStore, MoodOption } from '../store/useMoodBookStore';
import { DrawingCanvas } from './DrawingCanvas';
import { sounds } from '../lib/sounds';
import { PixelButton } from '../components/PixelButton';
import { roomSync } from '../lib/roomSync';
import { MOODS } from './MoodSelector';

export const GuessPanel: React.FC = () => {
  const {
    partnerDrawingDataUrl,
    drawingDataUrl,
    partnerStrokes,
    strokes,
    setCurrentGuess,
    selectedMood,
    partnerMood,
    setIsCorrect,
    setPhase,
    roomCode,
    isDrawer,
    setIsPlayingBack,
    addRound,
  } = useMoodBookStore();

  const [selectedGuess, setSelectedGuess] = useState<MoodOption | null>(null);
  const [customGuess, setCustomGuess] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  // Determine which drawing to show
  const displayDataUrl = isDrawer ? drawingDataUrl : partnerDrawingDataUrl;
  const displayStrokes = isDrawer ? strokes : partnerStrokes;
  const moodToGuess = isDrawer ? selectedMood : partnerMood;

  const handleGuessSelect = (mood: MoodOption) => {
    setSelectedGuess(mood);
    setCurrentGuess(mood);
    setShowCustom(false);
    sounds.click();
  };

  const handleSubmitGuess = () => {
    const guess = selectedGuess || customGuess.trim();
    if (!guess) return;
    sounds.click();

    const correct = guess.toLowerCase().trim() === (moodToGuess || '').toLowerCase().trim();

    // Sync guess to partner
    if (roomCode !== 'SOLO') {
      roomSync.emit({ type: 'GUESS_SUBMITTED', guess });
    }

    setIsCorrect(correct);
    if (correct) sounds.success();
    else sounds.wrong();

    // Add to history
    addRound({
      id: Date.now().toString(),
      drawerMood: moodToGuess || '',
      drawingDataUrl: displayDataUrl,
      strokes: displayStrokes,
      guess,
      isCorrect: correct,
      timestamp: Date.now(),
      drawerId: isDrawer ? 'you' : 'partner',
      guesserId: isDrawer ? 'partner' : 'you',
    });

    setPhase('result');
  };

  return (
    <div className="flex flex-col h-full gap-3 p-3" style={{ backgroundColor: '#FDF4EE' }}>
      {/* Header */}
      <div style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '9px',
        color: '#3A2E2A',
        textAlign: 'center',
        padding: '6px',
        backgroundColor: '#A7C7E7',
        border: '2px solid #3A2E2A',
        boxShadow: '2px 2px 0 #3A2E2A',
      }}>
        🔍 GUESS THE MOOD!
      </div>

      {/* Drawing Preview */}
      <div style={{ position: 'relative' }}>
        {displayDataUrl ? (
          <div className="pixel-border" style={{ overflow: 'hidden', maxHeight: '180px' }}>
            <img
              src={displayDataUrl}
              alt="Drawing to guess"
              style={{
                width: '100%',
                imageRendering: 'pixelated',
                display: 'block',
              }}
            />
          </div>
        ) : displayStrokes.length > 0 ? (
          <div className="pixel-border" style={{ overflow: 'hidden' }}>
            <DrawingCanvas
              width={400}
              height={250}
              readOnly={true}
              playbackStrokes={displayStrokes}
              className="w-full"
            />
          </div>
        ) : (
          <div className="pixel-border" style={{
            height: '160px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F5E6DA',
          }}>
            <span style={{
              fontFamily: "'Pixelify Sans', monospace",
              fontSize: '13px',
              color: '#C4956A',
              textAlign: 'center',
            }}>
              {isDrawer ? 'Your drawing\nwill appear here' : 'Waiting for\npartner to draw...'}
            </span>
          </div>
        )}

        {/* Replay button */}
        {displayStrokes.length > 0 && (
          <button
            onClick={() => { setIsPlayingBack(true); sounds.click(); }}
            style={{
              position: 'absolute',
              bottom: '6px',
              right: '6px',
              padding: '3px 8px',
              border: '2px solid #3A2E2A',
              backgroundColor: '#F5D6A8',
              boxShadow: '2px 2px 0 #3A2E2A',
              cursor: 'pointer',
              fontSize: '10px',
              fontFamily: "'Pixelify Sans', monospace",
            }}
          >
            ▶ Replay
          </button>
        )}
      </div>

      {/* Guess Options */}
      <div className="flex flex-col gap-2" style={{ flex: 1 }}>
        <p style={{
          fontFamily: "'Pixelify Sans', monospace",
          fontSize: '12px',
          color: '#3A2E2A',
          fontWeight: 600,
        }}>
          What mood is this? 🤔
        </p>

        <div className="grid grid-cols-3 gap-1">
          {MOODS.map((mood) => (
            <motion.button
              key={mood.label}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleGuessSelect(mood.label)}
              style={{
                padding: '6px 4px',
                border: `${selectedGuess === mood.label ? '3px' : '2px'} solid #3A2E2A`,
                backgroundColor: selectedGuess === mood.label ? mood.color : '#FDF4EE',
                boxShadow: selectedGuess === mood.label ? '0 0 0 #3A2E2A' : '2px 2px 0 #3A2E2A',
                transform: selectedGuess === mood.label ? 'translate(2px,2px)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                fontFamily: "'Pixelify Sans', monospace",
                fontSize: '10px',
                fontWeight: 600,
                color: '#3A2E2A',
              }}
            >
              <span style={{ fontSize: '18px' }}>{mood.emoji}</span>
              {mood.label}
            </motion.button>
          ))}
        </div>

        {/* Custom guess */}
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
              textAlign: 'left',
            }}
          >
            ✏️ Custom answer...
          </button>
        ) : (
          <div className="flex gap-2">
            <input
              className="pixel-input"
              placeholder="Type your guess..."
              value={customGuess}
              onChange={(e) => { setCustomGuess(e.target.value); setSelectedGuess(null); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitGuess()}
              autoFocus
              style={{ fontSize: '12px' }}
            />
          </div>
        )}
      </div>

      {/* Submit */}
      <PixelButton
        variant="blue"
        size="md"
        style={{ width: '100%', justifyContent: 'center' }}
        onClick={handleSubmitGuess}
        disabled={!selectedGuess && !customGuess.trim()}
      >
        🎯 Submit Guess!
      </PixelButton>
    </div>
  );
};
