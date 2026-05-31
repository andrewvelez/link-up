/**
 * WebRTC config.
 * Empty iceServers is best for local development and avoids third-party STUN.
 * For internet/NAT testing, add your own STUN/TURN entries here.
 * by: Andrew Velez
 */

/** @type {RTCConfiguration} */
export const RTC_CONFIG = {
  iceServers: [],
};
