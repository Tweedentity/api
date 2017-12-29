#!/usr/bin/env bash

docker run -it \
  --link 0xNIL-redis:redis \
  --rm redis redis-cli -h redis -p 6379
