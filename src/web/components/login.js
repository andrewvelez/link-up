/**
 * @author Andrew Velez
 * @license MIT
 * @description Provides the login placeholder as a reusable web component.
 */

class LinkUpLogin extends HTMLElement {
  connectedCallback() {
    if (this.firstElementChild) return;

    this.innerHTML = `
      <form class="login" aria-describedby="login-status">
        <fieldset disabled>
          <label for="email">Email</label>
          <input id="email" type="email" autocomplete="username" placeholder="you@example.com">
          <label for="password">Password</label>
          <div class="password-field">
            <input id="password" type="password" autocomplete="current-password" placeholder="••••••••">
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><use href="./icons/mockup.svg#eye"></use></svg>
          </div>
          <button class="text-button forgot" type="button">Forgot password?</button>
          <button class="button primary" type="submit">Sign in <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><use href="./icons/mockup.svg#arrow-right"></use></svg></button>
          <p class="join">New here? <button class="text-button" type="button">Create an account</button></p>
        </fieldset>
        <p id="login-status" class="placeholder-note">Sign-in and account creation are coming soon.</p>
      </form>
    `;
  }
}

customElements.define("link-up-login", LinkUpLogin);
