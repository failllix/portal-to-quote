FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=development

COPY package*.json ./

RUN npm ci

COPY backend ./backend/
COPY shared ./shared/
COPY logic ./logic/
COPY db ./db/
COPY ./.env.local ./

EXPOSE 3333

CMD ["npm", "run", "dev-backend"]
