resource "aws_sfn_state_machine" "pull_push_harvest_state_machine" {
  name     = "${var.region}-${var.environment}-${var.service}_pull_push_harvest"
  role_arn = aws_iam_role.iam_pull_push_harvest_sfn_role.arn
  definition = templatefile(
    "${path.module}/template/pull_push_harvest_sfn.json",
    {
      pull_push_job_queue       = var.pull_push_job_queue
      pull_push_job_definition  = var.pull_push_job_definition
      create_harvest_job_lambda = var.create_harvest_job_lambda_name
    }
  )
}

data "aws_iam_policy_document" "sfn_assume_role" {
  provider = aws.iam
  statement {
    actions = ["sts:AssumeRole"]
    effect  = "Allow"
    principals {
      identifiers = ["states.amazonaws.com"]
      type        = "Service"
    }
  }
}

variable "pull_push_harvest_sfn_role_suffix" {
  default = "pull_push_harvest_sfn_role"
}

resource "aws_iam_role" "iam_pull_push_harvest_sfn_role" {
  provider             = aws.iam
  name                 = "${var.region}-${var.environment}-${var.service}_${var.pull_push_harvest_sfn_role_suffix}"
  assume_role_policy   = data.aws_iam_policy_document.sfn_assume_role.json
}

data "aws_iam_policy_document" "sfn_execution_details" {
  provider = aws.iam
  statement {
    effect = "Allow"
    actions = [
      "states:DescribeExecution",
      "states:StopExecution"
    ]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "pull_push_harvest_sfn_execution" {
  provider = aws.iam
  name     = "${var.region}-${var.environment}-${var.service}_pull_push_harvest_sfn_execution"
  policy   = data.aws_iam_policy_document.sfn_execution_details.json
}

resource "aws_iam_role_policy_attachment" "pull_push_harvest_sfn_execution_attachment" {
  provider   = aws.iam
  role       = aws_iam_role.iam_pull_push_harvest_sfn_role.name
  policy_arn = aws_iam_policy.pull_push_harvest_sfn_execution.arn
}

data "aws_iam_policy_document" "sfn_batch_job_actions" {
  provider = aws.iam
  statement {
    effect = "Allow"
    actions = [
      "batch:SubmitJob",
      "batch:DescribeJobs",
      "batch:TerminateJob"
    ]
    resources = ["*"]
  }

  statement {
    effect = "Allow"
    actions = [
      "events:PutTargets",
      "events:PutRule",
      "events:DescribeRule"
    ]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "pull_push_harvest_batch_job_policy" {
  provider = aws.iam
  name     = "${var.region}-${var.environment}-${var.service}_pull_push_harvest_batch_job_policy"
  policy   = data.aws_iam_policy_document.sfn_batch_job_actions.json
}

resource "aws_iam_role_policy_attachment" "pull_push_harvest_batch_job_policy_attachment" {
  provider   = aws.iam
  role       = aws_iam_role.iam_pull_push_harvest_sfn_role.name
  policy_arn = aws_iam_policy.pull_push_harvest_batch_job_policy.arn
}

data "aws_iam_policy_document" "pull_push_harvest_sfn_lambda_permissions" {
  provider = aws.iam
  statement {
    effect = "Allow"
    actions = [
      "lambda:InvokeFunction",
    ]
    resources = [
      var.create_harvest_job_lambda_arn,
    ]
  }
}

resource "aws_iam_policy" "pull_push_harvest_sfn_lambda_policy" {
  provider = aws.iam
  name     = "${var.region}-${var.environment}-${var.service}_pull_push_harvest_sfn_lambda_policy"
  policy   = data.aws_iam_policy_document.pull_push_harvest_sfn_lambda_permissions.json
}

resource "aws_iam_role_policy_attachment" "pull_push_harvest_sfn_lambda_policy_attachment" {
  provider   = aws.iam
  role       = aws_iam_role.iam_pull_push_harvest_sfn_role.name
  policy_arn = aws_iam_policy.pull_push_harvest_sfn_lambda_policy.arn
}
