variable "environment" {
  type = string
}

variable "region" {
  type = string
}

variable "service" {
  type = string
}

variable "startover_window_seconds" {
  type    = number
  default = 1209600
}
