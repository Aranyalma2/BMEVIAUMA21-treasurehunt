# Admin Dockerfile (Vue.js with Nginx)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY apps/admin/package.json ./apps/admin/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy admin source
COPY apps/admin ./apps/admin

# Build argument for backend URL
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

# Build admin
RUN cd apps/admin && yarn build

# Production stage with Nginx
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html

# Copy custom nginx config
COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf

# Add healthcheck endpoint
RUN echo "OK" > /usr/share/nginx/html/health

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
