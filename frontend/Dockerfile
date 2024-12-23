# Frontend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build and expose app
RUN npm run build
EXPOSE 5173

CMD ["npm", "run", "dev"]
