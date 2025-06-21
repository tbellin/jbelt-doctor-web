# JBelt Doctor Web - Multi-stage Dockerfile
# Supports both development and production builds

FROM node:lts-alpine as base

# Install pnpm globally
RUN npm install -g pnpm@10.6.3

# Set working directory
WORKDIR /usr/src/app

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Development stage
FROM base as development
COPY . .
EXPOSE 3000
CMD ["pnpm", "dev", "--host", "0.0.0.0"]

# Production build stage
FROM base as build
COPY . .
RUN pnpm build

# Production runtime stage
FROM node:lts-alpine as production
RUN npm install -g pnpm@10.6.3

WORKDIR /usr/src/app

# Copy built application
COPY --from=build /usr/src/app/.output /usr/src/app/.output
COPY --from=build /usr/src/app/package.json /usr/src/app/

EXPOSE 3000

# Start the production server
CMD ["node", ".output/server/index.mjs"]