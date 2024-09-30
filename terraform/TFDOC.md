<!-- BEGIN_TF_DOCS -->
## Requirements

No requirements.

## Providers

No providers.

## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_live_channel"></a> [live\_channel](#module\_live\_channel) | ./mediapackage | n/a |
| <a name="module_vod_output"></a> [vod\_output](#module\_vod\_output) | ./s3 | n/a |
| <a name="module_vod_output_cloudfront"></a> [vod\_output\_cloudfront](#module\_vod\_output\_cloudfront) | ./cloudfront | n/a |

## Resources

No resources.

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_environment"></a> [environment](#input\_environment) | Name of the environment | `string` | n/a | yes |
| <a name="input_region"></a> [region](#input\_region) | AWS region | `string` | n/a | yes |
| <a name="input_service"></a> [service](#input\_service) | Name of the service | `string` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_live_channel_hls_ingest_endpoints"></a> [live\_channel\_hls\_ingest\_endpoints](#output\_live\_channel\_hls\_ingest\_endpoints) | n/a |
| <a name="output_live_channel_hls_orgin_endpoint"></a> [live\_channel\_hls\_orgin\_endpoint](#output\_live\_channel\_hls\_orgin\_endpoint) | n/a |
| <a name="output_live_channel_name"></a> [live\_channel\_name](#output\_live\_channel\_name) | n/a |
| <a name="output_vod_output_bucket_arn"></a> [vod\_output\_bucket\_arn](#output\_vod\_output\_bucket\_arn) | n/a |
| <a name="output_vod_output_bucket_domain"></a> [vod\_output\_bucket\_domain](#output\_vod\_output\_bucket\_domain) | n/a |
| <a name="output_vod_output_bucket_name"></a> [vod\_output\_bucket\_name](#output\_vod\_output\_bucket\_name) | n/a |
| <a name="output_vod_output_cf_domain"></a> [vod\_output\_cf\_domain](#output\_vod\_output\_cf\_domain) | n/a |
<!-- END_TF_DOCS -->