#!/bin/sh
# Starts SeaweedFS as one process (master, volume server, filer and S3 gateway) with the API's key
# pair as its only S3 user. SeaweedFS reads users from a JSON file, so this writes it from the
# environment first. A bucket needs no setup: the first write to it creates it.
set -eu

cat > /tmp/s3.json <<JSON
{"identities":[{"name":"myfit-api","credentials":[{"accessKey":"${S3_ACCESS_KEY_ID}","secretKey":"${S3_SECRET_ACCESS_KEY}"}],"actions":["Admin","Read","Write","List"]}]}
JSON

exec weed server -dir=/data -s3 -s3.config=/tmp/s3.json
