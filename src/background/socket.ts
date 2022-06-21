import { io, Socket } from 'socket.io-client';
import { storage } from 'webextension-polyfill';
import type { ServerStateEvent } from '../interfaces';

let socket: Socket;
let reportStateCallbacks: ((event: ServerStateEvent) => void)[] = [];

export async function initSocket() {
  if (socket && socket.connected) {
    socket.disconnect();
  }

  console.info('⚡️ Initializing WebSocket connection');

  const url =
    (await storage.local.get('serverUrl'))['serverUrl'] ??
    'ws://127.0.0.1:3000';

  socket = io(url);

  socket.on('connect', handleConnect);
  socket.on('disconnect', handleDisconnect);
  socket.on('state', handleState);
  socket.on('ping', handlePing);
}

function handleConnect() {
  console.info('✅ WebSocket connected', socket.id);
}

function handleDisconnect() {
  console.info('❌ WebSocket disconnected');
}

function handleState(event: ServerStateEvent) {
  reportStateCallbacks.forEach((c) => c(event));
}

function handlePing(start: number) {
  socket.emit('ping', start);
}

/**
 * Reports state to server
 * @param state Current state
 */
export function reportState(event: ServerStateEvent) {
  socket.emit('state', event);
}

export function emit(event: string, data: any) {
  socket.emit(event, data);
}

export function setReportStateCallback(
  callback: (event: ServerStateEvent) => void,
) {
  reportStateCallbacks.push(callback);
}

export function removeReportStateCallback(
  callback: (state: ServerStateEvent) => void,
) {
  reportStateCallbacks = reportStateCallbacks.filter((c) => c !== callback);
}
