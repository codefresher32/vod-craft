output "domain_name" {
  value = aws_cloudfront_distribution.vod_output_distribution.domain_name
}

output "origin_access_iam_arn" {
  value = aws_cloudfront_origin_access_identity.origin_access_identity.iam_arn
}
