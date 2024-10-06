import { createReadStream } from 'fs';
import 'aws-sdk-client-mock-jest';
import { mockClient } from 'aws-sdk-client-mock';
import { sdkStreamMixin } from '@aws-sdk/util-stream-node';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { harvestingTaskDetailKey, storeTaskDetail, getTaskDetail } from '../S3Utils';
import harvestTaskDetail from '../__fixtures__/harvestTaskDetail.json';

const s3ClientMock = mockClient(S3Client);

describe('S3Utils', () => {
  beforeEach(() => {
    process.env.AWS_REGION = 'eu-north-1';
    s3ClientMock.reset();
    s3ClientMock.on(PutObjectCommand).resolves({});
    s3ClientMock.on(GetObjectCommand).resolves({
      Body: sdkStreamMixin(createReadStream(`${__dirname}/../__fixtures__/harvestTaskDetail.json`)),
    });
  });

  afterEach(() => {
    delete process.env.AWS_REGION;
  });

  describe('harvestingTaskDetailKey', () => {
    test('should generate the correct S3 key', () => {
      const key = harvestingTaskDetailKey({
        tenant: 'tenant1', contentId: 'asset1',
      });

      expect(key).toBe('harvesting/tenant1/asset1/harvesting_task.json');
    });
  });

  describe('storeTaskDetail', () => {
    test('should store task detail successfully', async () => {
      const result = await storeTaskDetail({
        taskDetailBucket: 'harvest-task-detail', taskDetailKey: 'task-detail-key', taskDetail: harvestTaskDetail,
      });

      expect(result).toBe(true);
      expect(s3ClientMock).toHaveReceivedCommandTimes(PutObjectCommand, 1);
      expect(s3ClientMock).toHaveReceivedCommandWith(PutObjectCommand, {
        Bucket: 'harvest-task-detail', Key: 'task-detail-key', Body: JSON.stringify(harvestTaskDetail),
      });
    });

    test('should return false on error', async () => {
      s3ClientMock.on(PutObjectCommand).rejects(new Error('S3 error'));
      const result = await storeTaskDetail({
        taskDetailBucket: 'harvest-task-detail', taskDetailKey: 'task-detail-key', taskDetail: harvestTaskDetail,
      });

      expect(result).toBe(false);
      expect(s3ClientMock).toHaveReceivedCommandTimes(PutObjectCommand, 1);
      expect(s3ClientMock).toHaveReceivedCommandWith(PutObjectCommand, {
        Bucket: 'harvest-task-detail', Key: 'task-detail-key', Body: JSON.stringify(harvestTaskDetail),
      });
    });
  });

  describe('getTaskDetail', () => {
    test('should get task detail successfully', async () => {
      const result = await getTaskDetail({
        taskDetailBucket: 'harvest-task-detail', taskDetailKey: 'task-detail-key',
      });

      expect(result).toEqual(harvestTaskDetail);
      expect(s3ClientMock).toHaveReceivedCommandTimes(GetObjectCommand, 1);
      expect(s3ClientMock).toHaveReceivedCommandWith(GetObjectCommand, {
        Bucket: 'harvest-task-detail', Key: 'task-detail-key',
      });
    });

    test('should return null on error', async () => {
      s3ClientMock.on(GetObjectCommand).rejects(new Error('S3 error'));
      const result = await getTaskDetail({
        taskDetailBucket: 'harvest-task-detail', taskDetailKey: 'task-detail-key',
      });

      expect(result).toBeNull();
      expect(s3ClientMock).toHaveReceivedCommandTimes(GetObjectCommand, 1);
      expect(s3ClientMock).toHaveReceivedCommandWith(GetObjectCommand, {
        Bucket: 'harvest-task-detail', Key: 'task-detail-key',
      });
    });
  });
});
