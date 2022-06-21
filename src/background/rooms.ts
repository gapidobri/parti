import type { Runtime } from 'webextension-polyfill';
import type { PlaybackState } from '../interfaces';

export interface Room {
  ports: Runtime.Port[];
  state?: PlaybackState;
}

let rooms: Record<string, Room> = {};

export function joinRoom(name: string, port: Runtime.Port) {
  console.debug('joinRoom', name);
  if (!rooms[name]) {
    rooms[name] = { ports: [] };
  }
  rooms[name].ports.push(port);
  if (rooms[name].state) {
    port.postMessage(rooms[name].state);
  }
}

export function leaveRoom(name: string, port: Runtime.Port) {
  console.debug('leaveRoom', name);
  if (!rooms[name]) return;
  rooms[name].ports = rooms[name].ports.filter((p) => p !== port);
  if (!rooms[name].ports.length) {
    delete rooms[name];
  }
}

export function leaveRooms(port: Runtime.Port) {
  for (const name in rooms) {
    leaveRoom(name, port);
  }
}

export function setRoomState(
  name: string,
  state: PlaybackState,
  port?: Runtime.Port,
) {
  console.log('setRoomState', name, state);
  if (!rooms[name]) return;
  rooms[name].state = state;

  for (const p of rooms[name].ports) {
    if (p === port) continue;
    p.postMessage(state);
  }
}

export function getRoomState(name: string) {
  return rooms[name]?.state;
}

export function setPortRoomsState(port: Runtime.Port, state: PlaybackState) {
  for (const name in rooms) {
    if (!rooms[name].ports.includes(port)) continue;
    setRoomState(name, state, port);
  }
}

export function getPortRoom(port: Runtime.Port) {
  for (const roomName in rooms) {
    if (rooms[roomName].ports.includes(port)) {
      return roomName;
    }
  }
}
