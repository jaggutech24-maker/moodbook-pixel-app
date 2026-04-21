/**
 * MoodBook — HomeScreen
 * Landing page: create or join a room
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMoodBookStore } from '../store/useMoodBookStore';
import { roomSync, generateRoomCode } from '../lib/roomSync';
import { sounds } from '../lib/sounds';
import { PixelButton } from '../components/PixelButton';

type ConnectState = 'idle' | 'connecting' | 'error';

export const HomeScreen: React.FC = () => {
  const { playerName, setPlayerName, setRoomCode, setPhase, playerId, setIsDrawer, setIsHost } = useMoodBookStore();
  const [mode, setMode] = useState<'none' | 'create' | 'join'>('none');
  const [joinCode, setJoinCode] = useState('');
  const [nameInput, setNameInput] = useState(playerName || '');
  const [error, setError] = useState('');
  const [connectState, setConnectState] = useState<ConnectState>('idle');
  const [connectError, setConnectError] = useState('');

  const handleCreate = async () => {
    if (!nameInput.trim()) { setError('Enter your name first!'); return; }
    sounds.click();
    sounds.startBGM();
    const code = generateRoomCode();
    setPlayerName(nameInput.trim());
    setRoomCode(code);
    setIsDrawer(true);
    setIsHost(true);
    setConnectState('connecting');
    setConnectError('');

    try {
      await roomSync.joinRoom(code, playerId, nameInput.trim(), true);
      setConnectState('idle');
      setPhase('lobby');
    } catch (err: any) {
      setConnectState('error');
      setConnectError('Could not create room. Try again.');
      console.error(err);
    }
  };

  const handleJoin = async () => {
    if (!nameInput.trim()) { setError('Enter your name first!'); return; }
    if (joinCode.length < 4) { setError('Enter a valid room code!'); return; }
    sounds.click();
    sounds.startBGM();
    setPlayerName(nameInput.trim());
    setRoomCode(joinCode.toUpperCase());
    setIsDrawer(false);
    setIsHost(false);
    setConnectState('connecting');
    setConnectError('');

    try {
      await roomSync.joinRoom(joinCode.toUpperCase(), playerId, nameInput.trim(), false);
      setConnectState('idle');
      // JOINER: Goes straight to guess phase (waiting for drawing)
      setPhase('guess');
    } catch (err: any) {
      setConnectState('error');
      setConnectError('Could not find that room. Check the code and try again!');
      console.error(err);
    }
  };

  const handleSoloPlay = () => {
    if (!nameInput.trim()) { setError('Enter your name first!'); return; }
    sounds.click();
    sounds.startBGM();
    setPlayerName(nameInput.trim());
    setRoomCode('SOLO');
    setIsDrawer(true);
    setIsHost(true);
    setPhase('mood');
  };

  const isConnecting = connectState === 'connecting';

  return (
    <div
      className="flex flex-col items-center justify-center h-full gap-6"
      style={{ padding: '24px' }}
    >
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <div style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '22px',
          color: '#3A2E2A',
          textShadow: '3px 3px 0 #D8A7B1',
          lineHeight: 1.4,
          marginBottom: '6px',
        }}>
          📖 MoodBook
        </div>
        <div style={{
          fontFamily: "'Pixelify Sans', monospace",
          fontSize: '13px',
          color: '#8B6348',
        }}>
          Draw your mood · Let your partner guess 💕
        </div>
      </motion.div>

      {/* Name Input */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        style={{ width: '100%', maxWidth: '280px' }}
      >
        <div className="pixel-card" style={{ padding: '16px' }}>
          <div className="pixel-card-header" style={{ margin: '-16px -16px 12px -16px' }}>
            👤 Your Name
          </div>
          <input
            className="pixel-input"
            placeholder="e.g. Mochi, Boba..."
            value={nameInput}
            onChange={(e) => { setNameInput(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && setMode('none')}
            maxLength={16}
            disabled={isConnecting}
          />
          {error && (
            <p style={{ fontSize: '10px', color: '#E8A0A0', marginTop: '6px', fontFamily: "'Pixelify Sans', monospace" }}>
              ⚠️ {error}
            </p>
          )}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        style={{ width: '100%', maxWidth: '280px', display: 'flex', flexDirection: 'column', gap: '10px' }}
      >
        {/* Connecting spinner */}
        {isConnecting && (
          <div style={{
            textAlign: 'center',
            fontFamily: "'Pixelify Sans', monospace",
            fontSize: '13px',
            color: '#8B6348',
            padding: '8px',
            animation: 'pulse 1s ease-in-out infinite',
          }}>
            🔄 Connecting... please wait
          </div>
        )}

        {/* Connection error */}
        {connectState === 'error' && (
          <div style={{
            textAlign: 'center',
            fontFamily: "'Pixelify Sans', monospace",
            fontSize: '11px',
            color: '#E8A0A0',
            padding: '8px',
            border: '2px solid #E8A0A0',
            backgroundColor: '#FFF0F0',
          }}>
            ❌ {connectError}
          </div>
        )}

        {!isConnecting && mode === 'none' && (
          <>
            <PixelButton
              variant="default"
              size="md"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => { sounds.click(); setMode('create'); setConnectState('idle'); }}
            >
              🏠 Create Room
            </PixelButton>
            <PixelButton
              variant="blue"
              size="md"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => { sounds.click(); setMode('join'); setConnectState('idle'); }}
            >
              🔗 Join Room
            </PixelButton>
            <PixelButton
              variant="green"
              size="md"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleSoloPlay}
            >
              🎮 Solo Play
            </PixelButton>
          </>
        )}

        {!isConnecting && mode === 'create' && (
          <div className="flex flex-col gap-3">
            <p style={{
              fontFamily: "'Pixelify Sans', monospace",
              fontSize: '12px',
              color: '#3A2E2A',
              textAlign: 'center',
            }}>
              Share the room code with your partner!
            </p>
            <PixelButton
              variant="default"
              size="md"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleCreate}
            >
              🎲 Generate Room
            </PixelButton>
            <PixelButton
              variant="blue"
              size="sm"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => { setMode('none'); setConnectState('idle'); }}
            >
              ← Back
            </PixelButton>
          </div>
        )}

        {!isConnecting && mode === 'join' && (
          <div className="flex flex-col gap-3">
            <input
              className="pixel-input"
              placeholder="Enter room code..."
              value={joinCode}
              onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setError(''); setConnectState('idle'); }}
              maxLength={8}
              style={{ textAlign: 'center', fontSize: '14px', letterSpacing: '3px', fontWeight: 700 }}
            />
            <PixelButton
              variant="blue"
              size="md"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleJoin}
            >
              🚪 Join Room
            </PixelButton>
            <PixelButton
              variant="default"
              size="sm"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => { setMode('none'); setConnectState('idle'); }}
            >
              ← Back
            </PixelButton>
          </div>
        )}
      </motion.div>

      {/* Decorative footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '7px',
          color: '#C4956A',
          textAlign: 'center',
          lineHeight: 1.8,
        }}
      >
        ♡ made with love ♡<br />
        draw · guess · connect
      </motion.div>
    </div>
  );
};
