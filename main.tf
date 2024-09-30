terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.62"
    }
  }
}

variable "region" {
  type    = string
  default = "eu-north-1"
}

variable "environment" {
  type    = string
  default = "dev"
}

variable "service" {
  type    = string
  default = "vod-craft"
}

provider "aws" {
  region = var.region
}

provider "aws" {
  region = var.region
  alias  = "iam"
}

module "vod-craft" {
  source = "./terraform"

  region      = var.region
  environment = var.environment
  service     = var.service

  providers = {
    aws     = aws
    aws.iam = aws.iam
  }
}

output "vod_output_bucket_name" {
  value = module.vod-craft.vod_output_bucket_name
}

output "vod_output_bucket_arn" {
  value = module.vod-craft.vod_output_bucket_arn
}

output "vod_output_bucket_domain" {
  value = module.vod-craft.vod_output_bucket_domain
}

output "vod_output_cf_domain" {
  value = module.vod-craft.vod_output_cf_domain
}

output "live_channel_name" {
  value = module.vod-craft.live_channel_name
}

output "live_channel_hls_orgin_endpoint" {
  value = module.vod-craft.live_channel_hls_orgin_endpoint
}

output "live_channel_hls_ingest_endpoints" {
  value = module.vod-craft.live_channel_hls_ingest_endpoints
}
