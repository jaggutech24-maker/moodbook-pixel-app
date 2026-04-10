/**
 * MoodBook — ResultScreen
 * Shows the result: original mood vs guess, drawing, correct/wrong
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useMoodBookStore } from '../store/useMoodBookStore';
import { PixelButton } from '../components/PixelButton';
import { sounds } from '../lib/sounds';
import { MOODS } from './MoodSelector';

const CORRECT_MESSAGES = [
  '🎉 PERFECT MATCH!', '✨ MIND READER!', '💕 YOU KNOW ME!', '🌟 SPOT ON!', '🎊 AMAZING!',
];
const WRONG_MESSAGES = [
  '😅 NOT QUITE!', '🤔 CLOSE ENOUGH?', '💫 KEEP TRYING!', '🙈 NOPE!', '🎭 PLOT TWIST!',
];

const getRandMsg = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

export const ResultScreen: React.FC = () => {
  const {
    isCorrect,
    selectedMood,
    partnerMood,
    isDrawer,
    drawingDataUrl,
    partnerDrawingDataUrl,
    resetRound,
    setPhase,
    rounds,
    setIsPlayingBack,
  } = useMoodBookStore();

  const actualMood = isDrawer ? selectedMood : partnerMood;
  const displayedDataUrl = isDrawer ? drawingDataUrl : partnerDrawingDataUrl;
  const moodConfig = MOODS.find(m => m.label === actualMood);
  const lastRound = rounds[0];

  const message = isCorrect === null
    ? '🤷 NO RESULT'
    : isCorrect
    ? getRandMsg(CORRECT_MESSAGES)
    : getRandMsg(WRONG_MESSAGES);

  const handlePlayAgain = () => {
    sounds.click();
    resetRound();
    setPhase('mood');
  };

  const handleReplayDrawing = () => {
    sounds.click();
    setIsPlayingBack(true);
    setPhase('draw');
  };

  // Stats
  const totalRounds = rounds.length;
  const correctRounds = rounds.filter(r => r.isCorrect).length;
  const accuracy = totalRounds > 0 ? Math.round((correctRounds / totalRounds) * 100) : 0;

  return (
    <div className="flex flex-col h-full gap-0" style={{ overflow: 'hidden' }}>
      {/* ─── Result Banner ─── */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        style={{
          padding: '14px',
          textAlign: 'center',
          backgroundColor: isCorrect ? '#A8D5BA' : '#E8A0A0',
          border: '3px solid #3A2E2A',
          borderTop: 'none',
          boxShadow: '0 4px 0 #3A2E2A',
        }}
      >
        <div style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '11px',
          color: '#3A2E2A',
          lineHeight: 1.6,
        }}>
          {message}
        </div>
      </motion.div>

      {/* ─── Content: Two columns ─── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* LEFT — Drawing */}
        <div style={{
          flex: 1,
          borderRight: '2px solid #3A2E2A',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#FDF4EE',
        }}>
          <div style={{
            padding: '6px 10px',
            backgroundColor: '#D8A7B1',
            borderBottom: '2px solid #3A2E2A',
            fontFamily: "'Pixelify Sans', monospace",
            fontSize: '11px',
            fontWeight: 700,
            color: '#3A2E2A',
          }}>
            🖼️ The Drawing
          </div>
          <div style={{ flex: 1, padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {displayedDataUrl ? (
              <img
                src={displayedDataUrl}
                alt="Drawing"
                style={{
                  width: '100%',
                  border: '2px solid #3A2E2A',
                  imageRendering: 'pixelated',
                  backgroundColor: '#FDF4EE',
                }}
              />
            ) : (
              <div style={{
                flex: 1,
                border: '2px solid #3A2E2A',
                backgroundColor: '#F5E6DA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
              }}>
                <span style={{ fontSize: '40px' }}>{moodConfig?.emoji || '🎭'}</span>
              </div>
            )}

            {/* Actual mood */}
            <div style={{
              padding: '6px 10px',
              backgroundColor: moodConfig?.color || '#D8A7B1',
              border: '2px solid #3A2E2A',
              boxShadow: '2px 2px 0 #3A2E2A',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span style={{ fontSize: '18px' }}>{moodConfig?.emoji || '🎭'}</span>
              <div>
                <div style={{ fontFamily: "'Pixelify Sans', monospace", fontSize: '9px', color: '#8B6348' }}>ACTUAL MOOD</div>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '9px', color: '#3A2E2A' }}>{actualMood || '???'}</div>
              </div>
            </div>

            <button
              onClick={handleReplayDrawing}
              style={{
                padding: '5px',
                border: '2px solid #3A2E2A',
                backgroundColor: '#F5D6A8',
                cursor: 'pointer',
                boxShadow: '2px 2px 0 #3A2E2A',
                fontFamily: "'Pixelify Sans', monospace",
                fontSize: '11px',
                color: '#3A2E2A',
                fontWeight: 600,
              }}
            >
              ▶ Watch Replay
            </button>
          </div>
        </div>

        {/* RIGHT — Guess & Result */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#FDF4EE',
        }}>
          <div style={{
            padding: '6px 10px',
            backgroundColor: '#A7C7E7',
            borderBottom: '2px solid #3A2E2A',
            fontFamily: "'Pixelify Sans', monospace",
            fontSize: '11px',
            fontWeight: 700,
            color: '#3A2E2A',
          }}>
            🔍 The Guess
          </div>
          <div style={{ flex: 1, padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Guess result */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              style={{
                padding: '12px',
                border: '3px solid #3A2E2A',
                backgroundColor: isCorrect ? '#A8D5BA' : '#E8A0A0',
                boxShadow: '3px 3px 0 #3A2E2A',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '4px' }}>
                {isCorrect ? '✅' : '❌'}
              </div>
              <div style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '7px',
                color: '#3A2E2A',
                marginBottom: '6px',
              }}>
                PARTNER GUESSED:
              </div>
              <div style={{
                fontFamily: "'Pixelify Sans', monospace",
                fontSize: '16px',
                fontWeight: 700,
                color: '#3A2E2A',
              }}>
                {lastRound?.guess || '???'}
              </div>
            </motion.div>

            {/* Score streak */}
            <div style={{
              padding: '8px',
              border: '2px solid #3A2E2A',
              backgroundColor: '#F5E6DA',
              boxShadow: '2px 2px 0 #3A2E2A',
            }}>
              <div style={{ fontFamily: "'Pixelify Sans', monospace", fontSize: '11px', fontWeight: 700, color: '#3A2E2A', marginBottom: '4px' }}>
                📊 Session Stats
              </div>
              <div style={{ fontFamily: "'Pixelify Sans', monospace", fontSize: '11px', color: '#8B6348' }}>
                Rounds: {totalRounds} • Correct: {correctRounds}
              </div>
              <div style={{ display: 'flex', height: '6px', gap: '2px', marginTop: '6px' }}>
                {rounds.slice(0, 10).reverse().map((r, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      backgroundColor: r.isCorrect ? '#A8D5BA' : '#E8A0A0',
                      border: '1px solid #3A2E2A',
                    }}
                  />
                ))}
              </div>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: '#3A2E2A', marginTop: '4px' }}>
                {accuracy}% ACCURACY
              </div>
            </div>

            {/* Fun flavor text */}
            <div style={{
              padding: '8px',
              border: '2px dashed #C4956A',
              backgroundColor: '#FDF4EE',
              fontFamily: "'Pixelify Sans', monospace",
              fontSize: '11px',
              color: '#8B6348',
              fontStyle: 'italic',
            }}>
              {isCorrect
                ? '"You two are so in sync! 💕"'
                : '"Keep drawing, keep guessing! 🎨"'}
            </div>

            {/* Play again */}
            <PixelButton
              variant="default"
              size="md"
              style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}
              onClick={handlePlayAgain}
            >
              🔄 Play Again!
            </PixelButton>
          </div>
        </div>
      </div>
    </div>
  );
};
