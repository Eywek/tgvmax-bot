<div align="center">
    <img src="./logo.jpg" width="200">
</div>

---------------------------------------

# Qu'est-ce que c'est ?

[TGVMax bot](https://github.com/Eywek/tgvmax-bot) est un [bot](https://fr.wikipedia.org/wiki/Bot_informatique) qui a pour but de permettre la réservation facilement et automatiquement de billet [TGVMax](https://www.tgvmax.fr/VSC/fr-FR).

Il est recommandé d'avoir des connaissances techniques (Docker/containers & reverse-proxy) pour pouvoir installer le bot.

# Fonctionnalités

- Visualisation et réservation uniquement des billets TGVMax via l'interface (sans avoir à passer par sncf-connect ou trainline)

![](https://user-images.githubusercontent.com/6900054/170680049-fa293f25-b973-49dc-8bf3-72cf3b74a4ec.png)

- Alertes avec possibilité de réservation automatique
    - Un compte [Trainline Business](https://www.trainline.fr/business) est requis pour la réservation automatique
    - Vous pouvez configurer des alertes et être alerté via SMS (si vous êtes chez Free) ou via Telegram

![](https://user-images.githubusercontent.com/6900054/170680063-ba881436-2e77-4065-b145-ecf90dc9d5f3.png)

- Alertes récurrentes (voir [cron](https://fr.wikipedia.org/wiki/Cron#Syntaxe_de_la_table))
    - Exemple: ajouter automatiquement des alertes et réserver automatiquement tous les trains le mardi entre 10h et 11h

# Installation

Nous vous exposons 2 images [Docker](https://www.docker.com) ([liste](https://github.com/Eywek?tab=packages&repo_name=tgvmax-bot)) que vous devez lancer comme ci-dessous:

```bash
docker run -d --name tgvmax-frontend -p 8081:80 ghcr.io/eywek/tgvmax-bot-frontend:9ad9ed6d6aca0b98b045a75f4c6420c1f9817af4
```

_**Note:** Le bot utilise SQLite comme base de données, il est donc recommandé de créer un fichier vide appelé `tgvmax.sqlite` et le fournir comme volume au container du backend, pour pouvoir garder la configuration au cours des mise à jours._

```bash
docker run -d --restart=on-failure --name tgvmax-backend -p 8080:8080 -v <path to sqlite>/tgvmax.sqlite:/usr/src/tgvmax.sqlite ghcr.io/eywek/tgvmax-bot-backend:9ad9ed6d6aca0b98b045a75f4c6420c1f9817af4
```

## Reverse proxy

Pour accéder à l'interface il vous faut configurer un reverse proxy (comme Nginx) pour exposer le frontend et le backend.

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
