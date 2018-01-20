#!/usr/bin/env bash

docker run -it --rm \
  --name tweedentity-debug \
  -p 9093 \
  -v $PWD:/usr/src/app \
  -e VIRTUAL_HOST=api.localhost \
  -w /usr/src/app node:carbon npm run start
