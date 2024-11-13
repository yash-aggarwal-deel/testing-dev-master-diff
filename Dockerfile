FROM 974360507615.dkr.ecr.eu-west-1.amazonaws.com/node:20-slim AS buildContainer

ARG NODE_ENV
ARG CODEARTIFACT_AUTH_TOKEN

ENV HUSKY=0
ENV NODE_ENV=$NODE_ENV
ENV CODEARTIFACT_AUTH_TOKEN=$CODEARTIFACT_AUTH_TOKEN

WORKDIR /install

COPY .npmrc package*.json tsconfig.json ./

RUN npm ci --no-progress

COPY . .

ENV NODE_ENV=production
RUN npm run build && npm prune --omit=dev

FROM 974360507615.dkr.ecr.eu-west-1.amazonaws.com/node:20-slim as final

ENV NODE_ENV=production

WORKDIR /usr/src/app

USER node

COPY --from=buildContainer --chown=node:node /install/dist ./
COPY --from=buildContainer --chown=node:node /install/node_modules ./node_modules

# do not use npm scripts as a command
CMD ["node", "-r", "@letsdeel/init", "src/main"]
