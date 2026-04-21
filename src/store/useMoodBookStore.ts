/**
 * MoodBook — Global State Store (Zustand)
 * Manages all app state: room, game phase, drawing, mood, guesses
 */

import { create } from 'zustand';

// ─── Types ────────────────────────────────────────────────────────────────────

export type GamePhase =
  | 'home'       // Landing / room selection
  | 'lobby'      // Waiting for partner
  | 'mood'       // Select mood to draw
  | 'draw'       // Drawing phase
  | 'waiting'    // Waiting for partner to guess
  | 'guess'      // Guessing partner's drawing
  | 'result'     // Show result
  | 'history'    // History view
  | 'stats'      // Stats view
  | 'settings';  // Settings

export type TabId = 'draw' | 'guess' | 'stats' | 'history' | 'settings';

export type MoodOption = 'Happy' | 'Sad' | 'Angry' | 'Love' | 'Tired' | string;

export interface Stroke {
  points: { x: number; y: number }[];
  color: string;
  size: number;
  tool: 'pen' | 'eraser';
}

export interface GameRound {
  id: string;
  drawerMood: MoodOption;
  drawingDataUrl: string;
  strokes: Stroke[];
  guess: string;
  isCorrect: boolean;
  timestamp: number;
  drawerId: string;
  guesserId: string;
}

export interface PlayerInfo {
  id: string;
  name: string;
  isDrawer: boolean;
}

export interface RoomState {
  roomCode: string;
  players: PlayerInfo[];
  phase: GamePhase;
  currentRound: Partial<GameRound> | null;
  rounds: GameRound[];
}

export interface DrawingTool {
  type: 'pen' | 'eraser';
  color: string;
  size: number;
}

// ─── Store Interface ───────────────────────────────────────────────────────────

interface MoodBookState {
  // App Phase
  phase: GamePhase;
  setPhase: (phase: GamePhase) => void;

  // Active Tab
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;

  // Player
  playerId: string;
  playerName: string;
  setPlayerName: (name: string) => void;
  isDrawer: boolean;
  setIsDrawer: (val: boolean) => void;
  isHost: boolean;
  setIsHost: (val: boolean) => void;

  // Room
  roomCode: string;
  setRoomCode: (code: string) => void;
  partnerName: string;
  setPartnerName: (name: string) => void;

  // Mood Selection
  selectedMood: MoodOption | null;
  customMood: string;
  setSelectedMood: (mood: MoodOption) => void;
  setCustomMood: (mood: string) => void;

  // Drawing
  strokes: Stroke[];
  currentStroke: Stroke | null;
  addStroke: (stroke: Stroke) => void;
  setCurrentStroke: (stroke: Stroke | null) => void;
  clearStrokes: () => void;
  drawingDataUrl: string;
  setDrawingDataUrl: (url: string) => void;
  partnerDrawingDataUrl: string;
  setPartnerDrawingDataUrl: (url: string) => void;
  partnerStrokes: Stroke[];
  setPartnerStrokes: (strokes: Stroke[]) => void;

  // Drawing Tool
  tool: DrawingTool;
  setToolType: (type: 'pen' | 'eraser') => void;
  setToolColor: (color: string) => void;
  setToolSize: (size: number) => void;

  // Timer
  timeLeft: number;
  setTimeLeft: (t: number) => void;
  timerActive: boolean;
  setTimerActive: (v: boolean) => void;

  // Guess
  currentGuess: string;
  setCurrentGuess: (g: string) => void;
  partnerGuess: string;
  setPartnerGuess: (g: string) => void;
  partnerMood: MoodOption | null;
  setPartnerMood: (m: MoodOption) => void;

  // Result
  isCorrect: boolean | null;
  setIsCorrect: (v: boolean | null) => void;

  // History
  rounds: GameRound[];
  addRound: (round: GameRound) => void;
  clearHistory: () => void;

  // Settings
  showGrid: boolean;
  setShowGrid: (v: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;

  // Playback
  isPlayingBack: boolean;
  setIsPlayingBack: (v: boolean) => void;

  // Reset for new round
  resetRound: () => void;
}

// ─── Store Implementation ──────────────────────────────────────────────────────

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useMoodBookStore = create<MoodBookState>((set) => ({
  // App Phase
  phase: 'home',
  setPhase: (phase) => set({ phase }),

  // Active Tab
  activeTab: 'draw',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Player
  playerId: generateId(),
  playerName: '',
  setPlayerName: (name) => set({ playerName: name }),
  isDrawer: true,
  setIsDrawer: (val) => set({ isDrawer: val }),
  isHost: false,
  setIsHost: (val) => set({ isHost: val }),

  // Room
  roomCode: '',
  setRoomCode: (code) => set({ roomCode: code }),
  partnerName: '',
  setPartnerName: (name) => set({ partnerName: name }),

  // Mood
  selectedMood: null,
  customMood: '',
  setSelectedMood: (mood) => set({ selectedMood: mood }),
  setCustomMood: (mood) => set({ customMood: mood }),

  // Drawing
  strokes: [],
  currentStroke: null,
  addStroke: (stroke) => set((state) => ({ strokes: [...state.strokes, stroke] })),
  setCurrentStroke: (stroke) => set({ currentStroke: stroke }),
  clearStrokes: () => set({ strokes: [], currentStroke: null }),
  drawingDataUrl: '',
  setDrawingDataUrl: (url) => set({ drawingDataUrl: url }),
  partnerDrawingDataUrl: '',
  setPartnerDrawingDataUrl: (url) => set({ partnerDrawingDataUrl: url }),
  partnerStrokes: [],
  setPartnerStrokes: (strokes) => set({ partnerStrokes: strokes }),

  // Tool
  tool: { type: 'pen', color: '#3A2E2A', size: 4 },
  setToolType: (type) => set((state) => ({ tool: { ...state.tool, type } })),
  setToolColor: (color) => set((state) => ({ tool: { ...state.tool, color } })),
  setToolSize: (size) => set((state) => ({ tool: { ...state.tool, size } })),

  // Timer
  timeLeft: 30,
  setTimeLeft: (t) => set({ timeLeft: t }),
  timerActive: false,
  setTimerActive: (v) => set({ timerActive: v }),

  // Guess
  currentGuess: '',
  setCurrentGuess: (g) => set({ currentGuess: g }),
  partnerGuess: '',
  setPartnerGuess: (g) => set({ partnerGuess: g }),
  partnerMood: null,
  setPartnerMood: (m) => set({ partnerMood: m }),

  // Result
  isCorrect: null,
  setIsCorrect: (v) => set({ isCorrect: v }),

  // History
  rounds: [],
  addRound: (round) => set((state) => ({ rounds: [round, ...state.rounds] })),
  clearHistory: () => set({ rounds: [] }),

  // Settings
  showGrid: false,
  setShowGrid: (v) => set({ showGrid: v }),
  soundEnabled: true,
  setSoundEnabled: (v) => set({ soundEnabled: v }),

  // Playback
  isPlayingBack: false,
  setIsPlayingBack: (v) => set({ isPlayingBack: v }),

  // Reset for new round
  resetRound: () => set({
    selectedMood: null,
    customMood: '',
    strokes: [],
    currentStroke: null,
    drawingDataUrl: '',
    currentGuess: '',
    partnerGuess: '',
    partnerMood: null,
    isCorrect: null,
    timeLeft: 30,
    timerActive: false,
    isPlayingBack: false,
    tool: { type: 'pen', color: '#3A2E2A', size: 4 },
  }),
}));
