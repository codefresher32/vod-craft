resource "aws_s3_bucket" "vod_output_bucket" {
  bucket        = "${var.region}-${var.environment}-${var.service}-vod-output"
  force_destroy = true

  tags = {
    service     = var.service
    region      = var.region
    environment = var.environment
  }
}

resource "aws_s3_bucket_cors_configuration" "vod_output_cors_config" {
  bucket = aws_s3_bucket.vod_output_bucket.id

  cors_rule {
    allowed_origins = ["*"]
    allowed_methods = ["GET", "HEAD"]
    max_age_seconds = 3000
    allowed_headers = ["*"]
    expose_headers  = ["ETag"]
  }

  cors_rule {
    allowed_methods = ["GET"]
    allowed_origins = ["*"]
  }
}

resource "aws_s3_bucket_public_access_block" "vod_output_block_access" {
  bucket                  = aws_s3_bucket.vod_output_bucket.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

data "aws_iam_policy_document" "vod_output_bucket_policy" {
  provider = aws.iam

  statement {
    sid    = "allow_from_cloudfront"
    effect = "Allow"

    principals {
      identifiers = [var.vod_output_cf_origin_access_iam_arn]
      type        = "AWS"
    }

    actions = ["s3:GetObject"]
    resources = [
      aws_s3_bucket.vod_output_bucket.arn,
      "${aws_s3_bucket.vod_output_bucket.arn}/*",
    ]
  }
}

resource "aws_s3_bucket_policy" "vod_output_bucket_policy" {
  bucket = aws_s3_bucket.vod_output_bucket.id
  policy = data.aws_iam_policy_document.vod_output_bucket_policy.json
}
