resource "aws_security_group" "stream_pull_push" {
  name        = "${var.region}-${var.environment}-${var.service}_stream_pull_push_ecs"
  description = "Stream Pull Push ECS security group"

  vpc_id = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
