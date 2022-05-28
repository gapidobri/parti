import { runtime, Runtime } from 'webextension-polyfill';
import type { State } from '../interfaces';
import { initSocket, reportState, setReportStateCallback } from './socket';

console.info('✅ Background script running');

const ports: Record<string, Runtime.Port> = {};

initSocket();

runtime.onConnect.addListener(handleConnect);
runtime.onMessage.addListener(handleMessage);

function handleConnect(port: Runtime.Port) {
  const [name, id] = port.name.split(':');
  switch (name) {
    case 'state':
      handleStateReports(port, id);
      break;
  }
}

/**
 * Registers listeners for this port
 * @param port Connecter browser port
 * @param id Port id
 */
function handleStateReports(port: Runtime.Port, id: string) {
  console.info('✅ State reports port connected', id);
  ports[id] = port;

  port.onMessage.addListener(reportState);
  port.onMessage.addListener((state) => broadcastState(state, id));

  setReportStateCallback(port.postMessage);
  port.onDisconnect.addListener((port) => handleDisconnect(port, id));
}

/**
 * Broadcasts state to all content script instances
 * @param state Current state
 * @param id Port id
 */
function broadcastState(state: State, id: string) {
  for (const portId in ports) {
    if (portId === id) continue;
    ports[portId].postMessage(state);
  }
}

function handleDisconnect(port: Runtime.Port, id: string) {
  console.info('❌ State reports port disconnected', id);
  delete ports[id];
}

function handleMessage(data) {
  if (data === 'reloadSettings') {
    initSocket();
  }
}

export {};
