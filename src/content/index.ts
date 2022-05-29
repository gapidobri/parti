import type { PlaybackState } from '../interfaces';
import browser, { tabs } from 'webextension-polyfill';
import VideoPlayer from './player';

let port: browser.Runtime.Port;
let portConnected = false;

let player: VideoPlayer;

async function main() {
  player = await VideoPlayer.init();
  player.addReportListener(report);

  connectPort();
  setInterval(connectPort, 1000);
}

async function connectPort() {
  if (portConnected) return;

  // const [tab] = await tabs.query({ active: true, currentWindow: true });

  const portId = Math.random().toString(36).slice(2, 7);

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
