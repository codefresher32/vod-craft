export interface ITaskInput {
  status: string;
  mediaType: string | null;
  harvestingStartTimeUtc: string;
  harvestingEndTimeUtc: string;
  mpChannelId: string;
  originEndpointId: string;
  harvestJobId: string;
  manifestKey: string;
}

export interface ITaskDetail {
  tenant: string;
  contentId: string;
  taskToken: string;
  SFNExecutionArn: string;
  taskStatus: string;
  taskInput: ITaskInput[];
}

export enum TaskStatus {
  PROGRESSING = 'PROGRESSING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
}
