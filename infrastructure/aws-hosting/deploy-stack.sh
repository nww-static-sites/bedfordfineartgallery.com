#!/bin/sh

set -eu
umask 077

root=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
stack_name=${BEDFORD_STACK_NAME:-bedford-content-hosting}
site_bucket=${BEDFORD_SITE_BUCKET:-bedford-site-files-775735255405-us-east-1}
log_bucket=${BEDFORD_LOG_BUCKET:-bedford-cloudfront-logs-775735255405-us-east-1}
aliases=${BEDFORD_ENABLE_PRODUCTION_ALIASES:-false}
certificate_arn=${BEDFORD_CERTIFICATE_ARN:-}
compiled=$(mktemp)
trap 'rm -f "$compiled"' EXIT HUP INT TERM

node "$root/compile-template.mjs" "$compiled"
aws cloudformation validate-template --template-body "file://$compiled" >/dev/null
aws cloudformation deploy \
  --stack-name "$stack_name" \
  --template-file "$compiled" \
  --no-fail-on-empty-changeset \
  --parameter-overrides \
    "SiteBucketName=$site_bucket" \
    "LogBucketName=$log_bucket" \
    "EnableProductionAliases=$aliases" \
    "CertificateArn=$certificate_arn" \
  --tags Project=BedfordContentHosting ManagedBy=CloudFormation

aws cloudformation describe-stacks \
  --stack-name "$stack_name" \
  --query 'Stacks[0].Outputs' \
  --output json
