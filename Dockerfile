FROM node:16-alpine AS BUILDER

WORKDIR /tmp

COPY ./src          ./src
COPY ./package.json ./package.json
COPY tsconfig.json  ./
COPY yarn.lock      ./
COPY package.json      ./
COPY webpack.config.js ./

RUN yarn install
RUN yarn tsc
RUN yarn build:frontend

FROM node:16-alpine

ENV LOG_LEVEL=INFO

ARG REQUEST_PREFIX

WORKDIR /app

COPY --from=BUILDER /tmp/dist ./dist
COPY --from=BUILDER /tmp/node_modules ./node_modules
COPY --from=BUILDER /tmp/frontend/js ./frontend/js

RUN REQUEST_PREFIX=${REQUEST_PREFIX} yarn install && yarn build:frontend

CMD ["node", "dist/App.js"]
