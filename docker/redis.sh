#!/usr/bin/env bash

docker run \
  --name 0xNIL-redis \
  --restart unless-stopped \
  -v /vol/data/0xNIL-redis:/data \
  -d redis redis-server --appendonly yes

