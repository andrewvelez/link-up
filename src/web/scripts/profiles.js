/**
 * @author Andrew Velez
 * @license MIT
 * @description Switches between the public profile views.
 */

const viewSelector = document.querySelector("#profile-view");
const app = document.querySelector("#app");
const map = document.querySelector("#profiles-map");

viewSelector.addEventListener("change", (event) => {
  app.dataset.view = event.target.value;
  map.hidden = event.target.value !== "map";
});

const columnSelector = document.querySelector("#profile-columns");
const profiles = document.querySelector("#profiles-results");

columnSelector.addEventListener("change", () => {
  profiles.style.setProperty("--profile-columns", columnSelector.value);
});
