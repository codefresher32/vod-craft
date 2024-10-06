variable "log_group_name" {}

variable "environment" {}

variable "service" {}

variable "retention_in_days" {
  type    = number
  default = 0
}
