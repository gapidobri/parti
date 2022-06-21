export interface PlaybackState {
  state: 'play' | 'pause';
  offset?: number;
  time?: number;
}

export interface PortEvent {
  name: string;
  data: any;
}

export interface ServerStateEvent {
  room: string;
  data: PlaybackState;
}
