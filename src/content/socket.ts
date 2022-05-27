import { io, Socket } from 'socket.io-client';
import type { State } from './interfaces';

let socket: Socket;
const reportCallbacks: Array<(state: State) => void> = [];
const syncCallbacks: Array<() => void> = [];

function init() {
  socket = io('ws://127.0.0.1:3000');

  socket.on('connect', () => {
    console.debug('✅ WebSocket connected');
  });

  socket.on('disconnect', () => {
    console.debug('❌ WebSocket disconnected');
  });

  socket.on('state', (state: State) => {
    reportCallbacks.forEach((callback) => callback(state));
  });

  socket.on('sync', () => {
    syncCallbacks.forEach((callback) => callback());
  });

  socket.on('ping', (start) => socket.emit('ping', start));
}

function report(data: State) {
  socket.emit('state', data);
}

function sync(state: State) {
  socket.emit('sync', state);
}

function addReportCallback(callback: (state: State) => void) {
  reportCallbacks.push(callback);
}

function addSyncCallback(callback: () => void) {
  syncCallbacks.push(callback);
}

export default { init, report, sync, addReportCallback, addSyncCallback };
