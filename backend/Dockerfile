FROM node:16.13.0-buster-slim

RUN apt-get update && apt-get install -y \
      libcurl4-openssl-dev \
      ca-certificates \
      build-essential \
      python \
      python3

COPY ./ /usr/src
WORKDIR /usr/src
# ENV NODE_ENV production
RUN yarn
RUN "yarn" "generate"

CMD ["./node_modules/.bin/ts-node", "./index.ts"]