import axios from 'axios';
import {
  MediaPackageClient, CreateHarvestJobCommand, ListOriginEndpointsCommand,
} from '@aws-sdk/client-mediapackage';
import { getFileExtensionFromUri, getMediaTypeFromExtension } from './utils';
import {
  ITaskInput, ITaskDetail, TaskStatus, getTaskDetail, storeTaskDetail, harvestingTaskDetailKey,
} from '@vod-craft/utils';
import { IEvent, IOriginEndpoint, IHarvestJobDetail } from './types';

const mpClient = new MediaPackageClient({ region: process.env['AWS_REGION'] as string });

export const isProgramArchived = async ({
  originEndpointUri, harvestingStartTimeUtc, harvestingEndTimeUtc,
}: IOriginEndpoint): Promise<boolean> => {
  try {
    const resp = await axios.get(`${originEndpointUri}?start=${harvestingStartTimeUtc}&end=${harvestingEndTimeUtc}`);
    return resp.status === 200;
  } catch (err) {
    throw new Error(`Harvest job cannot be created between: ${harvestingStartTimeUtc} - ${harvestingEndTimeUtc}`);
  }
};

const addNewHarvestTask = async ({
  tenant,
  contentId,
  harvestingStartTimeUtc,
  harvestingEndTimeUtc,
  mpChannelId,
  originEndpointId,
  harvestJobId,
  manifestKey,
  mediaType,
  taskToken,
  SFNExecutionArn,
}: IHarvestJobDetail): Promise<void> => {
  const { HARVEST_TASK_DETAIL_BUCKET_NAME } = process.env as Record<string, string>;
  const existHarvestTasks = await getTaskDetail({
    taskDetailBucket: HARVEST_TASK_DETAIL_BUCKET_NAME,
    taskDetailKey: harvestingTaskDetailKey({ tenant, contentId }),
  });

  const newHarvestTask: ITaskInput = {
    status: TaskStatus.PROGRESSING,
    mediaType,
    harvestingStartTimeUtc,
    harvestingEndTimeUtc,
    mpChannelId,
    originEndpointId,
    harvestJobId,
    manifestKey,
  };
  const updatedHarvestTaskDetail: ITaskDetail = {
    ...existHarvestTasks,
    tenant,
    contentId,
    taskToken,
    SFNExecutionArn,
    taskStatus: TaskStatus.PROGRESSING,
    taskInput: [...(existHarvestTasks?.taskInput ?? []), newHarvestTask],
  };

  await storeTaskDetail({
    taskDetailBucket: HARVEST_TASK_DETAIL_BUCKET_NAME,
    taskDetailKey: harvestingTaskDetailKey({ tenant, contentId }),
    taskDetail: updatedHarvestTaskDetail,
  });
};

const createHarvestJob = async (createHarvestJobEvent: IOriginEndpoint): Promise<boolean> => {
  const canCreateVODAsset = await isProgramArchived(createHarvestJobEvent);
  if (!canCreateVODAsset) return false;

  const { VOD_OUTPUT_BUCKET_NAME, MP_HARVEST_ROLE_ARN } = process.env as Record<string, string>;
  const {
    tenant, contentId, harvestingStartTimeUtc, harvestingEndTimeUtc, originEndpointId, originEndpointUri,
  } = createHarvestJobEvent;
  const mediaExt = getFileExtensionFromUri(originEndpointUri);
  const mediaType = getMediaTypeFromExtension(mediaExt);
  const harvestJobId = `${tenant}_${contentId}_${mediaType}`;
  const manifestKey = `${contentId}/${mediaType}/index${mediaExt}`;

  try {
    const command = new CreateHarvestJobCommand({
      Id: harvestJobId,
      StartTime: harvestingStartTimeUtc,
      EndTime: harvestingEndTimeUtc,
      OriginEndpointId: originEndpointId,
      S3Destination: {
        BucketName: VOD_OUTPUT_BUCKET_NAME,
        ManifestKey: manifestKey,
        RoleArn: MP_HARVEST_ROLE_ARN,
      }
    });
    await mpClient.send(command);
    await addNewHarvestTask({ ...createHarvestJobEvent, mediaType, harvestJobId, manifestKey });
    return true;
  } catch (error) {
    console.error(
      `Error creating harvest job: ${harvestJobId} for mediatType: ${mediaType} errMsg: ${(error as Error).message}`
    );
    return false;
  }
};

const getOriginEndpoints = async (mpChannelId: string) => {
  try {
    const command = new ListOriginEndpointsCommand({ ChannelId: mpChannelId });
    const { OriginEndpoints } = await mpClient.send(command);
    return OriginEndpoints;
  } catch (error) {
    throw new Error(
      `Error fetching OriginEndpoints for ChannelId: ${mpChannelId} errMsg: ${(error as Error).message}`
    );
  }
};

export const createLive2VODAssets = async (event: IEvent): Promise<boolean> => {
  const OriginEndpoints = await getOriginEndpoints(event.mpChannelId);

  const harvestJobsResp = await Promise.all((OriginEndpoints ?? []).map(async ({ Id, Url }) => {
    if (!Id || !Url) return false;
    const createHarvestJobEvent: IOriginEndpoint = { ...event, originEndpointId: Id, originEndpointUri: Url };
    return createHarvestJob(createHarvestJobEvent);
  }));
  const isHarvestJobCreated = harvestJobsResp.some((resp) => resp === true);
  if (!isHarvestJobCreated) {
    throw new Error(`Failed to create harvest job for content: ${event.contentId}`);
  }
  return true;
};

export const handler = async (event: IEvent) => {
  console.info(`Event: ${JSON.stringify(event)}`);
  return await createLive2VODAssets(event);
};
