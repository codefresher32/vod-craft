import 'aws-sdk-client-mock-jest';
import axios from 'axios';
import { mockClient } from 'aws-sdk-client-mock';
import {
  MediaPackageClient, CreateHarvestJobCommand, ListOriginEndpointsCommand,
} from '@aws-sdk/client-mediapackage';
import { storeTaskDetail, getTaskDetail, harvestingTaskDetailKey } from '@vod-craft/utils';
import { handler } from '../index';
import { IEvent, IOriginEndpoint } from '../types';
import harvestTaskDetail from '@vod-craft/utils/__fixtures__/harvestTaskDetail.json';

const mpClientMock = mockClient(MediaPackageClient);

jest.mock('axios');

jest.mock('@vod-craft/utils', () => ({
  ...jest.requireActual('@vod-craft/utils'),
  storeTaskDetail: jest.fn().mockReturnValue(true),
  getTaskDetail: jest.fn().mockReturnValue(null),
}));

const mockEvent: IEvent = {
  tenant: 'vimond',
  contentId: '976848',
  taskToken: 'taskToken',
  SFNExecutionArn: 'SFNExecutionArn',
  harvestingStartTimeUtc: '2024-07-09T09:45:09Z',
  harvestingEndTimeUtc: '2024-07-09T10:15:09Z',
  mpChannelId: 'live-to-vod-workflow-channel',
};

const mockOriginEvent: IOriginEndpoint = {
  ...mockEvent,
  originEndpointId: 'ive-to-vod-workflow-hls',
  originEndpointUri: 'https://mediapackage.channel/v1/channel/live-to-vod-workflow-hls/index.m3u8',
};

describe('Create Harvest Job', () => {
  beforeEach(() => {
    process.env.AWS_REGION = 'eu-north-1';
    process.env.VOD_OUTPUT_BUCKET_NAME = 'VOD-OUTPUT-BUCKET';
    process.env.HARVEST_TASK_DETAIL_BUCKET = 'harvest-task-detail';
    process.env.MP_HARVEST_ROLE_ARN = 'arn:aws:iam::123456789012:role/MediaPackageHarvestRole';
    mpClientMock.reset();
    mpClientMock.on(ListOriginEndpointsCommand).resolves({ OriginEndpoints: [{
      Id: mockOriginEvent.originEndpointId, Url: mockOriginEvent.originEndpointUri,
    }]});
    mpClientMock.on(CreateHarvestJobCommand).resolves({});
    (axios.get as jest.Mock).mockResolvedValue({ status: 200 });
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.AWS_REGION;
    delete process.env.VOD_OUTPUT_BUCKET_NAME;
    delete process.env.HARVEST_TASK_DETAIL_BUCKET;
    delete process.env.MP_HARVEST_ROLE_ARN;
  });

  test('should successfully create harvest job', async () => {
    const resp = await handler(mockEvent);

    expect(mpClientMock).toHaveReceivedCommandTimes(ListOriginEndpointsCommand, 1);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(
      `${mockOriginEvent.originEndpointUri}?start=${mockEvent.harvestingStartTimeUtc}` +
      `&end=${mockEvent.harvestingEndTimeUtc}`,
    );
    expect(mpClientMock).toHaveReceivedCommandTimes(CreateHarvestJobCommand, 1);
    expect(getTaskDetail).toHaveBeenCalledTimes(1);
    expect(getTaskDetail).toHaveBeenCalledWith({
      taskDetailBucket: process.env.HARVEST_TASK_DETAIL_BUCKET_NAME,
      taskDetailKey: harvestingTaskDetailKey({
        tenant: mockEvent.tenant, contentId: mockEvent.contentId,
      }),
    });
    expect(storeTaskDetail).toHaveBeenCalledTimes(1);
    expect(storeTaskDetail).toHaveBeenCalledWith({
      taskDetailBucket: process.env.HARVEST_TASK_DETAIL_BUCKET_NAME,
      taskDetailKey: harvestingTaskDetailKey({
        tenant: mockEvent.tenant, contentId: mockEvent.contentId,
      }),
      taskDetail: harvestTaskDetail,
    });
    expect(resp).toBe(true);
  });

  test('should throw error if origin not found', async () => {
    mpClientMock.reset();
    mpClientMock.on(ListOriginEndpointsCommand).rejects(new Error('Origin not found'));

    await expect(handler(mockEvent)).rejects.toThrow(
      /Error fetching OriginEndpoints for ChannelId: live-to-vod-workflow-channel errMsg: Origin not found/
    );
    expect(mpClientMock).toHaveReceivedCommandTimes(ListOriginEndpointsCommand, 1);
    expect(axios.get).toHaveBeenCalledTimes(0);
    expect(mpClientMock).toHaveReceivedCommandTimes(CreateHarvestJobCommand, 0);
    expect(storeTaskDetail).toHaveBeenCalledTimes(0);
    expect(getTaskDetail).toHaveBeenCalledTimes(0);
  });

  test('should throw error if live stream not found', async () => {
    (axios.get as jest.Mock).mockRejectedValueOnce(new Error('stream not found'));

    await expect(handler(mockEvent)).rejects.toThrow(
      `Harvest job cannot be created between: ${mockEvent.harvestingStartTimeUtc} - ${mockEvent.harvestingEndTimeUtc}`
    );
    expect(mpClientMock).toHaveReceivedCommandTimes(ListOriginEndpointsCommand, 1);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(mpClientMock).toHaveReceivedCommandTimes(CreateHarvestJobCommand, 0);
    expect(storeTaskDetail).toHaveBeenCalledTimes(0);
    expect(getTaskDetail).toHaveBeenCalledTimes(0);
  });

  test('should throw error if can not create single harvest job', async () => {
    mpClientMock.on(CreateHarvestJobCommand).rejects(new Error('AWS Error'));

    await expect(handler(mockEvent)).rejects.toThrow(
      `Failed to create harvest job for content: ${mockEvent.contentId}`
    );
    expect(mpClientMock).toHaveReceivedCommandTimes(ListOriginEndpointsCommand, 1);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(mpClientMock).toHaveReceivedCommandTimes(CreateHarvestJobCommand, 1);
    expect(storeTaskDetail).toHaveBeenCalledTimes(0);
    expect(getTaskDetail).toHaveBeenCalledTimes(0);
  });
});
