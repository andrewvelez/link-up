import "./style.css";

const result = document.querySelector("#result");

document.querySelector("#hello").addEventListener("click", async () => {
  const response = await fetch("/api/hello");
  result.textContent = JSON.stringify(await response.json(), null, 2);
});
