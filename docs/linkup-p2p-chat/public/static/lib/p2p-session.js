/**
 * WebRTC RTCDataChannel session for one peer-to-peer chat.
 * by: Andrew Velez
 */

/**
 * @typedef {object} P2PSessionOptions
 * @property {import("./signaling-client.js").SignalingClient} signaling
 * @property {"host" | "guest"} role
 * @property {string} displayName
 * @property {RTCConfiguration} rtcConfig
 */

export class P2PSession extends EventTarget {
  /** @param {P2PSessionOptions} options */
  constructor({ signaling, role, displayName, rtcConfig }) {
    super();
    this.signaling = signaling;
    this.role = role;
    this.displayName = displayName;
    this.pc = new RTCPeerConnection(rtcConfig);
    /** @type {RTCDataChannel | null} */
    this.channel = null;
    /** @type {RTCIceCandidateInit[]} */
    this.pendingCandidates = [];
    this.hasMadeOffer = false;
    this.isClosed = false;

    this.pc.addEventListener("icecandidate", event => {
      if (event.candidate) {
        this.signaling.send("ice-candidate", { candidate: event.candidate.toJSON() });
      }
    });

    this.pc.addEventListener("connectionstatechange", () => {
      this.emitStatus(`WebRTC: ${this.pc.connectionState}`);
    });

    this.pc.addEventListener("datachannel", event => {
      this.attachChannel(event.channel);
    });
  }

  async start() {
    this.signaling.addEventListener("room-peers", event => {
      const customEvent = /** @type {CustomEvent<{ peerIds?: string[] }>} */ (event);
      if (this.role === "host" && customEvent.detail.peerIds?.length) void this.makeOffer();
    });

    this.signaling.addEventListener("peer-joined", () => {
      if (this.role === "host") void this.makeOffer();
    });

    this.signaling.addEventListener("offer", event => {
      const customEvent = /** @type {CustomEvent<{ description?: RTCSessionDescriptionInit }>} */ (event);
      if (customEvent.detail.description) void this.acceptOffer(customEvent.detail.description);
    });

    this.signaling.addEventListener("answer", event => {
      const customEvent = /** @type {CustomEvent<{ description?: RTCSessionDescriptionInit }>} */ (event);
      if (customEvent.detail.description) void this.acceptAnswer(customEvent.detail.description);
    });

    this.signaling.addEventListener("ice-candidate", event => {
      const customEvent = /** @type {CustomEvent<{ candidate?: RTCIceCandidateInit }>} */ (event);
      if (customEvent.detail.candidate) void this.addIceCandidate(customEvent.detail.candidate);
    });

    this.signaling.addEventListener("peer-left", () => {
      this.emitStatus("Peer left the room.");
      this.dispatchEvent(new Event("close"));
    });

    if (this.role === "host") this.attachChannel(this.pc.createDataChannel("chat", { ordered: true }));
    await this.signaling.open();
    this.emitStatus("Waiting for peer.");
  }

  /** @param {string} text */
  sendChat(text) {
    if (!this.channel || this.channel.readyState !== "open") {
      throw new Error("Peer channel is not open.");
    }

    const message = {
      kind: "chat",
      id: crypto.randomUUID(),
      text,
      from: this.displayName,
      sentAt: new Date().toISOString(),
    };

    this.channel.send(JSON.stringify(message));
    return message;
  }

  close() {
    this.isClosed = true;
    this.channel?.close();
    this.pc.close();
    this.signaling.close();
  }

  async makeOffer() {
    if (this.isClosed || this.hasMadeOffer) return;
    this.hasMadeOffer = true;
    this.emitStatus("Creating WebRTC offer.");
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    if (this.pc.localDescription) {
      this.signaling.send("offer", { description: this.pc.localDescription.toJSON() });
    }
  }

  /** @param {RTCSessionDescriptionInit} description */
  async acceptOffer(description) {
    this.emitStatus("Received WebRTC offer.");
    await this.pc.setRemoteDescription(description);
    await this.flushCandidates();
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    if (this.pc.localDescription) {
      this.signaling.send("answer", { description: this.pc.localDescription.toJSON() });
    }
  }

  /** @param {RTCSessionDescriptionInit} description */
  async acceptAnswer(description) {
    if (this.pc.signalingState !== "have-local-offer") return;
    this.emitStatus("Received WebRTC answer.");
    await this.pc.setRemoteDescription(description);
    await this.flushCandidates();
  }

  /** @param {RTCIceCandidateInit} candidate */
  async addIceCandidate(candidate) {
    if (!this.pc.remoteDescription) {
      this.pendingCandidates.push(candidate);
      return;
    }
    await this.pc.addIceCandidate(candidate);
  }

  async flushCandidates() {
    while (this.pendingCandidates.length > 0) {
      const candidate = this.pendingCandidates.shift();
      if (candidate) await this.pc.addIceCandidate(candidate);
    }
  }

  /** @param {RTCDataChannel} channel */
  attachChannel(channel) {
    this.channel = channel;

    channel.addEventListener("open", () => {
      this.emitStatus("Peer channel open.");
      channel.send(JSON.stringify({ kind: "hello", from: this.displayName }));
      this.dispatchEvent(new Event("open"));
    });

    channel.addEventListener("close", () => {
      this.emitStatus("Peer channel closed.");
      this.dispatchEvent(new Event("close"));
    });

    channel.addEventListener("message", event => {
      const data = parseJson(event.data);
      if (!data || typeof data.kind !== "string") return;

      if (data.kind === "hello") {
        this.dispatchEvent(new CustomEvent("peer", { detail: data }));
        return;
      }

      if (data.kind === "chat") {
        this.dispatchEvent(new CustomEvent("chat", { detail: data }));
      }
    });
  }

  /** @param {string} value */
  emitStatus(value) {
    this.dispatchEvent(new CustomEvent("status", { detail: value }));
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
