#!/bin/bash

if [ -z "${ENV}" ] || [ -z "${TAG}" ]; then
  echo "error: ENV(dev|stg|prd) or TAG is not set."
  exit 1
fi

ACC_ID=$(aws --profile mep-${ENV} sts get-caller-identity --query 'Account' --output text)
aws --profile mep-${ENV} ecr get-login-password --region ap-northeast-1 |\
  docker login --username AWS --password-stdin ${ACC_ID}.dkr.ecr.ap-northeast-1.amazonaws.com
docker build -t newton-api-proxy .
docker tag newton-api-proxy ${ACC_ID}.dkr.ecr.ap-northeast-1.amazonaws.com/newton-api-proxy:${TAG}
docker push  ${ACC_ID}.dkr.ecr.ap-northeast-1.amazonaws.com/newton-api-proxy:${TAG}
