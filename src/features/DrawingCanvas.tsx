/**
 * MoodBook — DrawingCanvas
 * HTML5 Canvas with pixel rendering, stroke tracking,
 * mouse + touch support, pen/eraser tools, and playback
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { useMoodBookStore, Stroke } from '../store/useMoodBookStore';
import { sounds } from '../lib/sounds';

interface DrawingCanvasProps {
  width?: number;
  height?: number;
  readOnly?: boolean;
  playbackStrokes?: Stroke[];
  onDrawingChange?: (dataUrl: string) => void;
  className?: string;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  width = 400,
  height = 300,
  readOnly = false,
  playbackStrokes,
  onDrawingChange,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const currentPoints = useRef<{ x: number; y: number }[]>([]);

  const { tool, strokes, addStroke, setCurrentStroke, showGrid, soundEnabled } = useMoodBookStore();

  // ─── Draw Entire Canvas ──────────────────────────────────────────────────────

  const redrawAll = useCallback((strokeList: Stroke[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    // Clear with paper background
    ctx.fillStyle = '#FDF4EE';
    ctx.fillRect(0, 0, width, height);

    // Draw grid if enabled
    if (showGrid) {
      ctx.strokeStyle = 'rgba(58,46,42,0.08)';
      ctx.lineWidth = 1;
      const gridSize = 20;
      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // Replay all strokes
    strokeList.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke.tool === 'eraser' ? '#FDF4EE' : stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.imageSmoothingEnabled = false;

      if (stroke.tool === 'eraser') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = '#FDF4EE';
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      stroke.points.forEach((pt) => ctx.lineTo(pt.x, pt.y));
      ctx.stroke();
    });

    ctx.globalCompositeOperation = 'source-over';
  }, [width, height, showGrid]);

  // ─── Playback Animation ──────────────────────────────────────────────────────

  const { isPlayingBack, setIsPlayingBack } = useMoodBookStore();

  const runPlayback = useCallback(async (strokesToPlay: Stroke[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    // Clear first
    ctx.fillStyle = '#FDF4EE';
    ctx.fillRect(0, 0, width, height);

    for (const stroke of strokesToPlay) {
      if (stroke.points.length < 2) continue;

      ctx.beginPath();
      ctx.strokeStyle = stroke.tool === 'eraser' ? '#FDF4EE' : stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(stroke.points[i].x, stroke.points[i].y);
        await new Promise((r) => setTimeout(r, 8));
      }
    }

    setIsPlayingBack(false);
  }, [width, height, setIsPlayingBack]);

  useEffect(() => {
    if (isPlayingBack && (playbackStrokes || strokes)) {
      runPlayback(playbackStrokes || strokes);
    }
  }, [isPlayingBack]);

  // ─── Initial Render + Redraw on Strokes Change ───────────────────────────────

  useEffect(() => {
    // DO NOT wipe and redraw the canvas if the user is actively holding down the mouse!
    if (!isPlayingBack && !isDrawing.current) {
      redrawAll(playbackStrokes || strokes);
    }
  }, [strokes, playbackStrokes, showGrid, isPlayingBack, redrawAll]);

  // ─── Get Canvas Relative Coords ──────────────────────────────────────────────

  const getPos = (
    e: React.PointerEvent,
    canvas: HTMLCanvasElement
  ): { x: number; y: number } => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // ─── Drawing Handlers ────────────────────────────────────────────────────────

  const startDrawing = useCallback(
    (e: React.PointerEvent) => {
      if (readOnly || isPlayingBack) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      canvas.setPointerCapture(e.pointerId);

      // Start timer on first stroke
      if (!useMoodBookStore.getState().timerActive) {
        useMoodBookStore.getState().setTimerActive(true);
      }

      isDrawing.current = true;
      const pos = getPos(e, canvas);
      lastPoint.current = pos;
      currentPoints.current = [pos];

      setCurrentStroke({
        points: [pos],
        color: tool.color,
        size: tool.size,
        tool: tool.type,
      });
    },
    [readOnly, isPlayingBack, tool, setCurrentStroke]
  );

  const draw = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawing.current || readOnly || isPlayingBack) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d')!;

      const pos = getPos(e, canvas);
      currentPoints.current.push(pos);

      // Draw segment on canvas in real-time
      ctx.beginPath();
      ctx.strokeStyle = tool.type === 'eraser' ? '#FDF4EE' : tool.color;
      ctx.lineWidth = tool.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.imageSmoothingEnabled = false;

      if (lastPoint.current) {
        ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      } else {
        ctx.moveTo(pos.x, pos.y);
      }
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();

      lastPoint.current = pos;

      // Subtle draw sound occasionally
      if (soundEnabled && Math.random() < 0.05) sounds.draw();
    },
    [readOnly, isPlayingBack, tool, soundEnabled]
  );

  const endDrawing = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawing.current || readOnly) return;
      
      const canvas = canvasRef.current;
      if (canvas && canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId);
      }

      isDrawing.current = false;

      if (currentPoints.current.length > 1) {
        const stroke: Stroke = {
          points: [...currentPoints.current],
          color: tool.color,
          size: tool.size,
          tool: tool.type,
        };
        addStroke(stroke);
      }

      currentPoints.current = [];
      lastPoint.current = null;
      setCurrentStroke(null);

      // Notify parent with data URL
      if (onDrawingChange && canvas) {
        onDrawingChange(canvas.toDataURL('image/png'));
      }
    },
    [readOnly, tool, addStroke, setCurrentStroke, onDrawingChange]
  );

  // ─── Export as DataURL ───────────────────────────────────────────────────────

  const getDataUrl = (): string => {
    return canvasRef.current?.toDataURL('image/png') ?? '';
  };

  // Expose via ref if needed
  useEffect(() => {
    (canvasRef.current as any)._getDataUrl = getDataUrl;
  }, []);

  return (
    <div className={`relative ${className}`} style={{ width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="canvas-pixelated block"
        style={{
          width: '100%',
          height: '100%',
          cursor: readOnly ? 'default' : tool.type === 'eraser' ? 'cell' : 'crosshair',
          touchAction: 'none',
          background: '#FDF4EE',
        }}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={endDrawing}
        onPointerOut={endDrawing}
        onPointerCancel={endDrawing}
      />
    </div>
  );
};
