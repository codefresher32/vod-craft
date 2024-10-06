output "create_harvest_job_lambda_name" {
  value = aws_lambda_function.lambda_create_harvest_job.function_name
}

output "create_harvest_job_lambda_arn" {
  value = aws_lambda_function.lambda_create_harvest_job.arn
}

output "harvest_event_handler_lambda_name" {
  value = aws_lambda_function.lambda_harvest_event_handler.function_name
}

output "harvest_event_handler_lambda_arn" {
  value = aws_lambda_function.lambda_harvest_event_handler.arn
}
