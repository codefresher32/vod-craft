data "aws_caller_identity" "current" {}

module "vod" {
  source = "./s3"

  region                              = var.region
  environment                         = var.environment
  service                             = var.service
  vod_output_cf_origin_access_iam_arn = module.vod_output_cloudfront.origin_access_iam_arn

  providers = {
    aws     = aws
    aws.iam = aws.iam
  }
}

module "harvest_job_processor" {
  source = "./lambda"

  region                        = var.region
  environment                   = var.environment
  service                       = var.service
  vod_output_bucket             = module.vod.bucket_name
  vod_output_cf_domain          = module.vod_output_cloudfront.domain_name
  harvest_task_detail_bucket    = module.vod.harvest_task_detail_bucket_name
  mediapackage_harvest_role_arn = module.live_channel.mediapackage_harvest_role_arn

  providers = {
    aws     = aws
    aws.iam = aws.iam
  }
}

module "live_channel" {
  source = "./mediapackage"

  region      = var.region
  environment = var.environment
  service     = var.service

  providers = {
    aws     = aws
    aws.iam = aws.iam
  }
}

module "vod_output_cloudfront" {
  source = "./cloudfront"

  region                   = var.region
  environment              = var.environment
  service                  = var.service
  vod_output_bucket_domain = module.vod.bucket_domain

  providers = {
    aws     = aws
    aws.iam = aws.iam
  }
}

module "pull_push" {
  source = "./batch"

  region      = var.region
  environment = var.environment
  service     = var.service

  providers = {
    aws     = aws
    aws.iam = aws.iam
  }
}

module "harvest_event" {
  source = "./Eventbridge"

  region                          = var.region
  environment                     = var.environment
  service                         = var.service
  aws_account_id                  = data.aws_caller_identity.current.account_id
  harvest_job_handler_lambda_arn  = module.harvest_job_processor.harvest_event_handler_lambda_arn
  harvest_job_handler_lambda_name = module.harvest_job_processor.harvest_event_handler_lambda_name

  providers = {
    aws     = aws
    aws.iam = aws.iam
  }
}

module "pull_push_harvest_orchestration" {
  source = "./sfn"

  region                         = var.region
  environment                    = var.environment
  service                        = var.service
  pull_push_job_queue            = module.pull_push.pull_push_job_queue
  pull_push_job_definition       = module.pull_push.pull_push_job_definition
  create_harvest_job_lambda_name = module.harvest_job_processor.create_harvest_job_lambda_name
  create_harvest_job_lambda_arn  = module.harvest_job_processor.create_harvest_job_lambda_arn

  providers = {
    aws     = aws
    aws.iam = aws.iam
  }
}
