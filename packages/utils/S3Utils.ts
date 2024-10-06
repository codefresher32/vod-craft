import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { ITaskDetail } from './types';

const s3Client = new S3Client({ region: process.env['AWS_REGION'] });

export const harvestingTaskDetailKey = ({ tenant, contentId }: {
  tenant: string; contentId: string;
}): string => `harvesting/${tenant}/${contentId}/harvesting_task.json`;

export const storeTaskDetail = async ({ taskDetailBucket, taskDetailKey, taskDetail }: {
  taskDetailBucket: string, taskDetailKey: string, taskDetail: ITaskDetail,
}): Promise<boolean> => {
  try {
    const command = new PutObjectCommand({
      Bucket: taskDetailBucket,
      Key: taskDetailKey,
      Body: JSON.stringify(taskDetail),
    });
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error(`Error storing task detail: ${error}`);
    return false;
  }
};

export const getTaskDetail = async ({ taskDetailBucket, taskDetailKey }: {
  taskDetailBucket: string, taskDetailKey: string,
}): Promise<ITaskDetail | null> => {
  try {
    const resp = await s3Client.send(new GetObjectCommand({
      Bucket: taskDetailBucket,
      Key: taskDetailKey,
    }));
    const data = await resp.Body?.transformToString();
    return JSON.parse(data ?? '');
  } catch (error) {
    console.error(`Error getting task detail: ${error}`);
    return null;
  }
};
