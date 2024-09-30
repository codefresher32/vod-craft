module "vod_output" {
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
  vod_output_bucket_domain = module.vod_output.bucket_domain

  providers = {
    aws     = aws
    aws.iam = aws.iam
  }
}
