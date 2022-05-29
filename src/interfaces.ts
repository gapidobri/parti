export interface State {
  playing: boolean;
  time: number;
}

export interface PlaybackState {
  state: 'play' | 'pause';
  offset?: number;
  time?: number;
}
