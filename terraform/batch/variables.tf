variable "environment" {
  type = string
}

variable "region" {
  type = string
}

variable "service" {
  type = string
}

variable "vpc_id" {
  type    = string
  default = "vpc-062ad3140ffe5c2fb"
}

variable "vpc_private_subnets" {
  type    = list(string)
  default = ["subnet-0caa7d45e4ab2e6cb", "subnet-0a4541f3e7f5d832a", "subnet-08a5ba1330dbab930"]
}

variable "extra_user_data" {
  default     = ""
  description = "Extra shell script to run on compute env machine through user data"
}

variable "batch_job_memory" {
  default = 2048
}

variable "batch_job_vcpus" {
  default = 1
}

variable "batch_job_command" {
  type    = list(string)
  default = []
}

variable "batch_job_environment" {
  type        = list(object({ name = string, value = string }))
  default     = []
  description = "List of environment variables for batch job"
}

variable "batch_instance_type_pricing" {
  type    = string
  default = "SPOT"
}

variable "batch_compute_env_instance_type" {
  type = list(string)
  default = [
    "c5.large", "c5.xlarge", "c5.2xlarge",
    "c5d.large", "c5d.xlarge", "c5d.2xlarge",
    "m5d.large", "m5d.xlarge", "m5d.2xlarge",
  ]
}

variable "batch_bid_percentage" {
  type        = number
  default     = 100
  description = "Maximum percentage that a spot instance can be priced compared to on-demand"
}

variable "batch_instance_allocation_strategy" {
  type    = string
  default = "SPOT_CAPACITY_OPTIMIZED"
}

variable "batch_compute_env_desired_vcpus" {
  type    = number
  default = 1
}

variable "batch_compute_env_min_vcpus" {
  type    = number
  default = 1
}

variable "batch_compute_env_max_vcpus" {
  type    = number
  default = 4
}

variable "batch_job_default_queue_priority" {
  type    = number
  default = 1
}

variable "pull_push_retry_interval_seconds" {
  type    = string
  default = "5"
}

variable "pull_push_image_platform" {
  type    = string
  default = "linux/amd64" 
}
