locals {
  dockerfile_md5 = filemd5("${path.root}/Dockerfile")
}

resource "aws_ecr_repository" "pull_push_ecr_repo" {
  name = "${var.region}-${var.environment}-${var.service}-pull-push-container-image"
}

resource "docker_image" "pull_push_ecr_image" {
  name     = "${var.region}-${var.environment}-${var.service}-pull-push-image"
  platform = var.pull_push_image_platform

  triggers = {
    dockerfile_md5 = local.dockerfile_md5
    all_files      = sha1(join("", [for f in fileset(path.root, "services/pull-push/src/*") : filesha1(f)]))
  }

  build {
    context      = abspath("${path.root}/")
    force_remove = true
    dockerfile   = "Dockerfile"
  }
}

resource "docker_tag" "pull_push_ecr_tag" {
  source_image = docker_image.pull_push_ecr_image.name
  target_image = "${aws_ecr_repository.pull_push_ecr_repo.repository_url}:${local.dockerfile_md5}"
}

resource "docker_registry_image" "pull_push_container_image" {
  name = docker_tag.pull_push_ecr_tag.target_image
}
