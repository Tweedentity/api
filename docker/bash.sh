#!/usr/bin/env bash

host=0xNIL-api

if [[ $1 != '' ]]; then
  host=$1
fi

docker exec -it $host bash
