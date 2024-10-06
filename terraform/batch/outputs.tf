output "pull_push_job_queue" {
  value = aws_batch_job_queue.stream_pull_push_default.name
}

output "pull_push_job_definition" {
  value = aws_batch_job_definition.stream_pull_push.name
}
