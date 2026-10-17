/**
 * @author Andrew Velez
 * @license MIT
 * @description Switches between the public profile views.
 */

const viewSelector = document.querySelector("#profile-view");
const views = document.querySelectorAll("[data-profile-view]");

viewSelector.addEventListener("change", () => {
  for (const view of views) {
    view.hidden = view.dataset.profileView !== viewSelector.value;
  }
});
