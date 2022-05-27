import { io, Socket } from 'socket.io-client';
import type { State } from './interfaces';

let socket: Socket;
const callbacks: Array<(state: State) => void> = [];

function init() {
  socket = io('ws://127.0.0.1:3000');

  socket.on('connect', () => {
    console.debug('✅ WebSocket connected');
  });

  socket.on('disconnect', () => {
    console.debug('❌ WebSocket disconnected');
  });

  socket.on('state', (state: State) => {
    callbacks.forEach((callback) => callback(state));
  });

  socket.on('ping', (start) => socket.emit('ping', start));
}

function report(data: State) {
  socket.emit('state', data);
}

function addReportCallback(callback: (state: State) => void) {
  callbacks.push(callback);
}

export default { init, report, addReportCallback };
