#!/usr/bin/env bash

docker stop 0xNIL-api
docker rm 0xNIL-api

source bin/.default.env && docker run -d \
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
  -e VIRTUAL_HOST=api.0xnil.org \
  -e LETSENCRYPT_HOST=0xnil.org,api.0xnil.org \
  -e LETSENCRYPT_EMAIL=admin@0xnil.org \
  -w /usr/src/app node:6 npm run start
