/**
 * MoodBook — Room Sync
 * Local simulation of real-time room sync (can be replaced with Firebase)
 * Uses BroadcastChannel API for cross-tab communication
 */

import { Stroke, MoodOption } from '../store/useMoodBookStore';

export type SyncEvent =
  | { type: 'PARTNER_JOINED'; playerName: string }
  | { type: 'MOOD_SELECTED'; mood: MoodOption }
  | { type: 'DRAWING_SUBMITTED'; dataUrl: string; strokes: Stroke[] }
  | { type: 'GUESS_SUBMITTED'; guess: string }
  | { type: 'PHASE_CHANGED'; phase: string }
  | { type: 'ROUND_RESET' }
  | { type: 'PING'; playerName: string; playerId: string };

type SyncListener = (event: SyncEvent) => void;

class RoomSyncManager {
  private channel: BroadcastChannel | null = null;
  private roomCode: string = '';
  private listeners: SyncListener[] = [];
  private playerId: string = '';

  /** Create or join a room */
  joinRoom(roomCode: string, playerId: string, playerName: string) {
    if (this.channel) {
      this.channel.close();
    }

    this.roomCode = roomCode;
    this.playerId = playerId;

    try {
      this.channel = new BroadcastChannel(`moodbook-room-${roomCode}`);
      this.channel.onmessage = (e) => {
        const event = e.data as SyncEvent & { _senderId?: string };
        // Don't process our own messages
        if ((event as any)._senderId === this.playerId) return;
        this.listeners.forEach((fn) => fn(event));
      };

      // Announce presence
      this.emit({ type: 'PING', playerName, playerId });
    } catch (err) {
      console.warn('BroadcastChannel not supported, running in solo mode');
    }
  }

  /** Emit an event to the room */
  emit(event: SyncEvent) {
    if (!this.channel) return;
    this.channel.postMessage({ ...event, _senderId: this.playerId });
  }

  /** Subscribe to room events */
  subscribe(listener: SyncListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /** Leave the room */
  leave() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.listeners = [];
    this.roomCode = '';
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
