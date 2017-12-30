#!/usr/bin/env bash

host=tweedentity

if [[ $1 != '' ]]; then
  host=$1
fi

docker exec -it $host bash
