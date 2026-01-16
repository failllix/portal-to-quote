FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=development

COPY package*.json ./

RUN npm ci

COPY shared/package*.json ./shared/

WORKDIR /app/shared

RUN npm ci

WORKDIR /app

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev-frontend"]
