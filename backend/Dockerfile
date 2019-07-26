FROM node:alpine

COPY ./ /usr/src
WORKDIR /usr/src
ENV NODE_ENV production
RUN yarn

CMD ["./node_modules/.bin/ts-node", "./index.ts"]