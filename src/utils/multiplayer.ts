import Peer from 'peerjs';
import type { PeerMessage } from '../types/game';

export class MultiplayerManager {
  private peer: Peer | null = null;
  private conn: any = null;
  public isHost: boolean = false;
  public roomCode: string = '';
  public isConnected: boolean = false;

  private onMessageCallback?: (msg: PeerMessage) => void;
  private onStatusChangeCallback?: (status: string, connected: boolean) => void;

  public initHost(
    customRoomCode?: string,
    onStatusChange?: (status: string, connected: boolean) => void,
    onMessage?: (msg: PeerMessage) => void
  ) {
    this.cleanup();
    this.isHost = true;
    this.onStatusChangeCallback = onStatusChange;
    this.onMessageCallback = onMessage;

    const code = customRoomCode || Math.floor(1000 + Math.random() * 9000).toString();
    this.roomCode = code;
    const fullPeerId = `vylera-tennis-${code}`;

    this.onStatusChangeCallback?.('Membuat room online...', false);

    this.peer = new Peer(fullPeerId, {
      debug: 1,
    });

    this.peer.on('open', (id) => {
      console.log('Peer Host open with ID:', id);
      this.onStatusChangeCallback?.(`Room siap! Kode: ${this.roomCode}. Menunggu pemain 2...`, false);
    });

    this.peer.on('connection', (connection) => {
      console.log('Guest connected to host');
      this.conn = connection;
      this.setupConnection();
    });

    this.peer.on('error', (err: any) => {
      console.error('Peer host error:', err);
      this.onStatusChangeCallback?.(`Gagal membuat room: ${err.message || 'Error ID dipakai'}`, false);
    });
  }

  public joinRoom(
    code: string,
    onStatusChange?: (status: string, connected: boolean) => void,
    onMessage?: (msg: PeerMessage) => void
  ) {
    this.cleanup();
    this.isHost = false;
    this.roomCode = code.trim();
    this.onStatusChangeCallback = onStatusChange;
    this.onMessageCallback = onMessage;

    const fullPeerId = `vylera-tennis-${this.roomCode}`;
    this.onStatusChangeCallback?.(`Menghubungkan ke room ${this.roomCode}...`, false);

    // Create a temporary peer for guest
    this.peer = new Peer({
      debug: 1,
    });

    this.peer.on('open', () => {
      console.log('Peer Guest opened, connecting to host:', fullPeerId);
      this.conn = this.peer!.connect(fullPeerId, {
        reliable: true,
      });
      this.setupConnection();
    });

    this.peer.on('error', (err: any) => {
      console.error('Peer guest error:', err);
      this.onStatusChangeCallback?.(`Gagal bergabung: Room '${this.roomCode}' tidak ditemukan.`, false);
    });
  }

  private setupConnection() {
    if (!this.conn) return;

    this.conn.on('open', () => {
      this.isConnected = true;
      console.log('WebRTC DataConnection open!');
      this.onStatusChangeCallback?.('Terhubung dengan pemain online!', true);
    });

    this.conn.on('data', (data: any) => {
      if (this.onMessageCallback) {
        this.onMessageCallback(data as PeerMessage);
      }
    });

    this.conn.on('close', () => {
      this.isConnected = false;
      this.onStatusChangeCallback?.('Koneksi terputus.', false);
    });

    this.conn.on('error', (err: any) => {
      console.error('DataConnection error:', err);
      this.onStatusChangeCallback?.('Error pada koneksi multiplayer.', false);
    });
  }

  public sendMessage(msg: PeerMessage) {
    if (this.conn && this.isConnected) {
      try {
        this.conn.send(msg);
      } catch (e) {
        console.error('Send message failed:', e);
      }
    }
  }

  public cleanup() {
    this.isConnected = false;
    if (this.conn) {
      this.conn.close();
      this.conn = null;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }
}

export const multiplayerManager = new MultiplayerManager();
