FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=development

RUN apk add --no-cache libc6-compat curl

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]
