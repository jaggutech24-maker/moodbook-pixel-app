/**
 * MoodBook — Room Sync (Firebase Realtime Database)
 *
 * How it works:
 *  - Creator joins a room → writes their presence to /rooms/{code}/players/{id}
 *  - Joiner joins a room  → writes their presence + fires PING event
 *  - Both sides listen to /rooms/{code}/events and react to new children
 *  - Events are append-only using Firebase push() so ordering is guaranteed
 *
 * Database structure:
 *   /rooms/{roomCode}/
 *     players/{playerId}: { name, isDrawer, joinedAt }
 *     events/{pushId}:    { type, ...payload, _senderId, timestamp }
 */

import { db } from './firebase';
import {
  ref,
  push,
  onChildAdded,
  onValue,
  set,
  off,
  serverTimestamp,
  onDisconnect,
} from 'firebase/database';
import { Stroke, MoodOption } from '../store/useMoodBookStore';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SyncEvent =
  | { type: 'PARTNER_JOINED'; playerName: string }
  | { type: 'MOOD_SELECTED'; mood: MoodOption }
  | { type: 'DRAWING_SUBMITTED'; dataUrl: string; strokes: Stroke[] }
  | { type: 'GUESS_SUBMITTED'; guess: string }
  | { type: 'PHASE_CHANGED'; phase: string }
  | { type: 'ROUND_RESET' }
  | { type: 'PING'; playerName: string; playerId: string };

type SyncListener = (event: SyncEvent) => void;

// ─── Manager ──────────────────────────────────────────────────────────────────

class RoomSyncManager {
  private roomCode: string = '';
  private playerId: string = '';
  private listeners: SyncListener[] = [];
  private eventsRef: ReturnType<typeof ref> | null = null;
  private playersRef: ReturnType<typeof ref> | null = null;

  /** Join (or create) a room */
  async joinRoom(
    roomCode: string,
    playerId: string,
    playerName: string,
    isCreator: boolean
  ): Promise<void> {
    this.leave(); // tear down any previous session

    this.roomCode = roomCode;
    this.playerId = playerId;

    // 1. Set Player Presence
    const playerRef = ref(db, `rooms/${roomCode}/players/${playerId}`);
    await set(playerRef, {
      name: playerName,
      isDrawer: isCreator,
      id: playerId,
      joinedAt: serverTimestamp(),
    });
    onDisconnect(playerRef).remove();

    // 2. Listen to Events
    const eventsRef = ref(db, `rooms/${roomCode}/events`);
    this.eventsRef = eventsRef;
    onChildAdded(eventsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data || data._senderId === this.playerId) return;
      this.listeners.forEach((fn) => fn(data as SyncEvent));
    });

    // 3. (NEW) Host watches for partner directly
    if (isCreator) {
      const playersRef = ref(db, `rooms/${roomCode}/players`);
      this.playersRef = playersRef;
      onValue(playersRef, (snapshot) => {
        const players = snapshot.val();
        if (!players) return;
        const playerIds = Object.keys(players);
        if (playerIds.length >= 2) {
          const partnerId = playerIds.find(id => id !== this.playerId);
          const partnerName = players[partnerId!].name;
          // Notify Host's local listeners (the App.tsx subscriber)
          this.listeners.forEach(fn => fn({ type: 'PARTNER_JOINED', playerName: partnerName }));
        }
      });
    } else {
      // Joiner still pings just in case host is already in lobby
      this.emit({ type: 'PING', playerName, playerId });
    }
  }

  /** Emit an event to the room (all connected players will receive it) */
  async emit(event: SyncEvent): Promise<void> {
    if (!this.eventsRef) return;
    await push(this.eventsRef, {
      ...event,
      _senderId: this.playerId,
      timestamp: Date.now(),
    });
  }

  /** Subscribe to incoming room events */
  subscribe(listener: SyncListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /** Clean up — call when leaving the room or going back to home */
  leave() {
    if (this.eventsRef) off(this.eventsRef);
    if (this.playersRef) off(this.playersRef);
    this.eventsRef = null;
    this.playersRef = null;
    this.listeners = [];
    this.roomCode = '';
    this.playerId = '';
  }

  getRoomCode() {
    return this.roomCode;
  }
}

export const roomSync = new RoomSyncManager();

/** Generate a random 6-char room code */
export const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
};
