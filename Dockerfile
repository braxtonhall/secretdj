FROM node:16-alpine AS BUILDER

WORKDIR /tmp

ARG REQUEST_PREFIX

COPY ./src          ./src
COPY ./frontend     ./frontend
COPY ./package.json ./package.json
COPY tsconfig.json  ./
COPY yarn.lock      ./
COPY package.json      ./
COPY webpack.config.js ./

RUN yarn install
RUN yarn tsc
RUN REQUEST_PREFIX=${REQUEST_PREFIX} yarn build:frontend

FROM node:16-alpine

ENV LOG_LEVEL=INFO

WORKDIR /app

COPY --from=BUILDER /tmp/dist ./dist
COPY --from=BUILDER /tmp/node_modules ./node_modules
COPY --from=BUILDER /tmp/frontend/js ./frontend/js
COPY --from=BUILDER /tmp/frontend/html ./frontend/html

CMD ["node", "dist/App.js"]
