/**
 * MoodBook — Room Sync (PeerJS / WebRTC)
 * Cross-device real-time sync using PeerJS (WebRTC peer-to-peer).
 *
 * Protocol:
 *  - Creator: registers as a PeerJS peer with ID = "moodbook-<ROOMCODE>"
 *  - Joiner:  connects to peer ID "moodbook-<ROOMCODE>" and sends events
 *  - Both sides relay events to all connected peers + local listeners
 */

import Peer, { DataConnection } from 'peerjs';
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
  private peer: Peer | null = null;
  private connections: DataConnection[] = [];
  private listeners: SyncListener[] = [];
  private roomCode: string = '';
  private playerId: string = '';

  /** Create or join a room */
  async joinRoom(
    roomCode: string,
    playerId: string,
    playerName: string,
    isCreator: boolean
  ): Promise<void> {
    // Tear down any existing peer
    this.leave();

    this.roomCode = roomCode;
    this.playerId = playerId;

    const peerId = `moodbook-${roomCode}`;

    if (isCreator) {
      // ── HOST: register with the room's peer ID ──────────────────────────────
      this.peer = new Peer(peerId);

      await new Promise<void>((resolve, reject) => {
        this.peer!.on('open', () => {
          console.log('[RoomSync] Host peer open:', peerId);
          resolve();
        });
        this.peer!.on('error', (err) => {
          // If room already taken we still try to recover; surface error
          console.error('[RoomSync] Host peer error:', err);
          reject(err);
        });
      });

      // Accept incoming connections from joiners
      this.peer.on('connection', (conn) => {
        this._setupConnection(conn);
      });
    } else {
      // ── JOINER: connect to the host ─────────────────────────────────────────
      this.peer = new Peer(); // random peer ID for joiner

      await new Promise<void>((resolve, reject) => {
        this.peer!.on('open', () => {
          console.log('[RoomSync] Joiner peer open, connecting to host:', peerId);
          const conn = this.peer!.connect(peerId, { reliable: true });

          conn.on('open', () => {
            this._setupConnection(conn);
            // Announce arrival
            this._send(conn, { type: 'PING', playerName, playerId });
            resolve();
          });

          conn.on('error', (err) => {
            console.error('[RoomSync] Connection error:', err);
            reject(err);
          });
        });
        this.peer!.on('error', (err) => {
          console.error('[RoomSync] Joiner peer error:', err);
          reject(err);
        });
      });
    }
  }

  /** Wire up a DataConnection */
  private _setupConnection(conn: DataConnection) {
    this.connections.push(conn);

    conn.on('data', (raw) => {
      const event = raw as SyncEvent & { _senderId?: string };
      if ((event as any)._senderId === this.playerId) return; // echo guard
      // Relay to all OTHER connections (for >2 player support in the future)
      this.connections
        .filter((c) => c !== conn && c.open)
        .forEach((c) => this._send(c, event));
      // Dispatch to local listeners
      this.listeners.forEach((fn) => fn(event));
    });

    conn.on('close', () => {
      this.connections = this.connections.filter((c) => c !== conn);
      console.log('[RoomSync] Connection closed');
    });

    conn.on('error', (err) => {
      console.error('[RoomSync] DataConnection error:', err);
      this.connections = this.connections.filter((c) => c !== conn);
    });
  }

  /** Send a single event on a specific connection */
  private _send(conn: DataConnection, event: SyncEvent) {
    if (conn.open) {
      conn.send({ ...event, _senderId: this.playerId });
    }
  }

  /** Emit an event to ALL connected peers */
  emit(event: SyncEvent) {
    this.connections
      .filter((c) => c.open)
      .forEach((c) => this._send(c, event));
  }

  /** Subscribe to incoming room events */
  subscribe(listener: SyncListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /** Clean up everything */
  leave() {
    this.connections.forEach((c) => { try { c.close(); } catch (_) {} });
    this.connections = [];
    if (this.peer) {
      try { this.peer.destroy(); } catch (_) {}
      this.peer = null;
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
