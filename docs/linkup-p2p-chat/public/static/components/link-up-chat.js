/**
 * Top-level SPA component. Owns state and P2P session lifecycle.
 * by: Andrew Velez
 */

import { RTC_CONFIG } from "../config.js";
import { SignalingClient } from "../lib/signaling-client.js";
import { P2PSession } from "../lib/p2p-session.js";
import { ChatStore } from "../state/chat-store.js";

export class LinkUpChat extends HTMLElement {
  constructor() {
    super();
    this.store = new ChatStore();
    /** @type {P2PSession | null} */
    this.session = null;
  }

  connectedCallback() {
    this.innerHTML = `
      <div class="chat-app">
        <connection-panel></connection-panel>
        <section class="chat-pane" aria-label="Chat">
          <h2>Messages</h2>
          <message-list></message-list>
          <message-composer></message-composer>
        </section>
      </div>
    `;

    this.addEventListener("connect-request", event => {
      const customEvent = /** @type {CustomEvent<{ role: "host" | "guest", roomId: string, displayName: string }>} */ (event);
      void this.connect(customEvent.detail);
    });

    this.addEventListener("send-message", event => {
      const customEvent = /** @type {CustomEvent<{ text: string }>} */ (event);
      this.sendMessage(customEvent.detail.text);
    });

    this.store.addEventListener("change", () => this.renderState());
    this.renderState();
  }

  disconnectedCallback() {
    this.session?.close();
  }

  /** @param {{ role: "host" | "guest", roomId: string, displayName: string }} options */
  async connect({ role, roomId, displayName }) {
    if (!roomId) {
      this.store.setStatus("Room ID is required.");
      return;
    }

    this.session?.close();
    this.store.resetMessages();
    this.store.set({ roomId, localName: displayName, remoteName: "", connected: false, status: "Connecting." });
    this.addSystemMessage(role === "host" ? "Room created. Open another tab and join the same room." : "Joining room.");

    const peerId = crypto.randomUUID();
    const signaling = new SignalingClient({ roomId, peerId });
    const session = new P2PSession({ signaling, role, displayName, rtcConfig: RTC_CONFIG });
    this.session = session;

    session.addEventListener("status", event => {
      const customEvent = /** @type {CustomEvent<string>} */ (event);
      this.store.setStatus(customEvent.detail);
    });

    session.addEventListener("open", () => {
      this.store.set({ connected: true, status: "Connected." });
      this.addSystemMessage("Peer channel opened. Messages now go over WebRTC.");
    });

    session.addEventListener("close", () => {
      this.store.set({ connected: false });
    });

    session.addEventListener("peer", event => {
      const customEvent = /** @type {CustomEvent<{ from?: string }>} */ (event);
      if (customEvent.detail.from) this.store.set({ remoteName: customEvent.detail.from });
    });

    session.addEventListener("chat", event => {
      const customEvent = /** @type {CustomEvent<{ id?: string, text?: string, from?: string, sentAt?: string }>} */ (event);
      const detail = customEvent.detail;
      this.store.addMessage({
        id: detail.id ?? crypto.randomUUID(),
        direction: "in",
        author: detail.from ?? (this.store.state.remoteName || "Peer"),
        text: detail.text ?? "",
        sentAt: detail.sentAt ?? new Date().toISOString(),
      });
    });

    try {
      await session.start();
    } catch (error) {
      this.store.setStatus(error instanceof Error ? error.message : "Connection failed.");
    }
  }

  /** @param {string} text */
  sendMessage(text) {
    try {
      const sent = this.session?.sendChat(text);
      if (!sent) return;
      this.store.addMessage({
        id: sent.id,
        direction: "out",
        author: this.store.state.localName || "Me",
        text: sent.text,
        sentAt: sent.sentAt,
      });
    } catch (error) {
      this.store.setStatus(error instanceof Error ? error.message : "Could not send message.");
    }
  }

  /** @param {string} text */
  addSystemMessage(text) {
    this.store.addMessage({
      id: crypto.randomUUID(),
      direction: "system",
      author: "system",
      text,
      sentAt: new Date().toISOString(),
    });
  }

  renderState() {
    const snapshot = this.store.snapshot();
    const connection = /** @type {import("./connection-panel.js").ConnectionPanel | null} */ (this.querySelector("connection-panel"));
    const messages = /** @type {import("./message-list.js").MessageList | null} */ (this.querySelector("message-list"));
    const composer = /** @type {import("./message-composer.js").MessageComposer | null} */ (this.querySelector("message-composer"));

    if (connection) connection.state = snapshot;
    if (messages) messages.messages = snapshot.messages;
    if (composer) composer.connected = snapshot.connected;
  }
}

customElements.define("link-up-chat", LinkUpChat);
