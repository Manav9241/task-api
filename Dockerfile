FROM node:24.11.1-alpine AS dev

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=development

USER node

CMD [ "node_modules/.bin/nodemon", "--legacy-watch", "index.js" ]


FROM node:24.11.1-alpine AS production

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production

USER node

CMD [ "node", "index.js" ]
