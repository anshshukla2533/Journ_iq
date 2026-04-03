# Base stage
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# Development stage
FROM base AS development
RUN npm install
COPY . .
# Generate prisma client
RUN npx prisma generate
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production
RUN npm ci --only=production
COPY . .
# Generate prisma client
RUN npx prisma generate
CMD ["node", "server.js"]
