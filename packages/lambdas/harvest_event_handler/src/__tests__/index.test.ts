import {
  ITaskInput, TaskStatus, getTaskDetail, storeTaskDetail, harvestingTaskDetailKey,
} from '@vod-craft/utils';
import harvestTaskDetail from '@vod-craft/utils/__fixtures__/harvestTaskDetail.json';
import { handler, parseHarvestJobId, isTaskProcessing, processHarvestTasks } from '../index';
import { sendTaskSuccessToSFN } from '../utils'
import { IEvent, IHarvestJobDetail } from '../types';

jest.mock('@vod-craft/utils', () => ({
  ...jest.requireActual('@vod-craft/utils'),
  storeTaskDetail: jest.fn().mockReturnValue(true),
  getTaskDetail: jest.fn(),
}));

jest.mock('../utils', () => ({
  sendTaskSuccessToSFN: jest.fn().mockReturnValue(true),
}));

(getTaskDetail as jest.Mock).mockReturnValue(harvestTaskDetail);

const mockHarvestJobDetail: IHarvestJobDetail = {
  id: 'vimond_976848_hls',
  arn: 'arn:aws:mediapackage:eu-north-1:786994645791:harvest_jobs/vimond_976848_hls',
  status: 'SUCCEEDED',
  start_time: '2024-07-16T09:20:00+00:00',
  end_time: '2024-07-16T09:25:00+00:00',
  origin_endpoint_id: 'live-to-vod-workflow-hls',
  created_at: '2024-07-16T11:34:14+00:00',
  s3_destination: {
    bucket_name: 'eu-north-1-dev-video-live-vimond-live-scheduler-vod-files',
    manifest_key: '976848/hls/index.m3u8',
    role_arn: 'arn:aws:iam::786994645791:role/eu-north-1-dev-video-live_mediapackage_harvest_role',
  },
};


const mockEvent: IEvent = {
  id: 'a256c36d-63e3-69de-0a1c-b03332905193',
  'detail-type': 'MediaPackage HarvestJob Notification',
  source: 'aws.mediapackage',
  account: '786994645791',
  time: '2024-07-16T11:35:34Z',
  region: 'eu-north-1',
  resources: [
    'arn:aws:mediapackage:eu-north-1:786994645791:harvest_jobs/vimond_976848_hls'
  ],
  detail: {
    harvest_job: mockHarvestJobDetail
  }
};

describe('Harvest Event Handler', () => {
  beforeEach(() => {
    process.env.AWS_REGION = 'eu-north-1';
    process.env.HARVEST_TASK_DETAIL_BUCKET_NAME = 'harvest-task-detail';
    process.env.VOD_OUTPUT_CF_DOMAIN = 'harvested-vod.tv';
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.AWS_REGION;
    delete process.env.HARVEST_TASK_DETAIL_BUCKET_NAME;
    delete process.env.VOD_OUTPUT_CF_DOMAIN;
  });

  describe('parseHarvestJobId', () => {
    test('should parse the harvest job ID correctly', () => {
      const result = parseHarvestJobId(mockHarvestJobDetail.id);

      expect(result).toEqual({
        tenant: 'vimond', contentId: '976848', mediaType: 'hls',
      });
    });
  });

  describe('isTaskProcessing', () => {
    test('should return true if any task is in progress', () => {
      const taskInput: ITaskInput[] = harvestTaskDetail.taskInput;

      expect(isTaskProcessing(taskInput)).toBe(true);
    });

    test('should return false if no task is in progress', () => {
      const taskInput: ITaskInput[] = [];

      expect(isTaskProcessing(taskInput)).toBe(false);
    });
  });

  describe('processHarvestTasks', () => {
    test('should process tasks and update task details', async () => {
      const result = await processHarvestTasks({
        tenant: 'vimond',
        contentId: '976848',
        harvestJobId: 'vimond_976848_hls',
        status: TaskStatus.SUCCEEDED,
      });

      expect(getTaskDetail).toHaveBeenCalledTimes(1);
      expect(getTaskDetail).toHaveBeenCalledWith({
        taskDetailBucket: process.env.HARVEST_TASK_DETAIL_BUCKET_NAME,
        taskDetailKey: harvestingTaskDetailKey({
          tenant: 'vimond', contentId: '976848',
        }),
      });
      expect(storeTaskDetail).toHaveBeenCalledTimes(1);
      expect(storeTaskDetail).toHaveBeenCalledWith({
        taskDetailBucket: process.env.HARVEST_TASK_DETAIL_BUCKET_NAME,
        taskDetailKey: harvestingTaskDetailKey({
          tenant: 'vimond', contentId: '976848',
        }),
        taskDetail: {
          ...harvestTaskDetail,
          taskStatus: TaskStatus.SUCCEEDED,
          taskInput:[{
            ...harvestTaskDetail.taskInput[0],
            status: TaskStatus.SUCCEEDED,
          }]
        }
      });
      expect(result).toEqual({
        ...harvestTaskDetail, taskStatus: TaskStatus.SUCCEEDED, taskInput:[{
          ...harvestTaskDetail.taskInput[0],status: TaskStatus.SUCCEEDED,
        }]
      });
    });

    test('should return null if task detail is not found', async () => {
      (getTaskDetail as jest.Mock).mockReturnValueOnce(null);

      const result = await processHarvestTasks({
        tenant: 'vimond',
        contentId: '976848',
        harvestJobId: 'vimond_976848_hls',
        status: TaskStatus.SUCCEEDED,
      });

      expect(result).toBeNull();
    });
  });

  describe('handler', () => {
    test('should handle the event, process harvest tasks and return SUCCEEDED', async () => {
      const res = await handler(mockEvent);

      expect(getTaskDetail).toHaveBeenCalledTimes(1);
      expect(getTaskDetail).toHaveBeenCalledWith({
        taskDetailBucket: process.env.HARVEST_TASK_DETAIL_BUCKET_NAME,
        taskDetailKey: harvestingTaskDetailKey({
          tenant: 'vimond', contentId: '976848',
        }),
      });
      expect(storeTaskDetail).toHaveBeenCalledTimes(1);
      expect(storeTaskDetail).toHaveBeenCalledWith({
        taskDetailBucket: process.env.HARVEST_TASK_DETAIL_BUCKET_NAME,
        taskDetailKey: harvestingTaskDetailKey({
          tenant: 'vimond', contentId: '976848',
        }),
        taskDetail: {
          ...harvestTaskDetail,
          taskStatus: TaskStatus.SUCCEEDED,
          taskInput:[{
            ...harvestTaskDetail.taskInput[0],
            status: TaskStatus.SUCCEEDED,
          }]
        }
      });
      expect(sendTaskSuccessToSFN).toHaveBeenCalledTimes(1);
      expect(res).toBe(TaskStatus.SUCCEEDED);
    });
  });
});
