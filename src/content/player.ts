import type { PlaybackState } from '../interfaces';

export default class VideoPlayer {
  private videoElement: HTMLVideoElement;
  private remoteEvent: boolean = false;
  private remoteSeek: boolean = false;
  private state: PlaybackState = { state: 'pause' };
  private reportCallbacks: Array<(state: PlaybackState) => void> = [];

  public static async init() {
    const instance = new VideoPlayer();
    await instance.initVideo();
    return instance;
  }

  private async initVideo() {
    this.videoElement = await this.locateVideoElement();

    this.videoElement.addEventListener('play', this.onPlay.bind(this));
    this.videoElement.addEventListener('pause', this.onPause.bind(this));
    this.videoElement.addEventListener('seeked', this.onSeek.bind(this));
  }

  public setState(state: PlaybackState) {
    this.remoteEvent = true;
    this.state = state;
    this.applyState();
  }

  private async applyState() {
    const prevTime = this.videoElement.currentTime;

    switch (this.state.state) {
      case 'play':
        this.videoElement.currentTime = (Date.now() + this.state.offset) / 1000;
        this.videoElement.play().catch(() => {
          this.videoElement.muted = true;
          this.videoElement.play();
        });
        break;

      case 'pause':
        this.videoElement.pause();
        this.videoElement.currentTime = this.state.time;
        break;
    }

    this.remoteSeek = this.videoElement.currentTime !== prevTime;
  }

  private syncState() {
    this.state.state = this.videoElement.paused ? 'pause' : 'play';
    this.state.time = this.videoElement.currentTime;
    this.state.offset = this.calculateOffset();
  }

  private onPlay() {
    console.info('▶️ Playing - remote:', this.remoteEvent);

    this.syncState();
    this.reportState();
  }

  private onPause() {
    console.info('⏸ Paused - remote:', this.remoteEvent);

    this.syncState();
    this.reportState();
  }

  private onSeek() {
    console.info('⏩ Seeking - remote:', this.remoteEvent || this.remoteSeek);

    this.syncState();

    if (this.remoteSeek) {
      this.remoteSeek = false;
      return;
    }
    this.reportState();
  }

  private reportState() {
    if (this.remoteEvent) {
      this.remoteEvent = false;
      return;
    }

    this.reportCallbacks.forEach((c) => c(this.state));
  }

  private calculateOffset() {
    return this.videoElement.currentTime * 1000 - Date.now();
  }

  public addReportListener(callback: (state: PlaybackState) => void) {
    this.reportCallbacks.push(callback);
  }

  private locateVideoElement(): Promise<HTMLVideoElement> {
    return new Promise((resolve, reject) => {
      if (document.querySelector('video')) {
        return resolve(document.querySelector('video'));
      }

      const observer = new MutationObserver(() => {
        if (document.querySelector('video')) {
          resolve(document.querySelector('video'));
          observer.disconnect();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  }
}
