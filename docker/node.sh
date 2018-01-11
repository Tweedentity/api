#!/usr/bin/env bash

docker stop tweedentity
docker rm tweedentity

docker run -d \
  --name tweedentity-api \
  -p 3132 \
  --restart unless-stopped \
  -v $PWD:/usr/src/app \
  -e VIRTUAL_HOST=api.tweedentity.com \
  -e LETSENCRYPT_HOST=tweedentity.com,www.tweedentity.com,api.tweedentity.com \
  -e LETSENCRYPT_EMAIL=admin@tweedentity.com \
  -e NODE_ENV=production \
  -w /usr/src/app node:carbon npm run start
