/**
 * Tests for the signaling room hub.
 * by: Andrew Velez
 */

import { describe, expect, test } from "bun:test";
import { createRoomHub } from "../src/signaling/room-hub.js";

/**
 * @param {string} peerId
 * @param {string} [roomId]
 */
function mockSocket(peerId, roomId = "room-a") {
  return {
    data: { peerId, roomId },
    sent: /** @type {unknown[]} */ ([]),
    closed: false,
    /** @param {string} message */
    send(message) {
      this.sent.push(JSON.parse(message));
    },
    close() {
      this.closed = true;
    },
  };
}

describe("createRoomHub", () => {
  test("announces existing and joining peers", () => {
    const hub = createRoomHub();
    const alice = mockSocket("alice");
    const bob = mockSocket("bob");

    hub.add(alice);
    hub.add(bob);

    expect(alice.sent).toContainEqual({ type: "room-peers", peerIds: [] });
    expect(alice.sent).toContainEqual({ type: "peer-joined", peerId: "bob" });
    expect(bob.sent).toContainEqual({ type: "room-peers", peerIds: ["alice"] });
    expect(hub.roomSize("room-a")).toBe(2);
  });

  test("forwards WebRTC signaling but rejects chat payloads", () => {
    const hub = createRoomHub();
    const alice = mockSocket("alice");
    const bob = mockSocket("bob");

    hub.add(alice);
    hub.add(bob);
    hub.forward(alice, JSON.stringify({ type: "offer", description: { type: "offer", sdp: "demo" } }));
    hub.forward(alice, JSON.stringify({ type: "chat", text: "must not relay" }));

    expect(bob.sent).toContainEqual({
      type: "offer",
      from: "alice",
      description: { type: "offer", sdp: "demo" },
    });
    expect(alice.sent).toContainEqual({ type: "error", message: "Only WebRTC signaling messages are allowed." });
  });

  test("limits demo rooms to two peers", () => {
    const hub = createRoomHub();
    const alice = mockSocket("alice");
    const bob = mockSocket("bob");
    const charlie = mockSocket("charlie");

    hub.add(alice);
    hub.add(bob);
    hub.add(charlie);

    expect(charlie.closed).toBe(true);
    expect(charlie.sent).toContainEqual({ type: "error", message: "This demo room already has two peers." });
    expect(hub.roomSize("room-a")).toBe(2);
  });
});
