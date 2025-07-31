# syntax=docker/dockerfile:1.7
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# Instala deps com foco em build (inclui devDependencies)
RUN npm ci --ignore-scripts

FROM node:20-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Se Typedoc causar conflito, garantir que já está resolvido no package.json
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
# Copiar apenas runtime necessário
COPY package.json package-lock.json* ./
RUN npm ci --only=production --ignore-scripts
COPY --from=build /app/dist ./dist
# Ajuste o caminho se seu entrypoint for diferente
CMD ["node", "dist/src/mcp-server.js"]