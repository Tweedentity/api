#!/usr/bin/env bash

docker stop tweedentity-api
docker rm tweedentity-api

docker stop tweedentity-api-debug
docker rm tweedentity-api-debug

docker run -d \
  --name tweedentity-api \
  -p 9093 \
  --restart unless-stopped \
  -v $PWD:/usr/src/app \
  -e VIRTUAL_HOST=api.tweedentity.com \
  -e LETSENCRYPT_HOST=tweedentity.com,www.tweedentity.com,api.tweedentity.com \
  -e LETSENCRYPT_EMAIL=admin@tweedentity.com \
  -e NODE_ENV=production \
  -w /usr/src/app node:6 npm run start
