import { useEffect, useState } from 'react';
import { useMoodBookStore } from './store/useMoodBookStore';
import { HomeScreen } from './features/HomeScreen';
import { MoodSelector } from './features/MoodSelector';
import { DrawPanel } from './features/DrawPanel';
import { GuessPanel } from './features/GuessPanel';
import { ResultScreen } from './features/ResultScreen';
import { roomSync } from './lib/roomSync';

export default function App() {
  const { phase, roomCode } = useMoodBookStore();
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    const unsub = roomSync.subscribe((event) => {
      const store = useMoodBookStore.getState();

      switch (event.type) {
        case 'PING':
          // Host receives this from Joiner
          if (store.phase === 'lobby' || store.phase === 'home') {
            store.setPartnerName(event.playerName);
            // Tell joiner we are ready!
            roomSync.emit({ type: 'PARTNER_JOINED', playerName: store.playerName });
            // Advance: Host (isDrawer) goes to mood, Joiner (if any) goes to guess
            store.setPhase(store.isDrawer ? 'mood' : 'guess');
          }
          break;
        case 'PARTNER_JOINED':
          // Joiner receives this from Host
          store.setPartnerName(event.playerName);
          if (store.phase === 'lobby' || store.phase === 'home' || store.phase === 'guess') {
            // Advance based on role
            store.setPhase(store.isDrawer ? 'mood' : 'guess');
          }
          break;
        case 'MOOD_SELECTED':
          store.setPartnerMood(event.mood);
          break;
        case 'DRAWING_SUBMITTED':
          store.setPartnerDrawingDataUrl(event.dataUrl);
          store.setPartnerStrokes(event.strokes);
          // Advance guesser from their waiting state to guess
          if (store.phase === 'guess' || store.phase === 'lobby') {
            store.setPhase('guess');
          }
          break;
        case 'GUESS_SUBMITTED':
          store.setPartnerGuess(event.guess);
          if (store.phase === 'waiting') {
            store.setPhase('result');
          }
          break;
        case 'PHASE_CHANGED':
          store.setPhase(event.phase as any);
          break;
        case 'ROUND_RESET':
          store.resetRound();
          break;
      }
    });

    return () => unsub();
  }, []);

  const renderPhase = () => {
    switch (phase) {
      case 'home':
        return <HomeScreen />;
      case 'lobby':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4" style={{ padding: '20px' }}>
            {/* Animated waiting dots */}
            <div style={{ fontFamily: "'Press Start 2P', monospace", color: '#3A2E2A', fontSize: '14px' }}>
              ⏳ WAITING FOR PARTNER
            </div>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              backgroundColor: '#D8A7B1',
              animation: 'pulse 1.2s ease-in-out infinite',
              margin: '-8px auto',
            }} />

            {/* Room code card */}
            <div style={{
              backgroundColor: '#FDF4EE',
              border: '4px solid #3A2E2A',
              padding: '20px 28px',
              boxShadow: '4px 4px 0px #3A2E2A',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
            }}>
              <p style={{ fontFamily: "'Pixelify Sans', monospace", color: '#8B6348', fontSize: '14px', fontWeight: 'bold' }}>
                📋 Room Code
              </p>
              <div style={{
                fontFamily: "'Press Start 2P', monospace",
                color: '#D8A7B1',
                fontSize: '28px',
                letterSpacing: '4px',
                lineHeight: 1.2,
              }}>
                {roomCode}
              </div>
              <button
                onClick={copyCode}
                style={{
                  fontFamily: "'Pixelify Sans', monospace",
                  fontSize: '12px',
                  padding: '6px 14px',
                  border: '2px solid #3A2E2A',
                  backgroundColor: copied ? '#A8D5BA' : '#F5D6A8',
                  boxShadow: '2px 2px 0 #3A2E2A',
                  cursor: 'pointer',
                  color: '#3A2E2A',
                  fontWeight: 700,
                  transition: 'background-color 0.2s',
                }}
              >
                {copied ? '✅ Copied!' : '📋 Copy Code'}
              </button>
            </div>

            <p style={{ fontFamily: "'Pixelify Sans', monospace", color: '#8B6348', fontSize: '13px' }}>
              Share this code with your partner on any device!
            </p>

            <div className="flex gap-4 mt-2">
              <button
                className="pixel-button pixel-button-blue"
                onClick={() => { roomSync.leave(); useMoodBookStore.getState().setPhase('home'); }}
              >
                ← Back
              </button>
              <button
                className="pixel-button pixel-button-yellow"
                onClick={() => useMoodBookStore.getState().setPhase('mood')}
              >
                Skip & Solo Play
              </button>
            </div>
          </div>
        );
      case 'waiting':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4">
            <h2 style={{ fontFamily: "'Press Start 2P', monospace", color: '#3A2E2A' }}>
              WAITING...
            </h2>
            <p style={{ fontFamily: "'Pixelify Sans', monospace", color: '#8B6348' }}>
              Waiting for partner to finish guessing.
            </p>
            <button
              className="pixel-button"
              onClick={() => useMoodBookStore.getState().setPhase('result')}
            >
              Skip Wait (Demo)
            </button>
          </div>
        );
      case 'mood':
        return <MoodSelector onSelect={() => useMoodBookStore.getState().setPhase('draw')} />;
      case 'draw':
        return <DrawPanel />;
      case 'guess':
        return <GuessPanel />;
      case 'result':
        return <ResultScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4 sm:p-8"
      style={{ backgroundColor: '#2C221F' }} // Dark wood/desk background
    >
      <div
        className="w-full max-w-4xl mx-auto flex relative"
        style={{ height: '85vh', minHeight: '600px' }}
      >
        {/* Book Spine */}
        <div className="book-spine h-full hidden sm:block shadow-[-10px_10px_20px_rgba(0,0,0,0.5)] z-10" style={{ width: '30px' }}></div>

        {/* Main Book Page */}
        <div
          className="book-container flex-1 h-full border-4 border-[#3A2E2A] rounded-r-2xl overflow-hidden flex flex-col shadow-[15px_15px_0px_#1A1311]"
          style={{ backgroundColor: 'var(--color-bg)' }}
        >
          {/* Decorative Corners */}
          <div className="book-corner" style={{ top: 0, right: 0, borderBottomLeftRadius: '10px' }} />
          <div className="book-corner" style={{ bottom: 0, right: 0, borderTopLeftRadius: '10px' }} />

          <div className="flex-1 overflow-y-auto relative p-2 sm:p-6 w-full h-full flex flex-col">
            {renderPhase()}
          </div>
        </div>
      </div>
    </div>
  );
}
