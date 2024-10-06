export interface IEvent {
  tenant: string;
  contentId: string;
  taskToken: string;
  SFNExecutionArn: string;
  harvestingStartTimeUtc: string;
  harvestingEndTimeUtc: string;
  mpChannelId: string;
}

export interface IOriginEndpoint extends IEvent {
  originEndpointId: string;
  originEndpointUri: string;
}

export interface IHarvestJobDetail extends IOriginEndpoint {
  mediaType: string | null;
  manifestKey: string;
  harvestJobId: string;
}
