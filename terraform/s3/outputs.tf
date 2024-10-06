output "bucket_name" {
  value = aws_s3_bucket.vod_output_bucket.id
}

output "bucket_arn" {
  value = aws_s3_bucket.vod_output_bucket.arn
}

output "bucket_domain" {
  value = aws_s3_bucket.vod_output_bucket.bucket_regional_domain_name
}

output "harvest_task_detail_bucket_arn" {
  value = aws_s3_bucket.harvest_task_detail_s3.arn
}

output "harvest_task_detail_bucket_name" {
  value = aws_s3_bucket.harvest_task_detail_s3.id
}
