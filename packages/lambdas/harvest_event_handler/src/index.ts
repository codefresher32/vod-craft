import {
  ITaskInput, ITaskDetail, TaskStatus, getTaskDetail, storeTaskDetail, harvestingTaskDetailKey,
} from '@vod-craft/utils';
import { sendTaskSuccessToSFN, sendTaskFailureToSFN } from './utils';
import { IEvent } from './types';

export const parseHarvestJobId = (id: string) => {
  const [tenant, contentId, mediaType] = id.split('_');
  return { tenant, contentId, mediaType };
};

export const isTaskProcessing = (taskInput: ITaskInput[]) =>
  taskInput.some((task) => task.status === TaskStatus.PROGRESSING);

export const processHarvestTasks = async ({
  tenant, contentId, harvestJobId, status,
}: { tenant: string; contentId: string; status: string; harvestJobId: string }) => {
  const { HARVEST_TASK_DETAIL_BUCKET_NAME } = process.env as Record<string, string>;

  const taskDetail = await getTaskDetail({
    taskDetailBucket: HARVEST_TASK_DETAIL_BUCKET_NAME,
    taskDetailKey: harvestingTaskDetailKey({ tenant, contentId }),
  });
  console.info(`Task detail: ${JSON.stringify(taskDetail)}`);
  if (!taskDetail) {
    console.error(`Harvest task not found: ${harvestJobId}`);
    return null;
  }

  const updatedTaskInput = taskDetail.taskInput.map((task) =>
    task.harvestJobId === harvestJobId ? { ...task, status: status } : task);
  const updatedTaskDetail = {
    ...taskDetail,
    taskInput: updatedTaskInput,
    taskStatus: isTaskProcessing(updatedTaskInput) ? TaskStatus.PROGRESSING : TaskStatus.SUCCEEDED,
  };
  console.info(`Updated task detail: ${JSON.stringify(updatedTaskDetail)}`);

  await storeTaskDetail({
    taskDetailBucket: HARVEST_TASK_DETAIL_BUCKET_NAME,
    taskDetailKey: harvestingTaskDetailKey({ tenant, contentId }),
    taskDetail: updatedTaskDetail,
  });

  return updatedTaskDetail;
};

const processSFNExecution = async (taskDetail: ITaskDetail) => {
  const { taskStatus } = taskDetail;
  if (taskStatus === TaskStatus.SUCCEEDED) {
    await sendTaskSuccessToSFN(taskDetail);
  } else if (taskStatus === TaskStatus.FAILED) {
    await sendTaskFailureToSFN(taskDetail);
  }
};

export const handler = async (event: IEvent): Promise<string | null> => {
  console.info(`Event: ${JSON.stringify(event)}`);
  const { detail: { harvest_job } } = event;
  const { tenant, contentId } = parseHarvestJobId(harvest_job.id);

  const taskDetail = await processHarvestTasks({
    tenant, contentId, harvestJobId: harvest_job.id, status: harvest_job.status,
  });
  console.info(`Harvest tasks updated detail: ${JSON.stringify(taskDetail)}`);

  if (taskDetail) {
    await processSFNExecution(taskDetail);
  }

  return taskDetail?.taskStatus ?? null;
};
