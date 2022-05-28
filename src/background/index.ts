import browser from 'webextension-polyfill';
import type { State } from '../interfaces';
import { initSocket, reportState, setReportStateCallback } from './socket';

console.info('✅ Background script running');

const ports: Record<string, browser.Runtime.Port> = {};

initSocket();

browser.runtime.onConnect.addListener(handleConnect);

function handleConnect(port: browser.Runtime.Port) {
  const [name, id] = port.name.split(':');
  switch (name) {
    case 'state':
      handleStateReports(port, id);
  }
}

function handleStateReports(port: browser.Runtime.Port, id: string) {
  console.info('✅ State reports port connected', id);
  ports[id] = port;

  port.onMessage.addListener(reportState);
  port.onMessage.addListener((state) => broadcastState(state, id));

  setReportStateCallback(port.postMessage);
  port.onDisconnect.addListener((port) => handleDisconnect(port, id));
}

function broadcastState(state: State, id: string) {
  for (const portId in ports) {
    if (portId === id) continue;
    ports[portId].postMessage(state);
  }
}

function handleDisconnect(port: browser.Runtime.Port, id: string) {
  console.info('❌ State reports port disconnected', id);
  delete ports[id];
}

export {};
