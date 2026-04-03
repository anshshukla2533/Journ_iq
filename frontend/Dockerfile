# Base stage
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# Development stage
FROM base AS development
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# Build stage
FROM base AS builder
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy nginx config if needed
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
