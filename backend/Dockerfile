FROM node:alpine

COPY ./ /usr/src
WORKDIR /usr/src
ENV NODE_ENV production
RUN yarn
RUN "./node_modules/.bin/ts-node" "./utils/fetch_trainline_stations.ts"

CMD ["./node_modules/.bin/ts-node", "./index.ts"]