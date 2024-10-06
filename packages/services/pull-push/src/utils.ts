import { spawn } from 'node:child_process';
import { HLSPullPush } from '@eyevinn/hls-pull-push';
import { MediaPackageClient, DescribeChannelCommand } from '@aws-sdk/client-mediapackage';
import { IMediaPackageIngestInfo } from './types';

const getStreamFormat = async (sourceHlsUrl: string): Promise<{ format: Record<string, string|number> }> => {
  const command = 'ffprobe';
  const args = ['-v', 'warning', '-print_format', 'json', '-show_format', '-i', sourceHlsUrl];

  return new Promise((resolve, reject) => {
    const process = spawn(command, args);
    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`ffprobe process exited with code ${code}: ${stderr}`));
      }

      try {
        const output = JSON.parse(stdout);
        resolve(output);
      } catch (parseError) {
        reject(new Error(`Error parsing ffprobe output: ${parseError.message}`));
      }
    });
  });
};


const isLiveStream = async (sourceHlsUrl: string): Promise<boolean> => {
  const { format } = await getStreamFormat(sourceHlsUrl);
  console.info(`${sourceHlsUrl} Stream Format: ${JSON.stringify(format)}`);
  if (!format) return false;
  return isNaN(Number(format?.duration));
};

export const shouldRetryPullPushService = async (
  pullPushClient: HLSPullPush, sourceHlsUrl: string, fetcherId: string,
): Promise<boolean> => {
  pullPushClient.getActiveFetchers();
  console.info(`Checking if stream is live: ${sourceHlsUrl}`);
  return !pullPushClient.isValidFetcher(fetcherId) && await isLiveStream(sourceHlsUrl);
};

export const getMpHLSIngestEndpoints = async (mpChannelId: string): Promise<IMediaPackageIngestInfo> => {
  const mpClient = new MediaPackageClient({ region: process.env.AWS_REGION });

  try {
    const command = new DescribeChannelCommand({ Id: mpChannelId });
    const { HlsIngest } = await mpClient.send(command);

    return {
      url: HlsIngest?.IngestEndpoints?.[0]?.Url ?? '',
      username: HlsIngest?.IngestEndpoints?.[0]?.Username ?? '',
      password: HlsIngest?.IngestEndpoints?.[0]?.Password ?? '',
    };
  } catch (err) {
    throw new Error(`Can't retrieve HLS ingest endpoints for mediapackage channel: ${mpChannelId}`);
  }
};
