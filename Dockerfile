FROM node:16.20.2-alpine3.18 AS builder


WORKDIR /app

COPY package*.json ./
COPY yarn.lock ./
COPY tsconfig.build.json ./
COPY tsconfig.json ./

RUN yarn install

COPY . .
ARG PORT
ARG POSTGRES_HOST
ARG POSTGRES_PORT
ARG POSTGRES_USER
ARG POSTGRES_PASSWORD
ARG POSTGRES_DATABASE

ENV PORT=${PORT}
ENV POSTGRES_HOST=${POSTGRES_HOST}
ENV POSTGRES_PORT=${POSTGRES_PORT}
ENV POSTGRES_USER=${POSTGRES_USER}
ENV POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
ENV POSTGRES_DATABASE=${POSTGRES_DATABASE}

RUN yarn migration:run
RUN yarn build

FROM node:16.20.2-alpine3.18

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/tsconfig.build.json ./
COPY --from=builder /app/tsconfig.json ./

EXPOSE 80
CMD [ "node", "dist/main"]
