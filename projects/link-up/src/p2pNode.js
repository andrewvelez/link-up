/**
 * SPDX-FileCopyrightText: 2026 Andrew Velez
 * SPDX-License-Identifier: GPL-3.0-or-later
 * @author Andrew Velez
 * @summary p2pNode module for the libp2p logic
 */

import { createLibp2p } from 'libp2p'
import { webSockets } from '@libp2p/websockets'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'


const node = await createLibp2p({
  start: false,
  addresses: {
    listen: ['/ip4/127.0.0.1/tcp/8000/ws']
  },
  transports: [webSockets()],
  connectionEncrypters: [noise()],
  streamMuxers: [yamux()]
});

export default {
  async start() {
    await node.start();
  },
  async stop() {
    await node.stop();
  },
  getListeningAddresses() {
    return node.getMultiaddrs();
  }
}
