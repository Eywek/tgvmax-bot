# How to run

```bash
docker run -d --name tgvmax-frontend -p 8081:80 ghcr.io/eywek/tgvmax-bot-frontend:9ad9ed6d6aca0b98b045a75f4c6420c1f9817af4
```
```bash
docker run -d --restart=on-failure --name tgvmax-backend -p 8080:8080 -v /home/eywek/docker/tgvmax/tgvmax.sqlite:/usr/src/tgvmax.sqlite ghcr.io/eywek/tgvmax-bot-backend:9ad9ed6d6aca0b98b045a75f4c6420c1f9817af4
```

## Nginx configuration

```
upstream frontend {
    server 127.0.0.1:8081;
}

upstream backend {
    server 127.0.0.1:8080;
}

server {
	server_name mydomain.fr;

    location / {
        include proxy_params;
        proxy_pass http://frontend;
    }
	location /api {
        include proxy_params;
        proxy_pass http://backend;
    }
}
```
