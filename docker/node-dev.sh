#!/usr/bin/env bash

source bin/.default.env && docker run -it --rm \
  --name 0xNIL-api-dev \
  --link 0xNIL-redis:redis \
  -p 9292:9292 \
  -v $PWD:/usr/src/app \
  -v $PWD/log:/var/log/0xNIL \
  -e CONSUMER_KEY="$CONSUMER_KEY" \
  -e CONSUMER_SECRET="$CONSUMER_SECRET" \
  -e ACCESS_TOKEN_KEY="$ACCESS_TOKEN_KEY" \
  -e ACCESS_TOKEN_SECRET="$ACCESS_TOKEN_SECRET" \
  -e VIRTUAL_HOST=api.felice0 \
  -w /usr/src/app node:6 npm run start

