locals {
  create_harvest_job_lambda_name    = "${var.region}-${var.environment}-${var.service}_create_harvest_job"
  create_harvest_job_log_group_name = "/aws/lambda/${local.create_harvest_job_lambda_name}"
}

module "create_harvest_job_log_group" {
  source            = "./cloudwatch-log"
  environment       = var.environment
  service           = var.service
  log_group_name    = local.create_harvest_job_log_group_name
  retention_in_days = var.lambda_log_cw_retention_days
}

data "archive_file" "lambda_create_harvest_job_data" {
  type        = "zip"
  source_dir  = "${path.root}/packages/lambdas/create_harvest_job/dist"
  output_path = "${path.root}/zipped-lambdas/lambda_create_harvest_job.zip"
}

resource "aws_lambda_function" "lambda_create_harvest_job" {
  filename         = data.archive_file.lambda_create_harvest_job_data.output_path
  function_name    = local.create_harvest_job_lambda_name
  role             = aws_iam_role.iam_create_harvest_job.arn
  handler          = "index.handler"
  runtime          = var.lambda_runtime
  memory_size      = var.lambda_create_harvest_job_memory_size
  timeout          = var.lambda_create_harvest_job_timeout
  source_code_hash = data.archive_file.lambda_create_harvest_job_data.output_base64sha512

  tracing_config {
    mode = var.lambda_create_harvest_job_tracing_mode
  }

  environment {
    variables = {
      MP_HARVEST_ROLE_ARN             = var.mediapackage_harvest_role_arn
      VOD_OUTPUT_BUCKET_NAME          = var.vod_output_bucket
      HARVEST_TASK_DETAIL_BUCKET_NAME = var.harvest_task_detail_bucket
    }
  }
}

# IAM role
variable "iam_create_harvest_job_role_suffix" {
  default = "create_harvest_job"
}

resource "aws_iam_role" "iam_create_harvest_job" {
  provider           = aws.iam
  name               = "${var.region}-${var.environment}-${var.service}_${var.iam_create_harvest_job_role_suffix}"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role_policy.json
}

resource "aws_iam_role_policy_attachment" "create_harvest_job_cw_lambda_logs_attachment" {
  provider   = aws.iam
  count      = var.allow_lambda_log_to_cloudwatch ? 1 : 0
  role       = aws_iam_role.iam_create_harvest_job.name
  policy_arn = aws_iam_policy.policy_lambda_cw_logs.arn
}

data "aws_iam_policy_document" "create_harvest_job_mp_permissions" {
  provider = aws.iam

  statement {
    actions = ["mediapackage:*"]

    resources = ["*"]
  }
}

resource "aws_iam_policy" "create_harvest_job_mp_policy" {
  provider = aws.iam
  name     = "${var.region}-${var.environment}-${var.service}_create_harvest_job_mp_policy"
  policy   = data.aws_iam_policy_document.create_harvest_job_mp_permissions.json
}

resource "aws_iam_role_policy_attachment" "create_harvest_job_mp_policy_attachment" {
  provider   = aws.iam
  role       = aws_iam_role.iam_create_harvest_job.name
  policy_arn = aws_iam_policy.create_harvest_job_mp_policy.arn
}

data "aws_iam_policy_document" "mp_harvest_role_pass_to_create_harvest_job_lambda" {
  provider = aws.iam
  statement {
    actions = [
      "iam:PassRole",
    ]
    resources = [var.mediapackage_harvest_role_arn]
  }
}

resource "aws_iam_policy" "mp_harvest_role_pass_policy" {
  provider = aws.iam
  name     = "${var.region}-${var.environment}-${var.service}_mp_harvest_role_pass_to_create_harvest_lambda_policy"
  policy   = data.aws_iam_policy_document.mp_harvest_role_pass_to_create_harvest_job_lambda.json
}

resource "aws_iam_role_policy_attachment" "mp_harvest_role_pass_policy_attachment" {
  provider   = aws.iam
  role       = aws_iam_role.iam_create_harvest_job.name
  policy_arn = aws_iam_policy.mp_harvest_role_pass_policy.arn
}

data "aws_iam_policy_document" "create_harvest_job_s3_permissions" {
  provider = aws.iam
  statement {
    actions = [
      "s3:GetObject",
      "s3:ListBucket",
      "s3:PutObject",
    ]
    resources = [
      "arn:aws:s3:::${var.harvest_task_detail_bucket}",
      "arn:aws:s3:::${var.harvest_task_detail_bucket}/*",
    ]
  }
}

resource "aws_iam_policy" "create_harvest_job_s3_policy" {
  provider = aws.iam
  name     = "${var.region}-${var.environment}-${var.service}-create_harvest_job_s3"
  policy   = data.aws_iam_policy_document.create_harvest_job_s3_permissions.json
}

resource "aws_iam_role_policy_attachment" "create_harvest_job_s3_attachment" {
  provider   = aws.iam
  role       = aws_iam_role.iam_create_harvest_job.name
  policy_arn = aws_iam_policy.create_harvest_job_s3_policy.arn
}
