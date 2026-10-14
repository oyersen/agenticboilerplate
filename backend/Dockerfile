# ==========================================
# Stage 1: Development & Dependencies
# ==========================================
FROM node:20-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "start:dev"]

# ==========================================
# Stage 2: Production Build
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build
RUN npm prune --production

# ==========================================
# Stage 3: Production Minimal Runtime
# ==========================================
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Security: run as non-root user
USER node

COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node package*.json ./

EXPOSE 5000

CMD ["node", "dist/main.js"]
