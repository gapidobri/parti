import type { State } from '../interfaces';
import { locatePlayer } from './player-locator';

import browser from 'webextension-polyfill';

let player: HTMLVideoElement;
let remoteAction = false;
let port: browser.Runtime.Port;

async function main() {
  const portId = Math.round(Math.random() * 100000);

  port = browser.runtime.connect({ name: `state:${portId}` });
  port.onMessage.addListener(handleReport);

  player = await locatePlayer();
  player.addEventListener('play', handlePlay);
  player.addEventListener('pause', handlePause);
  player.addEventListener('seeked', handleSeek);
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
