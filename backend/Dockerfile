FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=development

COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/

WORKDIR /app/backend

RUN npm ci

WORKDIR /app/shared

RUN npm ci

WORKDIR /app

COPY backend ./backend/
COPY shared ./shared/

WORKDIR /app/backend

EXPOSE 3333

CMD ["npm", "run", "dev"]
