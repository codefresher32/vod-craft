export interface IMediaPackageIngestInfo {
  url: string;
  username: string;
  password: string;
}

export interface IEvent {
  mpChannelId: string;
  sourceHlsUrl: string;
  destService: string;
  liveDuration: number;
}
