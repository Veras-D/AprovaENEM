# Multi-Stage Build Dockerfile for aprovaenem-frontend
# Stage 1: Build the optimized static Single Page Application (SPA) bundle
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests for layer caching
COPY package.json package-lock.json ./

# Install exact dependencies
RUN npm ci

# Copy application source files and configurations
COPY index.html vite.config.ts tsconfig.json tsconfig.node.json postcss.config.js tailwind.config.js ./
COPY public/ public/
COPY src/ src/

# Build production bundle with TypeScript strict checks
RUN npm run build

# Stage 2: Hardened Nginx 1.27 Alpine runtime
FROM nginx:1.27-alpine

# Set working directory
WORKDIR /usr/share/nginx/html

# Remove default Nginx welcome assets
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled static production assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy production Nginx reverse proxy configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create question assets directory for volume mount and set permissions
RUN mkdir -p /usr/share/nginx/html/assets/questions \
    && chown -R nginx:nginx /usr/share/nginx/html

# Expose HTTP and HTTPS ports
EXPOSE 80 443

# Healthcheck probe
HEALTHCHECK --interval=15s --timeout=5s --retries=3 --start-period=10s \
    CMD wget --spider -q http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
