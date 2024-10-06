AWS_REGION?=eu-north-1
TERRAFORM_VERSION=1.7.5
AWS_CLI_IMAGE=amazon/aws-cli
TERRAFORM_IMAGE=hashicorp/terraform:${TERRAFORM_VERSION}
DOCKER_ENV=-e AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY -e AWS_DEFAULT_REGION -e AWS_PROFILE -e AWS_REGION
DOCKER_RUN_MOUNT_OPTIONS=-v ${CURDIR}/:/app -v ${CREDENTIAL_DIR}/:/root/.aws -v /var/run/docker.sock:/var/run/docker.sock -w /app

define build_lambda
	npm run build
endef

define run_docker
	docker run -it --rm ${DOCKER_ENV} ${DOCKER_RUN_MOUNT_OPTIONS}
endef

init:
	${build_lambda} && $(run_docker) ${TERRAFORM_IMAGE} init

plan:
	${build_lambda} && $(run_docker) ${TERRAFORM_IMAGE} plan

apply:
	${build_lambda} && $(run_docker) ${TERRAFORM_IMAGE} apply

destroy:
	$(run_docker) ${TERRAFORM_IMAGE} destroy
