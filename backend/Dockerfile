FROM node:20-alpine AS base
FROM base AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY server.js ./
EXPOSE 3001
CMD ["node", "server.js"]