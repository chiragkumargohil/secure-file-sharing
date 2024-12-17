# Frontend Dockerfile
FROM node:18

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source code
COPY . .

# Build and expose app
RUN npm run build
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
