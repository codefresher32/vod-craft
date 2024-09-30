output "hls_origin_endpoint" {
  value = aws_cloudformation_stack.origin_endpoint.outputs.HlsEndpointUrl
}

output "channel_id" {
  value = aws_media_package_channel.live_channel.id
}

output "hls_ingest_endpoints" {
  value = aws_media_package_channel.live_channel.hls_ingest[0].ingest_endpoints
}
