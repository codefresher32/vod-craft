resource "aws_media_package_channel" "live_channel" {
  channel_id = "${var.region}-${var.environment}-${var.service}-live-channel"
}

resource "aws_cloudformation_stack" "origin_endpoint" {
  name = "${var.region}-${var.environment}-${var.service}-live-channel-endpoint"
  template_body = templatefile(
    "${path.module}/template/mp_origin_endpoint.json",
    {
      origin_endpoint_id          = "${var.region}-${var.environment}-${var.service}-live-channel-hls-endpoint",
      mp_channel_id               = aws_media_package_channel.live_channel.id,
      origin_endpoint_description = "Live channel origin endpoint",
      startover_window_seconds    = var.startover_window_seconds,
      tags = jsonencode([{
          Key = "service", Value = var.service
        }, {
          Key = "environment", Value = var.environment
        }, {
          Key = "region", Value = var.region
        }
      ])
    }
  )
}
