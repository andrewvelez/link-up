/**
 * Tiny in-memory WebSocket room hub for WebRTC signaling only.
 * It forwards SDP offers/answers and ICE candidates. It does not carry chat messages.
 * by: Andrew Velez
 */

const SIGNAL_TYPES = new Set(["offer", "answer", "ice-candidate"]);

/** @typedef {{ roomId: string, peerId: string }} SocketData */
/** @typedef {{ data: SocketData, send(message: string): unknown, close?: (code?: number, reason?: string) => unknown }} SignalingSocket */

/**
 * @typedef {object} RoomHub
 * @property {(ws: SignalingSocket) => void} add
 * @property {(ws: SignalingSocket) => void} remove
 * @property {(ws: SignalingSocket, message: string | ArrayBuffer | Uint8Array) => void} forward
 * @property {(roomId: string) => number} roomSize
 * @property {() => void} clear
 */

/** @returns {RoomHub} */
export function createRoomHub() {
  /** @type {Map<string, Map<string, SignalingSocket>>} */
  const rooms = new Map();

  /** @param {SignalingSocket} ws */
  function add(ws) {
    const { roomId, peerId } = ws.data;
    const room = getRoom(rooms, roomId);

    if (room.has(peerId)) {
      sendJson(ws, { type: "error", message: "Peer ID already exists in this room." });
      ws.close?.(1008, "duplicate peer id");
      return;
    }

    if (room.size >= 2) {
      sendJson(ws, { type: "error", message: "This demo room already has two peers." });
      ws.close?.(1008, "room full");
      return;
    }

    const existingPeerIds = [...room.keys()];
    room.set(peerId, ws);

    sendJson(ws, { type: "room-peers", peerIds: existingPeerIds });
    for (const peer of room.values()) {
      if (peer !== ws) sendJson(peer, { type: "peer-joined", peerId });
    }
  }

  /** @param {SignalingSocket} ws */
  function remove(ws) {
    const { roomId, peerId } = ws.data;
    const room = rooms.get(roomId);
    if (!room) return;

    room.delete(peerId);
    for (const peer of room.values()) {
      sendJson(peer, { type: "peer-left", peerId });
    }

    if (room.size === 0) rooms.delete(roomId);
  }

  /**
   * @param {SignalingSocket} ws
   * @param {string | ArrayBuffer | Uint8Array} message
   */
  function forward(ws, message) {
    const text = decodeMessage(message);
    if (!text) return;

    /** @type {unknown} */
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      sendJson(ws, { type: "error", message: "Invalid signaling JSON." });
      return;
    }

    if (!isSignal(parsed)) {
      sendJson(ws, { type: "error", message: "Only WebRTC signaling messages are allowed." });
      return;
    }

    const room = rooms.get(ws.data.roomId);
    if (!room) return;

    const outbound = JSON.stringify({ ...parsed, from: ws.data.peerId });
    if (typeof parsed.to === "string") {
      const recipient = room.get(parsed.to);
      if (recipient && recipient !== ws) recipient.send(outbound);
      return;
    }

    for (const peer of room.values()) {
      if (peer !== ws) peer.send(outbound);
    }
  }

  /** @param {string} roomId */
  function roomSize(roomId) {
    return rooms.get(roomId)?.size ?? 0;
  }

  function clear() {
    rooms.clear();
  }

  return { add, remove, forward, roomSize, clear };
}

/**
 * @param {Map<string, Map<string, SignalingSocket>>} rooms
 * @param {string} roomId
 */
function getRoom(rooms, roomId) {
  let room = rooms.get(roomId);
  if (!room) {
    room = new Map();
    rooms.set(roomId, room);
  }
  return room;
}

/**
 * @param {unknown} value
 * @returns {value is { type: string, to?: string, [key: string]: unknown }}
 */
function isSignal(value) {
  if (!value || typeof value !== "object") return false;
  const record = /** @type {Record<string, unknown>} */ (value);
  return typeof record.type === "string" && SIGNAL_TYPES.has(record.type);
}

/** @param {string | ArrayBuffer | Uint8Array} message */
function decodeMessage(message) {
  if (typeof message === "string") return message;
  return new TextDecoder().decode(message);
}

/**
 * @param {SignalingSocket} ws
 * @param {unknown} value
 */
function sendJson(ws, value) {
  try {
    ws.send(JSON.stringify(value));
  } catch {
    // The socket may already be closing. Nothing useful to do in this demo hub.
  }
}
