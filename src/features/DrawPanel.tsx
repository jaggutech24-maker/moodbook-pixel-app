/**
 * MoodBook — DrawPanel
 * Left page: canvas, tools, timer, mood display
 */

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useMoodBookStore } from '../store/useMoodBookStore';
import { DrawingCanvas } from './DrawingCanvas';
import { Timer } from './Timer';
import { PixelButton } from '../components/PixelButton';
import { sounds } from '../lib/sounds';
import { roomSync } from '../lib/roomSync';
import { MOODS } from './MoodSelector';

const PEN_COLORS = ['#3A2E2A', '#E8A0A0', '#A7C7E7', '#A8D5BA', '#D8A7B1', '#F5D6A8', '#C8A7D8'];
const PEN_SIZES = [2, 4, 7, 12];

export const DrawPanel: React.FC = () => {
  const {
    selectedMood,
    tool,
    setToolType,
    setToolColor,
    setToolSize,
    strokes,
    clearStrokes,
    setDrawingDataUrl,
    setPhase,
    setTimerActive,
    showGrid,
    setShowGrid,
    isPlayingBack,
    setIsPlayingBack,
    roomCode,
  } = useMoodBookStore();

  const moodConfig = MOODS.find(m => m.label === selectedMood);

  const handleTimeUp = useCallback(() => {
    submitDrawing();
  }, [strokes]);

  const submitDrawing = useCallback(() => {
    setTimerActive(false);
    // Capture canvas image
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    const dataUrl = canvas ? canvas.toDataURL('image/png') : '';
    setDrawingDataUrl(dataUrl);

    // Sync to partner if in a room
    if (roomCode !== 'SOLO') {
      roomSync.emit({
        type: 'DRAWING_SUBMITTED',
        dataUrl,
        strokes,
      });
    }

    setPhase(roomCode === 'SOLO' ? 'guess' : 'waiting');
  }, [strokes, roomCode, setDrawingDataUrl, setPhase, setTimerActive]);

  const handleClear = () => {
    clearStrokes();
    sounds.click();
  };

  const handlePlayback = () => {
    if (strokes.length === 0) return;
    sounds.click();
    setIsPlayingBack(true);
  };

  return (
    <div className="flex flex-col h-full gap-2 p-3" style={{ backgroundColor: '#FDF4EE' }}>
      {/* Mood Badge */}
      <div className="flex items-center justify-between">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: '2px solid #3A2E2A',
            padding: '4px 10px',
            backgroundColor: moodConfig?.color || '#D8A7B1',
            boxShadow: '2px 2px 0 #3A2E2A',
          }}
        >
          <span style={{ fontSize: '16px' }}>{moodConfig?.emoji || '🎭'}</span>
          <span style={{
            fontFamily: "'Pixelify Sans', monospace",
            fontSize: '12px',
            fontWeight: 700,
            color: '#3A2E2A',
          }}>
            Draw: <strong>{selectedMood || '???'}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => { setShowGrid(!showGrid); sounds.click(); }}
            style={{
              width: '28px', height: '28px',
              border: `2px solid #3A2E2A`,
              backgroundColor: showGrid ? '#A7C7E7' : '#FDF4EE',
              cursor: 'pointer',
              fontSize: '13px',
              boxShadow: '1px 1px 0 #3A2E2A',
            }}
            title="Toggle grid"
          >
            ⊞
          </button>
          <button
            onClick={handlePlayback}
            disabled={strokes.length === 0 || isPlayingBack}
            style={{
              width: '28px', height: '28px',
              border: `2px solid #3A2E2A`,
              backgroundColor: '#A8D5BA',
              cursor: strokes.length > 0 ? 'pointer' : 'not-allowed',
              fontSize: '11px',
              boxShadow: '1px 1px 0 #3A2E2A',
              opacity: strokes.length === 0 ? 0.5 : 1,
            }}
            title="Replay drawing"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Timer */}
      <Timer onTimeUp={handleTimeUp} />

      {/* Canvas */}
      <div
        className="pixel-border"
        style={{
          flex: 1,
          overflow: 'hidden',
          backgroundColor: '#FDF4EE',
          position: 'relative',
          minHeight: '180px',
        }}
      >
        <DrawingCanvas
          width={400}
          height={300}
          className="w-full h-full"
          onDrawingChange={(url) => setDrawingDataUrl(url)}
        />
        {isPlayingBack && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: '#F5D6A8',
            border: '2px solid #3A2E2A',
            padding: '2px 8px',
            fontSize: '10px',
            fontFamily: "'Press Start 2P', monospace",
            boxShadow: '2px 2px 0 #3A2E2A',
          }}>
            ▶ REPLAY
          </div>
        )}
      </div>

      {/* Tools Row */}
      <div className="flex flex-col gap-2">
        {/* Pen / Eraser */}
        <div className="flex gap-2 items-center">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { setToolType('pen'); sounds.click(); }}
            style={{
              flex: 1,
              padding: '6px',
              border: `${tool.type === 'pen' ? '3px' : '2px'} solid #3A2E2A`,
              backgroundColor: tool.type === 'pen' ? '#D8A7B1' : '#FDF4EE',
              boxShadow: tool.type === 'pen' ? '0 0 0 #3A2E2A' : '2px 2px 0 #3A2E2A',
              transform: tool.type === 'pen' ? 'translate(2px,2px)' : 'none',
              cursor: 'pointer',
              fontFamily: "'Pixelify Sans', monospace",
              fontSize: '12px',
              fontWeight: 700,
              color: '#3A2E2A',
            }}
          >
            ✏️ Pen
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { setToolType('eraser'); sounds.click(); }}
            style={{
              flex: 1,
              padding: '6px',
              border: `${tool.type === 'eraser' ? '3px' : '2px'} solid #3A2E2A`,
              backgroundColor: tool.type === 'eraser' ? '#A7C7E7' : '#FDF4EE',
              boxShadow: tool.type === 'eraser' ? '0 0 0 #3A2E2A' : '2px 2px 0 #3A2E2A',
              transform: tool.type === 'eraser' ? 'translate(2px,2px)' : 'none',
              cursor: 'pointer',
              fontFamily: "'Pixelify Sans', monospace",
              fontSize: '12px',
              fontWeight: 700,
              color: '#3A2E2A',
            }}
          >
            🧹 Erase
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleClear}
            style={{
              padding: '6px 10px',
              border: '2px solid #3A2E2A',
              backgroundColor: '#E8A0A0',
              boxShadow: '2px 2px 0 #3A2E2A',
              cursor: 'pointer',
              fontFamily: "'Pixelify Sans', monospace",
              fontSize: '12px',
              fontWeight: 700,
              color: '#3A2E2A',
            }}
          >
            🗑️
          </motion.button>
        </div>

        {/* Color Palette */}
        {tool.type === 'pen' && (
          <div className="flex gap-1 items-center">
            {PEN_COLORS.map((color) => (
              <motion.button
                key={color}
                whileTap={{ scale: 0.8 }}
                onClick={() => { setToolColor(color); sounds.click(); }}
                style={{
                  width: tool.color === color ? '26px' : '22px',
                  height: tool.color === color ? '26px' : '22px',
                  backgroundColor: color,
                  border: `${tool.color === color ? '3px' : '2px'} solid #3A2E2A`,
                  boxShadow: tool.color === color ? '0 0 0 #3A2E2A' : '1px 1px 0 #3A2E2A',
                  cursor: 'pointer',
                  transition: 'all 0.1s',
                  flexShrink: 0,
                }}
              />
            ))}
            <div style={{ flex: 1 }} />
            {/* Size dots */}
            {PEN_SIZES.map((size) => (
              <motion.button
                key={size}
                whileTap={{ scale: 0.8 }}
                onClick={() => { setToolSize(size); sounds.click(); }}
                style={{
                  width: '22px',
                  height: '22px',
                  border: `${tool.size === size ? '3px' : '2px'} solid #3A2E2A`,
                  backgroundColor: tool.size === size ? '#F5D6A8' : '#FDF4EE',
                  boxShadow: tool.size === size ? '0 0 0 #3A2E2A' : '1px 1px 0 #3A2E2A',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <div style={{
                  width: Math.min(size, 12) + 'px',
                  height: Math.min(size, 12) + 'px',
                  borderRadius: '50%',
                  backgroundColor: '#3A2E2A',
                }} />
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <PixelButton
        variant="default"
        size="md"
        style={{ width: '100%', justifyContent: 'center' }}
        onClick={submitDrawing}
        disabled={strokes.length === 0}
      >
        📤 Submit Drawing
      </PixelButton>
    </div>
  );
};
