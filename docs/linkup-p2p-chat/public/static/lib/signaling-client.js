/**
 * Browser WebSocket client for WebRTC signaling.
 * by: Andrew Velez
 */

/**
 * @typedef {object} SignalingClientOptions
 * @property {string} roomId
 * @property {string} peerId
 */

export class SignalingClient extends EventTarget {
  /** @param {SignalingClientOptions} options */
  constructor({ roomId, peerId }) {
    super();
    this.roomId = roomId;
    this.peerId = peerId;
    /** @type {WebSocket | null} */
    this.socket = null;
  }

  open() {
    if (this.socket?.readyState === WebSocket.OPEN) return Promise.resolve(undefined);

    const protocol = location.protocol === "https:" ? "wss:" : "ws:";
    const url = new URL(`${protocol}//${location.host}/signal/${encodeURIComponent(this.roomId)}`);
    url.searchParams.set("peerId", this.peerId);

    this.socket = new WebSocket(url);

    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error("WebSocket not created."));

      this.socket.addEventListener("open", () => {
        this.dispatchEvent(new CustomEvent("status", { detail: "Signaling connected." }));
        resolve(undefined);
      }, { once: true });

      this.socket.addEventListener("error", () => {
        reject(new Error("Could not connect to signaling."));
      }, { once: true });

      this.socket.addEventListener("close", () => {
        this.dispatchEvent(new CustomEvent("status", { detail: "Signaling closed." }));
        this.dispatchEvent(new Event("close"));
      });

      this.socket.addEventListener("message", event => {
        const data = parseJson(event.data);
        if (!data || typeof data.type !== "string") return;
        this.dispatchEvent(new CustomEvent(data.type, { detail: data }));
      });
    });
  }

  /**
   * @param {string} type
   * @param {Record<string, unknown>} payload
   * @param {string | undefined} [to]
   */
  send(type, payload, to) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error("Signaling socket is not open.");
    }
    this.socket.send(JSON.stringify({ type, ...payload, to }));
  }

  close() {
    this.socket?.close();
    this.socket = null;
  }
}

/** @param {unknown} value */
function parseJson(value) {
  if (typeof value !== "string") return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
