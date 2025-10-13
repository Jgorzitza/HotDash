FROM node:18-alpine
RUN apk add --no-cache openssl

EXPOSE 3000

WORKDIR /app

ENV NODE_ENV=production

# Copy package files
COPY package.json package-lock.json* ./

# Install ALL dependencies
RUN npm ci && npm cache clean --force

# Copy application files
COPY app ./app
COPY public ./public
COPY prisma ./prisma
COPY scripts ./scripts
COPY tsconfig.json ./
COPY vite.config.ts ./

# Copy pre-built files
COPY build ./build

# Verify polaris is installed
RUN ls -la node_modules/@shopify/polaris || echo "Polaris not found!"

CMD ["npm", "run", "docker-start"]
