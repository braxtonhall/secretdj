FROM node:12-alpine

COPY src               ./src
COPY frontend          ./frontend
COPY package.json      ./package.json
COPY yarn.lock         ./yarn.lock
COPY tsconfig.json     ./tsconfig.json
COPY webpack.config.js ./webpack.config.js

RUN yarn install && yarn build

CMD ["yarn", "start"]
