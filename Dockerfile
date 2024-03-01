FROM oven/bun:latest as base

WORKDIR /app

COPY package.json .
COPY tsconfig.json .
COPY src src/

EXPOSE 3000

CMD [ "bun", "start" ]
