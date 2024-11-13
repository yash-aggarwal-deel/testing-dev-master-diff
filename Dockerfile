FROM 974360507615.dkr.ecr.eu-west-1.amazonaws.com/node:18-slim AS buildContainer

ARG NODE_ENV
ARG CODEARTIFACT_AUTH_TOKEN

ENV NODE_ENV=$NODE_ENV
ENV CODEARTIFACT_AUTH_TOKEN=$CODEARTIFACT_AUTH_TOKEN

WORKDIR /install

COPY .npmrc package*.json tsconfig.json ./

RUN npm ci --no-progress

COPY . .

ENV NODE_ENV=production
RUN npm run build --if-present && \
    npm prune --production

FROM 974360507615.dkr.ecr.eu-west-1.amazonaws.com/node:18-slim as final

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

WORKDIR /usr/src/app

USER node

COPY --from=buildContainer --chown=node:node /install ./

EXPOSE $PORT

# TODO: replace with your http server entrypoint, do not use npm scripts as a command
CMD ["node", "-r", "@letsdeel/init", "dist/main.js"]