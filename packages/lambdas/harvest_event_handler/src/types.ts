export interface IHarvestJobDetail {
  id: string;
  arn: string;
  status: string;
  origin_endpoint_id: string;
  start_time: string;
  end_time: string;
  s3_destination: {
    bucket_name: string;
    manifest_key: string;
    role_arn: string;
  };
  created_at: string;
}

export interface IEvent {
  id: string;
  'detail-type': string;
  source: string;
  account: string;
  time: string;
  region: string;
  resources: string[];
  detail: {
    harvest_job: IHarvestJobDetail;
    message?: string;
  };
}
