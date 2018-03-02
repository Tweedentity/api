#!/usr/bin/env bash

docker run -it --rm \
  --name tweedentity-dev \
  -p 9093 \
  -v $PWD:/usr/src/app \
  -v $PWD/log:/var/log/tweedentity-api \
  -e NODE_ENV=development \
  -e VIRTUAL_HOST=api.tweedentity.com.localhost \
  -w /usr/src/app node:carbon npm run start
