# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
# Using npm ci for clean install, so we copy package.json and package-lock.json (if exists)
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Run stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
