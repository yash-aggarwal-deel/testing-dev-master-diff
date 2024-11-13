#!/bin/bash

svc_name=$(cat package.json | jq -r ".name")
if [ -z "$CODEARTIFACT_AUTH_TOKEN" ] ; then
	export CODEARTIFACT_AUTH_TOKEN=`aws-mfa-secure session codeartifact get-authorization-token \
			--domain npm \
			--domain-owner 974360507615 \
			--profile shared
			--query authorizationToken \
			--output text \
			--region eu-west-1`
fi

aws-mfa-secure session ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin 974360507615.dkr.ecr.eu-west-1.amazonaws.com

DOCKER_BUILDKIT=1 docker build \
	--build-arg NODE_ENV=development \
	--build-arg CODEARTIFACT_AUTH_TOKEN="$CODEARTIFACT_AUTH_TOKEN" \
	--tag ${svc_name}_app:local . \
	#&& docker-compose up --renew-anon-volumes
