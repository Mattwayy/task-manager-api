# --- Dev ---
FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm install -g npm@11.6.2
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# --- Prod ---
FROM node:20-alpine AS prod
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/server.js"]
