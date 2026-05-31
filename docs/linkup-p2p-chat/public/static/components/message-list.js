/**
 * Message list Web Component.
 * by: Andrew Velez
 */

import { escapeHtml } from "../lib/html.js";

export class MessageList extends HTMLElement {
  constructor() {
    super();
    /** @type {import("../state/chat-store.js").ChatMessage[]} */
    this._messages = [];
  }

  connectedCallback() {
    this.render();
  }

  /** @param {import("../state/chat-store.js").ChatMessage[]} messages */
  set messages(messages) {
    this._messages = messages;
    this.render();
  }

  render() {
    if (this._messages.length === 0) {
      this.innerHTML = `<div class="message-list"><p class="empty-state">Connect another browser tab, then send a message.</p></div>`;
      return;
    }

    this.innerHTML = `
      <div class="message-list" data-message-list>
        ${this._messages.map(message => `
          <article class="message ${escapeHtml(message.direction)}">
            <span class="message-meta">${escapeHtml(message.author)} · ${formatTime(message.sentAt)}</span>
            <div>${escapeHtml(message.text)}</div>
          </article>
        `).join("")}
      </div>
    `;

    const list = this.querySelector("[data-message-list]");
    list?.scrollTo({ top: list.scrollHeight });
  }
}

/** @param {string} iso */
function formatTime(iso) {
  return escapeHtml(new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
}

customElements.define("message-list", MessageList);
