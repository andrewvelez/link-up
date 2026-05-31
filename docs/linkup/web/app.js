async function boot() {
  const status = document.querySelector("#status");

  try {
    const res = await fetch("/api/health");

    const json = await res.json();

    status.textContent = json.ok
      ? "API online"
      : "API offline";
  }
  catch (err) {
    console.error(err);

    status.textContent = "connection failed";
  }

  const ws = new WebSocket("ws://127.0.0.1:4510/ws");

  ws.onmessage = (event) => {
    console.log("ws:", event.data);
  };
}

boot();
