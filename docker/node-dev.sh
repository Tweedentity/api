#!/usr/bin/env bash

source docker/.default.env && docker run -it --rm \
  --name tweedentity-dev \
  --link tweedentity-redis:redis \
  -p 9292:9292 \
  -v $PWD:/usr/src/app \
  -v $PWD/log:/var/log/tweedentity \
  -e CONSUMER_KEY="$CONSUMER_KEY" \
  -e CONSUMER_SECRET="$CONSUMER_SECRET" \
  -e ACCESS_TOKEN_KEY="$ACCESS_TOKEN_KEY" \
  -e ACCESS_TOKEN_SECRET="$ACCESS_TOKEN_SECRET" \
  -e VIRTUAL_HOST=api.felice0 \
  -e NODE_ENV=development \
  -w /usr/src/app node:6 npm run start

