import { io, Socket } from 'socket.io-client';
import { storage } from 'webextension-polyfill';
import type { State } from '../interfaces';

let socket: Socket;
let handleState: (state: State) => void = () => {};

export async function initSocket() {
  if (socket && socket.connected) {
    socket.disconnect();
  }

  console.info('⚡️ Initializing WebSocket connection');

  const url =
    (await storage.local.get('serverUrl'))['serverUrl'] ??
    'ws://127.0.0.1:3000';

  console.debug(url);

  socket = io(url);

  socket.on('connect', handleConnect);
  socket.on('disconnect', handleDisconnect);
  socket.on('state', handleState);
  socket.on('ping', handlePing);
}

function handleConnect() {
  console.info('✅ WebSocket connected', socket.id);
  console.debug('Session id', socket.id);
}

function handleDisconnect() {
  console.info('❌ WebSocket disconnected');
}

function handlePing(start: number) {
  socket.emit('ping', start);
}

/**
 * Reports state to server
 * @param state Current state
 */
export function reportState(state: State) {
  console.debug('Report state', state);
  socket.emit('state', state);
}

export function setReportStateCallback(callback: (state: State) => void) {
  handleState = callback;
}
