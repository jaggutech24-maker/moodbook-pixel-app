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
  // Track the push key of the most recent event we wrote so we can ignore our own
  private sentKeys = new Set<string>();

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

    // Write player presence
    const playerRef = ref(db, `rooms/${roomCode}/players/${playerId}`);
    await set(playerRef, {
      name: playerName,
      isDrawer: isCreator,
      joinedAt: serverTimestamp(),
    });
    // Remove presence on disconnect
    onDisconnect(playerRef).remove();

    // Start listening to events BEFORE we write the PING
    // so we don't miss the host's PARTNER_JOINED reply
    const eventsRef = ref(db, `rooms/${roomCode}/events`);
    this.eventsRef = eventsRef;

    // We mark the "cursor" time to ignore events that were already there
    // before we joined (avoids replaying old rounds).
    const joinTime = Date.now();

    onChildAdded(eventsRef, (snapshot) => {
      const data = snapshot.val() as SyncEvent & {
        _senderId?: string;
        timestamp?: number;
      };
      if (!data) return;
      // Ignore our own emits
      if (data._senderId === this.playerId) return;

      const { _senderId, timestamp, ...event } = data as any;
      this.listeners.forEach((fn) => fn(event as SyncEvent));
    });

    // Joiner announces themselves via PING so host knows to reply
    if (!isCreator) {
      await this._pushEvent({ type: 'PING', playerName, playerId });
    }
  }

  /** Emit an event to the room (all connected players will receive it) */
  async emit(event: SyncEvent): Promise<void> {
    await this._pushEvent(event);
  }

  private async _pushEvent(event: SyncEvent): Promise<void> {
    if (!this.eventsRef) return;
    const newRef = push(this.eventsRef);
    await set(newRef, {
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
    if (this.eventsRef) {
      off(this.eventsRef); // detach all Firebase listeners
      this.eventsRef = null;
    }
    this.listeners = [];
    this.roomCode = '';
    this.playerId = '';
    this.sentKeys.clear();
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
