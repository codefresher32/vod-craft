import { HLSPullPush, MediaPackageOutput } from '@eyevinn/hls-pull-push';
import { getMpHLSIngestEndpoints, shouldRetryPullPushService } from './utils';
import { IEvent, IMediaPackageIngestInfo } from './types';

const SERVICE_RETRY_INTERVAL = parseInt(process.env.SERVICE_RETRY_INTERVAL || '5', 10);

const initiatePullPushLiveStream = async ({
  sourceHlsUrl, destService, mpChannelId, liveDuration,
}: IEvent): Promise<void> => {
  try {
    const streamStart = Date.now();
    const ingestEndpoints: IMediaPackageIngestInfo = await getMpHLSIngestEndpoints(mpChannelId);

    const pullPushService = new HLSPullPush();
    pullPushService.registerPlugin(destService, new MediaPackageOutput());
    const logger = pullPushService.getLogger();

    const sourceUrl = new URL(sourceHlsUrl);
    const requestedPlugin = pullPushService.getPluginFor(destService);
    const outputDest = requestedPlugin.createOutputDestination({
      ingestUrls: [ingestEndpoints],
    }, logger);

    let sessionId = '';

    const startNewStreamingSession = async () => {
      sessionId = pullPushService.startFetcher({
        name: mpChannelId,
        url: sourceUrl.href,
        destPlugin: outputDest,
        destPluginName: destService,
      });
      outputDest.attachSessionId(sessionId);
    };

    const stopStreamingSession = async () => {
      if (pullPushService.isValidFetcher(sessionId)) {
        pullPushService.stopFetcher(sessionId);
      }
    };

    const handleStreaming = async () => {
      try {
        const streamedDuration = Date.now() - streamStart;

        if (streamedDuration >= liveDuration * 1000) {
          logger.info(`Live stream duration reached: ${liveDuration} seconds`);
          clearInterval(intervalId);
          await stopStreamingSession();
          return;
        }

        if (await shouldRetryPullPushService(pullPushService, sourceHlsUrl, sessionId)) {
          logger.info('Retrying to start new streaming session');
          await startNewStreamingSession();
        }
      } catch (error) {
        logger.error(`Error during streaming: ${error.message}`);
        process.exit(1);
      }
    };

    await handleStreaming();
    const intervalId = setInterval(handleStreaming, SERVICE_RETRY_INTERVAL * 1000);

  } catch (error) {
    console.error(`Failed to initiate the Pull-Push Live Stream: ${error.message}`);
    process.exit(1);
  }
};

const validateEnvs = (): void => {
  const requiredEnvs = [
    'AWS_REGION',
    'LIVE_MP_CHANNEL_NAME',
    'LIVE_SOURCE_HLS_URL',
    'LIVE_PROGRAM_DURATION',
  ];

  const missingEnvs = requiredEnvs.filter(env => !process.env[env]);

  if (missingEnvs.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvs.join(', ')}`);
  }
};

if (require.main === module) {
  validateEnvs();

  const event: IEvent = {
    mpChannelId: process.env.LIVE_MP_CHANNEL_NAME!,
    sourceHlsUrl: process.env.LIVE_SOURCE_HLS_URL!,
    destService: 'mediapackage',
    liveDuration: parseInt(process.env.LIVE_PROGRAM_DURATION!, 10),
  };

  initiatePullPushLiveStream(event);
}
