FROM node:16-alpine

COPY ./ /usr/src
WORKDIR /usr/src
# ENV NODE_ENV production
RUN yarn
RUN "yarn" "generate"

CMD ["./node_modules/.bin/ts-node", "./index.ts"]