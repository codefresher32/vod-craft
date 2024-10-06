data "aws_iam_policy_document" "lambda_assume_role_policy" {
  provider = aws.iam
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    effect = "Allow"
  }
}

data "aws_iam_policy_document" "lambda_cw_logs" {
  provider = aws.iam
  version  = "2012-10-17"

  statement {
    effect = "Allow"

    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]

    resources = ["arn:aws:logs:*:*:*"]
  }
}

resource "aws_iam_policy" "policy_lambda_cw_logs" {
  provider = aws.iam
  name     = "${var.region}-${var.environment}-${var.service}_lambda_CW_logs"
  policy   = data.aws_iam_policy_document.lambda_cw_logs.json
}
