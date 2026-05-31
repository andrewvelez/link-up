/**
 * Minimal observable state for the chat UI.
 * by: Andrew Velez
 */

/**
 * @typedef {object} ChatMessage
 * @property {string} id
 * @property {"in" | "out" | "system"} direction
 * @property {string} author
 * @property {string} text
 * @property {string} sentAt
 */

export class ChatStore extends EventTarget {
  constructor() {
    super();
    this.state = {
      roomId: "",
      localName: "",
      remoteName: "",
      status: "Not connected.",
      connected: false,
      messages: /** @type {ChatMessage[]} */ ([]),
    };
  }

  snapshot() {
    return structuredClone(this.state);
  }

  /** @param {Partial<Omit<typeof this.state, "messages">>} patch */
  set(patch) {
    this.state = { ...this.state, ...patch };
    this.emitChange();
  }

  /** @param {string} status */
  setStatus(status) {
    this.set({ status });
  }

  /** @param {ChatMessage} message */
  addMessage(message) {
    this.state = { ...this.state, messages: [...this.state.messages, message] };
    this.emitChange();
  }

  resetMessages() {
    this.state = { ...this.state, messages: [] };
    this.emitChange();
  }

  emitChange() {
    this.dispatchEvent(new Event("change"));
  }
}
