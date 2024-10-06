locals {
  harvest_event_handler_lambda_name    = "${var.region}-${var.environment}-${var.service}_harvest_event_handler"
  harvest_event_handler_log_group_name = "/aws/lambda/${local.harvest_event_handler_lambda_name}"
}

module "harvest_event_handler_log_group" {
  source            = "./cloudwatch-log"
  environment       = var.environment
  service           = var.service
  log_group_name    = local.harvest_event_handler_log_group_name
  retention_in_days = var.lambda_log_cw_retention_days
}

data "archive_file" "lambda_harvest_event_handler_data" {
  type        = "zip"
  source_dir  = "${path.root}/packages/lambdas/harvest_event_handler/dist"
  output_path = "${path.root}/zipped-lambdas/lambda_harvest_event_handler.zip"
}

resource "aws_lambda_function" "lambda_harvest_event_handler" {
  filename         = data.archive_file.lambda_harvest_event_handler_data.output_path
  function_name    = local.harvest_event_handler_lambda_name
  role             = aws_iam_role.iam_harvest_event_handler.arn
  handler          = "index.handler"
  runtime          = var.lambda_runtime
  memory_size      = var.lambda_harvest_event_handler_memory_size
  timeout          = var.lambda_harvest_event_handler_timeout
  source_code_hash = data.archive_file.lambda_harvest_event_handler_data.output_base64sha512

  tracing_config {
    mode = var.lambda_harvest_event_handler_tracing_mode
  }


  environment {
    variables = {
      MP_HARVEST_ROLE_ARN             = var.mediapackage_harvest_role_arn
      VOD_OUTPUT_BUCKET_NAME          = var.vod_output_bucket
      VOD_OUTPUT_CF_DOMAIN            = var.vod_output_cf_domain
      HARVEST_TASK_DETAIL_BUCKET_NAME = var.harvest_task_detail_bucket
    }
  }
}

# IAM role
variable "iam_harvest_event_handler_role_suffix" {
  default = "harvest_event_handler"
}

resource "aws_iam_role" "iam_harvest_event_handler" {
  provider           = aws.iam
  name               = "${var.region}-${var.environment}-${var.service}_${var.iam_harvest_event_handler_role_suffix}"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role_policy.json
}

resource "aws_iam_role_policy_attachment" "harvest_event_handler_cw_lambda_logs_attachment" {
  provider   = aws.iam
  count      = var.allow_lambda_log_to_cloudwatch ? 1 : 0
  role       = aws_iam_role.iam_harvest_event_handler.name
  policy_arn = aws_iam_policy.policy_lambda_cw_logs.arn
}

data "aws_iam_policy_document" "harvest_event_handler_s3_permissions" {
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

resource "aws_iam_policy" "harvest_event_handler_s3_policy" {
  provider = aws.iam
  name     = "${var.region}-${var.environment}-${var.service}-harvest_event_handler_s3"
  policy   = data.aws_iam_policy_document.harvest_event_handler_s3_permissions.json
}

resource "aws_iam_role_policy_attachment" "harvest_event_handler_s3_attachment" {
  provider   = aws.iam
  role       = aws_iam_role.iam_harvest_event_handler.name
  policy_arn = aws_iam_policy.harvest_event_handler_s3_policy.arn
}

data "aws_iam_policy_document" "harvest_event_handler_sfn_permissions" {
  provider = aws.iam
  statement {
    actions = [
      "states:SendTaskSuccess",
      "states:SendTaskFailure",
      "states:DescribeExecution",
    ]

    resources = ["*"]
  }
}

resource "aws_iam_policy" "harvest_event_handler_sfn_policy" {
  provider = aws.iam
  name     = "${var.region}-${var.environment}-${var.service}-harvest_event_handler_sfn"
  policy   = data.aws_iam_policy_document.harvest_event_handler_sfn_permissions.json
}

resource "aws_iam_role_policy_attachment" "harvest_event_handler_sfn_attachment" {
  provider   = aws.iam
  role       = aws_iam_role.iam_harvest_event_handler.name
  policy_arn = aws_iam_policy.harvest_event_handler_sfn_policy.arn
}
