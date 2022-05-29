import { runtime, Runtime, tabs } from 'webextension-polyfill';
import type { PlaybackState, PortEvent } from '../interfaces';
import {
  emit,
  initSocket,
  reportState,
  setReportStateCallback,
} from './socket';

let ports: Runtime.Port[] = [];
const rooms: Record<string, Runtime.Port[]> = {};
const states: Record<string, PlaybackState> = {};

initSocket();

runtime.onConnect.addListener(handleConnect);
runtime.onMessage.addListener(handleMessage);

function handleConnect(port: Runtime.Port) {
  switch (port.name) {
    case 'state':
      handleStateReports(port);
      break;
  }
}

/**
 * Registers listeners for this port
 * @param port Connecter browser port
 */
function handleStateReports(port: Runtime.Port) {
  console.info('✅ Player connected');

  ports.push(port);

  port.onMessage.addListener(reportState);
  port.onMessage.addListener(broadcastState);
  port.onDisconnect.addListener(handleDisconnect);

  setReportStateCallback(port.postMessage);
}

/**
 * Broadcasts state to all player instances
 * @param state Current state
 * @param id Port id
 */
function broadcastState(state: PlaybackState, port: Runtime.Port) {
  console.log(state);

  for (const room in rooms) {
    if (!rooms[room].includes(port)) continue;
    states[room] = state;
    for (const p of rooms[room]) {
      if (p === port) continue;
      p.postMessage(state);
    }
  }
}

function handleDisconnect(port: Runtime.Port) {
  console.info('❌ Player disconnected', port.name);
  ports = ports.filter((p) => p !== port);
}

async function handleMessage(event: PortEvent) {
  console.debug(event);

  const [tab] = await tabs.query({ active: true, currentWindow: true });
  const port = ports.find((p) => p.sender.tab.id === tab.id);

  switch (event.name) {
    case 'reloadsettings':
      initSocket();
      break;

    case 'joinroom':
      // TODO: Get playback state from player on join

      if (!rooms[event.data.name]) {
        rooms[event.data.name] = [];
      }
      rooms[event.data.name].push(port);

      if (states[event.data.name]) {
        port.postMessage(states[event.data.name]);
      }

      break;

    case 'leaveroom':
      rooms[event.data.name] = rooms[event.data.name].filter((p) => p !== port);
      break;
  }

  emit(event);
}

export {};
