/**
 * Message composer Web Component.
 * by: Andrew Velez
 */

export class MessageComposer extends HTMLElement {
  constructor() {
    super();
    this._connected = false;
  }

  connectedCallback() {
    this.render();
  }

  /** @param {boolean} value */
  set connected(value) {
    this._connected = value;
    this.render();
  }

  render() {
    this.innerHTML = `
      <section class="composer" aria-label="Message composer">
        <form class="composer-form" data-message-form>
          <input name="message" placeholder="Message" autocomplete="off" ${this._connected ? "" : "disabled"}>
          <button class="primary" type="submit" ${this._connected ? "" : "disabled"}>Send</button>
        </form>
      </section>
    `;

    this.querySelector("[data-message-form]")?.addEventListener("submit", event => {
      event.preventDefault();
      const form = /** @type {HTMLFormElement} */ (event.currentTarget);
      const input = /** @type {HTMLInputElement | null} */ (form.elements.namedItem("message"));
      const text = input?.value.trim() ?? "";
      if (!text) return;

      this.dispatchEvent(new CustomEvent("send-message", {
        bubbles: true,
        detail: { text },
      }));

      form.reset();
      input?.focus();
    });
  }
}

customElements.define("message-composer", MessageComposer);
