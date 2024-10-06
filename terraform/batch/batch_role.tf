data "aws_iam_policy_document" "ecs_assume_role_ec2" {
  provider = aws.iam
  statement {
    actions = ["sts:AssumeRole"]
    effect  = "Allow"
    principals {
      identifiers = ["ec2.amazonaws.com"]
      type        = "Service"
    }
  }
}

variable "batch_ecs_instance_role_suffix" {
  default = "pull_push_ecs_instance"
}

resource "aws_iam_role" "batch_ecs_instance" {
  provider             = aws.iam
  name                 = "${var.region}-${var.environment}-${var.service}_${var.batch_ecs_instance_role_suffix}"
  assume_role_policy   = data.aws_iam_policy_document.ecs_assume_role_ec2.json
}

resource "aws_iam_role_policy_attachment" "batch_ecs_instance_role" {
  provider   = aws.iam
  role       = aws_iam_role.batch_ecs_instance.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_role_policy_attachment" "batch_ecs_instance_ssm" {
  provider   = aws.iam
  role       = aws_iam_role.batch_ecs_instance.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "batch_ecs_instance_role" {
  provider = aws.iam
  name     = "${var.region}-${var.environment}-${var.service}_batch_stream_pull_push_ecs"
  role     = aws_iam_role.batch_ecs_instance.name
}

data "aws_iam_policy_document" "batch_assume_role" {
  provider = aws.iam
  statement {
    actions = ["sts:AssumeRole"]
    effect  = "Allow"
    principals {
      identifiers = ["batch.amazonaws.com"]
      type        = "Service"
    }
  }
}

variable "aws_batch_service_role_suffix" {
  default = "pull_push_batch_role"
}

resource "aws_iam_role" "aws_batch_service_role" {
  provider             = aws.iam
  name                 = "${var.region}-${var.environment}-${var.service}_${var.aws_batch_service_role_suffix}"
  assume_role_policy   = data.aws_iam_policy_document.batch_assume_role.json
}

resource "aws_iam_role_policy_attachment" "aws_batch_service_role" {
  provider   = aws.iam
  role       = aws_iam_role.aws_batch_service_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBatchServiceRole"
}

data "aws_iam_policy_document" "batch_ecs_task_assume_role" {
  provider = aws.iam
  statement {
    actions = ["sts:AssumeRole"]
    effect  = "Allow"
    principals {
      identifiers = ["ecs-tasks.amazonaws.com"]
      type        = "Service"
    }
  }
}

variable "aws_ecs_task_service_role_suffix" {
  default = "pull_push_ecs_role"
}
resource "aws_iam_role" "aws_ecs_task_service_role" {
  provider             = aws.iam
  name                 = "${var.region}-${var.environment}-${var.service}_${var.aws_ecs_task_service_role_suffix}"
  assume_role_policy   = data.aws_iam_policy_document.batch_ecs_task_assume_role.json
}

variable "spot_fleet_role_suffix" {
  default = "pull_push_spot_fleet_role"
}

data "aws_iam_policy_document" "spot_fleet_assume_role" {
  provider = aws.iam
  statement {
    sid    = "1"
    effect = "Allow"

    actions = [
      "sts:AssumeRole"
    ]

    principals {
      identifiers = [
        "spotfleet.amazonaws.com"
      ]
      type = "Service"
    }
  }
}

resource "aws_iam_role" "compute_environment_spot_fleet_role" {
  provider             = aws.iam
  name                 = "${var.region}-${var.environment}-${var.service}_${var.spot_fleet_role_suffix}"
  assume_role_policy   = data.aws_iam_policy_document.spot_fleet_assume_role.json
}

resource "aws_iam_role_policy_attachment" "compute_environment_spot_fleet_tagging_policy_attachment" {
  provider   = aws.iam
  role       = aws_iam_role.compute_environment_spot_fleet_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2SpotFleetTaggingRole"
}

data "aws_iam_policy_document" "mediapackage_channel_permissions" {
  provider = aws.iam
  statement {
    sid = "1"

    actions = ["mediapackage:*"]

    resources = ["*"]
  }
}

resource "aws_iam_policy" "mediapackage_channel_policy" {
  provider = aws.iam
  name     = "${var.region}-${var.environment}-${var.service}_pull_push_mp_channel_permissions"
  policy   = data.aws_iam_policy_document.mediapackage_channel_permissions.json
}

resource "aws_iam_role_policy_attachment" "mp_channel_permissions_attachment" {
  provider   = aws.iam
  role       = aws_iam_role.aws_ecs_task_service_role.name
  policy_arn = aws_iam_policy.mediapackage_channel_policy.arn
}

resource "aws_iam_role_policy_attachment" "external_s3_full_access" {
  provider   = aws.iam
  role       = aws_iam_role.aws_ecs_task_service_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}
