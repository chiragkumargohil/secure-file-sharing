# Frontend Dockerfile
FROM node:18-bullseye-slim

# Install build tools and optional dependencies
RUN apt-get update && apt-get install -y \
    python3 g++ make libc6-dev libstdc++6 && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies with platform-specific settings
RUN yarn config set nodeLinker node-modules && \
    yarn install --frozen-lockfile

RUN yarn add @rollup/rollup-linux-x64-gnu

# Copy source code
COPY . .

# Build and expose app
RUN yarn build
EXPOSE 5173

CMD ["yarn", "dev"]
