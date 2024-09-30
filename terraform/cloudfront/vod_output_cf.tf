data "aws_cloudfront_cache_policy" "cache_optimized" {
  name = "Managed-CachingOptimized"
}

data "aws_cloudfront_response_headers_policy" "cors_with_preflight" {
  name = "Managed-CORS-With-Preflight"
}

resource "aws_cloudfront_origin_access_identity" "origin_access_identity" {
  comment = "${var.region}-${var.environment}-${var.service}-vod-output-origin-access"
}

resource "aws_cloudfront_distribution" "vod_output_distribution" {
  origin {
    domain_name = var.vod_output_bucket_domain
    origin_id   = var.vod_output_bucket_domain

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.origin_access_identity.cloudfront_access_identity_path
    }
  }

  enabled         = true
  is_ipv6_enabled = false
  comment         = "${var.environment} - ${var.region} - ${var.service}"

  default_cache_behavior {
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["HEAD", "GET", "OPTIONS"]
    cached_methods             = ["GET", "HEAD"]
    target_origin_id           = var.vod_output_bucket_domain
    cache_policy_id            = data.aws_cloudfront_cache_policy.cache_optimized.id
    compress                   = true
    response_headers_policy_id = data.aws_cloudfront_response_headers_policy.cors_with_preflight.id
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    service     = var.service
    environment = var.environment
    region      = var.region
  }
}
