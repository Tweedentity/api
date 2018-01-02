#!/usr/bin/env bash

docker stop tweedentity
docker rm tweedentity

# for initial verification

source docker/.default.env && docker run -it \
  --name tweedentity \
  --link tweedentity-redis:redis \
  -p 9292 \
  --restart unless-stopped \
  -v $PWD:/usr/src/app \
  -v /vol/log/tweedentity:/var/log/tweedentity \
  -e CONSUMER_KEY="$CONSUMER_KEY" \
  -e CONSUMER_SECRET="$CONSUMER_SECRET" \
  -e ACCESS_TOKEN_KEY="$ACCESS_TOKEN_KEY" \
  -e ACCESS_TOKEN_SECRET="$ACCESS_TOKEN_SECRET" \
  -e VIRTUAL_HOST=tweedentity.com,www.tweedentity.com,api.tweedentity.com \
  -e LETSENCRYPT_HOST=tweedentity.com,www.tweedentity.com,api.tweedentity.com \
  -e LETSENCRYPT_EMAIL=admin@tweedentity.com \
  -e NODE_ENV=production \
  -w /usr/src/app node:6 npm run start
