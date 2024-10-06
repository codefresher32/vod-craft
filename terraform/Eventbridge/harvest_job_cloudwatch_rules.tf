resource "aws_cloudwatch_event_rule" "mediapackage_harvest_job_event_rule" {
  name        = "${var.region}-${var.environment}-${var.service}_mp_harvest_job_events"
  description = "Sends MediaPackage Harvest job events to event handler lambda"
  event_pattern = templatefile(
    "${path.module}/template/harvest_job_event_pattern.json",
    {
      mediapackage_harvest_job_prefix = "arn:aws:mediapackage:${var.region}:${var.aws_account_id}:harvest_jobs/"
    }
  )
}

resource "aws_cloudwatch_event_target" "mediapackage_harvest_job_event_target" {
  rule = aws_cloudwatch_event_rule.mediapackage_harvest_job_event_rule.name
  arn  = var.harvest_job_handler_lambda_arn
}

resource "aws_lambda_permission" "harvest_event_handler_allow_harvest_event" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = var.harvest_job_handler_lambda_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.mediapackage_harvest_job_event_rule.arn
}
