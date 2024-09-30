output "vod_output_bucket_name" {
  value = module.vod_output.bucket_name
}

output "vod_output_bucket_arn" {
  value = module.vod_output.bucket_arn
}

output "vod_output_bucket_domain" {
  value = module.vod_output.bucket_domain
}

output "vod_output_cf_domain" {
  value = module.vod_output_cloudfront.domain_name
}

output "live_channel_name" {
  value = module.live_channel.channel_id
}

output "live_channel_hls_orgin_endpoint" {
  value = module.live_channel.hls_origin_endpoint
}

output "live_channel_hls_ingest_endpoints" {
  value = module.live_channel.hls_ingest_endpoints
}
