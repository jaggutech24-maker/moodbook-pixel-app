import { useEffect } from 'react';
import { useMoodBookStore } from './store/useMoodBookStore';
import { HomeScreen } from './features/HomeScreen';
import { MoodSelector } from './features/MoodSelector';
import { DrawPanel } from './features/DrawPanel';
import { GuessPanel } from './features/GuessPanel';
import { ResultScreen } from './features/ResultScreen';
import { roomSync } from './lib/roomSync';

export default function App() {
  const { phase, roomCode } = useMoodBookStore();

  useEffect(() => {
    const unsub = roomSync.subscribe((event) => {
      const store = useMoodBookStore.getState();
      
      switch (event.type) {
        case 'PING':
          if (store.phase === 'lobby') {
            store.setPartnerName(event.playerName);
            store.setPhase(store.isDrawer ? 'mood' : 'guess');
            roomSync.emit({ type: 'PARTNER_JOINED', playerName: store.playerName });
          }
          break;
        case 'PARTNER_JOINED':
          if (store.phase === 'lobby') {
            store.setPartnerName(event.playerName);
            store.setPhase(store.isDrawer ? 'mood' : 'guess');
          }
          break;
        case 'MOOD_SELECTED':
          store.setPartnerMood(event.mood);
          break;
        case 'DRAWING_SUBMITTED':
          store.setPartnerDrawingDataUrl(event.dataUrl);
          store.setPartnerStrokes(event.strokes);
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
          <div className="flex flex-col items-center justify-center h-full text-center gap-4">
            <h2 style={{ fontFamily: "'Press Start 2P', monospace", color: '#3A2E2A', fontSize: '18px' }}>
              WAITING FOR PARTNER...
            </h2>
            <div className="bg-[#FDF4EE] border-4 border-[#3A2E2A] p-4 shadow-[4px_4px_0px_#3A2E2A]">
              <p style={{ fontFamily: "'Pixelify Sans', monospace", color: '#8B6348', fontSize: '16px', fontWeight: 'bold' }}>
                Room Code:
              </p>
              <h1 style={{ fontFamily: "'Press Start 2P', monospace", color: '#D8A7B1', fontSize: '32px', marginTop: '10px' }}>
                {roomCode}
              </h1>
            </div>
            <p style={{ fontFamily: "'Pixelify Sans', monospace", color: '#8B6348' }}>
              Share this code so they can join!
            </p>
            <div className="flex gap-4 mt-4">
              <button 
                className="pixel-button pixel-button-blue"
                onClick={() => useMoodBookStore.getState().setPhase('home')}
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
