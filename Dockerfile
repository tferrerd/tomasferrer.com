FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY astro.config.mjs tsconfig.json Dockerfile ./
COPY src ./src
COPY public ./public
RUN npm run build

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=8080
COPY --from=build /app/dist/agent-knowledge.json ./dist/agent-knowledge.json
COPY agent/server.mjs agent/prompt.txt ./agent/
USER node
EXPOSE 8080
CMD ["node", "agent/server.mjs"]
