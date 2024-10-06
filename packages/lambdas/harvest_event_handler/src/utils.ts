import {
  SFNClient, DescribeExecutionCommand, SendTaskSuccessCommand, SendTaskFailureCommand,
} from '@aws-sdk/client-sfn';
import { ITaskDetail } from '@vod-craft/utils';

const SFN_RUNNING_STATUS = 'RUNNING';

const sfnClient = new SFNClient({ region: process.env['AWS_REGION'] as string });

const getSFNExecutionStatus = async (SFNExecutionArn: string) => {
  try {
    const command = new DescribeExecutionCommand({ executionArn: SFNExecutionArn });
    const resp = await sfnClient.send(command);
    return resp.status;
  } catch (err) {
    console.error(`Failed to describe SFN execution: ${err}`);
    return null;
  }
};

export const sendTaskSuccessToSFN = async (taskDetail: ITaskDetail) => {
  const { taskToken, SFNExecutionArn } = taskDetail;
  const sfnExecutionStatus = await getSFNExecutionStatus(SFNExecutionArn);
  console.info(`sfnExecutionStatus: ${sfnExecutionStatus}`);
  if (sfnExecutionStatus !== SFN_RUNNING_STATUS) {
    console.info(`SFN execution is not running: ${SFNExecutionArn}`);
    return false;
  }

  try {
    const command = new SendTaskSuccessCommand({
      taskToken, output: JSON.stringify(taskDetail),
    });
    await sfnClient.send(command);
    return true;
  } catch (err) {
    console.error('Failed to send task success to SFN');
    return false;
  }
};

export const sendTaskFailureToSFN = async (taskDetail: ITaskDetail) => {
  const { taskToken, SFNExecutionArn } = taskDetail;
  const sfnExecutionStatus = await getSFNExecutionStatus(SFNExecutionArn);
  console.info(`sfnExecutionStatus: ${sfnExecutionStatus}`);
  if (sfnExecutionStatus !== SFN_RUNNING_STATUS) {
    console.info(`SFN execution is not running: ${SFNExecutionArn}`);
    return false;
  }

  try {
    const command = new SendTaskFailureCommand({
      taskToken, error: taskDetail.taskStatus, cause: 'Harvest Job processing failed',
    });
    await sfnClient.send(command);
    return true;
  } catch (err) {
    console.error('Failed to send task failure to SFN');
    return false;
  }
};
