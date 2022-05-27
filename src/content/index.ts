import type { State } from './interfaces';
import { locatePlayer } from './player-locator';
import Socket from './socket';

let player: HTMLVideoElement;
let remoteAction = false;

async function main() {
  Socket.init();
  Socket.addReportCallback(handleReport);

  player = await locatePlayer();

  player.addEventListener('play', handlePlay);
  player.addEventListener('pause', handlePause);
  player.addEventListener('timeupdate', handleTimeUpdate);
}

function report() {
  console.log('Reporting...');
  Socket.report({ playing: !player.paused, time: player.currentTime });
}

function handlePlay() {
  console.debug('Playing');

  if (remoteAction) {
    remoteAction = false;
    return;
  }

  report();
}

function handlePause() {
  console.debug('Paused');

  if (remoteAction) {
    remoteAction = false;
    return;
  }

  report();
}

function handleTimeUpdate() {
  if (player.paused) {
    report();
  }
}

function handleReport(newState: State) {
  console.debug(
    'ℹ️ New report: playing:',
    newState.playing,
    'time:',
    newState.time,
  );

  if (player.currentTime !== newState.time) {
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

main();

export {};
