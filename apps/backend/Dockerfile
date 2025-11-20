# Backend Dockerfile (NestJS with Production Build)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY apps/backend/package.json ./apps/backend/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy backend source and prisma schema
COPY apps/backend ./apps/backend
COPY apps/database ./apps/database

# Generate Prisma Client
RUN cd apps/database && npx prisma generate

# Build backend
RUN cd apps/backend && yarn build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy package files
COPY package.json yarn.lock ./
COPY apps/backend/package.json ./apps/backend/

# Install only production dependencies
RUN yarn install --frozen-lockfile --production

# Copy built application
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/database ./apps/database
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Generate Prisma Client for production
RUN cd apps/database && npx prisma generate

WORKDIR /app/apps/backend

EXPOSE 3002

# Run migrations and start the application
CMD ["sh", "-c", "cd ../database && npx prisma migrate deploy && cd ../backend && node dist/main.js"]
