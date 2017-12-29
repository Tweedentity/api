#!/usr/bin/env bash

docker stop nginx
docker rm nginx

docker stop nginx-gen
docker rm nginx-gen

docker stop nginx-letsencrypt
docker rm nginx-letsencrypt

docker run -d \
  --name nginx \
  --restart unless-stopped \
  -p 80:80 -p 443:443 \
  -v /etc/nginx/conf.d  \
  -v /etc/nginx/vhost.d \
  -v /usr/share/nginx/html \
  -v /vol/proxy/certs:/etc/nginx/certs:ro \
  --label com.github.jrcs.letsencrypt_nginx_proxy_companion.nginx_proxy \
  nginx

docker run -d \
    --name nginx-gen \
    --restart unless-stopped \
    --volumes-from nginx \
    -v /vol/proxy/templates/nginx.tmpl:/etc/docker-gen/templates/nginx.tmpl:ro \
    -v /var/run/docker.sock:/tmp/docker.sock:ro \
    --label com.github.jrcs.letsencrypt_nginx_proxy_companion.docker_gen \
    jwilder/docker-gen \
    -notify-sighup nginx -watch -wait 5s:30s /etc/docker-gen/templates/nginx.tmpl /etc/nginx/conf.d/default.conf

docker run -d \
    --name nginx-letsencrypt \
    --restart unless-stopped \
    --volumes-from nginx \
    -v /vol/proxy/certs:/etc/nginx/certs:rw \
    -v /var/run/docker.sock:/var/run/docker.sock:ro \
    jrcs/letsencrypt-nginx-proxy-companion
