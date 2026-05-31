/**
 * Connection form Web Component.
 * by: Andrew Velez
 */

import { escapeHtml, randomRoomId } from "../lib/html.js";

export class ConnectionPanel extends HTMLElement {
  constructor() {
    super();
    this._state = {
      roomId: "",
      localName: "",
      remoteName: "",
      status: "Not connected.",
      connected: false,
    };
  }

  connectedCallback() {
    this.render();
  }

  /** @param {Partial<typeof this._state>} state */
  set state(state) {
    this._state = { ...this._state, ...state };
    this.render();
  }

  render() {
    const roomValue = this._state.roomId || randomRoomId();
    const nameValue = this._state.localName || "Andrew";

    this.innerHTML = `
      <section class="panel" aria-label="Connection">
        <h2>Connection</h2>
        <form class="form-grid" data-connect-form>
          <label>
            Display name
            <input name="displayName" value="${escapeHtml(nameValue)}" autocomplete="nickname">
          </label>
          <label>
            Room ID
            <input name="roomId" value="${escapeHtml(roomValue)}" autocomplete="off">
          </label>
          <div class="action-row">
            <button class="primary" type="submit" value="host" name="role" ${this._state.connected ? "disabled" : ""}>Create room</button>
            <button class="secondary" type="submit" value="guest" name="role" ${this._state.connected ? "disabled" : ""}>Join room</button>
          </div>
        </form>
        <div class="status-box">
          <strong>Status</strong>
          <span>${escapeHtml(this._state.status)}</span>
          ${this._state.roomId ? `<p class="muted">Room: <code>${escapeHtml(this._state.roomId)}</code></p>` : ""}
          ${this._state.remoteName ? `<p class="muted">Peer: ${escapeHtml(this._state.remoteName)}</p>` : ""}
        </div>
      </section>
    `;

    this.querySelector("[data-connect-form]")?.addEventListener("submit", event => {
      event.preventDefault();
      const submitEvent = /** @type {SubmitEvent} */ (event);
      const submitter = /** @type {HTMLButtonElement | null} */ (submitEvent.submitter);
      const form = /** @type {HTMLFormElement} */ (event.currentTarget);
      const formData = new FormData(form);
      const roomId = String(formData.get("roomId") ?? "").trim();
      const displayName = String(formData.get("displayName") ?? "").trim() || "Me";
      const role = submitter?.value === "guest" ? "guest" : "host";

      this.dispatchEvent(new CustomEvent("connect-request", {
        bubbles: true,
        detail: { role, roomId, displayName },
      }));
    });
  }
}

customElements.define("connection-panel", ConnectionPanel);
