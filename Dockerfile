# Multi-stage build for production
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install all dependencies (including dev)
RUN npm ci
RUN cd server && npm ci
RUN cd client && npm ci

# Copy source code
COPY . .

# Build client
RUN cd client && npm run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy production node_modules from base stage
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package*.json ./

# Copy server dependencies
COPY --from=build /app/server/node_modules ./server/node_modules
COPY --from=build /app/server/package*.json ./server/

# Copy server source code
COPY server ./server

# Copy built client
COPY --from=build /app/client/dist ./client/dist

# Create uploads directory
RUN mkdir -p server/uploads && chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node server/healthcheck.js || exit 1

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server/app.js"]