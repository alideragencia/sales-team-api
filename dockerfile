#Dockerfile sales-team-api
FROM node:20.17-alpine as builder

WORKDIR /app

COPY package.json ./
COPY tsconfig.json ./
COPY prisma ./

RUN yarn install

RUN yarn add prisma
RUN npx prisma generate 

COPY  /src ./src
COPY .env tsconfig.json ./
RUN yarn build
 
FROM node:20.17-alpine as runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 4000
CMD ["node", "dist/server.cjs"]