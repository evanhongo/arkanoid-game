FROM node:14.15.0-slim
RUN apt-get update -y\
    && npm install -g yarn
WORKDIR /arkanoid-game
COPY package.json yarn.lock /arkanoid-game/
ADD . .
RUN yarn --network-concurrency 3 && yarn cache clean 
RUN yarn install
RUN make build
CMD ["serve", "./build"]