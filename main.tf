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

  providers = {
    aws     = aws
    aws.iam = aws.iam
  }
}
