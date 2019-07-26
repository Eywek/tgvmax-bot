FROM node AS builder

COPY ./ /usr/src
WORKDIR /usr/src
RUN yarn
ENV NODE_ENV production
RUN yarn run build

FROM nginx:alpine

COPY --from=builder /usr/src/dist /usr/share/nginx/html