import { runtime, Runtime, tabs } from 'webextension-polyfill';
import type { PlaybackState, PortEvent, ServerStateEvent } from '../interfaces';
import {
  getPortRoom,
  joinRoom,
  leaveRoom,
  leaveRooms,
  setPortRoomsState,
  setRoomState,
} from './rooms';
import {
  emit,
  initSocket,
  setReportStateCallback,
  removeReportStateCallback,
  reportState,
} from './socket';

let ports: Runtime.Port[] = [];

function main() {
  initSocket();

  runtime.onConnect.addListener(handleConnect);
  runtime.onMessage.addListener(handleMessage);

  setReportStateCallback(handleServerState);
}

function handleServerState(event: ServerStateEvent) {
  console.log('handleServerState', event);
  setRoomState(event.room, event.data);
}

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
async function handleStateReports(port: Runtime.Port) {
  console.info('✅ Player connected');

  const [tab] = await tabs.query({ active: true, currentWindow: true });
  console.log(tab.id);

  ports.push(port);

  port.onMessage.addListener((data) =>
    reportState({
      data,
      room: getPortRoom(port),
    }),
  );
  port.onMessage.addListener(broadcastState);
  port.onDisconnect.addListener(handleDisconnect);
}

/**
 * Broadcasts state to all player instances
 * @param state Current state
 * @param port Content script port
 */
function broadcastState(state: PlaybackState, port: Runtime.Port) {
  console.log('broadcastState', state);

  setPortRoomsState(port, state);
}

function handleDisconnect(port: Runtime.Port) {
  console.info('❌ Player disconnected');

  leaveRooms(port);

  ports = ports.filter((p) => p !== port);

  removeReportStateCallback(port.postMessage);
}

async function handleMessage(event: PortEvent) {
  const [tab] = await tabs.query({ active: true, currentWindow: true });
  const port = ports.find((p) => p.sender.tab.id === tab.id);

  console.debug('handleMessage', event);

  switch (event.name) {
    case 'reloadsettings':
      initSocket();
      break;

    case 'joinroom':
      // TODO: Get playback state from player on join
      joinRoom(event.data, port);
      break;

    case 'leaveroom':
      leaveRoom(event.data, port);
      break;
  }

  emit(event.name, event.data);
}

main();

export {};
