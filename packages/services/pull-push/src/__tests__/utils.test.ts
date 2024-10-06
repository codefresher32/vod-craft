import 'aws-sdk-client-mock-jest';
import { mockClient } from 'aws-sdk-client-mock';
import { MediaPackageClient, DescribeChannelCommand } from '@aws-sdk/client-mediapackage';
import { getMpHLSIngestEndpoints } from '../utils';

const mpClientMock = mockClient(MediaPackageClient);

describe('Utils', () => {
  beforeEach(() => {
    process.env.AWS_REGION = 'eu-north-1';
    mpClientMock.reset();
    mpClientMock.on(DescribeChannelCommand).resolves({
      HlsIngest: {
        IngestEndpoints: [{ Url: 'https://ingest-endpoint-url', Password: 'password', Username: 'username' }],
      },
    });
  });

  afterEach(() => {
    delete process.env.AWS_REGION;
  });

  describe('getMpHLSIngestEndpoints', () => {
    test('should return mediapackage ingest endpoint', async () => {
      const result = await getMpHLSIngestEndpoints('mp-channel-id');

      expect(result).toEqual({
        url: 'https://ingest-endpoint-url', username: 'username', password: 'password',
      });
      expect(mpClientMock).toHaveReceivedCommandTimes(DescribeChannelCommand, 1);
      expect(mpClientMock).toHaveReceivedCommandWith(DescribeChannelCommand, {
        Id: 'mp-channel-id',
      });
    });

    test('should throw proper error msg while DescribeChannelCommand error', async () => {
      mpClientMock.on(DescribeChannelCommand).rejects(new Error('describe command error'));

      await expect(getMpHLSIngestEndpoints('mp-channel-id')).rejects.toThrow(new Error(
        'Can\'t retrieve HLS ingest endpoints for mediapackage channel: mp-channel-id'
      ));
      expect(mpClientMock).toHaveReceivedCommandTimes(DescribeChannelCommand, 1);
      expect(mpClientMock).toHaveReceivedCommandWith(DescribeChannelCommand, {
        Id: 'mp-channel-id',
      });
    });
  });
});
