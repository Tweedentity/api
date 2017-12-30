#!/usr/bin/env bash

docker stop 0xNIL-api
docker rm 0xNIL-api

source docker/.default.env && docker run -d \
  --name 0xNIL-api \
  --link 0xNIL-redis:redis \
  -p 9292 \
  --restart unless-stopped \
  -v $PWD:/usr/src/app \
  -v /vol/log/0xNIL-api:/var/log/0xNIL-api \
  -e CONSUMER_KEY="$CONSUMER_KEY" \
  -e CONSUMER_SECRET="$CONSUMER_SECRET" \
  -e ACCESS_TOKEN_KEY="$ACCESS_TOKEN_KEY" \
  -e ACCESS_TOKEN_SECRET="$ACCESS_TOKEN_SECRET" \
  -e VIRTUAL_HOST=0xnil.com,www.0xnil.com,api.0xnil.com \
  -e LETSENCRYPT_HOST=0xnil.com,www.0xnil.com,api.0xnil.com \
  -e LETSENCRYPT_EMAIL=admin@0xnil.com \
  -w /usr/src/app node:6 npm run start
