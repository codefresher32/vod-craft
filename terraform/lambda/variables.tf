variable "environment" {
  type = string
}

variable "region" {
  type = string
}

variable "service" {
  type = string
}

variable "lambda_log_cw_retention_days" {
  type    = number
  default = 30
}

variable "lambda_runtime" {
  default = "nodejs20.x"
}

variable "lambda_create_harvest_job_memory_size" {
  default = 256
}

variable "lambda_create_harvest_job_timeout" {
  default = 30
}

variable "lambda_create_harvest_job_tracing_mode" {
  default = "Active"
}

variable "lambda_harvest_event_handler_memory_size" {
  default = 256
}

variable "lambda_harvest_event_handler_timeout" {
  default = 10
}

variable "lambda_harvest_event_handler_tracing_mode" {
  default = "Active"
}

variable "allow_lambda_log_to_cloudwatch" {
  type    = bool
  default = true
}

variable "vod_output_bucket" {
  type = string
}

variable "vod_output_cf_domain" {
  type = string
}

variable "harvest_task_detail_bucket" {
  type = string
}

variable "mediapackage_harvest_role_arn" {
  type = string
}
