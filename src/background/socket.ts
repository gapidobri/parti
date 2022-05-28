import { io, Socket } from 'socket.io-client';
import type { State } from '../interfaces';

const url = 'ws://127.0.0.1:3000';

let socket: Socket;
let handleState: (state: State) => void = () => {};

export function initSocket() {
  console.info('⚡️ Initializing WebSocket connection');

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

export function reportState(state: State) {
  console.debug('Report state', state);
  socket.emit('state', state);
}

export function setReportStateCallback(callback: (state: State) => void) {
  handleState = callback;
}
