FROM node:12-alpine

ARG REQUEST_PREFIX

COPY src               ./src
COPY frontend          ./frontend
COPY package.json      ./
COPY yarn.lock         ./
COPY tsconfig.json     ./
COPY webpack.config.js ./

RUN REQUEST_PREFIX=${REQUEST_PREFIX} yarn install && yarn build

CMD ["yarn", "start"]
