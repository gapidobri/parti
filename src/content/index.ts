import type { State } from '../interfaces';
import { locatePlayer } from './player-locator';

import browser from 'webextension-polyfill';

let player: HTMLVideoElement;
let remoteAction = false;
let port: browser.Runtime.Port;
let portConnected = false;

const portId = Math.round(Math.random() * 100000);

async function main() {
  setInterval(connectPort, 1000);

  player = await locatePlayer();
  player.addEventListener('play', handlePlay);
  player.addEventListener('pause', handlePause);
  player.addEventListener('seeked', handleSeek);
}

function connectPort() {
  if (portConnected) return;
  port = browser.runtime.connect({ name: `state:${portId}` });
  port.onMessage.addListener(handleReport);
  port.onDisconnect.addListener(handleDisconnect);
  portConnected = true;
}

function handleDisconnect() {
  console.info('Port disconnected');
  portConnected = false;
}

function report() {
  port.postMessage({ playing: !player.paused, time: player.currentTime });
}

function handlePlay() {
  console.debug('▶️ Playing');

  if (remoteAction) {
    remoteAction = false;
    return;
  }

  report();
}

function handlePause() {
  console.debug('⏸ Paused');

  if (remoteAction) {
    remoteAction = false;
    return;
  }

  report();
}

function handleSeek() {
  console.debug('⏩ Seeking');

  if (remoteAction) {
    remoteAction = false;
    return;
  }
  report();
}

function handleReport(newState: State) {
  // console.debug(
  //   'ℹ️ New report: playing:',
  //   newState.playing,
  //   'time:',
  //   newState.time,
  // );

  if (player.currentTime !== newState.time) {
    remoteAction = true;
    player.currentTime = newState.time;
  }

  if (player.paused === newState.playing) {
    remoteAction = true;
    if (newState.playing) {
      player.play();
    } else {
      player.pause();
    }
  }
}

function handleSync() {}

main();

export {};
