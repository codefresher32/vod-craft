resource "aws_s3_bucket" "harvest_task_detail_s3" {
  bucket = "${var.region}-${var.environment}-${var.service}-harvest-task-detail"
}
