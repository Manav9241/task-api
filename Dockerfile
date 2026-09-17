FROM node:24.11.1-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production

USER node

CMD [ "node", "index.js" ]
