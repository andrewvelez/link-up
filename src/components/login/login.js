/**
 * @author Andrew Velez
 * @license MIT
 * @description Loads the login placeholder into the regular DOM with htmx.
 */

const stylesheet = document.createElement("link");
stylesheet.rel = "stylesheet";
stylesheet.href = new URL("./login.css", import.meta.url).href;
document.head.append(stylesheet);

const markupUrl = new URL("./login.html", import.meta.url).href;

class LinkUpLogin extends HTMLElement {
  #loading = false;

  async connectedCallback() {
    if (this.firstElementChild || this.#loading) return;

    this.#loading = true;

    try {
      await window.htmx.ajax("GET", markupUrl, {
        source: this,
        target: this,
        swap: "innerHTML",
      });
    } catch (error) {
      console.error("Unable to load the login component.", error);
    } finally {
      this.#loading = false;
    }
  }
}

customElements.define("link-up-login", LinkUpLogin);
