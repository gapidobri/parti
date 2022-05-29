import type { PlaybackState } from '../interfaces';
import browser from 'webextension-polyfill';
import VideoPlayer from './player';

let port: browser.Runtime.Port;
let portConnected = false;

let player: VideoPlayer;

const portId = Math.round(Math.random() * 100000);

async function main() {
  connectPort();
  setInterval(connectPort, 1000);

  player = new VideoPlayer();
  player.addReportListener(report);
}

function connectPort() {
  if (portConnected) return;
  port = browser.runtime.connect({ name: `state:${portId}` });
  port.onMessage.addListener(handleMessage);
  port.onDisconnect.addListener(handleDisconnect);
  portConnected = true;
}

function handleMessage(state: PlaybackState) {
  player.setState(state);
}

function handleDisconnect() {
  console.info('Port disconnected');
  portConnected = false;
}

function report(state: PlaybackState) {
  port.postMessage(state);
}

main();

export {};
